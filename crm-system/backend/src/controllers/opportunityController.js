const { models } = require('../models');
const { Op } = require('sequelize');
const notificationController = require('./notificationController');

const { ensureUserContext, isAdmin } = require('../utils/access')

// 获取销售机会列表
exports.getOpportunities = async (req, res) => {
  try {
    const {
      page = 1,
      pageSize = 10,
      name = '',
      stage = '',
      status = '',
      onlyMine = 'true'
    } = req.query;

    await ensureUserContext(req)

    const where = {}
    if (isAdmin(req)) {
      if (onlyMine === 'true') {
        where.owner_id = req.user.id
      } else {
        where.owner_id = { [Op.ne]: null }
      }
    } else {
      where.owner_id = req.user.id
    }

    if (name) where.name = { [Op.like]: `%${name}%` };
    if (stage) where.stage = stage;
    if (status) where.status = status;

    const offset = (page - 1) * pageSize;
    const limit = parseInt(pageSize);

    const { count, rows } = await models.Opportunity.findAndCountAll({
      where,
      include: [
        { model: models.Customer, as: 'customer', attributes: ['id', 'name', 'contact'] },
        { model: models.User, as: 'owner', attributes: ['id', 'name', 'username'] }
      ],
      offset,
      limit,
      order: [['created_at', 'DESC']]
    });

    res.json({
      code: 200,
      message: '获取成功',
      data: { list: rows, total: count, page: parseInt(page), pageSize: parseInt(pageSize) }
    });
  } catch (error) {
    console.error('获取机会列表失败:', error);
    res.status(500).json({ code: 500, message: '获取机会列表失败' });
  }
};

// 创建销售机会
exports.createOpportunity = async (req, res) => {
  try {
    const opportunity = await models.Opportunity.create({
      ...req.body,
      owner_id: req.body.owner_id || req.user.id
    });

    res.status(201).json({
      code: 200,
      message: '创建成功',
      data: opportunity
    });
  } catch (error) {
    console.error('创建机会失败:', error);
    res.status(500).json({ code: 500, message: '创建机会失败' });
  }
};

// 获取机会详情
exports.getOpportunityById = async (req, res) => {
  try {
    await ensureUserContext(req)
    const opportunity = await models.Opportunity.findByPk(req.params.id, {
      include: [
        { model: models.Customer, as: 'customer' },
        { model: models.User, as: 'owner', attributes: ['id', 'name', 'username'] }
      ]
    });

    if (!opportunity) {
      return res.status(404).json({ code: 404, message: '机会不存在' });
    }

    // 数据范围校验：仅管理员或负责人可读
    if (!isAdmin(req) && opportunity.owner_id !== req.user.id) {
      return res.status(403).json({ code: 403, message: '无权限查看该机会' })
    }

    res.json({ code: 200, message: '获取成功', data: opportunity });
  } catch (error) {
    console.error('获取机会详情失败:', error);
    res.status(500).json({ code: 500, message: '获取机会详情失败' });
  }
};

// 更新机会
exports.updateOpportunity = async (req, res) => {
  try {
    await ensureUserContext(req)
    const opportunity = await models.Opportunity.findByPk(req.params.id);
    if (!opportunity) {
      return res.status(404).json({ code: 404, message: '机会不存在' });
    }

    // 数据范围校验：仅管理员或负责人可改（必须在update之前检查）
    if (!isAdmin(req) && opportunity.owner_id !== req.user.id) {
      return res.status(403).json({ code: 403, message: '无权限修改该机会' })
    }

    // 记录旧的阶段和状态
    const oldStage = opportunity.stage;
    const oldStatus = opportunity.status;

    await opportunity.update(req.body);

    // 如果阶段或状态变更，记录历史
    if ((req.body.stage && req.body.stage !== oldStage) || (req.body.status && req.body.status !== oldStatus)) {
      try {
        await models.OpportunityStageHistory.create({
          opportunity_id: req.params.id,
          old_stage: oldStage,
          new_stage: opportunity.stage,
          old_status: oldStatus,
          new_status: opportunity.status,
          changed_by: req.user.id,
          remark: req.body.remark || ''
        });
        console.log(`✅ 阶段历史已记录：机会ID=${req.params.id}, ${oldStage}->${opportunity.stage}`);
      } catch (error) {
        console.error('记录阶段历史失败:', error);
      }
    }

    // 如果阶段变更，发送通知
    if (req.body.stage && req.body.stage !== oldStage) {
      try {
        await notificationController.sendOpportunityChangeNotification(
          req.params.id,
          opportunity.owner_id,
          req.body.stage
        );
        console.log(`✅ 机会变更通知已发送：机会ID=${req.params.id}, 新阶段=${req.body.stage}`);
      } catch (error) {
        console.error('发送机会变更通知失败:', error);
      }
    }

    res.json({ code: 200, message: '更新成功', data: opportunity });
  } catch (error) {
    console.error('更新机会失败:', error);
    res.status(500).json({ code: 500, message: '更新机会失败' });
  }
};

// 删除机会
exports.deleteOpportunity = async (req, res) => {
  try {
    await ensureUserContext(req)
    const opportunity = await models.Opportunity.findByPk(req.params.id);
    if (!opportunity) {
      return res.status(404).json({ code: 404, message: '机会不存在' });
    }

    // 数据范围校验：仅管理员或负责人可删
    if (!isAdmin(req) && opportunity.owner_id !== req.user.id) {
      return res.status(403).json({ code: 403, message: '无权限删除该机会' })
    }

    await opportunity.destroy();
    res.json({ code: 200, message: '删除成功' });
  } catch (error) {
    console.error('删除机会失败:', error);
    res.status(500).json({ code: 500, message: '删除机会失败' });
  }
};

// 获取统计数据
exports.getStats = async (req, res) => {
  try {
    const stats = {
      total: await models.Opportunity.count({ where: { owner_id: req.user.id } }),
      open: await models.Opportunity.count({ where: { owner_id: req.user.id, status: 'open' } }),
      won: await models.Opportunity.count({ where: { owner_id: req.user.id, status: 'won' } }),
      lost: await models.Opportunity.count({ where: { owner_id: req.user.id, status: 'lost' } }),
      totalAmount: await models.Opportunity.sum('amount', { where: { owner_id: req.user.id, status: 'open' } }) || 0
    };

    res.json({ code: 200, message: '获取成功', data: stats });
  } catch (error) {
    console.error('获取统计数据失败:', error);
    res.status(500).json({ code: 500, message: '获取统计数据失败' });
  }
};

// 获取销售漏斗数据
exports.getFunnel = async (req, res) => {
  try {
    const { sequelize } = require('../models');
    const { startDate, endDate } = req.query;
    
    // 构建时间范围条件
    const where = { owner_id: req.user.id };
    if (startDate && endDate) {
      where.created_at = {
        [Op.between]: [new Date(startDate), new Date(endDate)]
      };
    }
    
    // 按阶段统计（包括进行中和已完成的）
    const results = await models.Opportunity.findAll({
      attributes: [
        'stage',
        'status',
        [sequelize.fn('COUNT', sequelize.col('id')), 'count'],
        [sequelize.fn('SUM', sequelize.col('amount')), 'amount']
      ],
      where,
      group: ['stage', 'status'],
      raw: true
    });

    // 阶段映射
    const stageMap = {
      initial: { name: '初步沟通', order: 1, probability: 10 },
      demand: { name: '需求确认', order: 2, probability: 30 },
      proposal: { name: '方案报价', order: 3, probability: 50 },
      negotiation: { name: '商务谈判', order: 4, probability: 70 },
      closed_won: { name: '赢单', order: 5, probability: 100 },
      closed_lost: { name: '输单', order: 6, probability: 0 }
    };

    // 按阶段聚合数据
    const stageDataMap = {};
    results.forEach(item => {
      const stage = item.stage;
      if (!stageDataMap[stage]) {
        stageDataMap[stage] = {
          stage,
          stageName: stageMap[stage]?.name || stage,
          order: stageMap[stage]?.order || 0,
          count: 0,
          amount: 0,
          wonCount: 0,
          wonAmount: 0,
          lostCount: 0,
          probability: stageMap[stage]?.probability || 0
        };
      }
      
      const count = parseInt(item.count);
      const amount = parseFloat(item.amount) || 0;
      
      stageDataMap[stage].count += count;
      stageDataMap[stage].amount += amount;
      
      if (item.status === 'won') {
        stageDataMap[stage].wonCount += count;
        stageDataMap[stage].wonAmount += amount;
      } else if (item.status === 'lost') {
        stageDataMap[stage].lostCount += count;
      }
    });

    // 格式化数据并计算转化率
    const funnel = Object.values(stageDataMap)
      .sort((a, b) => a.order - b.order)
      .map((item, index, array) => {
        // 计算转化率：当前阶段进入下一阶段的比例
        let conversionRate = 0;
        if (index > 0) {
          const prevStage = array[index - 1];
          if (prevStage.count > 0) {
            conversionRate = Math.round((item.count / prevStage.count) * 100);
          }
        } else {
          conversionRate = 100; // 第一个阶段转化率为100%
        }
        
        // 计算赢单率
        const winRate = item.count > 0 
          ? Math.round((item.wonCount / item.count) * 100) 
          : 0;
        
        return {
          ...item,
          conversionRate,     // 从上一阶段转化的比例
          winRate,            // 该阶段的赢单率
          amountFormatted: `￥${item.amount.toLocaleString('zh-CN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
        };
      });

    // 计算平均成交周期（只计算已赢单的）
    const wonOpportunities = await models.Opportunity.findAll({
      where: {
        ...where,
        status: 'won',
        close_date: { [Op.ne]: null }
      },
      attributes: ['created_at', 'close_date'],
      raw: true
    });

    let avgCycleDays = 0;
    if (wonOpportunities.length > 0) {
      const totalDays = wonOpportunities.reduce((sum, opp) => {
        const createdAt = new Date(opp.created_at);
        const closeDate = new Date(opp.close_date);
        const days = Math.floor((closeDate - createdAt) / (1000 * 60 * 60 * 24));
        return sum + days;
      }, 0);
      avgCycleDays = Math.round(totalDays / wonOpportunities.length);
    }

    // 整体转化率：从初始到赢单
    const initialCount = funnel.find(f => f.stage === 'initial')?.count || 0;
    const wonCount = funnel.find(f => f.stage === 'closed_won')?.wonCount || 0;
    const overallConversionRate = initialCount > 0 
      ? Math.round((wonCount / initialCount) * 100) 
      : 0;

    console.log('漏斗数据:', JSON.stringify({ funnel, avgCycleDays, overallConversionRate }, null, 2));
    res.json({ 
      code: 200, 
      message: '获取成功', 
      data: { 
        funnel,
        avgCycleDays,              // 平均成交周期（天）
        overallConversionRate,     // 整体转化率
        totalOpportunities: funnel.reduce((sum, f) => sum + f.count, 0),
        totalWon: wonCount,
        timeRange: { startDate, endDate }
      } 
    });
  } catch (error) {
    console.error('获取漏斗数据失败:', error);
    res.status(500).json({ code: 500, message: '获取漏斗数据失败' });
  }
};

// 按阶段统计
exports.getStageStats = async (req, res) => {
  try {
    const { sequelize } = require('../models');
    
    await ensureUserContext(req)
    const results = await models.Opportunity.findAll({
      attributes: [
        'stage',
        [sequelize.fn('COUNT', sequelize.col('id')), 'count'],
        [sequelize.fn('SUM', sequelize.col('amount')), 'amount']
      ],
      where: {
        owner_id: req.user.id
      },
      group: ['stage'],
      raw: true
    });

    const stageMap = {
      initial: '初步沟通',
      demand: '需求确认',
      proposal: '方案报价',
      negotiation: '商务谈判',
      closed_won: '赢单',
      closed_lost: '输单'
    };

    const stages = results.map(item => ({
      stage: item.stage,
      stageName: stageMap[item.stage] || item.stage,
      count: parseInt(item.count),
      amount: parseFloat(item.amount) || 0
    }));

    res.json({ code: 200, message: '获取成功', data: { stages } });
  } catch (error) {
    console.error('获取阶段统计失败:', error);
    res.status(500).json({ code: 500, message: '获取阶段统计失败' });
  }
};

// 预测金额
exports.getForecast = async (req, res) => {
  try {
    // 获取所有进行中的机会
    const opportunities = await models.Opportunity.findAll({
      attributes: ['amount', 'probability'],
      where: {
        owner_id: req.user.id,
        status: 'open'
      }
    });

    // 计算预测金额 = Σ(金额 × 赢率)
    let forecastAmount = 0;
    let totalAmount = 0;
    let totalProbability = 0;

    opportunities.forEach(opp => {
      const amount = parseFloat(opp.amount) || 0;
      const probability = parseInt(opp.probability) || 0;
      
      forecastAmount += amount * (probability / 100);
      totalAmount += amount;
      totalProbability += probability;
    });

    const avgProbability = opportunities.length > 0 
      ? Math.round(totalProbability / opportunities.length) 
      : 0;

    res.json({
      code: 200,
      message: '获取成功',
      data: {
        forecastAmount: Math.round(forecastAmount),
        totalAmount: Math.round(totalAmount),
        openCount: opportunities.length,
        avgProbability
      }
    });
  } catch (error) {
    console.error('获取预测数据失败:', error);
    res.status(500).json({ code: 500, message: '获取预测数据失败' });
  }
};

// 获取趋势分析数据（按日期统计）
exports.getTrend = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    
    // 构建时间范围条件
    const where = { owner_id: req.user.id };
    
    if (startDate && endDate) {
      where.created_at = {
        [Op.between]: [new Date(startDate), new Date(endDate)]
      };
    } else {
      // 默认显示最近30天
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      where.created_at = {
        [Op.gte]: thirtyDaysAgo
      };
    }
    
    // 获取所有机会
    const opportunities = await models.Opportunity.findAll({
      where,
      attributes: ['id', 'created_at', 'amount', 'status', 'owner_id'],
      raw: true
    });
    
    // 按日期分组统计（在JS中处理）
    const dateMap = {};
    await ensureUserContext(req)
    opportunities.forEach(opp => {
      const date = opp.created_at.toISOString().split('T')[0];
      if (!dateMap[date]) {
        dateMap[date] = { date, count: 0, amount: 0, wonCount: 0 };
      }
      dateMap[date].count++;
      dateMap[date].amount += parseFloat(opp.amount) || 0;
      if (opp.status === 'won') {
        dateMap[date].wonCount++;
      }
    });
    
    const trend = Object.values(dateMap).sort((a, b) => 
      new Date(a.date) - new Date(b.date)
    );
    
    res.json({ code: 200, message: '获取成功', data: { trend } });
  } catch (error) {
    console.error('获取趋势数据失败:', error);
    res.status(500).json({ code: 500, message: '获取趋势数据失败' });
  }
};

// 获取团队对比数据
exports.getTeamComparison = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    
    // 构建时间范围条件
    const where = {};
    if (startDate && endDate) {
      where.created_at = {
        [Op.between]: [new Date(startDate), new Date(endDate)]
      };
    }
    
    // 获取所有机会（包含负责人信息）
    const opportunities = await models.Opportunity.findAll({
      where,
      attributes: ['id', 'owner_id', 'amount', 'status'],
      include: [
        {
          model: models.User,
          as: 'owner',
          attributes: ['id', 'name']
        }
      ]
    });
    
    // 按负责人分组统计（在JS中处理）
    const userMap = {};
    opportunities.forEach(opp => {
      const userId = opp.owner_id;
      if (!userMap[userId]) {
        userMap[userId] = {
          userId,
          userName: opp.owner?.name || '未知',
          count: 0,
          amount: 0,
          wonCount: 0,
          wonAmount: 0
        };
      }
      userMap[userId].count++;
      userMap[userId].amount += parseFloat(opp.amount) || 0;
      if (opp.status === 'won') {
        userMap[userId].wonCount++;
        userMap[userId].wonAmount += parseFloat(opp.amount) || 0;
      }
    });
    
    const comparison = Object.values(userMap).map(item => ({
      ...item,
      conversionRate: item.count > 0 ? Math.round((item.wonCount / item.count) * 100) : 0
    })).sort((a, b) => b.amount - a.amount);
    
    res.json({ code: 200, message: '获取成功', data: { comparison } });
  } catch (error) {
    console.error('获取团队对比数据失败:', error);
    res.status(500).json({ code: 500, message: '获取团队对比数据失败' });
  }
};

// 增强版统计数据（支持时间范围）
exports.getStatsWithTimeRange = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    const where = { owner_id: req.user.id };
    
    // 添加时间范围过滤
    if (startDate && endDate) {
      where.created_at = {
        [Op.between]: [new Date(startDate), new Date(endDate)]
      };
    }
    
    const stats = {
      total: await models.Opportunity.count({ where }),
      open: await models.Opportunity.count({ where: { ...where, status: 'open' } }),
      won: await models.Opportunity.count({ where: { ...where, status: 'won' } }),
      lost: await models.Opportunity.count({ where: { ...where, status: 'lost' } }),
      totalAmount: await models.Opportunity.sum('amount', { where: { ...where, status: 'open' } }) || 0,
      wonAmount: await models.Opportunity.sum('amount', { where: { ...where, status: 'won' } }) || 0
    };
    
    res.json({ code: 200, message: '获取成功', data: stats });
  } catch (error) {
    console.error('获取统计数据失败:', error);
    res.status(500).json({ code: 500, message: '获取统计数据失败' });
  }
};

/**
 * 获取销售漏斗看板数据（按阶段分组）
 */
exports.getKanbanData = async (req, res) => {
  try {
    const { onlyMine = 'true' } = req.query;

    // 构建查询条件
    const where = {
      // 显示所有未关闭的机会（不包括赢单和输单）
      status: { [Op.notIn]: ['won', 'lost'] },
      owner_id: onlyMine === 'true' ? req.user.id : { [Op.ne]: null }
    };

    // 定义销售阶段（使用数据库中实际的值）
    const stages = [
      { key: 'initial', name: '初步沟通' },
      { key: 'demand', name: '需求确认' },
      { key: 'proposal', name: '方案报价' },
      { key: 'negotiation', name: '商务谈判' }
    ];

    // 查询所有符合条件的机会
    const opportunities = await models.Opportunity.findAll({
      where,
      include: [
        {
          model: models.Customer,
          as: 'customer',
          attributes: ['id', 'name', 'contact', 'phone']
        },
        {
          model: models.User,
          as: 'owner',
          attributes: ['id', 'name', 'username']
        }
      ],
      order: [['updated_at', 'DESC']]
    });

    // 按阶段分组
    const now = new Date();
    const kanbanData = stages.map(stage => {
      const stageOpportunities = opportunities.filter(opp => opp.stage === stage.key);
      const totalAmount = stageOpportunities.reduce((sum, opp) => sum + (parseFloat(opp.amount) || 0), 0);
      
      // 为每个机会添加关键信息
      const enrichedOpportunities = stageOpportunities.map(opp => {
        // 计算天数：从创建到现在
        const createdAt = new Date(opp.created_at);
        const daysInStage = Math.floor((now - createdAt) / (1000 * 60 * 60 * 24));
        
        // 计算预计成交距离天数
        let daysUntilClose = null;
        let isOverdue = false;
        if (opp.expected_close_date) {
          const closeDate = new Date(opp.expected_close_date);
          daysUntilClose = Math.floor((closeDate - now) / (1000 * 60 * 60 * 24));
          isOverdue = daysUntilClose < 0;
        }
        
        // 确定紧急程度颜色
        let urgencyLevel = 'normal'; // normal, warning, danger
        let urgencyColor = '#67C23A'; // 绿色
        
        if (isOverdue) {
          urgencyLevel = 'danger';
          urgencyColor = '#F56C6C'; // 红色
        } else if (daysUntilClose !== null && daysUntilClose <= 7) {
          urgencyLevel = 'warning';
          urgencyColor = '#E6A23C'; // 橙色
        } else if (daysInStage > 30) {
          urgencyLevel = 'warning';
          urgencyColor = '#E6A23C'; // 橙色（长时间未推进）
        }
        
        return {
          ...opp.toJSON(),
          // 关键信息
          cardInfo: {
            customerName: opp.customer?.name || '未知客户',
            customerContact: opp.customer?.contact || '',
            customerPhone: opp.customer?.phone || '',
            amount: parseFloat(opp.amount) || 0,
            amountFormatted: `￥${(parseFloat(opp.amount) || 0).toLocaleString('zh-CN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
            daysInStage: daysInStage,
            daysUntilClose: daysUntilClose,
            isOverdue: isOverdue,
            probability: opp.probability || 0,
            priority: opp.priority || 'medium',
            ownerName: opp.owner?.name || '未分配'
          },
          // 紧急程度标识
          urgency: {
            level: urgencyLevel,
            color: urgencyColor,
            label: urgencyLevel === 'danger' ? '紧急' : (urgencyLevel === 'warning' ? '警告' : '正常')
          }
        };
      });
      
      return {
        stage: stage.key,
        stageName: stage.name,
        count: stageOpportunities.length,
        totalAmount: totalAmount,
        totalAmountFormatted: `￥${totalAmount.toLocaleString('zh-CN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
        opportunities: enrichedOpportunities
      };
    });

    res.json({
      code: 200,
      message: '获取成功',
      data: kanbanData
    });
  } catch (error) {
    console.error('获取看板数据失败:', error);
    res.status(500).json({
      code: 500,
      message: '获取看板数据失败',
      error: error.message
    });
  }
};

/**
 * 更新销售机会阶段
 */
exports.updateStage = async (req, res) => {
  try {
    const { id } = req.params;
    const { stage } = req.body;

    // 验证阶段值
    const validStages = ['initial', 'demand', 'proposal', 'negotiation'];
    if (!stage || !validStages.includes(stage)) {
      return res.status(400).json({
        code: 400,
        message: '无效的销售阶段'
      });
    }

    // 查找销售机会
    const opportunity = await models.Opportunity.findByPk(id);
    if (!opportunity) {
      return res.status(404).json({
        code: 404,
        message: '销售机会不存在'
      });
    }

    // 检查权限
    await ensureUserContext(req)
    if (!isAdmin(req) && opportunity.owner_id !== req.user.id) {
      return res.status(403).json({
        code: 403,
        message: '无权限修改此销售机会'
      });
    }

    // 记录旧阶段
    const oldStage = opportunity.stage;

    // 更新阶段
    await opportunity.update({ stage });

    // 记录阶段历史
    try {
      await models.OpportunityStageHistory.create({
        opportunity_id: id,
        old_stage: oldStage,
        new_stage: stage,
        old_status: opportunity.status,
        new_status: opportunity.status,
        changed_by: req.user.id
      });
    } catch (error) {
      console.error('记录阶段历史失败:', error);
    }

    // 返回更新后的数据
    const updatedOpportunity = await models.Opportunity.findByPk(id, {
      include: [
        {
          model: models.Customer,
          as: 'customer',
          attributes: ['id', 'name', 'contact', 'phone']
        },
        {
          model: models.User,
          as: 'owner',
          attributes: ['id', 'name', 'username']
        }
      ]
    });

    res.json({
      code: 200,
      message: '阶段更新成功',
      data: updatedOpportunity
    });
  } catch (error) {
    console.error('更新阶段失败:', error);
    res.status(500).json({
      code: 500,
      message: '更新阶段失败',
      error: error.message
    });
  }
};

/**
 * 标记为赢单
 */
exports.markAsWon = async (req, res) => {
  try {
    const { id } = req.params;
    const { actual_amount, close_date, remark } = req.body;

    // 查找销售机会
    const opportunity = await models.Opportunity.findByPk(id);
    if (!opportunity) {
      return res.status(404).json({
        code: 404,
        message: '销售机会不存在'
      });
    }

    // 检查权限
    await ensureUserContext(req)
    if (!isAdmin(req) && opportunity.owner_id !== req.user.id) {
      return res.status(403).json({
        code: 403,
        message: '无权限操作此销售机会'
      });
    }

    // 检查当前状态
    if (opportunity.status === 'won') {
      return res.status(400).json({
        code: 400,
        message: '该机会已经是赢单状态'
      });
    }

    if (opportunity.status === 'lost') {
      return res.status(400).json({
        code: 400,
        message: '该机会已经输单，不能标记为赢单'
      });
    }

    // 记录旧状态
    const oldStage = opportunity.stage;
    const oldStatus = opportunity.status;

    // 更新为赢单
    await opportunity.update({
      status: 'won',
      stage: 'closed_won',
      actual_amount: actual_amount || opportunity.amount,
      close_date: close_date || new Date(),
      remark: remark || ''
    });

    // 记录阶段历史
    try {
      await models.OpportunityStageHistory.create({
        opportunity_id: id,
        old_stage: oldStage,
        new_stage: 'closed_won',
        old_status: oldStatus,
        new_status: 'won',
        changed_by: req.user.id,
        remark: '标记为赢单'
      });
    } catch (error) {
      console.error('记录阶段历史失败:', error);
    }

    // 返回更新后的数据
    const updatedOpportunity = await models.Opportunity.findByPk(id, {
      include: [
        {
          model: models.Customer,
          as: 'customer',
          attributes: ['id', 'name', 'contact', 'phone']
        },
        {
          model: models.User,
          as: 'owner',
          attributes: ['id', 'name', 'username']
        }
      ]
    });

    res.json({
      code: 200,
      message: '恭喜！标记为赢单成功',
      data: updatedOpportunity
    });
  } catch (error) {
    console.error('标记赢单失败:', error);
    res.status(500).json({
      code: 500,
      message: '标记赢单失败',
      error: error.message
    });
  }
};

/**
 * 获取销售机会阶段历史
 */
exports.getStageHistory = async (req, res) => {
  try {
    const { id } = req.params;

    // 查找销售机会
    const opportunity = await models.Opportunity.findByPk(id);
    if (!opportunity) {
      return res.status(404).json({
        code: 404,
        message: '销售机会不存在'
      });
    }

    // 检查权限
    await ensureUserContext(req)
    if (!isAdmin(req) && opportunity.owner_id !== req.user.id) {
      return res.status(403).json({
        code: 403,
        message: '无权限查看该机会历史'
      });
    }

    // 查询阶段历史
    const history = await models.OpportunityStageHistory.findAll({
      where: { opportunity_id: id },
      include: [
        {
          model: models.User,
          as: 'operator',
          attributes: ['id', 'name', 'username']
        }
      ],
      order: [['created_at', 'DESC']]
    });

    // 阶段映射
    const stageMap = {
      initial: '初步沟通',
      demand: '需求确认',
      proposal: '方案报价',
      negotiation: '商务谈判',
      closed_won: '赢单',
      closed_lost: '输单'
    };

    const statusMap = {
      open: '进行中',
      won: '已赢单',
      lost: '已输单'
    };

    // 格式化数据
    const formattedHistory = history.map(item => ({
      id: item.id,
      oldStage: item.old_stage,
      oldStageName: stageMap[item.old_stage] || item.old_stage,
      newStage: item.new_stage,
      newStageName: stageMap[item.new_stage] || item.new_stage,
      oldStatus: item.old_status,
      oldStatusName: statusMap[item.old_status] || item.old_status,
      newStatus: item.new_status,
      newStatusName: statusMap[item.new_status] || item.new_status,
      changedBy: item.changed_by,
      operator: item.operator,
      remark: item.remark,
      createdAt: item.created_at
    }));

    res.json({
      code: 200,
      message: '获取成功',
      data: {
        total: formattedHistory.length,
        list: formattedHistory
      }
    });
  } catch (error) {
    console.error('获取阶段历史失败:', error);
    res.status(500).json({
      code: 500,
      message: '获取阶段历史失败',
      error: error.message
    });
  }
};

/**
 * 标记为输单
 */
exports.markAsLost = async (req, res) => {
  try {
    const { id } = req.params;
    const { lost_reason, competitor, remark } = req.body;

    // 验证输单原因
    if (!lost_reason) {
      return res.status(400).json({
        code: 400,
        message: '请选择输单原因'
      });
    }

    // 查找销售机会
    const opportunity = await models.Opportunity.findByPk(id);
    if (!opportunity) {
      return res.status(404).json({
        code: 404,
        message: '销售机会不存在'
      });
    }

    // 检查权限
    await ensureUserContext(req)
    if (!isAdmin(req) && opportunity.owner_id !== req.user.id) {
      return res.status(403).json({
        code: 403,
        message: '无权限操作此销售机会'
      });
    }

    // 检查当前状态
    if (opportunity.status === 'lost') {
      return res.status(400).json({
        code: 400,
        message: '该机会已经是输单状态'
      });
    }

    if (opportunity.status === 'won') {
      return res.status(400).json({
        code: 400,
        message: '该机会已经赢单，不能标记为输单'
      });
    }

    // 记录旧状态
    const oldStage = opportunity.stage;
    const oldStatus = opportunity.status;

    // 更新为输单
    await opportunity.update({
      status: 'lost',
      stage: 'closed_lost',
      lose_reason: lost_reason,  // 修复：使用lose_reason匹配模型定义
      competitor: competitor || '',
      close_date: new Date(),
      remark: remark || ''
    });

    // 记录阶段历史
    try {
      await models.OpportunityStageHistory.create({
        opportunity_id: id,
        old_stage: oldStage,
        new_stage: 'closed_lost',
        old_status: oldStatus,
        new_status: 'lost',
        changed_by: req.user.id,
        remark: `标记为输单：${lost_reason}`
      });
    } catch (error) {
      console.error('记录阶段历史失败:', error);
    }

    // 返回更新后的数据
    const updatedOpportunity = await models.Opportunity.findByPk(id, {
      include: [
        {
          model: models.Customer,
          as: 'customer',
          attributes: ['id', 'name', 'contact', 'phone']
        },
        {
          model: models.User,
          as: 'owner',
          attributes: ['id', 'name', 'username']
        }
      ]
    });

    res.json({
      code: 200,
      message: '标记为输单成功',
      data: updatedOpportunity
    });
  } catch (error) {
    console.error('标记输单失败:', error);
    res.status(500).json({
      code: 500,
      message: '标记输单失败',
      error: error.message
    });
  }
};
