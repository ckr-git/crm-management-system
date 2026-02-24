const { body, param, query } = require('express-validator');
const { 
  CUSTOMER_SOURCES, 
  CUSTOMER_LEVELS, 
  CUSTOMER_STAGES, 
  COMPANY_SIZES,
  PAGINATION 
} = require('../constants/business');

/**
 * 客户创建验证规则
 */
const createCustomerValidation = [
  body('name')
    .trim()
    .notEmpty().withMessage('公司名称不能为空')
    .isLength({ max: 100 }).withMessage('公司名称不能超过100个字符'),
  
  body('contact')
    .trim()
    .notEmpty().withMessage('联系人不能为空')
    .isLength({ max: 50 }).withMessage('联系人名称不能超过50个字符'),
  
  body('phone')
    .trim()
    .notEmpty().withMessage('联系电话不能为空')
    .matches(/^1[3-9]\d{9}$/).withMessage('手机号格式不正确'),
  
  body('email')
    .optional({ checkFalsy: true })
    .trim()
    .isEmail().withMessage('邮箱格式不正确')
    .normalizeEmail(),
  
  body('source')
    .notEmpty().withMessage('客户来源不能为空')
    .isIn(CUSTOMER_SOURCES).withMessage('无效的客户来源'),
  
  body('level')
    .optional()
    .isIn(CUSTOMER_LEVELS).withMessage('无效的客户级别'),
  
  body('stage')
    .optional()
    .isIn(CUSTOMER_STAGES).withMessage('无效的客户阶段'),
  
  body('industry')
    .optional({ checkFalsy: true })
    .trim()
    .isLength({ max: 50 }).withMessage('行业不能超过50个字符'),
  
  body('company_size')
    .optional({ checkFalsy: true })
    .isIn(COMPANY_SIZES).withMessage('无效的公司规模'),
  
  body('mobile')
    .optional({ checkFalsy: true })
    .trim()
    .matches(/^1[3-9]\d{9}$/).withMessage('手机号格式不正确'),
  
  body('wechat')
    .optional({ checkFalsy: true })
    .trim()
    .isLength({ max: 50 }).withMessage('微信号不能超过50个字符'),
  
  body('address')
    .optional({ checkFalsy: true })
    .trim()
    .isLength({ max: 200 }).withMessage('地址不能超过200个字符'),
  
  body('website')
    .optional({ checkFalsy: true })
    .trim()
    .isURL().withMessage('网站地址格式不正确'),
  
  body('remark')
    .optional({ checkFalsy: true })
    .trim()
    .isLength({ max: 500 }).withMessage('备注不能超过500个字符')
];

/**
 * 客户更新验证规则
 */
const updateCustomerValidation = [
  param('id')
    .isInt({ min: 1 }).withMessage('无效的客户ID'),
  
  body('name')
    .optional()
    .trim()
    .notEmpty().withMessage('公司名称不能为空')
    .isLength({ max: 100 }).withMessage('公司名称不能超过100个字符'),
  
  body('contact')
    .optional()
    .trim()
    .notEmpty().withMessage('联系人不能为空')
    .isLength({ max: 50 }).withMessage('联系人名称不能超过50个字符'),
  
  body('phone')
    .optional()
    .trim()
    .notEmpty().withMessage('联系电话不能为空')
    .matches(/^1[3-9]\d{9}$/).withMessage('手机号格式不正确'),
  
  body('email')
    .optional({ checkFalsy: true })
    .trim()
    .isEmail().withMessage('邮箱格式不正确')
    .normalizeEmail(),
  
  body('source')
    .optional()
    .isIn(CUSTOMER_SOURCES).withMessage('无效的客户来源'),
  
  body('level')
    .optional()
    .isIn(CUSTOMER_LEVELS).withMessage('无效的客户级别'),
  
  body('stage')
    .optional()
    .isIn(CUSTOMER_STAGES).withMessage('无效的客户阶段')
];

/**
 * 客户ID验证
 */
const customerIdValidation = [
  param('id')
    .isInt({ min: 1 }).withMessage('无效的客户ID')
];

/**
 * 客户转移验证
 */
const transferCustomerValidation = [
  param('id')
    .isInt({ min: 1 }).withMessage('无效的客户ID'),
  
  body('to_user_id')
    .isInt({ min: 1 }).withMessage('目标用户ID必须是有效的整数'),
  
  body('reason')
    .optional({ checkFalsy: true })
    .trim()
    .isLength({ max: 200 }).withMessage('转移原因不能超过200个字符')
];

/**
 * 批量操作验证
 */
const batchOperationValidation = [
  body('customer_ids')
    .isArray({ min: 1 }).withMessage('请至少选择一个客户')
    .custom((value) => {
      if (!value.every(id => Number.isInteger(id) && id > 0)) {
        throw new Error('客户ID必须是有效的正整数');
      }
      return true;
    })
];

/**
 * 客户列表查询验证
 */
const getCustomersValidation = [
  query('page')
    .optional()
    .isInt({ min: 1 }).withMessage('页码必须是大于0的整数'),
  
  query('pageSize')
    .optional()
    .isInt({ min: 1, max: PAGINATION.MAX_PAGE_SIZE }).withMessage(`每页数量必须在1-${PAGINATION.MAX_PAGE_SIZE}之间`),
  
  query('stage')
    .optional({ checkFalsy: true })
    .isIn(CUSTOMER_STAGES).withMessage('无效的客户阶段'),
  
  query('level')
    .optional({ checkFalsy: true })
    .isIn(CUSTOMER_LEVELS).withMessage('无效的客户级别'),
  
  query('source')
    .optional({ checkFalsy: true })
    .isIn(CUSTOMER_SOURCES).withMessage('无效的客户来源'),
  
  query('onlyMine')
    .optional({ checkFalsy: true })
    .isIn(['true', 'false']).withMessage('onlyMine参数必须是true或false'),
  
  query('name')
    .optional({ checkFalsy: true })
    .trim(),
  
  query('contact')
    .optional({ checkFalsy: true })
    .trim(),
  
  query('phone')
    .optional({ checkFalsy: true })
    .trim()
];

module.exports = {
  createCustomerValidation,
  updateCustomerValidation,
  customerIdValidation,
  transferCustomerValidation,
  batchOperationValidation,
  getCustomersValidation
};
