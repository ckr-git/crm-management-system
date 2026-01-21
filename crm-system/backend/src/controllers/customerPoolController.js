const { models } = require('../models');
const { Op } = require('sequelize');
const { isAdmin } = require('../utils/access');

/**
 * 获取公海池列表
 */
exports.getPoolList = async (req, res) => {
  try {
    const {
      page = 1,
      pageSize = 10,
      status = 'available',
      name,
      industry,
      level
    } = req.query;

    // 构建查询条件
    const where = { status };

    // 分页查询
    const offset = (parseInt(page) - 1) * parseInt(pageSize);
    const limit = parseInt(pageSize);

    const { count, rows } = await models.CustomerPool.findAndCountAll({
      where,
      include: [
        {
          model: models.Customer,
          as: 'customer',
          where: name || industry || level ? {
            ...(name && { name: { [Op.like]: `%${name}%` } }),
            ...(industry && { industry }),
            ...(level && { level })
          } : undefined,
          attributes: ['id', 'name', 'contact', 'phone', 'industry', 'level', 'stage']
        },
        {
          model: models.User,
          as: 'previousOwner',
          attributes: ['id', 'name', 'username']
        },
        {
          model: models.User,
          as: 'claimer',
          attributes: ['id', 'name', 'username']
        }
      ],
      order: [['enter_at', 'DESC']],
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
    console.error('获取公海池列表失败:', error);
    res.status(500).json({
      code: 500,
      message: '获取公海池列表失败',
      error: error.message
    });
  }
};

/**
 * 释放客户到公海
 */
exports.releaseToPool = async (req, res) => {
  try {
    const { customer_id, reason } = req.body;

    // 验证客户是否存在
    const customer = await models.Customer.findByPk(customer_id);
    if (!customer) {
      return res.status(404).json({
        code: 404,
        message: '客户不存在'
      });
    }

    // 检查客户是否有负责人
    if (!customer.owner_id) {
      return res.status(400).json({
        code: 400,
        message: '该客户没有负责人，无法释放'
      });
    }

    // 权限检查：仅客户负责人或管理员可释放
    if (!isAdmin({ user: req.user }) && customer.owner_id !== req.user.id) {
      return res.status(403).json({
        code: 403,
        message: '无权限释放该客户'
      });
    }

    // 检查客户是否已在公海池
    const existingPool = await models.CustomerPool.findOne({
      where: {
        customer_id,
        status: 'available'
      }
    });

    if (existingPool) {
      return res.status(400).json({
        code: 400,
        message: '该客户已在公海池中'
      });
    }

    // 创建公海池记录
    const poolRecord = await models.CustomerPool.create({
      customer_id,
      previous_owner_id: customer.owner_id || req.user.id,
      reason,
      enter_at: new Date(),
      status: 'available'
    });

    // 清空客户的负责人
    await customer.update({
      owner_id: null
    });

    // 重新获取带关联数据的记录
    const fullRecord = await models.CustomerPool.findByPk(poolRecord.id, {
      include: [
        {
          model: models.Customer,
          as: 'customer'
        },
        {
          model: models.User,
          as: 'previousOwner'
        }
      ]
    });

    res.status(201).json({
      code: 200,
      message: '客户已释放到公海',
      data: fullRecord
    });
  } catch (error) {
    console.error('释放客户到公海失败:', error);
    res.status(500).json({
      code: 500,
      message: '释放客户到公海失败',
      error: error.message
    });
  }
};

/**
 * 从公海领取客户
 */
exports.claimFromPool = async (req, res) => {
  try {
    const { id } = req.params; // 公海池记录ID
    const DAILY_CLAIM_LIMIT = 10; // 每日领取上限

    // 查找公海池记录
    const poolRecord = await models.CustomerPool.findOne({
      where: {
        id,
        status: 'available'
      },
      include: [
        {
          model: models.Customer,
          as: 'customer'
        }
      ]
    });

    if (!poolRecord) {
      return res.status(404).json({
        code: 404,
        message: '公海池记录不存在或已被领取'
      });
    }

    // 检查今日领取数量
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const todayClaimedCount = await models.CustomerPool.count({
      where: {
        claimed_by: req.user.id,
        claimed_at: {
          [Op.gte]: today,
          [Op.lt]: tomorrow
        }
      }
    });

    if (todayClaimedCount >= DAILY_CLAIM_LIMIT) {
      return res.status(400).json({
        code: 400,
        message: `您今日已领取${todayClaimedCount}个客户，已达上限（${DAILY_CLAIM_LIMIT}个/天）`
      });
    }

    // 更新公海池记录
    await poolRecord.update({
      claimed_by: req.user.id,
      claimed_at: new Date(),
      status: 'claimed'
    });

    // 更新客户负责人
    await poolRecord.customer.update({
      owner_id: req.user.id
    });

    // 重新获取完整数据
    const fullRecord = await models.CustomerPool.findByPk(id, {
      include: [
        {
          model: models.Customer,
          as: 'customer'
        },
        {
          model: models.User,
          as: 'claimer',
          attributes: ['id', 'name', 'username']
        }
      ]
    });

    res.json({
      code: 200,
      message: `领取成功！今日已领取${todayClaimedCount + 1}/${DAILY_CLAIM_LIMIT}个`,
      data: fullRecord
    });
  } catch (error) {
    console.error('领取客户失败:', error);
    res.status(500).json({
      code: 500,
      message: '领取客户失败',
      error: error.message
    });
  }
};

/**
 * 获取公海池统计
 */
exports.getPoolStats = async (req, res) => {
  try {
    const DAILY_CLAIM_LIMIT = 10;

    // 可领取客户数
    const availableCount = await models.CustomerPool.count({
      where: { status: 'available' }
    });

    // 已领取客户数
    const claimedCount = await models.CustomerPool.count({
      where: { status: 'claimed' }
    });

    // 我领取的客户数
    const myClaimedCount = await models.CustomerPool.count({
      where: {
        claimed_by: req.user.id,
        status: 'claimed'
      }
    });

    // 今日领取数量
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const todayClaimedCount = await models.CustomerPool.count({
      where: {
        claimed_by: req.user.id,
        claimed_at: {
          [Op.gte]: today,
          [Op.lt]: tomorrow
        }
      }
    });

    // 按行业统计
    const industryStats = await models.CustomerPool.findAll({
      where: { status: 'available' },
      include: [
        {
          model: models.Customer,
          as: 'customer',
          attributes: []
        }
      ],
      attributes: [
        [models.CustomerPool.sequelize.col('customer.industry'), 'industry'],
        [models.CustomerPool.sequelize.fn('COUNT', models.CustomerPool.sequelize.col('CustomerPool.id')), 'count']
      ],
      group: ['customer.industry'],
      raw: true
    });

    res.json({
      code: 200,
      message: '获取成功',
      data: {
        availableCount,
        claimedCount,
        myClaimedCount,
        todayClaimedCount,
        dailyClaimLimit: DAILY_CLAIM_LIMIT,
        canClaimToday: todayClaimedCount < DAILY_CLAIM_LIMIT,
        industryStats
      }
    });
  } catch (error) {
    console.error('获取公海池统计失败:', error);
    res.status(500).json({
      code: 500,
      message: '获取公海池统计失败',
      error: error.message
    });
  }
};

/**
 * 获取公海池详情
 */
exports.getPoolDetail = async (req, res) => {
  try {
    const { id } = req.params;

    const poolRecord = await models.CustomerPool.findByPk(id, {
      include: [
        {
          model: models.Customer,
          as: 'customer'
        },
        {
          model: models.User,
          as: 'previousOwner',
          attributes: ['id', 'name', 'username', 'email', 'phone']
        },
        {
          model: models.User,
          as: 'claimer',
          attributes: ['id', 'name', 'username', 'email', 'phone']
        }
      ]
    });

    if (!poolRecord) {
      return res.status(404).json({
        code: 404,
        message: '公海池记录不存在'
      });
    }

    res.json({
      code: 200,
      message: '获取成功',
      data: poolRecord
    });
  } catch (error) {
    console.error('获取公海池详情失败:', error);
    res.status(500).json({
      code: 500,
      message: '获取公海池详情失败',
      error: error.message
    });
  }
};
