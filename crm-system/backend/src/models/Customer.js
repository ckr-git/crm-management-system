const { DataTypes } = require('sequelize');

let customerCodeSequence = 0;

const generateCustomerCode = () => {
  customerCodeSequence += 1;
  const date = new Date().toISOString().slice(0, 10).replace(/-/g, '');
  const suffix = String(customerCodeSequence).padStart(4, '0');
  return `C${date}${suffix}`;
};

module.exports = (sequelize) => {
  const Customer = sequelize.define('Customer', {
    id: {
      type: DataTypes.INTEGER.UNSIGNED,
      primaryKey: true,
      autoIncrement: true,
      comment: '客户ID'
    },
    code: {
      type: DataTypes.STRING(20),
      allowNull: false,
      unique: true,
      defaultValue: generateCustomerCode,
      comment: '客户编号：C+YYYYMMDD+4位流水号'
    },
    name: {
      type: DataTypes.STRING(100),
      allowNull: false,
      comment: '公司名称'
    },
    short_name: {
      type: DataTypes.STRING(50),
      allowNull: true,
      comment: '公司简称'
    },
    credit_code: {
      type: DataTypes.STRING(50),
      allowNull: true,
      comment: '统一社会信用代码'
    },
    contact: {
      type: DataTypes.STRING(50),
      allowNull: false,
      comment: '联系人'
    },
    position: {
      type: DataTypes.STRING(50),
      allowNull: true,
      comment: '联系人职位'
    },
    phone: {
      type: DataTypes.STRING(20),
      allowNull: false,
      comment: '联系电话'
    },
    mobile: {
      type: DataTypes.STRING(20),
      allowNull: true,
      comment: '手机号码'
    },
    email: {
      type: DataTypes.STRING(100),
      allowNull: true,
      comment: '邮箱'
    },
    wechat: {
      type: DataTypes.STRING(50),
      allowNull: true,
      comment: '微信号'
    },
    qq: {
      type: DataTypes.STRING(20),
      allowNull: true,
      comment: 'QQ号'
    },
    address: {
      type: DataTypes.STRING(200),
      allowNull: true,
      comment: '公司地址'
    },
    website: {
      type: DataTypes.STRING(200),
      allowNull: true,
      comment: '公司网站'
    },
    industry: {
      type: DataTypes.STRING(50),
      allowNull: true,
      comment: '所属行业'
    },
    company_size: {
      type: DataTypes.STRING(20),
      allowNull: true,
      comment: '公司规模'
    },
    source: {
      type: DataTypes.STRING(50),
      allowNull: false,
      comment: '客户来源'
    },
    level: {
      type: DataTypes.STRING(20),
      defaultValue: 'normal',
      comment: '客户等级'
    },
    stage: {
      type: DataTypes.STRING(50),
      allowNull: false,
      defaultValue: 'potential',
      comment: '客户阶段'
    },
    tags: {
      type: DataTypes.JSON,
      allowNull: true,
      comment: '客户标签'
    },
    remark: {
      type: DataTypes.TEXT,
      allowNull: true,
      comment: '备注'
    },
    owner_id: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: true,  // 允许为null，客户在公海时没有负责人
      comment: '负责人ID'
    },
    last_followup_at: {
      type: DataTypes.DATE,
      allowNull: true,
      comment: '最后跟进时间'
    },
    next_followup_at: {
      type: DataTypes.DATE,
      allowNull: true,
      comment: '下次跟进时间'
    }
  }, {
    tableName: 'customers',
    timestamps: true,
    paranoid: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
    deletedAt: 'deleted_at',
    indexes: [
      { unique: true, fields: ['code'] },
      { fields: ['name'] },
      { fields: ['phone'] },
      { fields: ['mobile'] },
      { fields: ['owner_id'] },
      { fields: ['source'] },
      { fields: ['stage'] },
      { fields: ['level'] },
      { fields: ['last_followup_at'] }
    ]
  });

  return Customer;
};
