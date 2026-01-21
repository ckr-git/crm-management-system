const request = require('supertest');
const app = require('../../src/app');
const { createTestDatabase, syncTestDatabase, cleanTestDatabase, createTestUser, createTestCustomer } = require('../helpers/testDatabase');
const { models } = require('../../src/models');

describe('Customer Pool Controller - 客户公海模块测试', () => {
  let sequelize;
  let testUser1;
  let testUser2;
  let token1;
  let token2;
  let testCustomer;

  beforeAll(async () => {
    sequelize = createTestDatabase();
    await syncTestDatabase(sequelize);

    // 创建测试角色
    const testRole = await models.Role.create({
      id: 1,
      name: '销售',
      code: 'sales',
      description: '销售人员'
    });

    // 创建两个测试用户
    testUser1 = await createTestUser(models.User, {
      username: 'sales1',
      password: 'test123456',
      role_id: testRole.id
    });

    testUser2 = await createTestUser(models.User, {
      username: 'sales2',
      password: 'test123456',
      role_id: testRole.id
    });

    // 获取token
    const login1 = await request(app)
      .post('/api/auth/login')
      .send({ username: 'sales1', password: 'test123456' });
    token1 = login1.body.data.token;

    const login2 = await request(app)
      .post('/api/auth/login')
      .send({ username: 'sales2', password: 'test123456' });
    token2 = login2.body.data.token;

    // 创建测试客户
    testCustomer = await createTestCustomer(models.Customer, testUser1.id);
  });

  afterAll(async () => {
    await cleanTestDatabase(sequelize);
  });

  describe('GET /api/customer-pool - 获取公海客户列表', () => {
    test('应该返回公海客户列表', async () => {
      const response = await request(app)
        .get('/api/customer-pool')
        .set('Authorization', `Bearer ${token1}`)
        .query({ page: 1, pageSize: 10 })
        .expect(200);

      expect(response.body).toHaveProperty('code', 200);
      expect(response.body.data).toHaveProperty('list');
      expect(response.body.data).toHaveProperty('total');
      expect(Array.isArray(response.body.data.list)).toBe(true);
    });

    test('应该拒绝未认证的请求', async () => {
      const response = await request(app)
        .get('/api/customer-pool')
        .expect(401);

      expect(response.body).toHaveProperty('code', 401);
    });
  });

  describe('POST /api/customer-pool/claim/:id - 领取公海客户', () => {
    let poolCustomer;

    beforeEach(async () => {
      // 创建一个公海客户
      poolCustomer = await models.Customer.create({
        name: '公海测试客户',
        contact: '测试联系人',
        phone: '13800138000',
        source: '网站',
        stage: 'potential',
        level: 'normal',
        owner_id: null  // 无负责人，在公海中
      });

      // 添加到公海池
      await models.CustomerPool.create({
        customer_id: poolCustomer.id,
        previous_owner_id: testUser1.id,
        reason: '测试释放',
        enter_at: new Date()
      });
    });

    afterEach(async () => {
      // 清理测试数据
      if (poolCustomer) {
        await models.CustomerPool.destroy({
          where: { customer_id: poolCustomer.id }
        });
        await poolCustomer.destroy({ force: true });
      }
    });

    test('应该成功领取公海客户', async () => {
      const response = await request(app)
        .post(`/api/customer-pool/claim/${poolCustomer.id}`)
        .set('Authorization', `Bearer ${token2}`)
        .expect(200);

      expect(response.body).toHaveProperty('code', 200);
      expect(response.body.data).toHaveProperty('owner_id', testUser2.id);

      // 验证客户已从公海移除
      const poolRecord = await models.CustomerPool.findOne({
        where: { customer_id: poolCustomer.id, claimed_by: null }
      });
      expect(poolRecord).toBeNull();
    });

    test('应该拒绝领取不存在的客户', async () => {
      const response = await request(app)
        .post('/api/customer-pool/claim/99999')
        .set('Authorization', `Bearer ${token2}`)
        .expect(404);

      expect(response.body).toHaveProperty('code', 404);
    });

    test('应该拒绝领取已被领取的客户', async () => {
      // 先让user2领取
      await request(app)
        .post(`/api/customer-pool/claim/${poolCustomer.id}`)
        .set('Authorization', `Bearer ${token2}`);

      // user1再次尝试领取
      const response = await request(app)
        .post(`/api/customer-pool/claim/${poolCustomer.id}`)
        .set('Authorization', `Bearer ${token1}`)
        .expect(400);

      expect(response.body).toHaveProperty('code', 400);
    });
  });

  describe('POST /api/customer-pool/release/:id - 释放客户到公海', () => {
    let ownedCustomer;

    beforeEach(async () => {
      // 创建用户拥有的客户
      ownedCustomer = await models.Customer.create({
        name: '待释放客户',
        contact: '测试联系人',
        phone: '13900139000',
        source: '网站',
        stage: 'potential',
        level: 'normal',
        owner_id: testUser1.id
      });
    });

    afterEach(async () => {
      if (ownedCustomer) {
        await models.CustomerPool.destroy({
          where: { customer_id: ownedCustomer.id }
        });
        await ownedCustomer.destroy({ force: true });
      }
    });

    test('应该成功释放客户到公海', async () => {
      const response = await request(app)
        .post(`/api/customer-pool/release/${ownedCustomer.id}`)
        .set('Authorization', `Bearer ${token1}`)
        .send({ reason: '长期无跟进' })
        .expect(200);

      expect(response.body).toHaveProperty('code', 200);

      // 验证客户已进入公海
      const customer = await models.Customer.findByPk(ownedCustomer.id);
      expect(customer.owner_id).toBeNull();

      const poolRecord = await models.CustomerPool.findOne({
        where: { customer_id: ownedCustomer.id }
      });
      expect(poolRecord).not.toBeNull();
      expect(poolRecord.reason).toBe('长期无跟进');
    });

    test('应该拒绝释放不属于自己的客户', async () => {
      const response = await request(app)
        .post(`/api/customer-pool/release/${ownedCustomer.id}`)
        .set('Authorization', `Bearer ${token2}`)  // 使用user2的token
        .send({ reason: '测试' })
        .expect(403);

      expect(response.body).toHaveProperty('code', 403);
    });

    test('应该拒绝释放不存在的客户', async () => {
      const response = await request(app)
        .post('/api/customer-pool/release/99999')
        .set('Authorization', `Bearer ${token1}`)
        .send({ reason: '测试' })
        .expect(404);

      expect(response.body).toHaveProperty('code', 404);
    });
  });

  describe('GET /api/customer-pool/history - 获取客户流转历史', () => {
    test('应该返回客户流转历史记录', async () => {
      const response = await request(app)
        .get('/api/customer-pool/history')
        .set('Authorization', `Bearer ${token1}`)
        .query({ page: 1, pageSize: 10 })
        .expect(200);

      expect(response.body).toHaveProperty('code', 200);
      expect(response.body.data).toHaveProperty('list');
      expect(Array.isArray(response.body.data.list)).toBe(true);
    });
  });

  describe('GET /api/customer-pool/stats - 获取公海统计数据', () => {
    test('应该返回公海统计信息', async () => {
      const response = await request(app)
        .get('/api/customer-pool/stats')
        .set('Authorization', `Bearer ${token1}`)
        .expect(200);

      expect(response.body).toHaveProperty('code', 200);
      expect(response.body.data).toHaveProperty('total');
      expect(response.body.data).toHaveProperty('totalInPool');
      expect(response.body.data).toHaveProperty('claimedToday');
      expect(typeof response.body.data.total).toBe('number');
    });
  });

  describe('POST /api/customer-pool/batch-claim - 批量领取客户', () => {
    let poolCustomers = [];

    beforeEach(async () => {
      // 创建多个公海客户
      for (let i = 0; i < 3; i++) {
        const customer = await models.Customer.create({
          name: `批量测试客户${i+1}`,
          contact: `测试联系人${i+1}`,
          phone: `1380013800${i}`,
          source: '网站',
          stage: 'potential',
          level: 'normal',
          owner_id: null
        });

        await models.CustomerPool.create({
          customer_id: customer.id,
          previous_owner_id: testUser1.id,
          reason: '测试',
          enter_at: new Date()
        });

        poolCustomers.push(customer);
      }
    });

    afterEach(async () => {
      // 清理
      for (const customer of poolCustomers) {
        await models.CustomerPool.destroy({
          where: { customer_id: customer.id }
        });
        await customer.destroy({ force: true });
      }
      poolCustomers = [];
    });

    test('应该成功批量领取公海客户', async () => {
      const ids = poolCustomers.map(c => c.id);

      const response = await request(app)
        .post('/api/customer-pool/batch-claim')
        .set('Authorization', `Bearer ${token2}`)
        .send({ ids })
        .expect(200);

      expect(response.body).toHaveProperty('code', 200);
      expect(response.body.data).toHaveProperty('successCount', ids.length);

      // 验证所有客户都已被领取
      for (const id of ids) {
        const customer = await models.Customer.findByPk(id);
        expect(customer.owner_id).toBe(testUser2.id);
      }
    });

    test('应该拒绝空的客户ID列表', async () => {
      const response = await request(app)
        .post('/api/customer-pool/batch-claim')
        .set('Authorization', `Bearer ${token2}`)
        .send({ ids: [] })
        .expect(400);

      expect(response.body).toHaveProperty('code', 400);
    });
  });
});
