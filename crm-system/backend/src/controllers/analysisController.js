const { models } = require('../models');
const { Op } = require('sequelize');
const dayjs = require('dayjs');
const { isAdmin } = require('../utils/access');

// 构建数据范围过滤条件（非管理员只能看自己的数据）
const buildOwnerFilter = (req) => {
  if (isAdmin(req)) return {};
  return { owner_id: req.user.id };
};

/**
 * 客户来源统计
 */
exports.getSourceStats = async (req, res) => {
  try {
    const { start_date, end_date } = req.query;

    // 构建查询条件（包含数据范围过滤）
    const where = { ...buildOwnerFilter(req) };
    if (start_date && end_date) {
      where.created_at = {
        [Op.between]: [new Date(start_date), new Date(end_date)]
      };
    }

    // 按来源分组统计
    const customers = await models.Customer.findAll({
      where,
      attributes: ['source'],
      raw: true
    });

    // 统计各来源数量
    const sourceMap = {};
    customers.forEach(customer => {
      const source = customer.source || '未知';
      sourceMap[source] = (sourceMap[source] || 0) + 1;
    });

    // 转换为数组格式
    const sourceStats = Object.keys(sourceMap).map(source => ({
      source,
      count: sourceMap[source],
      percentage: ((sourceMap[source] / customers.length) * 100).toFixed(2)
    }));

    // 按数量降序排序
    sourceStats.sort((a, b) => b.count - a.count);

    res.json({
      code: 200,
      message: '获取成功',
      data: {
        total: customers.length,
        stats: sourceStats
      }
    });
  } catch (error) {
    console.error('获取来源统计错误:', error);
    res.status(500).json({
      code: 500,
      message: '服务器错误',
      error: error.message
    });
  }
};

/**
 * 客户来源趋势
 */
exports.getSourceTrend = async (req, res) => {
  try {
    const { start_date, end_date, source } = req.query;

    // 默认最近30天
    const endDate = end_date ? dayjs(end_date) : dayjs();
    const startDate = start_date ? dayjs(start_date) : endDate.subtract(30, 'day');

    // 构建查询条件（包含数据范围过滤）
    const where = {
      ...buildOwnerFilter(req),
      created_at: {
        [Op.between]: [startDate.toDate(), endDate.toDate()]
      }
    };

    if (source && source !== 'all') {
      where.source = source;
    }

    // 查询数据
    const customers = await models.Customer.findAll({
      where,
      attributes: ['created_at', 'source'],
      raw: true
    });

    // 按日期分组统计
    const dateMap = {};
    const sources = new Set();

    customers.forEach(customer => {
      const date = dayjs(customer.created_at).format('YYYY-MM-DD');
      const src = customer.source || '未知';
      sources.add(src);

      if (!dateMap[date]) {
        dateMap[date] = {};
      }
      dateMap[date][src] = (dateMap[date][src] || 0) + 1;
    });

    // 生成完整日期序列
    const dates = [];
    let currentDate = startDate;
    while (currentDate.isBefore(endDate) || currentDate.isSame(endDate, 'day')) {
      dates.push(currentDate.format('YYYY-MM-DD'));
      currentDate = currentDate.add(1, 'day');
    }

    // 构建趋势数据
    const series = {};
    sources.forEach(src => {
      series[src] = dates.map(date => dateMap[date]?.[src] || 0);
    });

    res.json({
      code: 200,
      message: '获取成功',
      data: {
        dates,
        series
      }
    });
  } catch (error) {
    console.error('获取来源趋势错误:', error);
    res.status(500).json({
      code: 500,
      message: '服务器错误',
      error: error.message
    });
  }
};

/**
 * 来源转化率统计
 */
exports.getSourceConversion = async (req, res) => {
  try {
    const { start_date, end_date } = req.query;

    // 构建查询条件（包含数据范围过滤）
    const where = { ...buildOwnerFilter(req) };
    if (start_date && end_date) {
      where.created_at = {
        [Op.between]: [new Date(start_date), new Date(end_date)]
      };
    }

    // 获取所有客户（不包含机会，避免重复）
    const customers = await models.Customer.findAll({
      where,
      attributes: ['id', 'source']
    });

    // 获取有赢单机会的客户ID集合
    const wonOpportunities = await models.Opportunity.findAll({
      where: {
        status: 'won'
      },
      attributes: ['customer_id'],
      group: ['customer_id'],
      raw: true
    });
    
    const wonCustomerIds = new Set(wonOpportunities.map(o => o.customer_id));

    // 统计各来源的转化情况
    const sourceConversion = {};
    
    customers.forEach(customer => {
      const source = customer.source || '未知';
      if (!sourceConversion[source]) {
        sourceConversion[source] = {
          total: 0,
          converted: 0
        };
      }
      
      sourceConversion[source].total++;
      // 检查客户是否有赢单机会
      if (wonCustomerIds.has(customer.id)) {
        sourceConversion[source].converted++;
      }
    });

    // 计算转化率
    const conversionStats = Object.keys(sourceConversion).map(source => ({
      source,
      total: sourceConversion[source].total,
      converted: sourceConversion[source].converted,
      conversion_rate: sourceConversion[source].total > 0 
        ? ((sourceConversion[source].converted / sourceConversion[source].total) * 100).toFixed(2)
        : '0.00'
    }));

    // 按转化率降序排序
    conversionStats.sort((a, b) => parseFloat(b.conversion_rate) - parseFloat(a.conversion_rate));

    res.json({
      code: 200,
      message: '获取成功',
      data: conversionStats
    });
  } catch (error) {
    console.error('获取来源转化率错误:', error);
    res.status(500).json({
      code: 500,
      message: '服务器错误',
      error: error.message
    });
  }
};

// ==================== 行业分析 ====================

/**
 * 客户行业统计
 */
exports.getIndustryStats = async (req, res) => {
  try {
    const { start_date, end_date } = req.query;

    // 构建查询条件（包含数据范围过滤）
    const where = { ...buildOwnerFilter(req) };
    if (start_date && end_date) {
      where.created_at = {
        [Op.between]: [new Date(start_date), new Date(end_date)]
      };
    }

    // 按行业分组统计
    const customers = await models.Customer.findAll({
      where,
      attributes: ['industry'],
      raw: true
    });

    // 统计各行业数量
    const industryMap = {};
    customers.forEach(customer => {
      const industry = customer.industry || '未知';
      industryMap[industry] = (industryMap[industry] || 0) + 1;
    });

    // 转换为数组格式
    const industryStats = Object.keys(industryMap).map(industry => ({
      industry,
      count: industryMap[industry],
      percentage: ((industryMap[industry] / customers.length) * 100).toFixed(2)
    }));

    // 按数量降序排序
    industryStats.sort((a, b) => b.count - a.count);

    res.json({
      code: 200,
      message: '获取成功',
      data: {
        total: customers.length,
        stats: industryStats
      }
    });
  } catch (error) {
    console.error('获取行业统计错误:', error);
    res.status(500).json({
      code: 500,
      message: '服务器错误',
      error: error.message
    });
  }
};

/**
 * 行业对比分析
 */
exports.getIndustryComparison = async (req, res) => {
  try {
    const { start_date, end_date } = req.query;

    // 构建查询条件（包含数据范围过滤）
    const where = { ...buildOwnerFilter(req) };
    if (start_date && end_date) {
      where.created_at = {
        [Op.between]: [new Date(start_date), new Date(end_date)]
      };
    }

    // 获取客户及销售机会数据
    const customers = await models.Customer.findAll({
      where,
      include: [{
        model: models.Opportunity,
        as: 'opportunities',
        required: false
      }],
      attributes: ['id', 'industry']
    });

    // 统计各行业的详细数据（使用Set去重）
    const industryData = {};
    
    customers.forEach(customer => {
      const industry = customer.industry || '未知';
      if (!industryData[industry]) {
        industryData[industry] = {
          customer_ids: new Set(),
          opportunity_count: 0,
          won_count: 0,
          total_amount: 0
        };
      }
      
      // 使用Set去重，确保每个客户只计数一次
      industryData[industry].customer_ids.add(customer.id);
      
      if (customer.opportunities) {
        industryData[industry].opportunity_count += customer.opportunities.length;
        
        customer.opportunities.forEach(opp => {
          if (opp.status === 'won') {
            industryData[industry].won_count++;
            industryData[industry].total_amount += parseFloat(opp.actual_amount || opp.amount || 0);
          }
        });
      }
    });
    
    // 转换Set为计数

    const comparisonStats = Object.keys(industryData).map(industry => {
      const data = industryData[industry];
      const customerCount = data.customer_ids.size;
      return {
        industry,
        customer_count: customerCount,
        opportunity_count: data.opportunity_count,
        won_count: data.won_count,
        total_amount: data.total_amount.toFixed(2),
        conversion_rate: customerCount > 0 
          ? ((data.won_count / customerCount) * 100).toFixed(2)
          : '0.00'
      };
    });

    // 按客户数降序排序
    comparisonStats.sort((a, b) => b.customer_count - a.customer_count);

    res.json({
      code: 200,
      message: '获取成功',
      data: comparisonStats
    });
  } catch (error) {
    console.error('获取行业对比错误:', error);
    res.status(500).json({
      code: 500,
      message: '服务器错误',
      error: error.message
    });
  }
};

// ==================== 销售行为分析 ====================

/**
 * 销售行为统计 - 管理员可查看所有，普通用户只能看自己
 */
exports.getBehaviorStats = async (req, res) => {
  try {
    const { start_date, end_date, user_id } = req.query;

    // 构建查询条件
    const where = {};
    if (start_date && end_date) {
      where.created_at = {
        [Op.between]: [new Date(start_date), new Date(end_date)]
      };
    }
    
    // 数据范围控制：非管理员只能查看自己的数据
    if (!isAdmin(req)) {
      where.user_id = req.user.id;
    } else if (user_id) {
      where.user_id = user_id;
    }

    // 获取跟进记录
    const followups = await models.Followup.findAll({
      where,
      include: [
        {
          model: models.User,
          as: 'user',
          attributes: ['id', 'username', 'name']
        },
        {
          model: models.Customer,
          as: 'customer',
          attributes: ['id', 'name']
        }
      ],
      order: [['created_at', 'ASC']]
    });

    // 按销售人员分组统计
    const userStats = {};
    
    followups.forEach(followup => {
      const userId = followup.user_id;
      const userName = followup.user?.name || followup.user?.username || '未知';
      
      if (!userStats[userId]) {
        userStats[userId] = {
          user_id: userId,
          user_name: userName,
          followup_count: 0,
          customer_count: new Set(),
          follow_times: []
        };
      }
      
      userStats[userId].followup_count++;
      userStats[userId].customer_count.add(followup.customer_id);
      userStats[userId].follow_times.push(new Date(followup.created_at));
    });

    // 计算平均跟进频率
    const behaviorStats = Object.values(userStats).map(stat => {
      const customerCount = stat.customer_count.size;
      const avgFollowupPerCustomer = customerCount > 0 
        ? (stat.followup_count / customerCount).toFixed(2)
        : '0.00';
      
      // 计算跟进间隔（天）
      let avgInterval = 0;
      if (stat.follow_times.length > 1) {
        const intervals = [];
        for (let i = 1; i < stat.follow_times.length; i++) {
          const diff = (stat.follow_times[i] - stat.follow_times[i-1]) / (1000 * 60 * 60 * 24);
          intervals.push(diff);
        }
        avgInterval = intervals.length > 0 
          ? (intervals.reduce((a, b) => a + b, 0) / intervals.length).toFixed(2)
          : 0;
      }
      
      return {
        user_id: stat.user_id,
        user_name: stat.user_name,
        followup_count: stat.followup_count,
        customer_count: customerCount,
        avg_followup_per_customer: avgFollowupPerCustomer,
        avg_interval_days: avgInterval
      };
    });

    // 按跟进次数降序排序
    behaviorStats.sort((a, b) => b.followup_count - a.followup_count);

    res.json({
      code: 200,
      message: '获取成功',
      data: behaviorStats
    });
  } catch (error) {
    console.error('获取销售行为统计错误:', error);
    res.status(500).json({
      code: 500,
      message: '服务器错误',
      error: error.message
    });
  }
};

/**
 * 销售人员绩效对比 - 仅管理员可查看
 */
exports.getUserPerformance = async (req, res) => {
  try {
    // 权限检查：仅管理员可查看所有销售人员绩效
    if (!isAdmin(req)) {
      return res.status(403).json({ code: 403, message: '需要管理员权限' });
    }
    const { start_date, end_date } = req.query;

    // 构建查询条件
    const customerWhere = {};
    const opportunityWhere = {};
    
    if (start_date && end_date) {
      customerWhere.created_at = {
        [Op.between]: [new Date(start_date), new Date(end_date)]
      };
      opportunityWhere.created_at = {
        [Op.between]: [new Date(start_date), new Date(end_date)]
      };
    }

    // 获取所有用户（排除管理员）
    const users = await models.User.findAll({
      where: {
        status: 1  // 只查询启用的用户
      },
      attributes: ['id', 'username', 'name']
    });

    // 统计每个销售人员的绩效
    const performanceData = await Promise.all(users.map(async (user) => {
      // 客户数（带时间过滤）
      const customerCount = await models.Customer.count({
        where: {
          owner_id: user.id,
          ...customerWhere
        }
      });

      // 跟进记录数（带时间过滤）
      const followupWhere = {};
      if (start_date && end_date) {
        followupWhere.created_at = {
          [Op.between]: [new Date(start_date), new Date(end_date)]
        };
      }
      const followupCount = await models.Followup.count({
        where: {
          user_id: user.id,
          ...followupWhere
        }
      });

      // 销售机会数和赢单数（带时间过滤）
      const opportunities = await models.Opportunity.findAll({
        where: {
          owner_id: user.id,
          ...opportunityWhere
        },
        attributes: ['stage', 'status', 'amount', 'actual_amount'],
        raw: true
      });

      const opportunityCount = opportunities.length;
      const wonOpportunities = opportunities.filter(o => o.status === 'won');
      const wonCount = wonOpportunities.length;
      const totalAmount = wonOpportunities.reduce((sum, o) => sum + parseFloat(o.actual_amount || o.amount || 0), 0);

      // 转化率：基于客户总数的成交转化
      const conversionRate = customerCount > 0 
        ? ((wonCount / customerCount) * 100).toFixed(2)
        : '0.00';

      return {
        user_id: user.id,
        user_name: user.name || user.username,
        customer_count: customerCount,
        followup_count: followupCount,
        opportunity_count: opportunityCount,
        won_count: wonCount,
        total_amount: totalAmount.toFixed(2),
        conversion_rate: conversionRate
      };
    }));

    // 按成交金额降序排序
    performanceData.sort((a, b) => parseFloat(b.total_amount) - parseFloat(a.total_amount));

    res.json({
      code: 200,
      message: '获取成功',
      data: performanceData
    });
  } catch (error) {
    console.error('获取销售人员绩效错误:', error);
    res.status(500).json({
      code: 500,
      message: '服务器错误',
      error: error.message
    });
  }
};
