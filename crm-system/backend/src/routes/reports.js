const express = require('express');
const router = express.Router();
const reportController = require('../controllers/reportController');
const { checkPermission } = require('../middlewares/checkPermission');

/**
 * 报表路由
 */

// 获取综合报表数据 - 需要管理权限
router.get('/comprehensive', checkPermission('user:read'), reportController.getComprehensiveReport);

// 导出Excel报表
router.get('/export-excel', checkPermission('user:read'), reportController.exportExcel);

module.exports = router;
