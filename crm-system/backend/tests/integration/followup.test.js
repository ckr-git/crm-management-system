const request = require('supertest');
const app = require('../../src/app');
const { createTestDatabase, syncTestDatabase, cleanTestDatabase, createTestUser, createTestCustomer } = require('../helpers/testDatabase');
const { models } = require('../../src/models');

describe('Followup Controller - 跟进记录模块测试', () => {
  let sequelize;
  let testUser;
  let token;
  let testCustomer;
  let testFollowup;

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

    // 创建测试用户
    testUser = await createTestUser(models.User, {
      username: 'sales1',
      password: 'test123456',
      role_id: testRole.id
    });

    // 获取token
    const login = await request(app)
      .post('/api/auth/login')
      .send({ username: 'sales1', password: 'test123456' });
    token = login.body.data.token;

    // 创建测试客户
    testCustomer = await createTestCustomer(models.Customer, testUser.id);
  });

  afterAll(async () => {
    await cleanTestDatabase(sequelize);
  });

  describe('POST /api/followups - 创建跟进记录', () => {
    test('应该成功创建跟进记录', async () => {
      const followupData = {
        customer_id: testCustomer.id,
        type: 'phone',
        content: '电话沟通，客户对产品很感兴趣',
        result: '待进一步跟进',
        next_plan: '下周安排演示',
        next_followup_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()
      };

      const response = await request(app)
        .post('/api/followups')
        .set('Authorization', `Bearer ${token}`)
        .send(followupData)
        .expect(200);

      expect(response.body).toHaveProperty('code', 200);
      expect(response.body.data).toHaveProperty('id');
      expect(response.body.data).toHaveProperty('customer_id', testCustomer.id);
      expect(response.body.data).toHaveProperty('user_id', testUser.id);
      expect(response.body.data).toHaveProperty('type', 'phone');
      expect(response.body.data).toHaveProperty('content', followupData.content);

      testFollowup = response.body.data;
    });

    test('应该拒绝缺少必填字段的请求', async () => {
      const invalidData = {
        customer_id: testCustomer.id,
        // 缺少 type 和 content
      };

      const response = await request(app)
        .post('/api/followups')
        .set('Authorization', `Bearer ${token}`)
        .send(invalidData)
        .expect(400);

      expect(response.body).toHaveProperty('code', 400);
    });

    test('应该拒绝无效的跟进方式', async () => {
      const invalidData = {
        customer_id: testCustomer.id,
        type: 'invalid_type',  // 无效的type
        content: '测试内容'
      };

      const response = await request(app)
        .post('/api/followups')
        .set('Authorization', `Bearer ${token}`)
        .send(invalidData)
        .expect(400);

      expect(response.body).toHaveProperty('code', 400);
    });

    test('跟进后应更新客户的最后跟进时间', async () => {
      const followupData = {
        customer_id: testCustomer.id,
        type: 'visit',
        content: '现场拜访客户'
      };

      await request(app)
        .post('/api/followups')
        .set('Authorization', `Bearer ${token}`)
        .send(followupData);

      // 验证客户的last_followup_at已更新
      const customer = await models.Customer.findByPk(testCustomer.id);
      expect(customer.last_followup_at).not.toBeNull();
    });
  });

  describe('GET /api/followups - 获取跟进记录列表', () => {
    beforeAll(async () => {
      // 创建多条跟进记录
      for (let i = 0; i < 5; i++) {
        await models.Followup.create({
          customer_id: testCustomer.id,
          user_id: testUser.id,
          type: ['phone', 'visit', 'email', 'wechat'][i % 4],
          content: `测试跟进内容 ${i + 1}`,
          result: '待跟进'
        });
      }
    });

    test('应该返回跟进记录列表（分页）', async () => {
      const response = await request(app)
        .get('/api/followups')
        .set('Authorization', `Bearer ${token}`)
        .query({ page: 1, pageSize: 10 })
        .expect(200);

      expect(response.body).toHaveProperty('code', 200);
      expect(response.body.data).toHaveProperty('list');
      expect(response.body.data).toHaveProperty('total');
      expect(Array.isArray(response.body.data.list)).toBe(true);
      expect(response.body.data.list.length).toBeGreaterThan(0);
    });

    test('应该支持按客户ID筛选', async () => {
      const response = await request(app)
        .get('/api/followups')
        .set('Authorization', `Bearer ${token}`)
        .query({ customer_id: testCustomer.id })
        .expect(200);

      expect(response.body.data.list.every(f => f.customer_id === testCustomer.id)).toBe(true);
    });

    test('应该支持按跟进方式筛选', async () => {
      const response = await request(app)
        .get('/api/followups')
        .set('Authorization', `Bearer ${token}`)
        .query({ type: 'phone' })
        .expect(200);

      expect(response.body.data.list.every(f => f.type === 'phone')).toBe(true);
    });

    test('应该支持按时间范围筛选', async () => {
      const startDate = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();
      const endDate = new Date().toISOString();

      const response = await request(app)
        .get('/api/followups')
        .set('Authorization', `Bearer ${token}`)
        .query({ start_date: startDate, end_date: endDate })
        .expect(200);

      expect(response.body).toHaveProperty('code', 200);
    });

    test('应该拒绝未认证的请求', async () => {
      const response = await request(app)
        .get('/api/followups')
        .expect(401);

      expect(response.body).toHaveProperty('code', 401);
    });
  });

  describe('GET /api/followups/:id - 获取跟进记录详情', () => {
    test('应该返回跟进记录详情', async () => {
      if (!testFollowup) {
        testFollowup = await models.Followup.create({
          customer_id: testCustomer.id,
          user_id: testUser.id,
          type: 'phone',
          content: '详情测试'
        });
      }

      const response = await request(app)
        .get(`/api/followups/${testFollowup.id}`)
        .set('Authorization', `Bearer ${token}`)
        .expect(200);

      expect(response.body).toHaveProperty('code', 200);
      expect(response.body.data).toHaveProperty('id', testFollowup.id);
      expect(response.body.data).toHaveProperty('customer');
      expect(response.body.data).toHaveProperty('user');
    });

    test('应该返回404如果跟进记录不存在', async () => {
      const response = await request(app)
        .get('/api/followups/99999')
        .set('Authorization', `Bearer ${token}`)
        .expect(404);

      expect(response.body).toHaveProperty('code', 404);
    });
  });

  describe('PUT /api/followups/:id - 更新跟进记录', () => {
    test('应该成功更新跟进记录', async () => {
      if (!testFollowup) {
        testFollowup = await models.Followup.create({
          customer_id: testCustomer.id,
          user_id: testUser.id,
          type: 'phone',
          content: '待更新'
        });
      }

      const updates = {
        content: '已更新的跟进内容',
        result: '已成交',
        next_plan: '后续维护'
      };

      const response = await request(app)
        .put(`/api/followups/${testFollowup.id}`)
        .set('Authorization', `Bearer ${token}`)
        .send(updates)
        .expect(200);

      expect(response.body).toHaveProperty('code', 200);
      expect(response.body.data).toHaveProperty('content', updates.content);
      expect(response.body.data).toHaveProperty('result', updates.result);
    });

    test('应该返回404如果跟进记录不存在', async () => {
      const response = await request(app)
        .put('/api/followups/99999')
        .set('Authorization', `Bearer ${token}`)
        .send({ content: '测试' })
        .expect(404);

      expect(response.body).toHaveProperty('code', 404);
    });

    test('应该拒绝更新不属于自己的跟进记录', async () => {
      // 创建另一个用户的跟进记录
      const otherUser = await models.User.create({
        username: 'other_user',
        password: 'test123456',
        name: '其他用户',
        role_id: 1
      });

      const otherFollowup = await models.Followup.create({
        customer_id: testCustomer.id,
        user_id: otherUser.id,
        type: 'phone',
        content: '其他人的跟进'
      });

      const response = await request(app)
        .put(`/api/followups/${otherFollowup.id}`)
        .set('Authorization', `Bearer ${token}`)
        .send({ content: '尝试修改' })
        .expect(403);

      expect(response.body).toHaveProperty('code', 403);

      // 清理
      await otherFollowup.destroy({ force: true });
      await otherUser.destroy({ force: true });
    });
  });

  describe('DELETE /api/followups/:id - 删除跟进记录', () => {
    test('应该成功删除跟进记录', async () => {
      const followup = await models.Followup.create({
        customer_id: testCustomer.id,
        user_id: testUser.id,
        type: 'phone',
        content: '待删除'
      });

      const response = await request(app)
        .delete(`/api/followups/${followup.id}`)
        .set('Authorization', `Bearer ${token}`)
        .expect(200);

      expect(response.body).toHaveProperty('code', 200);

      // 验证已删除
      const deleted = await models.Followup.findByPk(followup.id);
      expect(deleted).toBeNull();
    });

    test('应该返回404如果跟进记录不存在', async () => {
      const response = await request(app)
        .delete('/api/followups/99999')
        .set('Authorization', `Bearer ${token}`)
        .expect(404);

      expect(response.body).toHaveProperty('code', 404);
    });
  });

  describe('GET /api/followups/stats/summary - 获取跟进统计数据', () => {
    test('应该返回跟进统计摘要', async () => {
      const response = await request(app)
        .get('/api/followups/stats/summary')
        .set('Authorization', `Bearer ${token}`)
        .expect(200);

      expect(response.body).toHaveProperty('code', 200);
      expect(response.body.data).toHaveProperty('total');
      expect(response.body.data).toHaveProperty('todayCount');
      expect(response.body.data).toHaveProperty('weekCount');
      expect(response.body.data).toHaveProperty('monthCount');
      expect(typeof response.body.data.total).toBe('number');
    });
  });

  describe('GET /api/followups/stats/by-type - 按跟进方式统计', () => {
    test('应该返回按跟进方式分组的统计数据', async () => {
      const response = await request(app)
        .get('/api/followups/stats/by-type')
        .set('Authorization', `Bearer ${token}`)
        .expect(200);

      expect(response.body).toHaveProperty('code', 200);
      expect(Array.isArray(response.body.data)).toBe(true);
      
      // 验证数据结构
      if (response.body.data.length > 0) {
        const item = response.body.data[0];
        expect(item).toHaveProperty('type');
        expect(item).toHaveProperty('count');
      }
    });
  });

  describe('GET /api/followups/stats/trend - 跟进趋势统计', () => {
    test('应该返回跟进趋势数据', async () => {
      const response = await request(app)
        .get('/api/followups/stats/trend')
        .set('Authorization', `Bearer ${token}`)
        .query({ days: 7 })
        .expect(200);

      expect(response.body).toHaveProperty('code', 200);
      expect(Array.isArray(response.body.data)).toBe(true);
    });

    test('应该支持自定义天数', async () => {
      const response = await request(app)
        .get('/api/followups/stats/trend')
        .set('Authorization', `Bearer ${token}`)
        .query({ days: 30 })
        .expect(200);

      expect(response.body).toHaveProperty('code', 200);
    });
  });

  describe('GET /api/followups/customer/:customerId - 获取指定客户的跟进记录', () => {
    test('应该返回指定客户的所有跟进记录', async () => {
      const response = await request(app)
        .get(`/api/followups/customer/${testCustomer.id}`)
        .set('Authorization', `Bearer ${token}`)
        .expect(200);

      expect(response.body).toHaveProperty('code', 200);
      expect(Array.isArray(response.body.data)).toBe(true);
      
      // 验证所有记录都属于该客户
      response.body.data.forEach(followup => {
        expect(followup.customer_id).toBe(testCustomer.id);
      });
    });

    test('应该返回空数组如果客户没有跟进记录', async () => {
      const newCustomer = await models.Customer.create({
        name: '无跟进客户',
        contact: '测试',
        phone: '13900000001',
        source: '网站',
        stage: 'potential',
        level: 'normal',
        owner_id: testUser.id
      });

      const response = await request(app)
        .get(`/api/followups/customer/${newCustomer.id}`)
        .set('Authorization', `Bearer ${token}`)
        .expect(200);

      expect(response.body.data).toEqual([]);

      await newCustomer.destroy({ force: true });
    });
  });

  describe('POST /api/followups/batch-delete - 批量删除跟进记录', () => {
    test('应该成功批量删除跟进记录', async () => {
      // 创建多条跟进记录
      const followups = [];
      for (let i = 0; i < 3; i++) {
        const followup = await models.Followup.create({
          customer_id: testCustomer.id,
          user_id: testUser.id,
          type: 'phone',
          content: `批量删除测试 ${i}`
        });
        followups.push(followup);
      }

      const ids = followups.map(f => f.id);

      const response = await request(app)
        .post('/api/followups/batch-delete')
        .set('Authorization', `Bearer ${token}`)
        .send({ ids })
        .expect(200);

      expect(response.body).toHaveProperty('code', 200);
      expect(response.body.data).toHaveProperty('deletedCount', ids.length);

      // 验证已删除
      for (const id of ids) {
        const followup = await models.Followup.findByPk(id);
        expect(followup).toBeNull();
      }
    });

    test('应该拒绝空的ID列表', async () => {
      const response = await request(app)
        .post('/api/followups/batch-delete')
        .set('Authorization', `Bearer ${token}`)
        .send({ ids: [] })
        .expect(400);

      expect(response.body).toHaveProperty('code', 400);
    });
  });
});
