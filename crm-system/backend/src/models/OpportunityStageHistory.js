const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const OpportunityStageHistory = sequelize.define('OpportunityStageHistory', {
    id: {
      type: DataTypes.INTEGER.UNSIGNED,
      primaryKey: true,
      autoIncrement: true,
      comment: 'ID'
    },
    opportunity_id: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false,
      comment: '销售机会ID',
      references: {
        model: 'opportunities',
        key: 'id'
      }
    },
    old_stage: {
      type: DataTypes.STRING(50),
      allowNull: true,
      comment: '原阶段'
    },
    new_stage: {
      type: DataTypes.STRING(50),
      allowNull: false,
      comment: '新阶段'
    },
    old_status: {
      type: DataTypes.STRING(20),
      allowNull: true,
      comment: '原状态'
    },
    new_status: {
      type: DataTypes.STRING(20),
      allowNull: false,
      comment: '新状态'
    },
    changed_by: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false,
      comment: '操作人ID',
      references: {
        model: 'users',
        key: 'id'
      }
    },
    remark: {
      type: DataTypes.TEXT,
      allowNull: true,
      comment: '备注'
    }
  }, {
    tableName: 'opportunity_stage_history',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: false,  // 历史记录不需要更新时间
    paranoid: false,   // 历史记录不使用软删除
    comment: '销售机会阶段历史表',
    indexes: [
      {
        name: 'idx_opportunity_id',
        fields: ['opportunity_id']
      },
      {
        name: 'idx_created_at',
        fields: ['created_at']
      }
    ]
  });

  // 定义关联关系
  OpportunityStageHistory.associate = (models) => {
    // 历史记录属于销售机会
    OpportunityStageHistory.belongsTo(models.Opportunity, {
      foreignKey: 'opportunity_id',
      as: 'opportunity'
    });

    // 历史记录属于操作人
    OpportunityStageHistory.belongsTo(models.User, {
      foreignKey: 'changed_by',
      as: 'operator'
    });
  };

  return OpportunityStageHistory;
};
