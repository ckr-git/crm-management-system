const express = require('express');
const router = express.Router();
const workflowController = require('../controllers/workflowController');

// 启动工作流
router.post('/start', workflowController.startWorkflow);

// 获取待办任务
router.get('/tasks/pending', workflowController.getPendingTasks);

// 审批通过
router.post('/tasks/:id/approve', workflowController.approveTask);

// 审批拒绝
router.post('/tasks/:id/reject', workflowController.rejectTask);

module.exports = router;
