const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const OperationLog = sequelize.define('OperationLog', {
    id: {
      type: DataTypes.BIGINT.UNSIGNED,
      primaryKey: true,
      autoIncrement: true,
      comment: '日志ID'
    },
    user_id: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false,
      comment: '操作人ID'
    },
    module: {
      type: DataTypes.STRING(50),
      allowNull: false,
      comment: '模块名称'
    },
    action: {
      type: DataTypes.STRING(50),
      allowNull: false,
      comment: '操作类型'
    },
    resource_type: {
      type: DataTypes.STRING(50),
      allowNull: true,
      comment: '资源类型'
    },
    resource_id: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: true,
      comment: '资源ID'
    },
    description: {
      type: DataTypes.STRING(500),
      allowNull: true,
      comment: '操作描述'
    },
    ip: {
      type: DataTypes.STRING(50),
      allowNull: true,
      comment: 'IP地址'
    },
    user_agent: {
      type: DataTypes.STRING(500),
      allowNull: true,
      comment: '用户代理'
    },
    request_data: {
      type: DataTypes.JSON,
      allowNull: true,
      comment: '请求数据'
    },
    response_data: {
      type: DataTypes.JSON,
      allowNull: true,
      comment: '响应数据'
    },
    status: {
      type: DataTypes.STRING(20),
      defaultValue: 'success',
      comment: '状态：success成功 fail失败'
    },
    error_message: {
      type: DataTypes.TEXT,
      allowNull: true,
      comment: '错误信息'
    }
  }, {
    tableName: 'operation_logs',
    timestamps: true,
    updatedAt: false,
    createdAt: 'created_at',
    indexes: [
      { fields: ['user_id'] },
      { fields: ['module', 'action'] },
      { fields: ['created_at'] }
    ]
  });

  return OperationLog;
};
