const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const Opportunity = sequelize.define('Opportunity', {
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
    name: {
      type: DataTypes.STRING(100),
      allowNull: false,
      comment: '机会名称'
    },
    amount: {
      type: DataTypes.DECIMAL(12, 2),
      allowNull: false,
      defaultValue: 0,
      comment: '预期金额'
    },
    stage: {
      type: DataTypes.STRING(50),
      allowNull: false,
      defaultValue: 'initial',
      comment: '销售阶段：initial初步沟通 demand需求确认 proposal方案报价 negotiation商务谈判 closed_won赢单 closed_lost输单'
    },
    probability: {
      type: DataTypes.INTEGER,
      allowNull: true,
      defaultValue: 0,
      comment: '赢率（0-100）'
    },
    expected_close_date: {
      type: DataTypes.DATEONLY,
      allowNull: true,
      comment: '预计成交日期'
    },
    priority: {
      type: DataTypes.STRING(20),
      allowNull: true,
      defaultValue: 'medium',
      comment: '优先级'
    },
    product: {
      type: DataTypes.STRING(100),
      allowNull: true,
      comment: '产品'
    },
    owner_id: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false,
      comment: '负责人ID',
      references: {
        model: 'users',
        key: 'id'
      }
    },
    win_reason: {
      type: DataTypes.STRING(200),
      allowNull: true,
      comment: '赢单原因'
    },
    lose_reason: {
      type: DataTypes.STRING(200),
      allowNull: true,
      comment: '输单原因'
    },
    close_date: {
      type: DataTypes.DATEONLY,
      allowNull: true,
      comment: '成交日期'
    },
    actual_amount: {
      type: DataTypes.DECIMAL(12, 2),
      allowNull: true,
      comment: '实际金额'
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true,
      comment: '描述'
    },
    status: {
      type: DataTypes.STRING(20),
      allowNull: false,
      defaultValue: 'open',
      comment: '状态：open进行中 won已赢单 lost已输单'
    }
  }, {
    tableName: 'opportunities',
    timestamps: true,
    paranoid: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
    deletedAt: 'deleted_at',
    comment: '销售机会表',
    indexes: [
      {
        name: 'idx_opportunities_customer_id',
        fields: ['customer_id']
      },
      {
        name: 'idx_opportunities_owner_id',
        fields: ['owner_id']
      },
      {
        name: 'idx_opportunities_stage',
        fields: ['stage']
      },
      {
        name: 'idx_opportunities_status',
        fields: ['status']
      }
    ]
  });

  // 定义关联关系
  Opportunity.associate = (models) => {
    // 机会属于客户
    Opportunity.belongsTo(models.Customer, {
      foreignKey: 'customer_id',
      as: 'customer'
    });

    // 机会属于负责人
    Opportunity.belongsTo(models.User, {
      foreignKey: 'owner_id',
      as: 'owner'
    });
  };

  return Opportunity;
};
