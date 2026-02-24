const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const userController = require('../controllers/userController');
const operationLog = require('../middlewares/operationLog');
const { checkPermission } = require('../middlewares/checkPermission');

/**
 * 用户管理路由
 */

// 获取用户列表（分页、搜索）- 需要用户管理权限
router.get('/', checkPermission('user:read'), userController.getUsers);

// 获取可用用户列表（用于下拉选择）
router.get('/available', userController.getAvailableUsers);

// 获取当前用户信息
router.get('/current', userController.getCurrentUser);

// 获取用户详情 - 需要用户查看权限
router.get('/:id', checkPermission('user:read'), userController.getUserById);

// 创建用户 - 需要用户创建权限
router.post('/', 
  checkPermission('user:create'),
  operationLog('user', 'create'),
  [
    body('username').notEmpty().withMessage('用户名不能为空'),
    body('password').isLength({ min: 6 }).withMessage('密码至少6位'),
    body('name').notEmpty().withMessage('姓名不能为空'),
    body('role_id').notEmpty().withMessage('请选择角色')
  ], 
  userController.createUser
);

// 更新用户信息 - 需要用户编辑权限
router.put('/:id', 
  checkPermission('user:update'),
  operationLog('user', 'update'),
  [
    body('name').optional().notEmpty().withMessage('姓名不能为空'),
    body('email').optional().isEmail().withMessage('邮箱格式不正确')
  ], 
  userController.updateUser
);

// 启用/禁用用户 - 需要用户编辑权限
router.put('/:id/status', checkPermission('user:update'), operationLog('user', 'update'), userController.updateUserStatus);

// 重置密码 - 需要用户编辑权限
router.put('/:id/reset-password', checkPermission('user:update'), operationLog('user', 'update'), userController.resetPassword);

// 删除用户（软删除）- 需要用户删除权限
router.delete('/:id', checkPermission('user:delete'), operationLog('user', 'delete'), userController.deleteUser);

module.exports = router;
// Updated for permission check
