const mysql = require('mysql2/promise');
require('dotenv').config({ path: '../.env' });

async function cleanupDeletedUsers() {
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 3307,
    user: process.env.DB_USER || 'crm_user',
    password: process.env.DB_PASSWORD || 'crm123456',
    database: process.env.DB_NAME || 'crm_system'
  });

  try {
    // 获取已软删除的用户ID
    const [deletedUsers] = await connection.execute(
      'SELECT id, username, name FROM users WHERE deleted_at IS NOT NULL'
    );
    
    if (deletedUsers.length === 0) {
      console.log('没有需要清理的用户');
      return;
    }
    
    console.log(`找到 ${deletedUsers.length} 个已软删除的用户:`);
    deletedUsers.forEach(u => console.log(`  - ID: ${u.id}, 用户名: ${u.username}, 姓名: ${u.name}`));
    
    const userIds = deletedUsers.map(u => u.id);
    const idsString = userIds.join(',');
    
    // 开始事务
    await connection.beginTransaction();
    
    // 删除相关数据
    console.log('\n开始清理相关数据...');
    
    // 1. customer_pool
    await connection.execute(`DELETE FROM customer_pool WHERE previous_owner_id IN (${idsString})`);
    await connection.execute(`DELETE FROM customer_pool WHERE claimed_by IN (${idsString})`);
    console.log('✓ 清理 customer_pool');
    
    // 2. customer_transfers
    await connection.execute(`DELETE FROM customer_transfers WHERE from_user_id IN (${idsString})`);
    await connection.execute(`DELETE FROM customer_transfers WHERE to_user_id IN (${idsString})`);
    await connection.execute(`DELETE FROM customer_transfers WHERE transfer_by IN (${idsString})`);
    console.log('✓ 清理 customer_transfers');
    
    // 3. customers - 将客户的 owner_id 设为 NULL 或转给管理员(id=1)
    await connection.execute(`UPDATE customers SET owner_id = NULL WHERE owner_id IN (${idsString})`);
    console.log('✓ 清理 customers (设置 owner_id 为 NULL)');
    
    // 4. followups
    await connection.execute(`DELETE FROM followups WHERE user_id IN (${idsString})`);
    console.log('✓ 清理 followups');
    
    // 5. notifications
    await connection.execute(`DELETE FROM notifications WHERE sender_id IN (${idsString})`);
    console.log('✓ 清理 notifications');
    
    // 6. operation_logs
    await connection.execute(`DELETE FROM operation_logs WHERE user_id IN (${idsString})`);
    console.log('✓ 清理 operation_logs');
    
    // 7. opportunities
    await connection.execute(`UPDATE opportunities SET owner_id = NULL WHERE owner_id IN (${idsString})`);
    console.log('✓ 清理 opportunities (设置 owner_id 为 NULL)');
    
    // 8. workflow_instances
    await connection.execute(`DELETE FROM workflow_instances WHERE initiator_id IN (${idsString})`);
    console.log('✓ 清理 workflow_instances');
    
    // 9. workflow_tasks
    await connection.execute(`DELETE FROM workflow_tasks WHERE assignee_id IN (${idsString})`);
    console.log('✓ 清理 workflow_tasks');
    
    // 最后，物理删除用户
    const [result] = await connection.execute(
      `DELETE FROM users WHERE id IN (${idsString})`
    );
    
    console.log(`\n✅ 成功删除 ${result.affectedRows} 个用户记录`);
    
    // 提交事务
    await connection.commit();
    console.log('✅ 所有操作已提交');
    
  } catch (error) {
    await connection.rollback();
    console.error('❌ 清理失败，已回滚:', error.message);
    throw error;
  } finally {
    await connection.end();
  }
}

cleanupDeletedUsers().catch(console.error);
