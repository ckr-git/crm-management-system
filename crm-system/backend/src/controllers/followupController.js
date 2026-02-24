const { models } = require('../models');
const { Op } = require('sequelize');

/**
 * 获取跟进记录列表
 */
const { ensureUserContext, isAdmin } = require('../utils/access')

exports.getFollowupList = async (req, res) => {
  try {
    const {
      page = 1,
      pageSize = 10,
      customer_id,
      type,
      user_id,
      start_date,
      end_date
    } = req.query;

    await ensureUserContext(req)

    // 构建查询条件（非管理员默认仅看自己）
    const where = {};
    if (!isAdmin(req)) {
      where.user_id = req.user.id
    }

    if (customer_id) {
      where.customer_id = customer_id;
    }

    if (type) {
      where.type = type;
    }

    if (user_id && isAdmin(req)) {
      where.user_id = user_id;
    }

    // 时间范围查询
    if (start_date || end_date) {
      where.created_at = {};
      if (start_date) {
        where.created_at[Op.gte] = start_date;
      }
      if (end_date) {
        where.created_at[Op.lte] = end_date;
      }
    }

    // 分页查询
    const offset = (parseInt(page) - 1) * parseInt(pageSize);
    const limit = parseInt(pageSize);

    const { count, rows } = await models.Followup.findAndCountAll({
      where,
      include: [
        {
          model: models.Customer,
          as: 'customer',
          attributes: ['id', 'name', 'contact', 'phone']
        },
        {
          model: models.User,
          as: 'user',
          attributes: ['id', 'name', 'username']
        }
      ],
      order: [['created_at', 'DESC']],
      offset,
      limit
    });

    res.json({
      code: 200,
      message: '获取成功',
      data: {
        list: rows,
        total: count,
        page: parseInt(page),
        pageSize: parseInt(pageSize)
      }
    });
  } catch (error) {
    console.error('获取跟进记录列表失败:', error);
    res.status(500).json({
      code: 500,
      message: '获取跟进记录列表失败',
      error: error.message
    });
  }
};

/**
 * 创建跟进记录
 */
exports.createFollowup = async (req, res) => {
  try {
    const {
      customer_id,
      type,
      content,
      result,
      next_plan,
      next_followup_at,
      attachments
    } = req.body;

    // 验证客户是否存在
    const customer = await models.Customer.findByPk(customer_id);
    if (!customer) {
      return res.status(404).json({
        code: 404,
        message: '客户不存在'
      });
    }

    // 创建跟进记录
    const followup = await models.Followup.create({
      customer_id,
      user_id: req.user.id,
      type,
      content,
      result: result || null,
      next_plan: next_plan || null,
      next_followup_at: next_followup_at || null,
      attachments
    });

    // 更新客户的跟进时间
    const updateData = {
      last_followup_at: new Date()  // 更新最后跟进时间
    };
    if (next_followup_at) {
      updateData.next_followup_at = next_followup_at;  // 更新下次跟进时间
    }
    await customer.update(updateData);

    // 获取完整的跟进记录（包括关联数据）
    const fullFollowup = await models.Followup.findByPk(followup.id, {
      include: [
        {
          model: models.Customer,
          as: 'customer',
          attributes: ['id', 'name', 'contact', 'phone']
        },
        {
          model: models.User,
          as: 'user',
          attributes: ['id', 'name', 'username']
        }
      ]
    });

    res.status(201).json({
      code: 200,
      message: '创建成功',
      data: fullFollowup
    });
  } catch (error) {
    console.error('创建跟进记录失败:', error);
    res.status(500).json({
      code: 500,
      message: '创建跟进记录失败',
      error: error.message
    });
  }
};

/**
 * 获取跟进记录详情
 */
const { ensureUserContext: ensureCtx, isAdmin: checkAdmin } = require('../utils/access')

exports.getFollowupDetail = async (req, res) => {
  try {
    await ensureCtx(req)
    const { id } = req.params;

    const followup = await models.Followup.findByPk(id, {
      include: [
        {
          model: models.Customer,
          as: 'customer',
          attributes: ['id', 'name', 'contact', 'phone', 'company_size', 'industry']
        },
        {
          model: models.User,
          as: 'user',
          attributes: ['id', 'name', 'username', 'email', 'phone']
        }
      ]
    });

    if (!followup) {
      return res.status(404).json({
        code: 404,
        message: '跟进记录不存在'
      });
    }

    // 权限检查：仅管理员或记录创建者可查看详情
    if (!checkAdmin(req) && followup.user_id !== req.user.id) {
      return res.status(403).json({ code: 403, message: '无权限查看该跟进记录' })
    }

    res.json({
      code: 200,
      message: '获取成功',
      data: followup
    });
  } catch (error) {
    console.error('获取跟进记录详情失败:', error);
    res.status(500).json({
      code: 500,
      message: '获取跟进记录详情失败',
      error: error.message
    });
  }
};

/**
 * 更新跟进记录
 */
exports.updateFollowup = async (req, res) => {
  try {
    await ensureCtx(req)
    const { id } = req.params;
    const {
      type,
      content,
      result,
      next_plan,
      next_followup_at,
      attachments
    } = req.body;

    const followup = await models.Followup.findByPk(id);

    if (!followup) {
      return res.status(404).json({
        code: 404,
        message: '跟进记录不存在'
      });
    }

    // 权限检查：仅管理员或记录创建者可修改
    if (!checkAdmin(req) && followup.user_id !== req.user.id) {
      return res.status(403).json({ code: 403, message: '无权限修改该跟进记录' })
    }

    // 更新跟进记录
    await followup.update({
      type: type || followup.type,
      content: content || followup.content,
      result: result || null,
      next_plan: next_plan || null,
      next_followup_at: next_followup_at || null,
      attachments
    });

    // 如果更新了下次跟进时间，同步更新客户的下次跟进时间
    if (next_followup_at) {
      const customer = await models.Customer.findByPk(followup.customer_id);
      if (customer) {
        await customer.update({
          next_followup_at
        });
      }
    }

    // 获取更新后的完整数据
    const updatedFollowup = await models.Followup.findByPk(id, {
      include: [
        {
          model: models.Customer,
          as: 'customer',
          attributes: ['id', 'name', 'contact', 'phone']
        },
        {
          model: models.User,
          as: 'user',
          attributes: ['id', 'name', 'username']
        }
      ]
    });

    res.json({
      code: 200,
      message: '更新成功',
      data: updatedFollowup
    });
  } catch (error) {
    console.error('更新跟进记录失败:', error);
    res.status(500).json({
      code: 500,
      message: '更新跟进记录失败',
      error: error.message
    });
  }
};

/**
 * 删除跟进记录
 */
exports.deleteFollowup = async (req, res) => {
  try {
    await ensureCtx(req)
    const { id } = req.params;

    const followup = await models.Followup.findByPk(id);

    if (!followup) {
      return res.status(404).json({
        code: 404,
        message: '跟进记录不存在'
      });
    }

    // 权限检查：仅管理员或记录创建者可删除
    if (!checkAdmin(req) && followup.user_id !== req.user.id) {
      return res.status(403).json({ code: 403, message: '无权限删除该跟进记录' })
    }

    await followup.destroy();

    res.json({
      code: 200,
      message: '删除成功'
    });
  } catch (error) {
    console.error('删除跟进记录失败:', error);
    res.status(500).json({
      code: 500,
      message: '删除跟进记录失败',
      error: error.message
    });
  }
};

/**
 * 获取客户的跟进记录统计
 */
exports.getFollowupStats = async (req, res) => {
  try {
    const { customer_id } = req.query;

    if (!customer_id) {
      return res.status(400).json({
        code: 400,
        message: '客户ID不能为空'
      });
    }

    // 统计总跟进次数
    const totalCount = await models.Followup.count({
      where: { customer_id }
    });

    // 按跟进方式统计
    const typeStats = await models.Followup.findAll({
      where: { customer_id },
      attributes: [
        'type',
        [models.Followup.sequelize.fn('COUNT', models.Followup.sequelize.col('id')), 'count']
      ],
      group: ['type']
    });

    // 最近跟进记录
    const latestFollowup = await models.Followup.findOne({
      where: { customer_id },
      include: [
        {
          model: models.User,
          as: 'user',
          attributes: ['id', 'name', 'username']
        }
      ],
      order: [['created_at', 'DESC']]
    });

    res.json({
      code: 200,
      message: '获取成功',
      data: {
        totalCount,
        typeStats,
        latestFollowup
      }
    });
  } catch (error) {
    console.error('获取跟进记录统计失败:', error);
    res.status(500).json({
      code: 500,
      message: '获取跟进记录统计失败',
      error: error.message
    });
  }
};

/**
 * 获取待提醒的跟进列表（今天和未来7天需要跟进的客户）
 */
exports.getReminders = async (req, res) => {
  try {
    const userId = req.user.id;
    const now = new Date();
    const sevenDaysLater = new Date();
    sevenDaysLater.setDate(sevenDaysLater.getDate() + 7);

    // 查询当前用户负责的、需要跟进的客户
    const customers = await models.Customer.findAll({
      where: {
        owner_id: userId,
        next_followup_at: {
          [Op.between]: [now, sevenDaysLater]
        }
      },
      include: [
        {
          model: models.Followup,
          as: 'followups',
          limit: 1,
          order: [['created_at', 'DESC']],
          attributes: ['id', 'type', 'content', 'created_at']
        }
      ],
      order: [['next_followup_at', 'ASC']]
    });

    // 分类：今天、明天、未来
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    const dayAfterTomorrow = new Date(today);
    dayAfterTomorrow.setDate(dayAfterTomorrow.getDate() + 2);

    const reminders = {
      today: [],
      tomorrow: [],
      upcoming: []
    };

    customers.forEach(customer => {
      const nextDate = new Date(customer.next_followup_at);
      nextDate.setHours(0, 0, 0, 0);

      if (nextDate.getTime() === today.getTime()) {
        reminders.today.push(customer);
      } else if (nextDate.getTime() === tomorrow.getTime()) {
        reminders.tomorrow.push(customer);
      } else {
        reminders.upcoming.push(customer);
      }
    });

    res.json({
      code: 200,
      message: '获取成功',
      data: {
        totalCount: customers.length,
        todayCount: reminders.today.length,
        tomorrowCount: reminders.tomorrow.length,
        upcomingCount: reminders.upcoming.length,
        reminders
      }
    });
  } catch (error) {
    console.error('获取提醒列表失败:', error);
    res.status(500).json({
      code: 500,
      message: '获取提醒列表失败',
      error: error.message
    });
  }
};

/**
 * 获取逾期未跟进的客户列表
 */
exports.getOverdueFollowups = async (req, res) => {
  try {
    const userId = req.user.id;
    const now = new Date();

    // 查询逾期未跟进的客户
    const customers = await models.Customer.findAll({
      where: {
        owner_id: userId,
        next_followup_at: {
          [Op.lt]: now,
          [Op.ne]: null
        }
      },
      include: [
        {
          model: models.Followup,
          as: 'followups',
          limit: 1,
          order: [['created_at', 'DESC']],
          attributes: ['id', 'type', 'content', 'created_at', 'next_followup_at']
        }
      ],
      order: [['next_followup_at', 'ASC']]
    });

    // 计算逾期天数
    const overdueList = customers.map(customer => {
      const nextDate = new Date(customer.next_followup_at);
      const diffTime = now.getTime() - nextDate.getTime();
      const overdueDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

      return {
        ...customer.toJSON(),
        overdueDays
      };
    });

    res.json({
      code: 200,
      message: '获取成功',
      data: {
        totalCount: overdueList.length,
        list: overdueList
      }
    });
  } catch (error) {
    console.error('获取逾期列表失败:', error);
    res.status(500).json({
      code: 500,
      message: '获取逾期列表失败',
      error: error.message
    });
  }
};

/**
 * 获取个人跟进统计
 */
exports.getUserStats = async (req, res) => {
  try {
    const userId = req.user.id;
    const { startDate, endDate } = req.query;

    // 构建时间范围
    const where = { user_id: userId };
    if (startDate && endDate) {
      where.created_at = {
        [Op.between]: [new Date(startDate), new Date(endDate)]
      };
    }
    // 不传日期时查询全部数据，避免种子数据超出默认范围导致统计为0

    // 总跟进次数
    const totalCount = await models.Followup.count({ where });

    // 按类型统计
    const followups = await models.Followup.findAll({
      where,
      attributes: ['type', 'created_at'],
      raw: true
    });

    // 按类型分组
    const typeStats = {};
    followups.forEach(f => {
      typeStats[f.type] = (typeStats[f.type] || 0) + 1;
    });

    // 按日期统计（最近7天）
    const dateMap = {};
    const last7Days = [];
    for (let i = 6; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];
      last7Days.push(dateStr);
      dateMap[dateStr] = 0;
    }

    followups.forEach(f => {
      const dateStr = new Date(f.created_at).toISOString().split('T')[0];
      if (dateMap[dateStr] !== undefined) {
        dateMap[dateStr]++;
      }
    });

    const dailyStats = last7Days.map(date => ({
      date,
      count: dateMap[date]
    }));

    // 跟进的客户数
    const customerCount = await models.Followup.count({
      where,
      distinct: true,
      col: 'customer_id'
    });

    res.json({
      code: 200,
      message: '获取成功',
      data: {
        totalCount,
        customerCount,
        typeStats,
        dailyStats,
        avgPerDay: totalCount > 0 ? (totalCount / 7).toFixed(1) : 0
      }
    });
  } catch (error) {
    console.error('获取个人统计失败:', error);
    res.status(500).json({
      code: 500,
      message: '获取个人统计失败',
      error: error.message
    });
  }
};

/**
 * 获取团队跟进对比统计
 */
exports.getTeamStats = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;

    // 构建时间范围
    const where = {};
    if (startDate && endDate) {
      where.created_at = {
        [Op.between]: [new Date(startDate), new Date(endDate)]
      };
    }
    // 不传日期时查询全部数据

    // 获取所有跟进记录
    const followups = await models.Followup.findAll({
      where,
      attributes: ['user_id', 'customer_id'],
      include: [
        {
          model: models.User,
          as: 'user',
          attributes: ['id', 'name']
        }
      ]
    });

    // 按用户分组统计
    const userMap = {};
    followups.forEach(f => {
      const userId = f.user_id;
      if (!userMap[userId]) {
        userMap[userId] = {
          userId,
          userName: f.user?.name || '未知',
          followupCount: 0,
          customerSet: new Set()
        };
      }
      userMap[userId].followupCount++;
      userMap[userId].customerSet.add(f.customer_id);
    });

    // 转换为数组并计算客户数
    const teamStats = Object.values(userMap).map(user => ({
      userId: user.userId,
      userName: user.userName,
      followupCount: user.followupCount,
      customerCount: user.customerSet.size
    })).sort((a, b) => b.followupCount - a.followupCount);

    res.json({
      code: 200,
      message: '获取成功',
      data: {
        teamStats
      }
    });
  } catch (error) {
    console.error('获取团队统计失败:', error);
    res.status(500).json({
      code: 500,
      message: '获取团队统计失败',
      error: error.message
    });
  }
};

/**
 * 导出跟进记录到Excel
 */
exports.exportFollowups = async (req, res) => {
  try {
    const XLSX = require('xlsx');
    const {
      customer_id,
      type,
      user_id,
      start_date,
      end_date
    } = req.query;

    // 构建查询条件
    const where = {};
    if (customer_id) where.customer_id = customer_id;
    if (type) where.type = type;
    if (user_id) where.user_id = user_id;
    
    if (start_date || end_date) {
      where.created_at = {};
      if (start_date) where.created_at[Op.gte] = start_date;
      if (end_date) where.created_at[Op.lte] = end_date;
    }

    // 查询所有符合条件的跟进记录
    const followups = await models.Followup.findAll({
      where,
      include: [
        {
          model: models.Customer,
          as: 'customer',
          attributes: ['name', 'contact', 'phone']
        },
        {
          model: models.User,
          as: 'user',
          attributes: ['name']
        }
      ],
      order: [['created_at', 'DESC']]
    });

    // 跟进方式映射
    const typeMap = {
      phone: '电话',
      visit: '拜访',
      email: '邮件',
      wechat: '微信'
    };

    // 准备Excel数据
    const excelData = followups.map(f => ({
      '客户名称': f.customer?.name || '',
      '联系人': f.customer?.contact || '',
      '电话': f.customer?.phone || '',
      '跟进方式': typeMap[f.type] || f.type,
      '跟进人': f.user?.name || '',
      '跟进内容': f.content || '',
      '跟进结果': f.result || '',
      '下次计划': f.next_plan || '',
      '下次跟进时间': f.next_followup_at ? new Date(f.next_followup_at).toLocaleString('zh-CN') : '',
      '跟进时间': new Date(f.created_at).toLocaleString('zh-CN')
    }));

    // 创建工作簿
    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.json_to_sheet(excelData);
    
    // 设置列宽
    ws['!cols'] = [
      { wch: 20 }, { wch: 10 }, { wch: 15 }, { wch: 10 },
      { wch: 10 }, { wch: 40 }, { wch: 20 }, { wch: 30 },
      { wch: 20 }, { wch: 20 }
    ];

    XLSX.utils.book_append_sheet(wb, ws, '跟进记录');

    // 生成Buffer
    const buffer = XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' });

    // 设置响应头
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', `attachment; filename=followups_${Date.now()}.xlsx`);
    
    res.send(buffer);
  } catch (error) {
    console.error('导出跟进记录错误:', error);
    res.status(500).json({
      code: 500,
      message: '导出失败',
      error: error.message
    });
  }
};

/**
 * 下载跟进记录导入模板
 */
exports.downloadFollowupTemplate = async (req, res) => {
  try {
    const XLSX = require('xlsx');

    // 模板数据（示例行）
    const templateData = [{
      '客户名称*': '腾讯科技',
      '跟进方式*': '电话',
      '跟进内容*': '了解客户需求，介绍产品功能',
      '跟进结果': '客户感兴趣，约定下次拜访',
      '下次计划': '现场演示产品',
      '下次跟进时间': '2025-10-20 14:00',
      '备注': '客户对价格比较敏感'
    }];

    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.json_to_sheet(templateData);
    
    // 设置列宽
    ws['!cols'] = [
      { wch: 20 }, { wch: 12 }, { wch: 40 }, { wch: 30 },
      { wch: 30 }, { wch: 20 }, { wch: 30 }
    ];

    XLSX.utils.book_append_sheet(wb, ws, '跟进记录导入模板');

    const buffer = XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' });

    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', 'attachment; filename=followup_import_template.xlsx');
    
    res.send(buffer);
  } catch (error) {
    console.error('下载模板错误:', error);
    res.status(500).json({
      code: 500,
      message: '下载失败',
      error: error.message
    });
  }
};

/**
 * 从Excel批量导入跟进记录
 */
exports.importFollowups = async (req, res) => {
  try {
    const XLSX = require('xlsx');

    if (!req.file) {
      return res.status(400).json({
        code: 400,
        message: '请上传Excel文件'
      });
    }

    // 解析Excel
    const workbook = XLSX.read(req.file.buffer, { type: 'buffer' });
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    const jsonData = XLSX.utils.sheet_to_json(worksheet);

    if (jsonData.length === 0) {
      return res.status(400).json({
        code: 400,
        message: 'Excel文件为空'
      });
    }

    const successList = [];
    const errorList = [];
    
    // 跟进方式映射
    const typeMap = {
      '电话': 'phone',
      '拜访': 'visit',
      '邮件': 'email',
      '微信': 'wechat'
    };

    // 逐行处理
    for (let i = 0; i < jsonData.length; i++) {
      const row = jsonData[i];
      const rowNum = i + 2;

      try {
        // 验证必填字段
        const customerName = row['客户名称*'] || row['客户名称'];
        const typeText = row['跟进方式*'] || row['跟进方式'];
        const content = row['跟进内容*'] || row['跟进内容'];

        if (!customerName || !typeText || !content) {
          errorList.push({
            row: rowNum,
            data: row,
            error: '缺少必填字段：客户名称、跟进方式、跟进内容'
          });
          continue;
        }

        // 验证跟进方式
        const type = typeMap[typeText];
        if (!type) {
          errorList.push({
            row: rowNum,
            data: row,
            error: `跟进方式无效（应为：电话、拜访、邮件、微信）`
          });
          continue;
        }

        // 验证跟进内容长度
        if (content.length < 10) {
          errorList.push({
            row: rowNum,
            data: row,
            error: '跟进内容不能少于10个字符'
          });
          continue;
        }

        // 查找客户
        const customer = await models.Customer.findOne({
          where: { name: customerName }
        });

        if (!customer) {
          errorList.push({
            row: rowNum,
            data: row,
            error: `客户不存在：${customerName}`
          });
          continue;
        }

        // 解析下次跟进时间
        let nextFollowupAt = null;
        const nextTimeStr = row['下次跟进时间'] || '';
        if (nextTimeStr) {
          nextFollowupAt = new Date(nextTimeStr);
          if (isNaN(nextFollowupAt.getTime())) {
            nextFollowupAt = null;
          }
        }

        // 创建跟进记录
        const followup = await models.Followup.create({
          customer_id: customer.id,
          user_id: req.user.id,
          type,
          content,
          result: row['跟进结果'] || '',
          next_plan: row['下次计划'] || '',
          next_followup_at: nextFollowupAt,
          attachments: null
        });

        // 如果设置了下次跟进时间，更新客户
        if (nextFollowupAt) {
          await customer.update({ next_followup_at: nextFollowupAt });
        }

        successList.push({
          row: rowNum,
          customer: customerName,
          id: followup.id
        });
      } catch (error) {
        errorList.push({
          row: rowNum,
          data: row,
          error: error.message
        });
      }
    }

    res.json({
      code: 200,
      message: '导入完成',
      data: {
        total: jsonData.length,
        success: successList.length,
        fail: errorList.length,
        successList,
        errorList
      }
    });
  } catch (error) {
    console.error('导入跟进记录错误:', error);
    res.status(500).json({
      code: 500,
      message: '导入失败',
      error: error.message
    });
  }
};
