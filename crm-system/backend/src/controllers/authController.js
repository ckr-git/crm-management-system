const { validationResult } = require('express-validator');
const jwt = require('jsonwebtoken');
const { models } = require('../models');
const config = require('../config');

/**
 * 用户登录
 */
exports.login = async (req, res) => {
  // 安全：不在日志中输出敏感信息
  console.log('=== 登录请求 ===' , req.body?.username || 'unknown');
  try {
    // 验证输入
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        code: 400,
        message: errors.array()[0].msg
      });
    }

    const { username, password } = req.body;

    // 查找用户
    const user = await models.User.findOne({
      where: { username },
      include: [{
        model: models.Role,
        as: 'role',
        attributes: ['id', 'name', 'code'],
        include: [{
          model: models.Permission,
          as: 'permissions',
          attributes: ['id', 'code', 'name']
        }]
      }]
    });

    if (!user) {
      return res.status(401).json({
        code: 401,
        message: '用户名或密码错误'
      });
    }

    // 检查用户状态
    if (user.status !== 1) {
      return res.status(403).json({
        code: 403,
        message: '账号已被禁用'
      });
    }

    // 验证密码
    const isValid = await user.validatePassword(password);
    if (!isValid) {
      return res.status(401).json({
        code: 401,
        message: '用户名或密码错误'
      });
    }

    // 更新登录信息
    await user.update({
      last_login_at: new Date(),
      last_login_ip: req.ip,
      login_count: user.login_count + 1
    });

    // 提取权限代码列表
    const permissions = user.role?.permissions ? 
      user.role.permissions.map(p => p.code) : [];

    // 生成JWT Token
    const token = jwt.sign(
      { 
        id: user.id, 
        username: user.username,
        role: user.role.code
      },
      config.jwt.secret,
      { expiresIn: config.jwt.expiresIn }
    );

    // 返回用户信息、token和权限
    const userData = user.toSafeJSON();
    res.json({
      code: 200,
      message: '登录成功',
      data: {
        token,
        user: {
          ...userData,
          permissions
        }
      }
    });
  } catch (error) {
    console.error('登录错误:', error.message);
    // 生产环境不暴露错误详情
    res.status(500).json({
      code: 500,
      message: '登录失败，请稍后重试'
    });
  }
};

/**
 * 获取用户信息
 */
exports.getUserInfo = async (req, res) => {
  try {
    // 从token中获取用户ID
    const token = req.headers.authorization?.replace('Bearer ', '');
    if (!token) {
      return res.status(401).json({
        code: 401,
        message: '未提供认证令牌'
      });
    }

    const decoded = jwt.verify(token, config.jwt.secret);
    
    const user = await models.User.findByPk(decoded.id, {
      include: [{
        model: models.Role,
        as: 'role',
        attributes: ['id', 'name', 'code'],
        include: [{
          model: models.Permission,
          as: 'permissions',
          attributes: ['id', 'code', 'name']
        }]
      }]
    });

    if (!user) {
      return res.status(404).json({
        code: 404,
        message: '用户不存在'
      });
    }

    // 提取权限代码列表
    const permissions = user.role?.permissions ? 
      user.role.permissions.map(p => p.code) : [];

    const userData = user.toSafeJSON();
    res.json({
      code: 200,
      message: '获取成功',
      data: {
        ...userData,
        permissions
      }
    });
  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({
        code: 401,
        message: '无效的认证令牌'
      });
    }
    console.error('获取用户信息错误:', error);
    res.status(500).json({
      code: 500,
      message: '服务器错误'
    });
  }
};

/**
 * 用户登出
 */
exports.logout = async (req, res) => {
  try {
    // 这里可以将token加入黑名单（使用Redis）
    // 简单实现：客户端清除token即可
    
    res.json({
      code: 200,
      message: '登出成功'
    });
  } catch (error) {
    console.error('登出错误:', error);
    res.status(500).json({
      code: 500,
      message: '服务器错误'
    });
  }
};

/**
 * 刷新用户权限
 * 用于在角色权限变更后，不需要重新登录即可获取最新权限
 */
exports.refreshPermissions = async (req, res) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({
        code: 401,
        message: '未登录'
      });
    }

    // 重新查询用户信息和权限
    const user = await models.User.findByPk(userId, {
      include: [{
        model: models.Role,
        as: 'role',
        attributes: ['id', 'name', 'code'],
        include: [{
          model: models.Permission,
          as: 'permissions',
          attributes: ['id', 'code', 'name']
        }]
      }]
    });

    if (!user) {
      return res.status(404).json({
        code: 404,
        message: '用户不存在'
      });
    }

    // 提取权限代码列表
    const permissions = user.role?.permissions ? 
      user.role.permissions.map(p => p.code) : [];

    res.json({
      code: 200,
      message: '权限刷新成功',
      data: {
        permissions
      }
    });
  } catch (error) {
    console.error('刷新权限错误:', error);
    res.status(500).json({
      code: 500,
      message: '服务器错误',
      error: error.message
    });
  }
};
