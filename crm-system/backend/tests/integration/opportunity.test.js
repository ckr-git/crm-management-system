const request = require('supertest');
const app = require('../../src/app');
const { createTestDatabase, syncTestDatabase, cleanTestDatabase, createTestUser, createTestCustomer, createTestOpportunity, models } = require('../helpers/testDatabase');

describe('Opportunity Controller - 销售机会模块测试', () => {
  let sequelize;
  let testUser;
  let testCustomer;
  let testOpportunity;
  let token;

  beforeAll(async () => {
    // 创建测试数据库
    sequelize = createTestDatabase();

    await syncTestDatabase(sequelize);

    // 创建测试角色
    const testRole = await models.Role.create({
      id: 1,
      name: '销售',
      code: 'sales'
    });

    // 创建测试用户
    testUser = await createTestUser(models.User, {
      username: 'salesuser',
      password: 'test123456',
      role_id: testRole.id
    });

    // 获取token
    const loginResponse = await request(app)
      .post('/api/auth/login')
      .send({
        username: 'salesuser',
        password: 'test123456'
      });
    token = loginResponse.body.data.token;

    // 创建测试客户
    testCustomer = await createTestCustomer(models.Customer, testUser.id);

    // 创建测试销售机会
    testOpportunity = await createTestOpportunity(models.Opportunity, testCustomer.id, testUser.id);
  });

  afterAll(async () => {
    await cleanTestDatabase(sequelize);
  });

  describe('GET /api/opportunities - 获取销售机会列表', () => {
    test('应该返回销售机会列表', async () => {
      const response = await request(app)
        .get('/api/opportunities')
        .set('Authorization', `Bearer ${token}`)
        .query({ page: 1, pageSize: 10 })
        .expect(200);

      expect(response.body).toHaveProperty('code', 200);
      expect(response.body.data).toHaveProperty('list');
      expect(response.body.data).toHaveProperty('total');
      expect(Array.isArray(response.body.data.list)).toBe(true);
    });

    test('应该支持按名称搜索', async () => {
      const response = await request(app)
        .get('/api/opportunities')
        .set('Authorization', `Bearer ${token}`)
        .query({ name: '测试' })
        .expect(200);

      expect(response.body.code).toBe(200);
    });

    test('应该支持按阶段筛选', async () => {
      const response = await request(app)
        .get('/api/opportunities')
        .set('Authorization', `Bearer ${token}`)
        .query({ stage: 'initial' })
        .expect(200);

      expect(response.body.code).toBe(200);
    });
  });

  describe('POST /api/opportunities - 创建销售机会', () => {
    test('应该成功创建销售机会', async () => {
      const newOpportunity = {
        name: '新销售机会',
        customer_id: testCustomer.id,
        amount: 200000,
        stage: 'initial',
        status: 'open',
        probability: 30,
        expected_close_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
      };

      const response = await request(app)
        .post('/api/opportunities')
        .set('Authorization', `Bearer ${token}`)
        .send(newOpportunity)
        .expect(201);

      expect(response.body).toHaveProperty('code', 200);
      expect(response.body.data).toHaveProperty('id');
      expect(response.body.data).toHaveProperty('name', newOpportunity.name);
      expect(response.body.data).toHaveProperty('amount', newOpportunity.amount);
    });
  });

  describe('GET /api/opportunities/:id - 获取销售机会详情', () => {
    test('应该返回销售机会详情', async () => {
      const response = await request(app)
        .get(`/api/opportunities/${testOpportunity.id}`)
        .set('Authorization', `Bearer ${token}`)
        .expect(200);

      expect(response.body).toHaveProperty('code', 200);
      expect(response.body.data).toHaveProperty('id', testOpportunity.id);
      expect(response.body.data).toHaveProperty('customer');
      expect(response.body.data).toHaveProperty('owner');
    });

    test('应该返回404如果销售机会不存在', async () => {
      const response = await request(app)
        .get('/api/opportunities/99999')
        .set('Authorization', `Bearer ${token}`)
        .expect(404);

      expect(response.body).toHaveProperty('code', 404);
    });
  });

  describe('PUT /api/opportunities/:id - 更新销售机会', () => {
    test('应该成功更新销售机会', async () => {
      const updates = {
        stage: 'demand',
        probability: 50
      };

      const response = await request(app)
        .put(`/api/opportunities/${testOpportunity.id}`)
        .set('Authorization', `Bearer ${token}`)
        .send(updates)
        .expect(200);

      expect(response.body).toHaveProperty('code', 200);
      expect(response.body.data).toHaveProperty('stage', updates.stage);
      expect(response.body.data).toHaveProperty('probability', updates.probability);
    });
  });

  describe('GET /api/opportunities/stats - 获取统计数据', () => {
    test('应该返回统计数据', async () => {
      const response = await request(app)
        .get('/api/opportunities/stats')
        .set('Authorization', `Bearer ${token}`)
        .expect(200);

      expect(response.body).toHaveProperty('code', 200);
      expect(response.body.data).toHaveProperty('total');
      expect(response.body.data).toHaveProperty('open');
      expect(response.body.data).toHaveProperty('won');
      expect(response.body.data).toHaveProperty('lost');
      expect(response.body.data).toHaveProperty('totalAmount');
    });
  });

  describe('GET /api/opportunities/funnel - 获取销售漏斗数据', () => {
    test('应该返回销售漏斗数据', async () => {
      const response = await request(app)
        .get('/api/opportunities/stats/funnel')
        .set('Authorization', `Bearer ${token}`)
        .expect(200);

      expect(response.body).toHaveProperty('code', 200);
      expect(response.body.data).toHaveProperty('funnel');
      expect(Array.isArray(response.body.data.funnel)).toBe(true);
    });
  });

  describe('GET /api/opportunities/kanban - 获取看板数据', () => {
    test('应该返回看板数据（按阶段分组）', async () => {
      const response = await request(app)
        .get('/api/opportunities/kanban')
        .set('Authorization', `Bearer ${token}`)
        .expect(200);

      expect(response.body).toHaveProperty('code', 200);
      expect(Array.isArray(response.body.data)).toBe(true);

      if (response.body.data.length > 0) {
        const stageData = response.body.data[0];
        expect(stageData).toHaveProperty('stage');
        expect(stageData).toHaveProperty('stageName');
        expect(stageData).toHaveProperty('count');
        expect(stageData).toHaveProperty('totalAmount');
        expect(stageData).toHaveProperty('opportunities');
      }
    });
  });

  describe('PUT /api/opportunities/:id/stage - 更新销售阶段', () => {
    test('应该成功更新销售阶段', async () => {
      const response = await request(app)
        .put(`/api/opportunities/${testOpportunity.id}/stage`)
        .set('Authorization', `Bearer ${token}`)
        .send({ stage: 'proposal' })
        .expect(200);

      expect(response.body).toHaveProperty('code', 200);
      expect(response.body.data).toHaveProperty('stage', 'proposal');
    });

    test('应该拒绝无效的阶段值', async () => {
      const response = await request(app)
        .put(`/api/opportunities/${testOpportunity.id}/stage`)
        .set('Authorization', `Bearer ${token}`)
        .send({ stage: 'invalid_stage' })
        .expect(400);

      expect(response.body).toHaveProperty('code', 1001);
    });
  });

  describe('PUT /api/opportunities/:id/win - 标记赢单', () => {
    test('应该成功标记赢单', async () => {
      // 创建一个新的销售机会用于赢单测试
      const oppForWin = await createTestOpportunity(models.Opportunity, testCustomer.id, testUser.id, {
        name: '赢单测试机会',
        stage: 'negotiation',
        status: 'open'
      });

      const response = await request(app)
        .put(`/api/opportunities/${oppForWin.id}/won`)
        .set('Authorization', `Bearer ${token}`)
        .send({
          actual_amount: 120000,
          close_date: new Date().toISOString(),
          remark: '成功签约'
        })
        .expect(200);

      expect(response.body).toHaveProperty('code', 200);
      expect(response.body.data).toHaveProperty('status', 'won');
      expect(response.body.data).toHaveProperty('stage', 'closed_won');
      expect(response.body.data).toHaveProperty('actual_amount', 120000);
    });

    test('应该拒绝标记已经赢单的机会', async () => {
      // 创建一个已经赢单的销售机会
      const wonOpp = await createTestOpportunity(models.Opportunity, testCustomer.id, testUser.id, {
        name: '已赢单机会',
        status: 'won',
        stage: 'closed_won'
      });

      const response = await request(app)
        .put(`/api/opportunities/${wonOpp.id}/won`)
        .set('Authorization', `Bearer ${token}`)
        .send({
          actual_amount: 100000
        })
        .expect(400);

      expect(response.body).toHaveProperty('code', 400);
      expect(response.body.message).toContain('该机会已经是赢单状态');
    });
  });

  describe('PUT /api/opportunities/:id/lose - 标记输单', () => {
    test('应该成功标记输单', async () => {
      // 创建一个新的销售机会用于输单测试
      const oppForLose = await createTestOpportunity(models.Opportunity, testCustomer.id, testUser.id, {
        name: '输单测试机会',
        stage: 'negotiation',
        status: 'open'
      });

      const response = await request(app)
        .put(`/api/opportunities/${oppForLose.id}/lost`)
        .set('Authorization', `Bearer ${token}`)
        .send({
          lost_reason: 'price',
          competitor: '竞争对手公司',
          remark: '价格原因输单'
        })
        .expect(200);

      expect(response.body).toHaveProperty('code', 200);
      expect(response.body.data).toHaveProperty('status', 'lost');
      expect(response.body.data).toHaveProperty('stage', 'closed_lost');
      expect(response.body.data).toHaveProperty('lose_reason', 'price');
    });

    test('应该拒绝不提供输单原因', async () => {
      const oppForLose2 = await createTestOpportunity(models.Opportunity, testCustomer.id, testUser.id, {
        name: '输单测试机会2',
        status: 'open'
      });

      const response = await request(app)
        .put(`/api/opportunities/${oppForLose2.id}/lost`)
        .set('Authorization', `Bearer ${token}`)
        .send({
          // 缺少 lost_reason
          remark: '测试'
        })
        .expect(400);

      expect(response.body).toHaveProperty('code', 400);
      expect(response.body.message).toContain('请选择输单原因');
    });
  });

  describe('DELETE /api/opportunities/:id - 删除销售机会', () => {
    test('应该成功删除销售机会', async () => {
      // 创建一个用于删除的销售机会
      const oppToDelete = await createTestOpportunity(models.Opportunity, testCustomer.id, testUser.id, {
        name: '待删除机会'
      });

      const response = await request(app)
        .delete(`/api/opportunities/${oppToDelete.id}`)
        .set('Authorization', `Bearer ${token}`)
        .expect(200);

      expect(response.body).toHaveProperty('code', 200);

      // 验证已删除
      const deleted = await models.Opportunity.findByPk(oppToDelete.id);
      expect(deleted).toBeNull();
    });
  });
});
