const express = require('express');
const router = express.Router();
const analysisController = require('../controllers/analysisController');

/**
 * 数据分析路由
 */

// 客户来源统计
router.get('/source-stats', analysisController.getSourceStats);

// 客户来源趋势
router.get('/source-trend', analysisController.getSourceTrend);

// 来源转化率统计
router.get('/source-conversion', analysisController.getSourceConversion);

// 客户行业统计
router.get('/industry-stats', analysisController.getIndustryStats);

// 行业对比分析
router.get('/industry-comparison', analysisController.getIndustryComparison);

// 销售行为统计
router.get('/behavior-stats', analysisController.getBehaviorStats);

// 销售人员绩效对比
router.get('/user-performance', analysisController.getUserPerformance);

module.exports = router;
