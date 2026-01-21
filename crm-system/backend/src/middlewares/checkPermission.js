/**
 * 权限检查中间件
 * 用于检查用户是否拥有特定权限
 */
const { models } = require('../models');

/**
 * 检查权限
 * @param {string} permissionCode - 权限代码，如 'customer:create'
 */
const checkPermission = (permissionCode) => {
  return async (req, res, next) => {
    try {
      // 获取当前用户
      const userId = req.user?.id;
      if (!userId) {
        return res.status(401).json({
          code: 401,
          message: '未登录'
        });
      }

      // 获取用户及角色信息
      const user = await models.User.findByPk(userId, {
        include: [{
          model: models.Role,
          as: 'role',
          include: [{
            model: models.Permission,
            as: 'permissions',
            attributes: ['code']
          }]
        }]
      });

      if (!user) {
        return res.status(401).json({
          code: 401,
          message: '用户不存在'
        });
      }

      // 管理员拥有所有权限
      if (user.role?.code === 'admin' || user.role?.is_system === 1) {
        return next();
      }

      // 检查是否有该权限
      const userPermissions = user.role?.permissions || [];
      const hasPermission = userPermissions.some(p => p.code === permissionCode);

      if (!hasPermission) {
        return res.status(403).json({
          code: 403,
          message: '无权限访问',
          required: permissionCode
        });
      }

      next();
    } catch (error) {
      console.error('权限检查错误:', error);
      res.status(500).json({
        code: 500,
        message: '服务器错误',
        error: error.message
      });
    }
  };
};

/**
 * 检查多个权限（满足任意一个即可）
 * @param {string[]} permissionCodes - 权限代码数组
 */
const checkAnyPermission = (permissionCodes) => {
  return async (req, res, next) => {
    try {
      const userId = req.user?.id;
      if (!userId) {
        return res.status(401).json({
          code: 401,
          message: '未登录'
        });
      }

      const user = await models.User.findByPk(userId, {
        include: [{
          model: models.Role,
          as: 'role',
          include: [{
            model: models.Permission,
            as: 'permissions',
            attributes: ['code']
          }]
        }]
      });

      if (!user) {
        return res.status(401).json({
          code: 401,
          message: '用户不存在'
        });
      }

      // 管理员拥有所有权限
      if (user.role?.code === 'admin' || user.role?.is_system === 1) {
        return next();
      }

      // 检查是否有任意一个权限
      const userPermissions = user.role?.permissions || [];
      const hasPermission = permissionCodes.some(code => 
        userPermissions.some(p => p.code === code)
      );

      if (!hasPermission) {
        return res.status(403).json({
          code: 403,
          message: '无权限访问',
          required: permissionCodes
        });
      }

      next();
    } catch (error) {
      console.error('权限检查错误:', error);
      res.status(500).json({
        code: 500,
        message: '服务器错误',
        error: error.message
      });
    }
  };
};

module.exports = {
  checkPermission,
  checkAnyPermission
};
