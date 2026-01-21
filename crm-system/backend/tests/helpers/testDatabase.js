const { Sequelize } = require('sequelize');

/**
 * 创建测试数据库连接
 * 使用SQLite内存数据库，避免影响真实数据
 */
const createTestDatabase = () => {
  const sequelize = new Sequelize('sqlite::memory:', {
    dialect: 'sqlite',
    logging: false,
    define: {
      timestamps: true,
      underscored: false,
      createdAt: 'created_at',
      updatedAt: 'updated_at',
      deletedAt: 'deleted_at',
      paranoid: true
    }
  });

  return sequelize;
};

/**
 * 同步测试数据库
 */
const syncTestDatabase = async (sequelize) => {
  await sequelize.sync({ force: true });
};

/**
 * 清理测试数据库
 */
const cleanTestDatabase = async (sequelize) => {
  await sequelize.drop();
  await sequelize.close();
};

/**
 * 创建测试用户数据
 */
const createTestUser = async (User, overrides = {}) => {
  return await User.create({
    username: 'testuser',
    password: 'test123456',
    name: '测试用户',
    email: 'test@example.com',
    phone: '13800138000',
    role_id: 1,
    status: 1,
    ...overrides
  });
};

/**
 * 创建测试客户数据
 */
const createTestCustomer = async (Customer, ownerId, overrides = {}) => {
  return await Customer.create({
    name: '测试公司',
    contact: '张三',
    phone: '13800138001',
    source: 'website',
    stage: 'potential',
    level: 'normal',
    owner_id: ownerId,
    ...overrides
  });
};

/**
 * 创建测试销售机会数据
 */
const createTestOpportunity = async (Opportunity, customerId, ownerId, overrides = {}) => {
  return await Opportunity.create({
    name: '测试销售机会',
    customer_id: customerId,
    owner_id: ownerId,
    amount: 100000,
    stage: 'initial',
    status: 'open',
    probability: 30,
    expected_close_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
    ...overrides
  });
};

module.exports = {
  createTestDatabase,
  syncTestDatabase,
  cleanTestDatabase,
  createTestUser,
  createTestCustomer,
  createTestOpportunity
};
