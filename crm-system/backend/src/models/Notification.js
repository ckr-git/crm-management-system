const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const Notification = sequelize.define('Notification', {
    id: {
      type: DataTypes.BIGINT.UNSIGNED,
      primaryKey: true,
      autoIncrement: true,
      comment: '通知ID'
    },
    user_id: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false,
      comment: '接收用户ID',
      references: {
        model: 'users',
        key: 'id'
      }
    },
    type: {
      type: DataTypes.STRING(50),
      allowNull: false,
      comment: '通知类型：system系统通知 task任务提醒 approval审批通知 customer客户通知'
    },
    title: {
      type: DataTypes.STRING(200),
      allowNull: false,
      comment: '通知标题'
    },
    content: {
      type: DataTypes.TEXT,
      allowNull: false,
      comment: '通知内容'
    },
    link: {
      type: DataTypes.STRING(500),
      allowNull: true,
      comment: '跳转链接'
    },
    is_read: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
      comment: '是否已读'
    },
    read_at: {
      type: DataTypes.DATE,
      allowNull: true,
      comment: '已读时间'
    },
    sender_id: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: true,
      comment: '发送人ID（系统通知可为空）',
      references: {
        model: 'users',
        key: 'id'
      }
    },
    extra_data: {
      type: DataTypes.JSON,
      allowNull: true,
      comment: '额外数据'
    }
  }, {
    tableName: 'notifications',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
    paranoid: false,  // 不使用软删除
    comment: '消息通知表',
    indexes: [
      {
        name: 'idx_user_id',
        fields: ['user_id']
      },
      {
        name: 'idx_type',
        fields: ['type']
      },
      {
        name: 'idx_is_read',
        fields: ['is_read']
      },
      {
        name: 'idx_created_at',
        fields: ['created_at']
      }
    ]
  });

  // 定义关联关系
  Notification.associate = (models) => {
    // 通知属于某个用户（接收人）
    Notification.belongsTo(models.User, {
      foreignKey: 'user_id',
      as: 'receiver'
    });

    // 通知属于某个用户（发送人）
    Notification.belongsTo(models.User, {
      foreignKey: 'sender_id',
      as: 'sender'
    });
  };

  return Notification;
};
