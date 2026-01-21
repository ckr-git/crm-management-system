require('dotenv').config();
const { models, testConnection } = require('./src/models');

async function test() {
  try {
    console.log('1. 测试数据库连接...');
    await testConnection();
    
    console.log('\n2. 测试Opportunity模型...');
    const count = await models.Opportunity.count();
    console.log(`✅ Opportunity表查询成功，当前记录数: ${count}`);
    
    console.log('\n3. 测试关联查询...');
    const opportunities = await models.Opportunity.findAll({
      limit: 1,
      include: [
        { model: models.Customer, as: 'customer' },
        { model: models.User, as: 'owner' }
      ]
    });
    console.log(`✅ 关联查询成功，返回 ${opportunities.length} 条记录`);
    
    console.log('\n4. 测试统计查询...');
    const stats = await models.Opportunity.sum('amount', { where: { status: 'open' } });
    console.log(`✅ 统计查询成功，结果: ${stats || 0}`);
    
    console.log('\n✅ 所有测试通过！');
    process.exit(0);
  } catch (error) {
    console.error('\n❌ 测试失败:', error.message);
    console.error('详细错误:', error);
    process.exit(1);
  }
}

test();
