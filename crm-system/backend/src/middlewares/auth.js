const jwt = require('jsonwebtoken');
const config = require('../config');

/**
 * JWT认证中间件
 * 验证请求中的JWT token，并将用户信息挂载到req.user
 */
const authMiddleware = (req, res, next) => {
  try {
    // 从请求头获取token
    const authHeader = req.headers.authorization;
    
    if (!authHeader) {
      return res.status(401).json({
        code: 401,
        message: '未提供认证令牌'
      });
    }

    // 提取token（格式：Bearer <token>）
    const token = authHeader.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({
        code: 401,
        message: '认证令牌格式不正确'
      });
    }

    // 验证token
    const decoded = jwt.verify(token, config.jwt.secret);
    
    // 将用户信息挂载到req对象
    req.user = decoded;
    
    // 继续下一个中间件或路由处理
    next();
  } catch (error) {
    // token验证失败
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        code: 401,
        message: 'token已过期，请重新登录'
      });
    }
    
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({
        code: 401,
        message: 'token无效'
      });
    }
    
    return res.status(401).json({
      code: 401,
      message: '认证失败',
      error: error.message
    });
  }
};

module.exports = authMiddleware;
