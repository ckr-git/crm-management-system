const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const CustomerPool = sequelize.define('CustomerPool', {
    id: {
      type: DataTypes.INTEGER.UNSIGNED,
      primaryKey: true,
      autoIncrement: true,
      comment: 'ID'
    },
    customer_id: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false,
      comment: '客户ID',
      references: {
        model: 'customers',
        key: 'id'
      }
    },
    previous_owner_id: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false,
      comment: '原负责人ID',
      references: {
        model: 'users',
        key: 'id'
      }
    },
    reason: {
      type: DataTypes.STRING(100),
      allowNull: false,
      comment: '进入公海原因'
    },
    enter_at: {
      type: DataTypes.DATE,
      allowNull: false,
      comment: '进入时间'
    },
    claimed_by: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: true,
      comment: '领取人ID',
      references: {
        model: 'users',
        key: 'id'
      }
    },
    claimed_at: {
      type: DataTypes.DATE,
      allowNull: true,
      comment: '领取时间'
    },
    status: {
      type: DataTypes.STRING(20),
      allowNull: false,
      defaultValue: 'available',
      comment: '状态：available可领取 claimed已领取'
    }
  }, {
    tableName: 'customer_pool',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: false, // 公海池记录不需要updated_at
    paranoid: false,
    comment: '客户公海池表',
    indexes: [
      {
        name: 'idx_customer_pool_customer_id',
        fields: ['customer_id']
      },
      {
        name: 'idx_customer_pool_status',
        fields: ['status']
      },
      {
        name: 'idx_customer_pool_enter_at',
        fields: ['enter_at']
      }
    ]
  });

  // 定义关联关系
  CustomerPool.associate = (models) => {
    // 公海池记录属于某个客户
    CustomerPool.belongsTo(models.Customer, {
      foreignKey: 'customer_id',
      as: 'customer'
    });

    // 公海池记录属于原负责人
    CustomerPool.belongsTo(models.User, {
      foreignKey: 'previous_owner_id',
      as: 'previousOwner'
    });

    // 公海池记录可能有领取人
    CustomerPool.belongsTo(models.User, {
      foreignKey: 'claimed_by',
      as: 'claimer'
    });
  };

  return CustomerPool;
};
