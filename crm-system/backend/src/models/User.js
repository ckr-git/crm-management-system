const { DataTypes } = require('sequelize');
const bcrypt = require('bcryptjs');

module.exports = (sequelize) => {
  const User = sequelize.define('User', {
    id: {
      type: DataTypes.INTEGER.UNSIGNED,
      primaryKey: true,
      autoIncrement: true,
      comment: '用户ID'
    },
    username: {
      type: DataTypes.STRING(50),
      allowNull: false,
      unique: true,
      comment: '用户名（手机号）'
    },
    password: {
      type: DataTypes.STRING(255),
      allowNull: false,
      comment: '密码（BCrypt加密）',
      set(value) {
        // 自动加密密码
        if (value) {
          const salt = bcrypt.genSaltSync(10);
          const hash = bcrypt.hashSync(value, salt);
          this.setDataValue('password', hash);
        }
      }
    },
    name: {
      type: DataTypes.STRING(50),
      allowNull: false,
      comment: '真实姓名'
    },
    email: {
      type: DataTypes.STRING(100),
      allowNull: true,
      comment: '邮箱'
    },
    phone: {
      type: DataTypes.STRING(20),
      allowNull: true,
      comment: '手机号'
    },
    avatar: {
      type: DataTypes.STRING(255),
      allowNull: true,
      comment: '头像URL'
    },
    role_id: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false,
      comment: '角色ID'
    },
    department_id: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: true,
      comment: '部门ID'
    },
    manager_id: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: true,
      comment: '直属上级ID'
    },
    status: {
      type: DataTypes.TINYINT,
      allowNull: false,
      defaultValue: 1,
      comment: '状态：1启用 0禁用'
    },
    last_login_at: {
      type: DataTypes.DATE,
      allowNull: true,
      comment: '最后登录时间'
    },
    last_login_ip: {
      type: DataTypes.STRING(50),
      allowNull: true,
      comment: '最后登录IP'
    },
    login_count: {
      type: DataTypes.INTEGER.UNSIGNED,
      defaultValue: 0,
      comment: '登录次数'
    }
  }, {
    tableName: 'users',
    timestamps: true,
    paranoid: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
    deletedAt: 'deleted_at',
    indexes: [
      { fields: ['username'] },
      { fields: ['role_id'] },
      { fields: ['status'] }
    ]
  });

  // 实例方法：验证密码
  User.prototype.validatePassword = function(password) {
    return bcrypt.compareSync(password, this.password);
  };

  // 实例方法：隐藏敏感字段
  User.prototype.toSafeJSON = function() {
    const values = { ...this.get() };
    delete values.password;
    delete values.deleted_at;
    return values;
  };

  return User;
};
