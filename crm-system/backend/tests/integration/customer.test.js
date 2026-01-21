const request = require('supertest');
const app = require('../../src/app');
const { createTestDatabase, syncTestDatabase, cleanTestDatabase, createTestUser, createTestCustomer } = require('../helpers/testDatabase');
const Customer = require('../../src/models/Customer');
const User = require('../../src/models/User');
const Role = require('../../src/models/Role');

describe('Customer Controller - 客户管理模块测试', () => {
  let sequelize;
  let CustomerModel;
  let UserModel;
  let RoleModel;
  let testUser;
  let token;
  let testCustomer;

  beforeAll(async () => {
    // 创建测试数据库
    sequelize = createTestDatabase();
    CustomerModel = Customer(sequelize);
    UserModel = User(sequelize);
    RoleModel = Role(sequelize);

    // 建立模型关联
    CustomerModel.belongsTo(UserModel, { foreignKey: 'owner_id', as: 'owner' });
    UserModel.hasMany(CustomerModel, { foreignKey: 'owner_id', as: 'customers' });
    UserModel.belongsTo(RoleModel, { foreignKey: 'role_id', as: 'role' });

    await syncTestDatabase(sequelize);

    // 创建测试角色
    const testRole = await RoleModel.create({
      id: 1,
      name: '销售',
      code: 'sales',
      description: '销售人员'
    });

    // 创建测试用户并获取token
    testUser = await createTestUser(UserModel, {
      username: 'salesuser',
      password: 'test123456',
      role_id: testRole.id
    });

    // 模拟登录获取token
    const loginResponse = await request(app)
      .post('/api/auth/login')
      .send({
        username: 'salesuser',
        password: 'test123456'
      });

    token = loginResponse.body.data.token;

    // 创建测试客户
    testCustomer = await createTestCustomer(CustomerModel, testUser.id);
  });

  afterAll(async () => {
    await cleanTestDatabase(sequelize);
  });

  describe('GET /api/customers - 获取客户列表', () => {
    test('应该返回客户列表（分页）', async () => {
      const response = await request(app)
        .get('/api/customers')
        .set('Authorization', `Bearer ${token}`)
        .query({ page: 1, pageSize: 10 })
        .expect(200);

      expect(response.body).toHaveProperty('code', 200);
      expect(response.body.data).toHaveProperty('list');
      expect(response.body.data).toHaveProperty('total');
      expect(response.body.data).toHaveProperty('page', 1);
      expect(response.body.data).toHaveProperty('pageSize', 10);
      expect(Array.isArray(response.body.data.list)).toBe(true);
    });

    test('应该支持按名称搜索', async () => {
      const response = await request(app)
        .get('/api/customers')
        .set('Authorization', `Bearer ${token}`)
        .query({ name: '测试' })
        .expect(200);

      expect(response.body.data.list.length).toBeGreaterThanOrEqual(0);
    });

    test('应该拒绝未认证的请求', async () => {
      const response = await request(app)
        .get('/api/customers')
        .expect(401);

      expect(response.body).toHaveProperty('code', 401);
    });
  });

  describe('POST /api/customers - 创建客户', () => {
    test('应该成功创建客户', async () => {
      const newCustomer = {
        name: '新客户公司',
        contact: '李四',
        phone: '13900139000',
        email: 'lisi@example.com',
        source: 'website',
        industry: '互联网',
        level: 'important',
        stage: 'potential'
      };

      const response = await request(app)
        .post('/api/customers')
        .set('Authorization', `Bearer ${token}`)
        .send(newCustomer)
        .expect(200);

      expect(response.body).toHaveProperty('code', 200);
      expect(response.body.data).toHaveProperty('id');
      expect(response.body.data).toHaveProperty('name', newCustomer.name);
      expect(response.body.data).toHaveProperty('contact', newCustomer.contact);
    });

    test('应该拒绝缺少必填字段的请求', async () => {
      const invalidCustomer = {
        contact: '王五',
        // 缺少 name 和 phone
      };

      const response = await request(app)
        .post('/api/customers')
        .set('Authorization', `Bearer ${token}`)
        .send(invalidCustomer)
        .expect(400);

      expect(response.body).toHaveProperty('code', 400);
    });

    test('应该拒绝手机号格式错误', async () => {
      const invalidCustomer = {
        name: '测试公司2',
        contact: '赵六',
        phone: '12345',  // 错误的手机号格式
        source: 'website'
      };

      const response = await request(app)
        .post('/api/customers')
        .set('Authorization', `Bearer ${token}`)
        .send(invalidCustomer)
        .expect(400);

      expect(response.body).toHaveProperty('code', 400);
    });
  });

  describe('GET /api/customers/:id - 获取客户详情', () => {
    test('应该返回客户详情', async () => {
      const response = await request(app)
        .get(`/api/customers/${testCustomer.id}`)
        .set('Authorization', `Bearer ${token}`)
        .expect(200);

      expect(response.body).toHaveProperty('code', 200);
      expect(response.body.data).toHaveProperty('id', testCustomer.id);
      expect(response.body.data).toHaveProperty('name');
      expect(response.body.data).toHaveProperty('contact');
      expect(response.body.data).toHaveProperty('owner');
    });

    test('应该返回404如果客户不存在', async () => {
      const response = await request(app)
        .get('/api/customers/99999')
        .set('Authorization', `Bearer ${token}`)
        .expect(404);

      expect(response.body).toHaveProperty('code', 404);
    });
  });

  describe('PUT /api/customers/:id - 更新客户', () => {
    test('应该成功更新客户信息', async () => {
      const updates = {
        contact: '张三（已更新）',
        level: 'vip'
      };

      const response = await request(app)
        .put(`/api/customers/${testCustomer.id}`)
        .set('Authorization', `Bearer ${token}`)
        .send(updates)
        .expect(200);

      expect(response.body).toHaveProperty('code', 200);
      expect(response.body.data).toHaveProperty('contact', updates.contact);
      expect(response.body.data).toHaveProperty('level', updates.level);
    });

    test('应该返回404如果客户不存在', async () => {
      const response = await request(app)
        .put('/api/customers/99999')
        .set('Authorization', `Bearer ${token}`)
        .send({ contact: '测试' })
        .expect(404);

      expect(response.body).toHaveProperty('code', 404);
    });
  });

  describe('DELETE /api/customers/:id - 删除客户', () => {
    test('应该成功删除客户（软删除）', async () => {
      // 先创建一个用于删除的客户
      const customerToDelete = await createTestCustomer(CustomerModel, testUser.id, {
        name: '待删除客户',
        phone: '13900139001'
      });

      const response = await request(app)
        .delete(`/api/customers/${customerToDelete.id}`)
        .set('Authorization', `Bearer ${token}`)
        .expect(200);

      expect(response.body).toHaveProperty('code', 200);
      expect(response.body).toHaveProperty('message', '删除成功');

      // 验证客户已被软删除
      const deletedCustomer = await CustomerModel.findByPk(customerToDelete.id);
      expect(deletedCustomer).toBeNull();
    });

    test('应该返回404如果客户不存在', async () => {
      const response = await request(app)
        .delete('/api/customers/99999')
        .set('Authorization', `Bearer ${token}`)
        .expect(404);

      expect(response.body).toHaveProperty('code', 404);
    });
  });

  describe('POST /api/customers/batch-delete - 批量删除客户', () => {
    test('应该成功批量删除客户', async () => {
      // 创建两个客户用于批量删除
      const customer1 = await createTestCustomer(CustomerModel, testUser.id, {
        name: '批量删除1',
        phone: '13900139002'
      });
      const customer2 = await createTestCustomer(CustomerModel, testUser.id, {
        name: '批量删除2',
        phone: '13900139003'
      });

      const response = await request(app)
        .post('/api/customers/batch-delete')
        .set('Authorization', `Bearer ${token}`)
        .send({ ids: [customer1.id, customer2.id] })
        .expect(200);

      expect(response.body).toHaveProperty('code', 200);
      expect(response.body.message).toContain('成功删除2个客户');
    });

    test('应该拒绝空的ids数组', async () => {
      const response = await request(app)
        .post('/api/customers/batch-delete')
        .set('Authorization', `Bearer ${token}`)
        .send({ ids: [] })
        .expect(400);

      expect(response.body).toHaveProperty('code', 400);
    });
  });

  describe('POST /api/customers/:id/transfer - 转移客户', () => {
    let anotherUser;

    beforeAll(async () => {
      // 创建另一个用户用于转移测试
      anotherUser = await createTestUser(UserModel, {
        username: 'anotheruser',
        password: 'test123456',
        name: '另一个用户',
        role_id: 1
      });
    });

    test('应该成功转移客户', async () => {
      const response = await request(app)
        .post(`/api/customers/${testCustomer.id}/transfer`)
        .set('Authorization', `Bearer ${token}`)
        .send({
          to_user_id: anotherUser.id,
          reason: '客户调整',
          remark: '测试转移'
        })
        .expect(200);

      expect(response.body).toHaveProperty('code', 200);
      expect(response.body.data).toHaveProperty('owner_id', anotherUser.id);
    });

    test('应该拒绝转移给不存在的用户', async () => {
      const response = await request(app)
        .post(`/api/customers/${testCustomer.id}/transfer`)
        .set('Authorization', `Bearer ${token}`)
        .send({
          to_user_id: 99999,
          reason: '测试'
        })
        .expect(404);

      expect(response.body).toHaveProperty('code', 404);
      expect(response.body.message).toContain('新负责人不存在');
    });
  });
});
