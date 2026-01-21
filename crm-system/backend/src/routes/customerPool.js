const express = require('express');
const router = express.Router();
const { body, query } = require('express-validator');
const customerPoolController = require('../controllers/customerPoolController');

// 验证规则
const releaseValidation = [
  body('customer_id').notEmpty().withMessage('客户ID不能为空')
    .isInt().withMessage('客户ID必须是整数'),
  body('reason').notEmpty().withMessage('释放原因不能为空')
    .isLength({ min: 5 }).withMessage('释放原因不能少于5个字符')
];

const listValidation = [
  query('page').optional().isInt({ min: 1 }).withMessage('页码必须大于0'),
  query('pageSize').optional().isInt({ min: 1, max: 10000 }).withMessage('每页条数必须在1-10000之间'),
  query('status').optional().isIn(['available', 'claimed']).withMessage('状态值不正确')
];

// 路由
router.get('/', listValidation, customerPoolController.getPoolList);
router.post('/release', releaseValidation, customerPoolController.releaseToPool);
router.post('/:id/claim', customerPoolController.claimFromPool);
router.get('/stats', customerPoolController.getPoolStats);
router.get('/:id', customerPoolController.getPoolDetail);

module.exports = router;
