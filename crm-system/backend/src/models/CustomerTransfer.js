const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const CustomerTransfer = sequelize.define('CustomerTransfer', {
    id: {
      type: DataTypes.INTEGER.UNSIGNED,
      primaryKey: true,
      autoIncrement: true,
      comment: '转移记录ID'
    },
    customer_id: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false,
      comment: '客户ID'
    },
    from_user_id: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false,
      comment: '原负责人ID'
    },
    to_user_id: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false,
      comment: '新负责人ID'
    },
    reason: {
      type: DataTypes.STRING(200),
      allowNull: true,
      comment: '转移原因'
    },
    remark: {
      type: DataTypes.TEXT,
      allowNull: true,
      comment: '备注说明'
    },
    transfer_by: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false,
      comment: '操作人ID'
    }
  }, {
    tableName: 'customer_transfers',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: false,
    paranoid: false,  // 转移记录不使用软删除
    indexes: [
      { fields: ['customer_id'] },
      { fields: ['from_user_id'] },
      { fields: ['to_user_id'] },
      { fields: ['created_at'] }
    ]
  });

  return CustomerTransfer;
};
