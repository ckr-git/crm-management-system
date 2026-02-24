const express = require('express');
const router = express.Router();
const logController = require('../controllers/logController');
const { checkPermission } = require('../middlewares/checkPermission');

/**
 * 操作日志路由
 */

// 获取操作日志列表 - 需要管理权限
router.get('/', checkPermission('user:read'), logController.getOperationLogs);

// 获取日志详情
router.get('/:id', checkPermission('user:read'), logController.getLogById);

// 导出日志
router.get('/export/excel', checkPermission('user:read'), logController.exportLogs);

module.exports = router;
