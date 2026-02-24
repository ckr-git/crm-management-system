const express = require('express');
const router = express.Router();
const { body, query } = require('express-validator');
const followupController = require('../controllers/followupController');
const upload = require('../middleware/upload');
const validate = require('../middlewares/validate');

// 验证规则
const createValidation = [
  body('customer_id').notEmpty().withMessage('客户ID不能为空')
    .isInt().withMessage('客户ID必须是整数'),
  body('type').notEmpty().withMessage('跟进方式不能为空')
    .isIn(['phone', 'visit', 'email', 'wechat']).withMessage('跟进方式不正确'),
  body('content').notEmpty().withMessage('跟进内容不能为空')
    .isLength({ min: 10 }).withMessage('跟进内容不能少于10个字符'),
  body('next_followup_at').optional({ checkFalsy: true }).isISO8601().withMessage('下次跟进时间格式不正确')
];

const updateValidation = [
  body('type').optional().isIn(['phone', 'visit', 'email', 'wechat']).withMessage('跟进方式不正确'),
  body('content').optional().isLength({ min: 10 }).withMessage('跟进内容不能少于10个字符'),
  body('next_followup_at').optional({ checkFalsy: true }).isISO8601().withMessage('下次跟进时间格式不正确')
];

const listValidation = [
  query('page').optional().isInt({ min: 1 }).withMessage('页码必须大于0'),
  query('pageSize').optional().isInt({ min: 1, max: 10000 }).withMessage('每页条数必须在1-10000之间'),
  query('customer_id').optional().isInt().withMessage('客户ID必须是整数'),
  query('user_id').optional().isInt().withMessage('用户ID必须是整数')
];

// 路由
router.get('/', listValidation, validate, followupController.getFollowupList);
router.post('/', createValidation, validate, followupController.createFollowup);
router.get('/stats', followupController.getFollowupStats);
router.get('/stats/user', followupController.getUserStats);
router.get('/stats/team', followupController.getTeamStats);
router.get('/reminders', followupController.getReminders);
router.get('/overdue', followupController.getOverdueFollowups);
router.get('/export', followupController.exportFollowups);
router.get('/template', followupController.downloadFollowupTemplate);
router.post('/import', upload.single('file'), followupController.importFollowups);
router.get('/:id', followupController.getFollowupDetail);
router.put('/:id', updateValidation, validate, followupController.updateFollowup);
router.delete('/:id', followupController.deleteFollowup);

module.exports = router;
