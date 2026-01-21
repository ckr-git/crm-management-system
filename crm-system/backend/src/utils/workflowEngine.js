/**
 * 工作流引擎
 */
const { models } = require('../models');

class WorkflowEngine {
  /**
   * 启动工作流
   */
  static async startWorkflow(workflowCode, data) {
    const { title, initiatorId, businessType, businessId } = data;

    // 获取工作流定义
    const workflow = await models.Workflow.findOne({
      where: { code: workflowCode, status: 1 }
    });

    if (!workflow) {
      throw new Error('工作流不存在或已禁用');
    }

    // 创建流程实例
    const instance = await models.WorkflowInstance.create({
      workflow_id: workflow.id,
      title,
      initiator_id: initiatorId,
      business_type: businessType,
      business_id: businessId,
      status: 'pending',
      current_node: 'start',
      data: data.formData || {}
    });

    // 创建第一个任务节点
    const firstNode = workflow.config.nodes[0];
    if (firstNode && firstNode.type === 'approval') {
      await models.WorkflowTask.create({
        instance_id: instance.id,
        node_id: firstNode.id,
        node_name: firstNode.name,
        assignee_id: firstNode.assigneeId,
        status: 'pending'
      });
    }

    return instance;
  }

  /**
   * 审批通过
   */
  static async approve(taskId, data) {
    const { userId, comment } = data;

    // 获取任务
    const task = await models.WorkflowTask.findByPk(taskId, {
      include: [{
        model: models.WorkflowInstance,
        as: 'instance'
      }]
    });

    if (!task) {
      throw new Error('任务不存在');
    }

    if (task.assignee_id !== userId) {
      throw new Error('无权限处理此任务');
    }

    if (task.status !== 'pending') {
      throw new Error('任务已处理');
    }

    // 更新任务状态
    await task.update({
      status: 'approved',
      comment,
      handled_at: new Date()
    });

    // 检查是否还有下一个节点
    const workflow = await models.Workflow.findByPk(task.instance.workflow_id);
    const currentNodeIndex = workflow.config.nodes.findIndex(n => n.id === task.node_id);
    const nextNode = workflow.config.nodes[currentNodeIndex + 1];

    if (nextNode && nextNode.type === 'approval') {
      // 创建下一个任务
      await models.WorkflowTask.create({
        instance_id: task.instance_id,
        node_id: nextNode.id,
        node_name: nextNode.name,
        assignee_id: nextNode.assigneeId,
        status: 'pending'
      });

      // 更新流程当前节点
      await task.instance.update({
        current_node: nextNode.id
      });
    } else {
      // 流程结束
      await task.instance.update({
        status: 'approved',
        current_node: 'end',
        finished_at: new Date()
      });
    }

    return task;
  }

  /**
   * 审批拒绝
   */
  static async reject(taskId, data) {
    const { userId, comment } = data;

    const task = await models.WorkflowTask.findByPk(taskId, {
      include: [{
        model: models.WorkflowInstance,
        as: 'instance'
      }]
    });

    if (!task) {
      throw new Error('任务不存在');
    }

    if (task.assignee_id !== userId) {
      throw new Error('无权限处理此任务');
    }

    if (task.status !== 'pending') {
      throw new Error('任务已处理');
    }

    // 更新任务状态
    await task.update({
      status: 'rejected',
      comment,
      handled_at: new Date()
    });

    // 更新流程状态为拒绝
    await task.instance.update({
      status: 'rejected',
      finished_at: new Date()
    });

    return task;
  }

  /**
   * 获取用户待办任务
   */
  static async getPendingTasks(userId) {
    const tasks = await models.WorkflowTask.findAll({
      where: {
        assignee_id: userId,
        status: 'pending'
      },
      include: [
        {
          model: models.WorkflowInstance,
          as: 'instance',
          include: [{
            model: models.User,
            as: 'initiator',
            attributes: ['id', 'name', 'username']
          }]
        }
      ],
      order: [['created_at', 'DESC']]
    });

    return tasks;
  }
}

module.exports = WorkflowEngine;
