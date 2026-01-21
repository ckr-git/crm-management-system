const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { body } = require('express-validator');
const authMiddleware = require('../middlewares/auth');
const { loginLimiter } = require('../middlewares/rateLimit');

// 调试中间件
router.use((req, res, next) => {
  console.log('=== Auth路由收到请求 ===');
  console.log('路径:', req.path);
  console.log('方法:', req.method);
  next();
});

/**
 * @route   POST /api/auth/login
 * @desc    用户登录
 * @access  Public
 */
router.post('/login', loginLimiter, [
  body('username').notEmpty().withMessage('用户名不能为空'),
  body('password').notEmpty().withMessage('密码不能为空')
], authController.login);

/**
 * @route   GET /api/auth/userinfo
 * @desc    获取用户信息
 * @access  Private
 */
router.get('/userinfo', authController.getUserInfo);

/**
 * @route   POST /api/auth/logout
 * @desc    用户登出
 * @access  Private
 */
router.post('/logout', authController.logout);

/**
 * @route   GET /api/auth/refresh-permissions
 * @desc    刷新用户权限
 * @access  Private
 */
router.get('/refresh-permissions', authMiddleware, authController.refreshPermissions);

module.exports = router;
