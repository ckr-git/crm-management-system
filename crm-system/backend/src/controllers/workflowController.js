const WorkflowEngine = require('../utils/workflowEngine');

/**
 * 启动工作流
 */
exports.startWorkflow = async (req, res) => {
  try {
    const { workflow_code, title, business_type, business_id, form_data } = req.body;

    const instance = await WorkflowEngine.startWorkflow(workflow_code, {
      title,
      initiatorId: req.user.id,
      businessType: business_type,
      businessId: business_id,
      formData: form_data
    });

    res.json({
      code: 200,
      message: '流程启动成功',
      data: instance
    });
  } catch (error) {
    console.error('启动工作流错误:', error);
    res.status(500).json({
      code: 500,
      message: error.message || '服务器错误'
    });
  }
};

/**
 * 获取待办任务
 */
exports.getPendingTasks = async (req, res) => {
  try {
    const userId = req.user.id;
    const tasks = await WorkflowEngine.getPendingTasks(userId);

    res.json({
      code: 200,
      message: '获取成功',
      data: tasks
    });
  } catch (error) {
    console.error('获取待办任务错误:', error);
    res.status(500).json({
      code: 500,
      message: '服务器错误'
    });
  }
};

/**
 * 审批通过
 */
exports.approveTask = async (req, res) => {
  try {
    const { id } = req.params;
    const { comment } = req.body;

    const task = await WorkflowEngine.approve(id, {
      userId: req.user.id,
      comment
    });

    res.json({
      code: 200,
      message: '审批通过',
      data: task
    });
  } catch (error) {
    console.error('审批通过错误:', error);
    res.status(500).json({
      code: 500,
      message: error.message || '服务器错误'
    });
  }
};

/**
 * 审批拒绝
 */
exports.rejectTask = async (req, res) => {
  try {
    const { id } = req.params;
    const { comment } = req.body;

    const task = await WorkflowEngine.reject(id, {
      userId: req.user.id,
      comment
    });

    res.json({
      code: 200,
      message: '审批拒绝',
      data: task
    });
  } catch (error) {
    console.error('审批拒绝错误:', error);
    res.status(500).json({
      code: 500,
      message: error.message || '服务器错误'
    });
  }
};
