const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const WorkflowTask = sequelize.define('WorkflowTask', {
    id: {
      type: DataTypes.INTEGER.UNSIGNED,
      primaryKey: true,
      autoIncrement: true,
      comment: '任务ID'
    },
    instance_id: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false,
      comment: '流程实例ID',
      references: {
        model: 'workflow_instances',
        key: 'id'
      }
    },
    node_id: {
      type: DataTypes.STRING(50),
      allowNull: false,
      comment: '节点ID'
    },
    node_name: {
      type: DataTypes.STRING(100),
      allowNull: false,
      comment: '节点名称'
    },
    assignee_id: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false,
      comment: '处理人ID',
      references: {
        model: 'users',
        key: 'id'
      }
    },
    status: {
      type: DataTypes.STRING(20),
      allowNull: false,
      defaultValue: 'pending',
      comment: '任务状态：pending待处理 approved已批准 rejected已拒绝'
    },
    comment: {
      type: DataTypes.TEXT,
      allowNull: true,
      comment: '审批意见'
    },
    handled_at: {
      type: DataTypes.DATE,
      allowNull: true,
      comment: '处理时间'
    }
  }, {
    tableName: 'workflow_tasks',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
    paranoid: false,
    comment: '工作流任务表',
    indexes: [
      {
        name: 'idx_workflow_tasks_instance_id',
        fields: ['instance_id']
      },
      {
        name: 'idx_workflow_tasks_assignee_id',
        fields: ['assignee_id']
      },
      {
        name: 'idx_workflow_tasks_status',
        fields: ['status']
      }
    ]
  });

  return WorkflowTask;
};
