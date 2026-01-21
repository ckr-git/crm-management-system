const express = require('express');
const router = express.Router();
const permissionController = require('../controllers/permissionController');
const operationLog = require('../middlewares/operationLog');

/**
 * 权限管理路由
 */

// 获取权限列表（树形结构）
router.get('/', permissionController.getPermissions);

// 获取角色的权限
router.get('/role/:id', permissionController.getRolePermissions);

// 更新角色权限
router.put('/role/:id', operationLog('role', 'update'), permissionController.updateRolePermissions);

module.exports = router;
