const request = require('supertest');
const app = require('../../src/app');
const { createTestDatabase, syncTestDatabase, cleanTestDatabase, createTestUser } = require('../helpers/testDatabase');
const User = require('../../src/models/User');
const Role = require('../../src/models/Role');

describe('Auth Controller - 认证模块测试', () => {
  let sequelize;
  let UserModel;
  let RoleModel;
  let testUser;
  let token;

  beforeAll(async () => {
    // 创建测试数据库
    sequelize = createTestDatabase();
    UserModel = User(sequelize);
    RoleModel = Role(sequelize);

    // 建立模型关联
    UserModel.belongsTo(RoleModel, { foreignKey: 'role_id', as: 'role' });
    RoleModel.hasMany(UserModel, { foreignKey: 'role_id', as: 'users' });

    await syncTestDatabase(sequelize);

    // 创建测试角色
    const testRole = await RoleModel.create({
      id: 1,
      name: '管理员',
      code: 'admin',
      description: '系统管理员'
    });

    // 创建测试用户
    testUser = await createTestUser(UserModel, {
      username: 'admin',
      password: 'admin123',
      role_id: testRole.id
    });
  });

  afterAll(async () => {
    await cleanTestDatabase(sequelize);
  });

  describe('POST /api/auth/login - 用户登录', () => {
    test('应该成功登录并返回token', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          username: 'admin',
          password: 'admin123'
        })
        .expect(200);

      expect(response.body).toHaveProperty('code', 200);
      expect(response.body).toHaveProperty('message', '登录成功');
      expect(response.body.data).toHaveProperty('token');
      expect(response.body.data).toHaveProperty('user');
      expect(response.body.data.user).not.toHaveProperty('password');

      // 保存token供后续测试使用
      token = response.body.data.token;
    });

    test('应该拒绝错误的密码', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          username: 'admin',
          password: 'wrongpassword'
        })
        .expect(401);

      expect(response.body).toHaveProperty('code', 401);
      expect(response.body).toHaveProperty('message', '用户名或密码错误');
    });

    test('应该拒绝不存在的用户', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          username: 'nonexistuser',
          password: 'anypassword'
        })
        .expect(401);

      expect(response.body).toHaveProperty('code', 401);
      expect(response.body).toHaveProperty('message', '用户名或密码错误');
    });

    test('应该拒绝空用户名', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          username: '',
          password: 'admin123'
        })
        .expect(400);

      expect(response.body).toHaveProperty('code', 400);
    });

    test('应该拒绝空密码', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          username: 'admin',
          password: ''
        })
        .expect(400);

      expect(response.body).toHaveProperty('code', 400);
    });

    test('应该拒绝被禁用的用户', async () => {
      // 创建一个被禁用的用户
      const disabledUser = await createTestUser(UserModel, {
        username: 'disabled',
        password: 'test123456',
        role_id: 1,
        status: 0
      });

      const response = await request(app)
        .post('/api/auth/login')
        .send({
          username: 'disabled',
          password: 'test123456'
        })
        .expect(403);

      expect(response.body).toHaveProperty('code', 403);
      expect(response.body).toHaveProperty('message', '账号已被禁用');
    });
  });

  describe('GET /api/auth/userinfo - 获取用户信息', () => {
    test('应该返回当前登录用户信息', async () => {
      const response = await request(app)
        .get('/api/auth/userinfo')
        .set('Authorization', `Bearer ${token}`)
        .expect(200);

      expect(response.body).toHaveProperty('code', 200);
      expect(response.body.data).toHaveProperty('username', 'admin');
      expect(response.body.data).not.toHaveProperty('password');
    });

    test('应该拒绝没有token的请求', async () => {
      const response = await request(app)
        .get('/api/auth/userinfo')
        .expect(401);

      expect(response.body).toHaveProperty('code', 401);
      expect(response.body).toHaveProperty('message');
    });

    test('应该拒绝无效的token', async () => {
      const response = await request(app)
        .get('/api/auth/userinfo')
        .set('Authorization', 'Bearer invalid_token_here')
        .expect(401);

      expect(response.body).toHaveProperty('code', 401);
    });
  });

  describe('POST /api/auth/logout - 用户登出', () => {
    test('应该成功登出', async () => {
      const response = await request(app)
        .post('/api/auth/logout')
        .set('Authorization', `Bearer ${token}`)
        .expect(200);

      expect(response.body).toHaveProperty('code', 200);
      expect(response.body).toHaveProperty('message', '登出成功');
    });
  });
});
