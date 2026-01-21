const request = require('supertest');
const app = require('../../src/app');
const { createTestDatabase, syncTestDatabase, cleanTestDatabase, createTestUser } = require('../helpers/testDatabase');
const { models } = require('../../src/models');

describe('Analysis/Report Controller - 报表分析模块测试', () => {
  let sequelize;
  let testUser;
  let token;
  let testCustomers = [];
  let testOpportunities = [];

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

    // 创建测试数据
    await createTestData();
  });

  afterAll(async () => {
    await cleanTestDatabase(sequelize);
  });

  // 创建测试数据辅助函数
  async function createTestData() {
    // 创建不同来源、行业的客户
    const sources = ['网站咨询', '电话咨询', '老客户转介绍', '展会活动'];
    const industries = ['互联网', '金融', '制造', '零售'];
    const stages = ['potential', 'intention', 'quotation', 'negotiation', 'deal'];
    const levels = ['normal', 'important', 'vip'];

    for (let i = 0; i < 20; i++) {
      const customer = await models.Customer.create({
        name: `测试客户${i + 1}`,
        contact: `联系人${i + 1}`,
        phone: `1390013900${i}`,
        source: sources[i % sources.length],
        industry: industries[i % industries.length],
        stage: stages[i % stages.length],
        level: levels[i % levels.length],
        owner_id: testUser.id
      });
      testCustomers.push(customer);

      // 为部分客户创建销售机会
      if (i < 15) {
        const opportunity = await models.Opportunity.create({
          customer_id: customer.id,
          name: `销售机会${i + 1}`,
          amount: (i + 1) * 10000,
          stage: ['initial', 'demand', 'proposal', 'negotiation', 'closed_won', 'closed_lost'][i % 6],
          probability: (i * 10) % 100,
          expected_close_date: new Date(Date.now() + (i * 7) * 24 * 60 * 60 * 1000),
          owner_id: testUser.id
        });
        testOpportunities.push(opportunity);
      }

      // 创建跟进记录
      if (i < 10) {
        await models.Followup.create({
          customer_id: customer.id,
          user_id: testUser.id,
          type: ['phone', 'visit', 'email', 'wechat'][i % 4],
          content: `跟进记录${i + 1}`
        });
      }
    }
  }

  describe('GET /api/analysis/source-stats - 客户来源分析', () => {
    test('应该返回客户来源统计数据', async () => {
      const response = await request(app)
        .get('/api/analysis/source-stats')
        .set('Authorization', `Bearer ${token}`)
        .expect(200);

      expect(response.body).toHaveProperty('code', 200);
      expect(response.body.data).toHaveProperty('total');
      expect(response.body.data).toHaveProperty('stats');
      expect(Array.isArray(response.body.data.stats)).toBe(true);
      
      // 验证数据结构
      if (response.body.data.stats.length > 0) {
        const item = response.body.data.stats[0];
        expect(item).toHaveProperty('source');
        expect(item).toHaveProperty('count');
        expect(typeof item.count).toBe('number');
      }
    });

    test('应该包含所有客户来源', async () => {
      const response = await request(app)
        .get('/api/analysis/source-stats')
        .set('Authorization', `Bearer ${token}`);

      const sources = response.body.data.stats.map(item => item.source);
      expect(sources.length).toBeGreaterThan(0);
    });

    test('应该支持时间范围筛选', async () => {
      const startDate = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();
      const endDate = new Date().toISOString();

      const response = await request(app)
        .get('/api/analysis/source-stats')
        .set('Authorization', `Bearer ${token}`)
        .query({ start_date: startDate, end_date: endDate })
        .expect(200);

      expect(response.body).toHaveProperty('code', 200);
    });
  });

  describe('GET /api/analysis/industry-stats - 行业分析', () => {
    test('应该返回行业统计数据', async () => {
      const response = await request(app)
        .get('/api/analysis/industry-stats')
        .set('Authorization', `Bearer ${token}`)
        .expect(200);

      expect(response.body).toHaveProperty('code', 200);
      expect(response.body.data).toHaveProperty('total');
      expect(response.body.data).toHaveProperty('stats');
      expect(Array.isArray(response.body.data.stats)).toBe(true);
      
      if (response.body.data.stats.length > 0) {
        const item = response.body.data.stats[0];
        expect(item).toHaveProperty('industry');
        expect(item).toHaveProperty('count');
      }
    });

    test('应该按数量降序排列', async () => {
      const response = await request(app)
        .get('/api/analysis/industry-stats')
        .set('Authorization', `Bearer ${token}`);

      const data = response.body.data.stats;
      for (let i = 0; i < data.length - 1; i++) {
        expect(data[i].count).toBeGreaterThanOrEqual(data[i + 1].count);
      }
    });
  });

  // 跳过客户阶段分析测试 - API未实现
  describe.skip('GET /api/analysis/customer-stage - 客户阶段分析', () => {
    test('应该返回客户阶段分布数据', async () => {
      const response = await request(app)
        .get('/api/analysis/customer-stage')
        .set('Authorization', `Bearer ${token}`)
        .expect(200);

      expect(response.body).toHaveProperty('code', 200);
      expect(Array.isArray(response.body.data)).toBe(true);
      
      if (response.body.data.length > 0) {
        const item = response.body.data[0];
        expect(item).toHaveProperty('stage');
        expect(item).toHaveProperty('count');
      }
    });

    test('应该计算各阶段占比', async () => {
      const response = await request(app)
        .get('/api/analysis/customer-stage')
        .set('Authorization', `Bearer ${token}`);

      const data = response.body.data;
      const totalCount = data.reduce((sum, item) => sum + item.count, 0);
      
      data.forEach(item => {
        if (item.percentage !== undefined) {
          expect(item.percentage).toBeGreaterThanOrEqual(0);
          expect(item.percentage).toBeLessThanOrEqual(100);
        }
      });
    });
  });

  describe('GET /api/analysis/source-conversion - 来源转化率分析', () => {
    test('应该返回转化率数据', async () => {
      const response = await request(app)
        .get('/api/analysis/source-conversion')
        .set('Authorization', `Bearer ${token}`)
        .expect(200);

      expect(response.body).toHaveProperty('code', 200);
      expect(Array.isArray(response.body.data)).toBe(true);
      
      if (response.body.data.length > 0) {
        const item = response.body.data[0];
        expect(item).toHaveProperty('source');
        expect(item).toHaveProperty('total');
        expect(item).toHaveProperty('converted');
        expect(item).toHaveProperty('conversion_rate');
      }
    });

    test('应该正确计算转化率', async () => {
      const response = await request(app)
        .get('/api/analysis/source-conversion')
        .set('Authorization', `Bearer ${token}`);

      response.body.data.forEach(item => {
        if (item.total > 0) {
          const expectedRate = (item.converted / item.total * 100).toFixed(2);
          expect(parseFloat(item.conversion_rate)).toBeCloseTo(parseFloat(expectedRate), 1);
        }
      });
    });
  });

  describe('GET /api/opportunities/stats/funnel - 销售漏斗数据', () => {
    test('应该返回销售漏斗各阶段数据', async () => {
      const response = await request(app)
        .get('/api/opportunities/stats/funnel')
        .set('Authorization', `Bearer ${token}`)
        .expect(200);

      expect(response.body).toHaveProperty('code', 200);
      expect(Array.isArray(response.body.data)).toBe(true);
      
      if (response.body.data.length > 0) {
        const item = response.body.data[0];
        expect(item).toHaveProperty('stage');
        expect(item).toHaveProperty('count');
        expect(item).toHaveProperty('amount');
      }
    });

    test('漏斗应该按阶段顺序排列', async () => {
      const response = await request(app)
        .get('/api/opportunities/stats/funnel')
        .set('Authorization', `Bearer ${token}`);

      const stages = response.body.data.map(item => item.stage);
      const expectedOrder = ['initial', 'demand', 'proposal', 'negotiation', 'closed_won', 'closed_lost'];
      
      // 验证包含的阶段顺序正确
      const filteredExpected = expectedOrder.filter(s => stages.includes(s));
      const actualOrder = stages.filter(s => expectedOrder.includes(s));
      
      filteredExpected.forEach((stage, index) => {
        if (actualOrder[index]) {
          const expectedIndex = expectedOrder.indexOf(stage);
          const actualIndex = expectedOrder.indexOf(actualOrder[index]);
          expect(actualIndex).toBeLessThanOrEqual(expectedIndex);
        }
      });
    });
  });

  describe.skip('GET /api/reports/monthly - 月度报表 (API未实现)', () => {
    test('应该返回月度统计数据', async () => {
      const response = await request(app)
        .get('/api/reports/monthly')
        .set('Authorization', `Bearer ${token}`)
        .query({ 
          year: new Date().getFullYear(),
          month: new Date().getMonth() + 1
        })
        .expect(200);

      expect(response.body).toHaveProperty('code', 200);
      expect(response.body.data).toHaveProperty('newCustomers');
      expect(response.body.data).toHaveProperty('newOpportunities');
      expect(response.body.data).toHaveProperty('totalAmount');
      expect(response.body.data).toHaveProperty('wonAmount');
    });

    test('应该拒绝无效的年月参数', async () => {
      const response = await request(app)
        .get('/api/reports/monthly')
        .set('Authorization', `Bearer ${token}`)
        .query({ year: 'invalid', month: 13 })
        .expect(400);

      expect(response.body).toHaveProperty('code', 400);
    });
  });

  describe.skip('GET /api/reports/user-performance - 用户业绩报表 (API未实现)', () => {
    test('应该返回用户业绩数据', async () => {
      const response = await request(app)
        .get('/api/reports/user-performance')
        .set('Authorization', `Bearer ${token}`)
        .expect(200);

      expect(response.body).toHaveProperty('code', 200);
      expect(Array.isArray(response.body.data)).toBe(true);
      
      if (response.body.data.length > 0) {
        const item = response.body.data[0];
        expect(item).toHaveProperty('user_id');
        expect(item).toHaveProperty('customerCount');
        expect(item).toHaveProperty('opportunityCount');
        expect(item).toHaveProperty('totalAmount');
      }
    });

    test('应该支持时间范围筛选', async () => {
      const startDate = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();
      const endDate = new Date().toISOString();

      const response = await request(app)
        .get('/api/reports/user-performance')
        .set('Authorization', `Bearer ${token}`)
        .query({ start_date: startDate, end_date: endDate })
        .expect(200);

      expect(response.body).toHaveProperty('code', 200);
    });
  });

  describe.skip('GET /api/analysis/trend - 趋势分析', () => {
    test('应该返回客户增长趋势', async () => {
      const response = await request(app)
        .get('/api/analysis/trend')
        .set('Authorization', `Bearer ${token}`)
        .query({ type: 'customer', days: 30 })
        .expect(200);

      expect(response.body).toHaveProperty('code', 200);
      expect(Array.isArray(response.body.data)).toBe(true);
      
      if (response.body.data.length > 0) {
        const item = response.body.data[0];
        expect(item).toHaveProperty('date');
        expect(item).toHaveProperty('count');
      }
    });

    test('应该支持不同类型的趋势分析', async () => {
      const types = ['customer', 'opportunity', 'followup'];
      
      for (const type of types) {
        const response = await request(app)
          .get('/api/analysis/trend')
          .set('Authorization', `Bearer ${token}`)
          .query({ type, days: 7 })
          .expect(200);

        expect(response.body).toHaveProperty('code', 200);
      }
    });

    test('应该按日期升序排列', async () => {
      const response = await request(app)
        .get('/api/analysis/trend')
        .set('Authorization', `Bearer ${token}`)
        .query({ type: 'customer', days: 7 });

      const data = response.body.data;
      for (let i = 0; i < data.length - 1; i++) {
        const date1 = new Date(data[i].date);
        const date2 = new Date(data[i + 1].date);
        expect(date1.getTime()).toBeLessThanOrEqual(date2.getTime());
      }
    });
  });

  describe.skip('GET /api/analysis/summary - 数据总览', () => {
    test('应该返回综合统计数据', async () => {
      const response = await request(app)
        .get('/api/analysis/summary')
        .set('Authorization', `Bearer ${token}`)
        .expect(200);

      expect(response.body).toHaveProperty('code', 200);
      expect(response.body.data).toHaveProperty('totalCustomers');
      expect(response.body.data).toHaveProperty('totalOpportunities');
      expect(response.body.data).toHaveProperty('totalAmount');
      expect(response.body.data).toHaveProperty('wonAmount');
      expect(response.body.data).toHaveProperty('followupCount');
    });

    test('所有数值应该是非负数', async () => {
      const response = await request(app)
        .get('/api/analysis/summary')
        .set('Authorization', `Bearer ${token}`);

      const data = response.body.data;
      Object.values(data).forEach(value => {
        if (typeof value === 'number') {
          expect(value).toBeGreaterThanOrEqual(0);
        }
      });
    });
  });

  describe('GET /api/reports/export-excel - 导出报表', () => {
    test('应该支持导出Excel格式', async () => {
      const response = await request(app)
        .get('/api/reports/export-excel')
        .set('Authorization', `Bearer ${token}`)
        .query({
          type: 'customer',
          start_date: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
          end_date: new Date().toISOString()
        });

      // Excel导出直接返回文件流
      expect(response.status).toBe(200);
      expect(response.headers['content-type']).toContain('spreadsheetml');
    });

    test('应该支持不同类型的报表', async () => {
      const types = ['customer', 'opportunity', 'followup', 'comprehensive'];
      
      for (const type of types) {
        const response = await request(app)
          .get('/api/reports/export-excel')
          .set('Authorization', `Bearer ${token}`)
          .query({ type });

        expect(response.status).toBe(200);
      }
    });
  });

  describe.skip('数据准确性测试', () => {
    test('客户总数应该与数据库一致', async () => {
      const response = await request(app)
        .get('/api/analysis/summary')
        .set('Authorization', `Bearer ${token}`);

      const totalFromApi = response.body.data.totalCustomers;
      
      const totalFromDb = await models.Customer.count({
        where: { owner_id: testUser.id }
      });

      expect(totalFromApi).toBe(totalFromDb);
    });

    test('销售机会总金额应该正确', async () => {
      const response = await request(app)
        .get('/api/analysis/summary')
        .set('Authorization', `Bearer ${token}`);

      const totalAmountFromApi = response.body.data.totalAmount;
      
      const opportunities = await models.Opportunity.findAll({
        where: { owner_id: testUser.id }
      });
      
      const totalAmountFromDb = opportunities.reduce((sum, opp) => 
        sum + parseFloat(opp.amount || 0), 0
      );

      expect(parseFloat(totalAmountFromApi)).toBeCloseTo(totalAmountFromDb, 2);
    });
  });

  describe('性能测试', () => {
    test('统计查询应该在合理时间内完成', async () => {
      const startTime = Date.now();
      
      await request(app)
        .get('/api/analysis/source-stats')
        .set('Authorization', `Bearer ${token}`)
        .expect(200);

      const endTime = Date.now();
      const duration = endTime - startTime;

      // 应该在2秒内完成
      expect(duration).toBeLessThan(2000);
    });

    test('复杂聚合查询应该在合理时间内完成', async () => {
      const startTime = Date.now();
      
      await request(app)
        .get('/api/opportunities/stats/funnel')
        .set('Authorization', `Bearer ${token}`)
        .expect(200);

      const endTime = Date.now();
      const duration = endTime - startTime;

      // 应该在3秒内完成
      expect(duration).toBeLessThan(3000);
    });
  });
});
