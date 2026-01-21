/**
 * 添加数据库索引优化性能
 */
const { sequelize } = require('../models');

async function addIndexes() {
  console.log('开始添加数据库索引...');

  try {
    // 客户表索引
    await sequelize.query(`
      CREATE INDEX IF NOT EXISTS idx_customers_owner_id ON customers(owner_id);
      CREATE INDEX IF NOT EXISTS idx_customers_source ON customers(source);
      CREATE INDEX IF NOT EXISTS idx_customers_industry ON customers(industry);
      CREATE INDEX IF NOT EXISTS idx_customers_level ON customers(level);
      CREATE INDEX IF NOT EXISTS idx_customers_status ON customers(status);
      CREATE INDEX IF NOT EXISTS idx_customers_created_at ON customers(created_at);
    `);
    console.log('✅ 客户表索引添加完成');

    // 销售机会表索引
    await sequelize.query(`
      CREATE INDEX IF NOT EXISTS idx_opportunities_customer_id ON opportunities(customer_id);
      CREATE INDEX IF NOT EXISTS idx_opportunities_owner_id ON opportunities(owner_id);
      CREATE INDEX IF NOT EXISTS idx_opportunities_stage ON opportunities(stage);
      CREATE INDEX IF NOT EXISTS idx_opportunities_created_at ON opportunities(created_at);
    `);
    console.log('✅ 销售机会表索引添加完成');

    // 跟进记录表索引
    await sequelize.query(`
      CREATE INDEX IF NOT EXISTS idx_followups_customer_id ON followups(customer_id);
      CREATE INDEX IF NOT EXISTS idx_followups_user_id ON followups(user_id);
      CREATE INDEX IF NOT EXISTS idx_followups_type ON followups(type);
      CREATE INDEX IF NOT EXISTS idx_followups_created_at ON followups(created_at);
    `);
    console.log('✅ 跟进记录表索引添加完成');

    // 客户公海表索引
    await sequelize.query(`
      CREATE INDEX IF NOT EXISTS idx_customer_pool_customer_id ON customer_pool(customer_id);
      CREATE INDEX IF NOT EXISTS idx_customer_pool_previous_owner_id ON customer_pool(previous_owner_id);
      CREATE INDEX IF NOT EXISTS idx_customer_pool_return_time ON customer_pool(return_time);
    `);
    console.log('✅ 客户公海表索引添加完成');

    // 操作日志表索引
    await sequelize.query(`
      CREATE INDEX IF NOT EXISTS idx_operation_logs_user_id ON operation_logs(user_id);
      CREATE INDEX IF NOT EXISTS idx_operation_logs_action ON operation_logs(action);
      CREATE INDEX IF NOT EXISTS idx_operation_logs_created_at ON operation_logs(created_at);
    `);
    console.log('✅ 操作日志表索引添加完成');

    console.log('\n🎉 所有索引添加完成！');
  } catch (error) {
    console.error('❌ 添加索引失败:', error);
  } finally {
    await sequelize.close();
  }
}

addIndexes();
