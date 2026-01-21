const { createTestDatabase, syncTestDatabase, cleanTestDatabase, createTestUser } = require('../../helpers/testDatabase');
const Customer = require('../../../src/models/Customer');
const User = require('../../../src/models/User');

describe('Customer Model - 客户模型单元测试', () => {
  let sequelize;
  let CustomerModel;
  let UserModel;
  let testUser;

  beforeAll(async () => {
    sequelize = createTestDatabase();
    CustomerModel = Customer(sequelize);
    UserModel = User(sequelize);

    // 建立关联
    CustomerModel.belongsTo(UserModel, { foreignKey: 'owner_id', as: 'owner' });
    UserModel.hasMany(CustomerModel, { foreignKey: 'owner_id', as: 'customers' });

    await syncTestDatabase(sequelize);

    testUser = await createTestUser(UserModel, { role_id: 1 });
  });

  afterAll(async () => {
    await cleanTestDatabase(sequelize);
  });

  describe('创建客户', () => {
    test('应该成功创建客户', async () => {
      const customer = await CustomerModel.create({
        name: '测试公司',
        contact: '张三',
        phone: '13800138000',
        source: 'website',
        stage: 'potential',
        level: 'normal',
        owner_id: testUser.id
      });

      expect(customer).toBeDefined();
      expect(customer.id).toBeDefined();
      expect(customer.name).toBe('测试公司');
      expect(customer.contact).toBe('张三');
    });

    test('应该设置默认阶段为potential', async () => {
      const customer = await CustomerModel.create({
        name: '默认阶段测试',
        contact: '李四',
        phone: '13800138001',
        source: 'referral',
        owner_id: testUser.id
      });

      expect(customer.stage).toBe('potential');
    });

    test('应该设置默认等级为normal', async () => {
      const customer = await CustomerModel.create({
        name: '默认等级测试',
        contact: '王五',
        phone: '13800138002',
        source: 'website',
        owner_id: testUser.id
      });

      expect(customer.level).toBe('normal');
    });

    test('应该支持JSON字段存储标签', async () => {
      const tags = ['VIP', '重点客户', '潜在大单'];

      const customer = await CustomerModel.create({
        name: 'JSON测试公司',
        contact: '赵六',
        phone: '13800138003',
        source: 'website',
        owner_id: testUser.id,
        tags: tags
      });

      expect(customer.tags).toEqual(tags);
      expect(Array.isArray(customer.tags)).toBe(true);
    });

    test('应该允许owner_id为null（公海客户）', async () => {
      const customer = await CustomerModel.create({
        name: '公海客户',
        contact: '孙七',
        phone: '13800138004',
        source: 'website',
        stage: 'pool',
        owner_id: null
      });

      expect(customer.owner_id).toBeNull();
    });
  });

  describe('字段验证', () => {
    test('应该拒绝缺少必填字段', async () => {
      await expect(
        CustomerModel.create({
          contact: '测试',
          phone: '13800138005'
          // 缺少 name, source
        })
      ).rejects.toThrow();
    });
  });

  describe('关联查询', () => {
    test('应该能查询关联的负责人信息', async () => {
      const customer = await CustomerModel.create({
        name: '关联测试公司',
        contact: '周八',
        phone: '13800138006',
        source: 'website',
        owner_id: testUser.id
      });

      const customerWithOwner = await CustomerModel.findByPk(customer.id, {
        include: [{ model: UserModel, as: 'owner' }]
      });

      expect(customerWithOwner.owner).toBeDefined();
      expect(customerWithOwner.owner.id).toBe(testUser.id);
      expect(customerWithOwner.owner.name).toBe(testUser.name);
    });
  });

  describe('更新客户', () => {
    test('应该成功更新客户信息', async () => {
      const customer = await CustomerModel.create({
        name: '更新测试公司',
        contact: '吴九',
        phone: '13800138007',
        source: 'website',
        level: 'normal',
        owner_id: testUser.id
      });

      await customer.update({
        level: 'important',
        stage: 'opportunity'
      });

      expect(customer.level).toBe('important');
      expect(customer.stage).toBe('opportunity');
    });

    test('应该能更新跟进时间', async () => {
      const customer = await CustomerModel.create({
        name: '跟进时间测试',
        contact: '郑十',
        phone: '13800138008',
        source: 'website',
        owner_id: testUser.id
      });

      const lastFollowupAt = new Date();
      const nextFollowupAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

      await customer.update({
        last_followup_at: lastFollowupAt,
        next_followup_at: nextFollowupAt
      });

      expect(customer.last_followup_at).toBeInstanceOf(Date);
      expect(customer.next_followup_at).toBeInstanceOf(Date);
    });
  });

  describe('软删除', () => {
    test('应该支持软删除', async () => {
      const customer = await CustomerModel.create({
        name: '软删除测试公司',
        contact: '测试',
        phone: '13800138009',
        source: 'website',
        owner_id: testUser.id
      });

      const customerId = customer.id;

      await customer.destroy();

      const found = await CustomerModel.findByPk(customerId);
      expect(found).toBeNull();

      const foundWithDeleted = await CustomerModel.findByPk(customerId, {
        paranoid: false
      });
      expect(foundWithDeleted).toBeDefined();
      expect(foundWithDeleted.deleted_at).not.toBeNull();
    });
  });

  describe('索引字段', () => {
    test('name字段应该支持查询', async () => {
      await CustomerModel.create({
        name: '索引测试公司A',
        contact: '测试A',
        phone: '13800138010',
        source: 'website',
        owner_id: testUser.id
      });

      const found = await CustomerModel.findOne({
        where: { name: '索引测试公司A' }
      });

      expect(found).toBeDefined();
      expect(found.name).toBe('索引测试公司A');
    });

    test('phone字段应该支持查询', async () => {
      await CustomerModel.create({
        name: '索引测试公司B',
        contact: '测试B',
        phone: '13800138011',
        source: 'website',
        owner_id: testUser.id
      });

      const found = await CustomerModel.findOne({
        where: { phone: '13800138011' }
      });

      expect(found).toBeDefined();
      expect(found.phone).toBe('13800138011');
    });
  });
});
