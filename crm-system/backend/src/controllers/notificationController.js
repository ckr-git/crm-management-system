const { models } = require('../models');
const { Op } = require('sequelize');
const { isAdmin } = require('../utils/access');

/**
 * 发送通知 - 仅管理员可手动发送
 */
exports.sendNotification = async (req, res) => {
  try {
    // 权限检查：仅管理员可手动发送通知
    if (!isAdmin(req)) {
      return res.status(403).json({ code: 403, message: '需要管理员权限' });
    }
    const { user_id, type, title, content, link, extra_data } = req.body;

    const notification = await models.Notification.create({
      user_id,
      type,
      title,
      content,
      link,
      sender_id: req.user.id || req.user.userId,
      extra_data
    });

    res.json({
      code: 200,
      message: '通知发送成功',
      data: notification
    });
  } catch (error) {
    console.error('发送通知错误:', error);
    res.status(500).json({
      code: 500,
      message: '服务器错误',
      error: error.message
    });
  }
};

/**
 * 获取通知列表
 */
exports.getNotifications = async (req, res) => {
  try {
    const { page = 1, limit = 20, type, is_read } = req.query;
    const userId = req.user.id || req.user.userId;

    // 构建查询条件
    const where = {
      user_id: userId
    };

    if (type) {
      where.type = type;
    }

    if (is_read !== undefined) {
      where.is_read = is_read === 'true';
    }

    // 分页查询
    const offset = (page - 1) * limit;
    
    const { count, rows } = await models.Notification.findAndCountAll({
      where,
      include: [
        {
          model: models.User,
          as: 'sender',
          attributes: ['id', 'name', 'username']
        }
      ],
      order: [['created_at', 'DESC']],
      limit: parseInt(limit),
      offset: offset
    });

    res.json({
      code: 200,
      message: '获取成功',
      data: {
        list: rows,
        total: count,
        page: parseInt(page),
        limit: parseInt(limit)
      }
    });
  } catch (error) {
    console.error('获取通知列表错误:', error);
    res.status(500).json({
      code: 500,
      message: '服务器错误',
      error: error.message
    });
  }
};

/**
 * 获取未读消息数量
 */
exports.getUnreadCount = async (req, res) => {
  try {
    const userId = req.user.id || req.user.userId;

    const count = await models.Notification.count({
      where: {
        user_id: userId,
        is_read: false
      }
    });

    res.json({
      code: 200,
      message: '获取成功',
      data: { count }
    });
  } catch (error) {
    console.error('获取未读数量错误:', error);
    res.status(500).json({
      code: 500,
      message: '服务器错误',
      error: error.message
    });
  }
};

/**
 * 标记消息为已读
 */
exports.markAsRead = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id || req.user.userId;

    const notification = await models.Notification.findOne({
      where: {
        id,
        user_id: userId
      }
    });

    if (!notification) {
      return res.status(404).json({
        code: 404,
        message: '通知不存在'
      });
    }

    await notification.update({
      is_read: true,
      read_at: new Date()
    });

    res.json({
      code: 200,
      message: '标记成功',
      data: notification
    });
  } catch (error) {
    console.error('标记已读错误:', error);
    res.status(500).json({
      code: 500,
      message: '服务器错误',
      error: error.message
    });
  }
};

/**
 * 全部标记为已读
 */
exports.markAllAsRead = async (req, res) => {
  try {
    const userId = req.user.id || req.user.userId;

    await models.Notification.update(
      {
        is_read: true,
        read_at: new Date()
      },
      {
        where: {
          user_id: userId,
          is_read: false
        }
      }
    );

    res.json({
      code: 200,
      message: '全部标记成功'
    });
  } catch (error) {
    console.error('全部标记已读错误:', error);
    res.status(500).json({
      code: 500,
      message: '服务器错误',
      error: error.message
    });
  }
};

/**
 * 删除通知
 */
exports.deleteNotification = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id || req.user.userId;

    const notification = await models.Notification.findOne({
      where: {
        id,
        user_id: userId
      }
    });

    if (!notification) {
      return res.status(404).json({
        code: 404,
        message: '通知不存在'
      });
    }

    await notification.destroy();

    res.json({
      code: 200,
      message: '删除成功'
    });
  } catch (error) {
    console.error('删除通知错误:', error);
    res.status(500).json({
      code: 500,
      message: '服务器错误',
      error: error.message
    });
  }
};

// ==================== 通知触发器 ====================

/**
 * 发送客户分配通知
 */
exports.sendCustomerAssignNotification = async (customerId, newOwnerId, operatorName) => {
  try {
    const customer = await models.Customer.findByPk(customerId);
    if (!customer) return;

    await models.Notification.create({
      user_id: newOwnerId,
      type: 'customer',
      title: '客户分配通知',
      content: `${operatorName} 将客户【${customer.name}】分配给了您`,
      link: `/customers/${customerId}`,
      extra_data: {
        customer_id: customerId,
        customer_name: customer.name
      }
    });
  } catch (error) {
    console.error('发送客户分配通知错误:', error);
  }
};

/**
 * 发送跟进提醒通知
 */
exports.sendFollowupReminderNotification = async (followupId, userId) => {
  try {
    const followup = await models.Followup.findOne({
      where: { id: followupId },
      include: [{
        model: models.Customer,
        as: 'customer',
        attributes: ['id', 'name']
      }]
    });

    if (!followup) return;

    await models.Notification.create({
      user_id: userId,
      type: 'task',
      title: '跟进提醒',
      content: `您有一条客户【${followup.customer.name}】的跟进计划需要执行`,
      link: `/customers/${followup.customer_id}`,
      extra_data: {
        customer_id: followup.customer_id,
        customer_name: followup.customer.name,
        followup_id: followupId
      }
    });
  } catch (error) {
    console.error('发送跟进提醒通知错误:', error);
  }
};

/**
 * 发送销售机会变更通知
 */
exports.sendOpportunityChangeNotification = async (opportunityId, ownerId, stage) => {
  try {
    const opportunity = await models.Opportunity.findOne({
      where: { id: opportunityId },
      include: [{
        model: models.Customer,
        as: 'customer',
        attributes: ['id', 'name']
      }]
    });

    if (!opportunity) return;

    await models.Notification.create({
      user_id: ownerId,
      type: 'customer',
      title: '销售机会状态变更',
      content: `客户【${opportunity.customer.name}】的销售机会【${opportunity.name}】状态已变更为：${stage}`,
      link: `/opportunities/${opportunityId}`,
      extra_data: {
        opportunity_id: opportunityId,
        opportunity_name: opportunity.name,
        customer_name: opportunity.customer.name,
        stage: stage
      }
    });
  } catch (error) {
    console.error('发送销售机会变更通知错误:', error);
  }
};
