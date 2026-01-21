const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const SystemConfig = sequelize.define('SystemConfig', {
    id: {
      type: DataTypes.INTEGER.UNSIGNED,
      primaryKey: true,
      autoIncrement: true
    },
    config_key: {
      type: DataTypes.STRING(100),
      allowNull: false,
      unique: true
    },
    config_value: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    config_type: {
      type: DataTypes.STRING(20),
      allowNull: false,
      defaultValue: 'string'
    },
    description: {
      type: DataTypes.STRING(500),
      allowNull: true
    }
  }, {
    tableName: 'system_configs',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
    paranoid: false
  });

  return SystemConfig;
};
