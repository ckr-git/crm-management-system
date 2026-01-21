const { sequelize } = require('../models');

async function createSystemConfigTable() {
  try {
    await sequelize.query(`
      CREATE TABLE IF NOT EXISTS system_configs (
        id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
        config_key VARCHAR(100) NOT NULL UNIQUE,
        config_value TEXT,
        config_type VARCHAR(20) NOT NULL DEFAULT 'string',
        description VARCHAR(500),
        created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    `);

    await sequelize.query(`
      INSERT INTO system_configs (config_key, config_value, config_type, description) VALUES
      ('site_name', 'CRM系统', 'string', '网站名称'),
      ('customer_pool_days', '30', 'number', '客户公海回收天数'),
      ('followup_reminder_hours', '24', 'number', '跟进提醒提前小时数'),
      ('enable_notification', 'true', 'boolean', '启用通知功能')
      ON DUPLICATE KEY UPDATE config_key=config_key;
    `);

    console.log('✅ system_configs 表创建成功');
  } catch (error) {
    console.error('❌ 创建表失败:', error.message);
  } finally {
    await sequelize.close();
  }
}

createSystemConfigTable();
