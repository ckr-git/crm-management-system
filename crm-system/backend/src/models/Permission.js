const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const Permission = sequelize.define('Permission', {
    id: {
      type: DataTypes.INTEGER.UNSIGNED,
      primaryKey: true,
      autoIncrement: true
    },
    parent_id: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: true,
      defaultValue: null,
      comment: '父级权限ID'
    },
    name: {
      type: DataTypes.STRING(100),
      allowNull: false,
      comment: '权限名称'
    },
    code: {
      type: DataTypes.STRING(100),
      allowNull: false,
      unique: true,
      comment: '权限代码'
    },
    type: {
      type: DataTypes.STRING(20),
      defaultValue: 'action',
      comment: '权限类型：module模块 action操作'
    },
    sort_order: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
      comment: '排序'
    }
  }, {
    tableName: 'permissions',
    timestamps: true,
    updatedAt: false
  });

  return Permission;
};
