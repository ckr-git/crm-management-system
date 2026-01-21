const express = require('express');
const router = express.Router();
const notificationController = require('../controllers/notificationController');

/**
 * 消息通知路由
 */

// 发送通知
router.post('/', notificationController.sendNotification);

// 获取通知列表
router.get('/', notificationController.getNotifications);

// 获取未读消息数量
router.get('/unread-count', notificationController.getUnreadCount);

// 标记消息为已读
router.put('/:id/read', notificationController.markAsRead);

// 全部标记为已读
router.put('/read-all', notificationController.markAllAsRead);

// 删除通知
router.delete('/:id', notificationController.deleteNotification);

module.exports = router;
