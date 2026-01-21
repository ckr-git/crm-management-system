const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const roleController = require('../controllers/roleController');
const operationLog = require('../middlewares/operationLog');

/**
 * 角色管理路由
 */

// 获取角色列表
router.get('/', roleController.getRoles);

// 获取角色详情
router.get('/:id', roleController.getRoleById);

// 创建角色
router.post('/', 
  operationLog('role', 'create'),
  [
    body('name').notEmpty().withMessage('角色名称不能为空'),
    body('code').notEmpty().withMessage('角色代码不能为空')
  ], 
  roleController.createRole
);

// 更新角色
router.put('/:id', operationLog('role', 'update'), roleController.updateRole);

// 删除角色
router.delete('/:id', operationLog('role', 'delete'), roleController.deleteRole);

module.exports = router;
