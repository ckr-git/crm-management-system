const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const WorkflowInstance = sequelize.define('WorkflowInstance', {
    id: {
      type: DataTypes.INTEGER.UNSIGNED,
      primaryKey: true,
      autoIncrement: true,
      comment: '流程实例ID'
    },
    workflow_id: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false,
      comment: '工作流ID',
      references: {
        model: 'workflows',
        key: 'id'
      }
    },
    title: {
      type: DataTypes.STRING(200),
      allowNull: false,
      comment: '流程标题'
    },
    initiator_id: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false,
      comment: '发起人ID',
      references: {
        model: 'users',
        key: 'id'
      }
    },
    business_type: {
      type: DataTypes.STRING(50),
      allowNull: true,
      comment: '业务类型'
    },
    business_id: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: true,
      comment: '业务ID'
    },
    status: {
      type: DataTypes.STRING(20),
      allowNull: false,
      defaultValue: 'pending',
      comment: '流程状态：pending进行中 approved通过 rejected拒绝 cancelled取消'
    },
    current_node: {
      type: DataTypes.STRING(50),
      allowNull: true,
      comment: '当前节点'
    },
    data: {
      type: DataTypes.JSON,
      allowNull: true,
      comment: '流程数据'
    },
    finished_at: {
      type: DataTypes.DATE,
      allowNull: true,
      comment: '完成时间'
    }
  }, {
    tableName: 'workflow_instances',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
    paranoid: false,
    comment: '流程实例表',
    indexes: [
      {
        name: 'idx_workflow_instances_workflow_id',
        fields: ['workflow_id']
      },
      {
        name: 'idx_workflow_instances_initiator_id',
        fields: ['initiator_id']
      },
      {
        name: 'idx_workflow_instances_status',
        fields: ['status']
      }
    ]
  });

  return WorkflowInstance;
};
