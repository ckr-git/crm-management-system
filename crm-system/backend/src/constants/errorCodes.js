/**
 * 统一错误码定义
 */

const ERROR_CODES = {
  // 通用错误 (1000-1999)
  SUCCESS: { code: 200, message: '操作成功' },
  VALIDATION_ERROR: { code: 1001, message: '数据验证失败' },
  UNAUTHORIZED: { code: 1002, message: '未登录或token失效' },
  FORBIDDEN: { code: 1003, message: '无权限访问' },
  NOT_FOUND: { code: 1004, message: '资源不存在' },
  INTERNAL_ERROR: { code: 1005, message: '服务器内部错误' },
  DUPLICATE_ERROR: { code: 1006, message: '数据已存在' },
  
  // 认证错误 (2000-2099)
  INVALID_CREDENTIALS: { code: 2001, message: '用户名或密码错误' },
  ACCOUNT_DISABLED: { code: 2002, message: '账号已被禁用' },
  INVALID_TOKEN: { code: 2003, message: '无效的token' },
  TOKEN_EXPIRED: { code: 2004, message: 'token已过期' },
  
  // 客户管理错误 (3000-3099)
  CUSTOMER_NOT_FOUND: { code: 3001, message: '客户不存在' },
  CUSTOMER_EXISTS: { code: 3002, message: '客户已存在' },
  CUSTOMER_TRANSFER_FAILED: { code: 3003, message: '客户转移失败' },
  
  // 机会管理错误 (4000-4099)
  OPPORTUNITY_NOT_FOUND: { code: 4001, message: '销售机会不存在' },
  INVALID_STAGE: { code: 4002, message: '无效的阶段' },
  OPPORTUNITY_CLOSED: { code: 4003, message: '销售机会已关闭' },
  
  // 用户管理错误 (5000-5099)
  USER_NOT_FOUND: { code: 5001, message: '用户不存在' },
  USER_EXISTS: { code: 5002, message: '用户已存在' },
  
  // 权限管理错误 (6000-6099)
  ROLE_NOT_FOUND: { code: 6001, message: '角色不存在' },
  PERMISSION_DENIED: { code: 6002, message: '权限不足' }
};

/**
 * 创建标准响应对象
 */
class ApiResponse {
  static success(data = null, message = '操作成功', code = 200) {
    return { code, message, data };
  }

  static error(errorCode, customMessage = null, data = null) {
    return {
      code: errorCode.code,
      message: customMessage || errorCode.message,
      data
    };
  }
}

/**
 * 创建自定义错误类
 */
class AppError extends Error {
  constructor(errorCode, customMessage = null, statusCode = null) {
    super(customMessage || errorCode.message);
    this.name = 'AppError';
    this.errorCode = errorCode;
    this.statusCode = statusCode || this.getStatusCodeFromErrorCode(errorCode.code);
  }

  getStatusCodeFromErrorCode(code) {
    if (code >= 2000 && code < 3000) return 401; // 认证错误
    if (code === 1003 || code === 6002) return 403; // 权限错误
    if (code === 1004 || (code >= 3000 && code % 1000 === 1)) return 404; // 资源不存在
    if (code === 1001 || code === 1006) return 400; // 验证错误
    return 500; // 默认服务器错误
  }

  toJSON() {
    return {
      code: this.errorCode.code,
      message: this.message,
      statusCode: this.statusCode
    };
  }
}

module.exports = {
  ERROR_CODES,
  ApiResponse,
  AppError
};
