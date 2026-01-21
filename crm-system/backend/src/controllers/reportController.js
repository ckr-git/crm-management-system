const { models } = require('../models');
const { Op } = require('sequelize');
const ExcelJS = require('exceljs');

/**
 * 获取综合报表数据
 */
exports.getComprehensiveReport = async (req, res) => {
  try {
    const { start_date, end_date, type } = req.query;

    // 构建查询条件
    const where = {};
    if (start_date && end_date) {
      where.created_at = {
        [Op.between]: [new Date(start_date), new Date(end_date)]
      };
    }

    let reportData = {};

    switch (type) {
      case 'customer':
        reportData = await generateCustomerReport(where);
        break;
      case 'opportunity':
        reportData = await generateOpportunityReport(where);
        break;
      case 'followup':
        reportData = await generateFollowupReport(where);
        break;
      case 'comprehensive':
      default:
        reportData = await generateComprehensiveReport(where);
        break;
    }

    res.json({
      code: 200,
      message: '获取成功',
      data: reportData
    });
  } catch (error) {
    console.error('获取综合报表错误:', error);
    res.status(500).json({
      code: 500,
      message: '服务器错误',
      error: error.message
    });
  }
};

/**
 * 导出Excel报表
 */
exports.exportExcel = async (req, res) => {
  try {
    const { start_date, end_date, type } = req.query;

    // 构建查询条件
    const where = {};
    if (start_date && end_date) {
      where.created_at = {
        [Op.between]: [new Date(start_date), new Date(end_date)]
      };
    }

    // 创建工作簿
    const workbook = new ExcelJS.Workbook();
    workbook.creator = 'CRM System';
    workbook.created = new Date();

    // 根据类型生成不同的报表
    switch (type) {
      case 'customer':
        await generateCustomerExcel(workbook, where);
        break;
      case 'opportunity':
        await generateOpportunityExcel(workbook, where);
        break;
      case 'followup':
        await generateFollowupExcel(workbook, where);
        break;
      case 'comprehensive':
      default:
        await generateComprehensiveExcel(workbook, where);
        break;
    }

    // 设置响应头
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', `attachment; filename=CRM_Report_${Date.now()}.xlsx`);

    // 写入响应
    await workbook.xlsx.write(res);
    res.end();
  } catch (error) {
    console.error('导出Excel错误:', error);
    res.status(500).json({
      code: 500,
      message: '服务器错误',
      error: error.message
    });
  }
};

// ==================== 报表生成函数 ====================

/**
 * 生成客户报表
 */
async function generateCustomerReport(where) {
  const customers = await models.Customer.findAll({
    where,
    include: [
      {
        model: models.User,
        as: 'owner',
        attributes: ['id', 'name', 'username']
      },
      {
        model: models.Opportunity,
        as: 'opportunities',
        required: false
      }
    ]
  });

  // 统计数据
  const totalCount = customers.length;
  const sourceStats = {};
  const industryStats = {};
  const levelStats = {};

  customers.forEach(customer => {
    // 来源统计
    const source = customer.source || '未知';
    sourceStats[source] = (sourceStats[source] || 0) + 1;

    // 行业统计
    const industry = customer.industry || '未知';
    industryStats[industry] = (industryStats[industry] || 0) + 1;

    // 等级统计
    const level = customer.level || '未知';
    levelStats[level] = (levelStats[level] || 0) + 1;
  });

  return {
    summary: {
      total: totalCount,
      source_count: Object.keys(sourceStats).length,
      industry_count: Object.keys(industryStats).length
    },
    source_stats: sourceStats,
    industry_stats: industryStats,
    level_stats: levelStats,
    customers: customers.map(c => ({
      id: c.id,
      name: c.name,
      contact: c.contact,
      phone: c.phone,
      source: c.source,
      industry: c.industry,
      level: c.level,
      owner: c.owner?.name,
      created_at: c.created_at
    }))
  };
}

/**
 * 生成销售机会报表
 */
async function generateOpportunityReport(where) {
  const opportunities = await models.Opportunity.findAll({
    where,
    include: [
      {
        model: models.Customer,
        as: 'customer',
        attributes: ['id', 'name']
      },
      {
        model: models.User,
        as: 'owner',
        attributes: ['id', 'name']
      }
    ]
  });

  // 统计数据
  const totalCount = opportunities.length;
  const stageStats = {};
  let totalAmount = 0;
  let wonCount = 0;
  let wonAmount = 0;

  opportunities.forEach(opp => {
    const stage = opp.stage;
    stageStats[stage] = (stageStats[stage] || 0) + 1;

    const amount = parseFloat(opp.amount || 0);
    totalAmount += amount;

    if (stage === 'closed_won') {
      wonCount++;
      wonAmount += amount;
    }
  });

  return {
    summary: {
      total: totalCount,
      won_count: wonCount,
      win_rate: totalCount > 0 ? ((wonCount / totalCount) * 100).toFixed(2) : '0.00',
      total_amount: totalAmount.toFixed(2),
      won_amount: wonAmount.toFixed(2)
    },
    stage_stats: stageStats,
    opportunities: opportunities.map(o => ({
      id: o.id,
      name: o.name,
      customer: o.customer?.name,
      stage: o.stage,
      amount: o.amount,
      owner: o.owner?.name,
      expected_close_date: o.expected_close_date,
      created_at: o.created_at
    }))
  };
}

/**
 * 生成跟进报表
 */
async function generateFollowupReport(where) {
  const followups = await models.Followup.findAll({
    where,
    include: [
      {
        model: models.Customer,
        as: 'customer',
        attributes: ['id', 'name']
      },
      {
        model: models.User,
        as: 'user',
        attributes: ['id', 'name']
      }
    ]
  });

  // 统计数据
  const totalCount = followups.length;
  const typeStats = {};
  const userStats = {};

  followups.forEach(followup => {
    // 类型统计
    const type = followup.type;
    typeStats[type] = (typeStats[type] || 0) + 1;

    // 用户统计
    const userName = followup.user?.name || '未知';
    userStats[userName] = (userStats[userName] || 0) + 1;
  });

  return {
    summary: {
      total: totalCount,
      type_count: Object.keys(typeStats).length,
      user_count: Object.keys(userStats).length
    },
    type_stats: typeStats,
    user_stats: userStats,
    followups: followups.map(f => ({
      id: f.id,
      customer: f.customer?.name,
      user: f.user?.name,
      type: f.type,
      content: f.content,
      result: f.result,
      created_at: f.created_at
    }))
  };
}

/**
 * 生成综合报表
 */
async function generateComprehensiveReport(where) {
  const [customerReport, opportunityReport, followupReport] = await Promise.all([
    generateCustomerReport(where),
    generateOpportunityReport(where),
    generateFollowupReport(where)
  ]);

  return {
    customer: customerReport,
    opportunity: opportunityReport,
    followup: followupReport,
    generated_at: new Date()
  };
}

// ==================== Excel生成函数 ====================

/**
 * 生成客户Excel
 */
async function generateCustomerExcel(workbook, where) {
  const report = await generateCustomerReport(where);
  const sheet = workbook.addWorksheet('客户报表');

  // 设置列
  sheet.columns = [
    { header: 'ID', key: 'id', width: 10 },
    { header: '客户名称', key: 'name', width: 20 },
    { header: '联系人', key: 'contact', width: 15 },
    { header: '电话', key: 'phone', width: 15 },
    { header: '来源', key: 'source', width: 15 },
    { header: '行业', key: 'industry', width: 15 },
    { header: '等级', key: 'level', width: 10 },
    { header: '负责人', key: 'owner', width: 15 },
    { header: '创建时间', key: 'created_at', width: 20 }
  ];

  // 添加数据
  report.customers.forEach(customer => {
    sheet.addRow(customer);
  });

  // 样式设置
  sheet.getRow(1).font = { bold: true };
  sheet.getRow(1).fill = {
    type: 'pattern',
    pattern: 'solid',
    fgColor: { argb: 'FFE0E0E0' }
  };
}

/**
 * 生成销售机会Excel
 */
async function generateOpportunityExcel(workbook, where) {
  const report = await generateOpportunityReport(where);
  const sheet = workbook.addWorksheet('销售机会报表');

  sheet.columns = [
    { header: 'ID', key: 'id', width: 10 },
    { header: '机会名称', key: 'name', width: 25 },
    { header: '客户', key: 'customer', width: 20 },
    { header: '阶段', key: 'stage', width: 15 },
    { header: '金额', key: 'amount', width: 15 },
    { header: '负责人', key: 'owner', width: 15 },
    { header: '预计成交日期', key: 'expected_close_date', width: 20 },
    { header: '创建时间', key: 'created_at', width: 20 }
  ];

  report.opportunities.forEach(opp => {
    sheet.addRow(opp);
  });

  sheet.getRow(1).font = { bold: true };
  sheet.getRow(1).fill = {
    type: 'pattern',
    pattern: 'solid',
    fgColor: { argb: 'FFE0E0E0' }
  };
}

/**
 * 生成跟进记录Excel
 */
async function generateFollowupExcel(workbook, where) {
  const report = await generateFollowupReport(where);
  const sheet = workbook.addWorksheet('跟进记录报表');

  sheet.columns = [
    { header: 'ID', key: 'id', width: 10 },
    { header: '客户', key: 'customer', width: 20 },
    { header: '跟进人', key: 'user', width: 15 },
    { header: '跟进方式', key: 'type', width: 12 },
    { header: '跟进内容', key: 'content', width: 40 },
    { header: '跟进结果', key: 'result', width: 20 },
    { header: '跟进时间', key: 'created_at', width: 20 }
  ];

  report.followups.forEach(followup => {
    sheet.addRow(followup);
  });

  sheet.getRow(1).font = { bold: true };
  sheet.getRow(1).fill = {
    type: 'pattern',
    pattern: 'solid',
    fgColor: { argb: 'FFE0E0E0' }
  };
}

/**
 * 生成综合Excel
 */
async function generateComprehensiveExcel(workbook, where) {
  await Promise.all([
    generateCustomerExcel(workbook, where),
    generateOpportunityExcel(workbook, where),
    generateFollowupExcel(workbook, where)
  ]);
}
