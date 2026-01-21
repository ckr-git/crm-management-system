const express = require('express');
const router = express.Router();
const reportController = require('../controllers/reportController');

/**
 * 报表路由
 */

// 获取综合报表数据
router.get('/comprehensive', reportController.getComprehensiveReport);

// 导出Excel报表
router.get('/export-excel', reportController.exportExcel);

module.exports = router;
