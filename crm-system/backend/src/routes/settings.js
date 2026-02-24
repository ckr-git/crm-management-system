const express = require('express');
const router = express.Router();
const settingsController = require('../controllers/settingsController');
const { checkPermission } = require('../middlewares/checkPermission');

// 系统设置 - 读取需要管理权限，修改需要更高权限
router.get('/system', checkPermission('user:read'), settingsController.getSystemSettings);
router.put('/system', checkPermission('role:read'), settingsController.updateSystemSettings);

// 用户个人设置 - 任何已登录用户可访问（auth中间件已在app.js中挂载）
router.get('/user', settingsController.getUserSettings);
router.put('/user', settingsController.updateUserSettings);
router.post('/password', settingsController.changePassword);

module.exports = router;
