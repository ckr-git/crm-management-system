/**
 * 创建测试通知数据
 */
const { sequelize } = require('../models');

async function createTestNotifications() {
  try {
    console.log('开始创建测试通知数据...');

    // 插入测试通知
    await sequelize.query(`
      INSERT INTO notifications (user_id, type, title, content, link, is_read, sender_id)
      VALUES 
      (1, 'system', '系统通知', '欢迎使用CRM系统消息中心！', '/home', 0, NULL),
      (1, 'task', '任务提醒', '您有一个待办任务需要处理', '/followups', 0, NULL),
      (1, 'customer', '客户分配通知', '系统管理员将客户【测试公司】分配给了您', '/customers/1', 0, 1),
      (1, 'approval', '审批通知', '您有一个客户转移审批待处理', '/workflow/tasks', 0, NULL)
    `);

    console.log('✅ 测试通知创建成功！共4条');
    console.log('');
    console.log('现在刷新消息中心页面，应该能看到4条测试消息！');
    
  } catch (error) {
    console.error('❌ 创建测试数据失败:', error.message);
  } finally {
    await sequelize.close();
  }
}

createTestNotifications();
