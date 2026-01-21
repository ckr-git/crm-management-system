const express = require('express');
const router = express.Router();
const logController = require('../controllers/logController');

/**
 * 操作日志路由
 */

// 获取操作日志列表
router.get('/', logController.getOperationLogs);

// 获取日志详情
router.get('/:id', logController.getLogById);

// 导出日志
router.get('/export/excel', logController.exportLogs);

module.exports = router;
