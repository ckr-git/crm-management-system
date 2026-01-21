const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const Followup = sequelize.define('Followup', {
    id: {
      type: DataTypes.INTEGER.UNSIGNED,
      primaryKey: true,
      autoIncrement: true,
      comment: '跟进记录ID'
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
    user_id: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false,
      comment: '跟进人ID',
      references: {
        model: 'users',
        key: 'id'
      }
    },
    type: {
      type: DataTypes.STRING(20),
      allowNull: false,
      comment: '跟进方式：phone电话 visit拜访 email邮件 wechat微信'
    },
    content: {
      type: DataTypes.TEXT,
      allowNull: false,
      comment: '跟进内容'
    },
    result: {
      type: DataTypes.STRING(50),
      allowNull: true,
      comment: '跟进结果'
    },
    next_plan: {
      type: DataTypes.TEXT,
      allowNull: true,
      comment: '下次计划'
    },
    next_followup_at: {
      type: DataTypes.DATE,
      allowNull: true,
      comment: '下次跟进时间'
    },
    attachments: {
      type: DataTypes.JSON,
      allowNull: true,
      comment: '附件'
    }
  }, {
    tableName: 'followups',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
    paranoid: false, // 跟进记录不使用软删除
    comment: '跟进记录表',
    indexes: [
      {
        name: 'idx_customer_id',
        fields: ['customer_id']
      },
      {
        name: 'idx_user_id',
        fields: ['user_id']
      },
      {
        name: 'idx_type',
        fields: ['type']
      },
      {
        name: 'idx_created_at',
        fields: ['created_at']
      }
    ]
  });

  // 定义关联关系
  Followup.associate = (models) => {
    // 跟进记录属于某个客户
    Followup.belongsTo(models.Customer, {
      foreignKey: 'customer_id',
      as: 'customer'
    });

    // 跟进记录属于某个用户（跟进人）
    Followup.belongsTo(models.User, {
      foreignKey: 'user_id',
      as: 'user'
    });
  };

  return Followup;
};
