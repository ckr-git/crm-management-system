// 修复公海池数据不一致问题
const { models, sequelize } = require('./src/models');

async function fixPoolData() {
  try {
    console.log('开始修复公海池数据...\n');

    // 获取所有客户
    const customers = await models.Customer.findAll();
    
    console.log(`找到 ${customers.length} 个客户，开始逐个检查...\n`);

    for (const customer of customers) {
      console.log(`检查客户 ID=${customer.id} (${customer.name}):`);
      
      // 查找该客户最新的公海池记录
      const latestPool = await models.CustomerPool.findOne({
        where: { customer_id: customer.id },
        order: [['enter_at', 'DESC'], ['id', 'DESC']]
      });

      if (!latestPool) {
        // 客户从未进入过公海池，应该有负责人
        console.log(`  - 从未进入公海池`);
        if (!customer.owner_id) {
          console.log(`  ❌ 没有负责人！这不正常，但不修改`);
        } else {
          console.log(`  ✅ 有负责人: ${customer.owner_id}`);
        }
        console.log();
        continue;
      }

      console.log(`  - 最新公海池记录: ID=${latestPool.id}, status=${latestPool.status}`);
      console.log(`  - 当前负责人: ${customer.owner_id}`);

      if (latestPool.status === 'available') {
        // 客户在公海中，应该没有负责人
        if (customer.owner_id !== null) {
          console.log(`  ❌ 客户在公海但有负责人！`);
          console.log(`  🔧 修复：清空负责人...`);
          await customer.update({ owner_id: null });
          console.log(`  ✅ 已修复`);
        } else {
          console.log(`  ✅ 数据一致：在公海且无负责人`);
        }
      } else if (latestPool.status === 'claimed') {
        // 客户已被领取，负责人应该是领取人
        if (customer.owner_id !== latestPool.claimed_by) {
          console.log(`  ❌ 客户负责人(${customer.owner_id})与领取人(${latestPool.claimed_by})不一致！`);
          console.log(`  🔧 修复：设置负责人为领取人...`);
          await customer.update({ owner_id: latestPool.claimed_by });
          console.log(`  ✅ 已修复`);
        } else {
          console.log(`  ✅ 数据一致：已领取且负责人正确`);
        }
      }
      
      console.log();
    }

    console.log('\n✅ 数据修复完成！');
    process.exit(0);
  } catch (error) {
    console.error('❌ 修复失败:', error);
    process.exit(1);
  }
}

// 执行修复
fixPoolData();
