const { body, param, query } = require('express-validator');

/**
 * 机会创建验证规则
 */
const createOpportunityValidation = [
  body('customer_id')
    .isInt({ min: 1 }).withMessage('客户ID必须是有效的整数'),
  
  body('name')
    .trim()
    .notEmpty().withMessage('机会名称不能为空')
    .isLength({ max: 100 }).withMessage('机会名称不能超过100个字符'),
  
  body('amount')
    .isFloat({ min: 0 }).withMessage('金额必须是大于等于0的数字'),
  
  body('stage')
    .notEmpty().withMessage('阶段不能为空')
    .isIn(['initial', 'demand', 'proposal', 'negotiation', 'closed_won', 'closed_lost'])
    .withMessage('无效的阶段'),
  
  body('probability')
    .optional()
    .isInt({ min: 0, max: 100 }).withMessage('成交概率必须在0-100之间'),
  
  body('expected_close_date')
    .optional({ checkFalsy: true })
    .isISO8601().withMessage('预计成交日期格式不正确'),
  
  body('product')
    .optional({ checkFalsy: true })
    .trim()
    .isLength({ max: 100 }).withMessage('产品名称不能超过100个字符'),
  
  body('competitor')
    .optional({ checkFalsy: true })
    .trim()
    .isLength({ max: 200 }).withMessage('竞争对手不能超过200个字符'),
  
  body('description')
    .optional({ checkFalsy: true })
    .trim()
    .isLength({ max: 1000 }).withMessage('描述不能超过1000个字符')
];

/**
 * 机会更新验证规则
 */
const updateOpportunityValidation = [
  param('id')
    .isInt({ min: 1 }).withMessage('无效的机会ID'),
  
  body('name')
    .optional()
    .trim()
    .notEmpty().withMessage('机会名称不能为空')
    .isLength({ max: 100 }).withMessage('机会名称不能超过100个字符'),
  
  body('amount')
    .optional()
    .isFloat({ min: 0 }).withMessage('金额必须是大于等于0的数字'),
  
  body('stage')
    .optional()
    .isIn(['initial', 'demand', 'proposal', 'negotiation', 'closed_won', 'closed_lost'])
    .withMessage('无效的阶段'),
  
  body('probability')
    .optional()
    .isInt({ min: 0, max: 100 }).withMessage('成交概率必须在0-100之间'),
  
  body('expected_close_date')
    .optional({ checkFalsy: true })
    .isISO8601().withMessage('预计成交日期格式不正确')
];

/**
 * 机会ID验证
 */
const opportunityIdValidation = [
  param('id')
    .isInt({ min: 1 }).withMessage('无效的机会ID')
];

/**
 * 更新阶段验证
 */
const updateStageValidation = [
  param('id')
    .isInt({ min: 1 }).withMessage('无效的机会ID'),
  
  body('stage')
    .notEmpty().withMessage('阶段不能为空')
    .isIn(['initial', 'demand', 'proposal', 'negotiation', 'closed_won', 'closed_lost'])
    .withMessage('无效的阶段'),
  
  body('probability')
    .optional()
    .isInt({ min: 0, max: 100 }).withMessage('成交概率必须在0-100之间')
];

/**
 * 标记赢单/输单验证
 */
const markAsClosedValidation = [
  param('id')
    .isInt({ min: 1 }).withMessage('无效的机会ID'),
  
  body('reason')
    .optional({ checkFalsy: true })
    .trim()
    .isLength({ max: 500 }).withMessage('原因不能超过500个字符'),
  
  body('actual_close_date')
    .optional({ checkFalsy: true })
    .isISO8601().withMessage('实际成交日期格式不正确')
];

/**
 * 机会列表查询验证
 */
const getOpportunitiesValidation = [
  query('page')
    .optional()
    .isInt({ min: 1 }).withMessage('页码必须是大于0的整数'),
  
  query('pageSize')
    .optional()
    .isInt({ min: 1, max: 100 }).withMessage('每页数量必须在1-100之间'),
  
  query('name')
    .optional({ checkFalsy: true })
    .trim(),
  
  query('stage')
    .optional({ checkFalsy: true })
    .isIn(['initial', 'demand', 'proposal', 'negotiation', 'closed_won', 'closed_lost'])
    .withMessage('无效的阶段'),
  
  query('status')
    .optional({ checkFalsy: true })
    .isIn(['open', 'won', 'lost'])
    .withMessage('无效的状态'),
  
  query('onlyMine')
    .optional({ checkFalsy: true })
    .isIn(['true', 'false']).withMessage('onlyMine参数必须是true或false'),
  
  query('min_amount')
    .optional()
    .isFloat({ min: 0 }).withMessage('最小金额必须是大于等于0的数字'),
  
  query('max_amount')
    .optional()
    .isFloat({ min: 0 }).withMessage('最大金额必须是大于等于0的数字')
];

/**
 * 统计查询验证
 */
const getStatsValidation = [
  query('start_date')
    .optional({ checkFalsy: true })
    .isISO8601().withMessage('开始日期格式不正确'),
  
  query('end_date')
    .optional({ checkFalsy: true })
    .isISO8601().withMessage('结束日期格式不正确'),
  
  query('user_id')
    .optional()
    .isInt({ min: 1 }).withMessage('用户ID必须是有效的整数')
];

module.exports = {
  createOpportunityValidation,
  updateOpportunityValidation,
  opportunityIdValidation,
  updateStageValidation,
  markAsClosedValidation,
  getOpportunitiesValidation,
  getStatsValidation
};
