const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const Workflow = sequelize.define('Workflow', {
    id: {
      type: DataTypes.INTEGER.UNSIGNED,
      primaryKey: true,
      autoIncrement: true,
      comment: '工作流ID'
    },
    name: {
      type: DataTypes.STRING(100),
      allowNull: false,
      comment: '工作流名称'
    },
    code: {
      type: DataTypes.STRING(50),
      allowNull: false,
      unique: true,
      comment: '工作流编码'
    },
    description: {
      type: DataTypes.STRING(500),
      allowNull: true,
      comment: '工作流描述'
    },
    type: {
      type: DataTypes.STRING(50),
      allowNull: false,
      comment: '流程类型：approval审批 notification通知'
    },
    config: {
      type: DataTypes.JSON,
      allowNull: false,
      comment: '流程配置（节点、条件等）'
    },
    status: {
      type: DataTypes.TINYINT,
      allowNull: false,
      defaultValue: 1,
      comment: '状态：1启用 0禁用'
    }
  }, {
    tableName: 'workflows',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
    paranoid: false,
    comment: '工作流定义表'
  });

  return Workflow;
};
