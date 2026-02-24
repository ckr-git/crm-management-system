const { validationResult } = require('express-validator');
const { ERROR_CODES, ApiResponse } = require('../constants/errorCodes');

/**
 * 统一的验证结果处理中间件
 * 用于处理 express-validator 的验证结果
 */
const validate = (req, res, next) => {
  const errors = validationResult(req);
  
  if (!errors.isEmpty()) {
    const firstError = errors.array()[0];
    
    // 记录验证错误日志（不记录body，避免泄露密码等敏感数据）
    console.error('验证失败:', {
      path: req.path,
      method: req.method,
      errors: errors.array()
    });
    
    return res.status(400).json(
      ApiResponse.error(
        ERROR_CODES.VALIDATION_ERROR,
        firstError.msg,
        {
          field: firstError.param,
          value: firstError.value,
          errors: errors.array()
        }
      )
    );
  }
  
  next();
};

module.exports = validate;
