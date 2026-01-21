const rateLimit = require('express-rate-limit');

/**
 * 通用API限流 - 每个IP每分钟100次请求
 */
const apiLimiter = rateLimit({
  windowMs: 60 * 1000, // 1分钟
  max: 100,
  message: {
    code: 429,
    message: '请求过于频繁，请稍后再试'
  },
  standardHeaders: true,
  legacyHeaders: false
});

/**
 * 登录接口限流 - 每个IP每15分钟最多10次尝试
 * 防止暴力破解
 */
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15分钟
  max: 10,
  message: {
    code: 429,
    message: '登录尝试次数过多，请15分钟后再试'
  },
  standardHeaders: true,
  legacyHeaders: false,
  skipSuccessfulRequests: true // 成功的请求不计入限制
});

/**
 * 严格限流 - 敏感操作（如密码重置）
 * 每个IP每小时最多5次
 */
const strictLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1小时
  max: 5,
  message: {
    code: 429,
    message: '操作过于频繁，请1小时后再试'
  },
  standardHeaders: true,
  legacyHeaders: false
});

/**
 * 文件上传限流 - 每个IP每分钟最多5次
 */
const uploadLimiter = rateLimit({
  windowMs: 60 * 1000, // 1分钟
  max: 5,
  message: {
    code: 429,
    message: '上传过于频繁，请稍后再试'
  },
  standardHeaders: true,
  legacyHeaders: false
});

module.exports = {
  apiLimiter,
  loginLimiter,
  strictLimiter,
  uploadLimiter
};
