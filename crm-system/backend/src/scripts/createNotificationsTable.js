/**
 * 创建 notifications 表
 */
const { sequelize } = require('../models');

async function createNotificationsTable() {
  try {
    console.log('开始创建 notifications 表...');

    await sequelize.query(`
      CREATE TABLE IF NOT EXISTS \`notifications\` (
        \`id\` INT UNSIGNED NOT NULL AUTO_INCREMENT COMMENT '通知ID',
        \`user_id\` INT UNSIGNED NOT NULL COMMENT '接收用户ID',
        \`type\` VARCHAR(50) NOT NULL COMMENT '通知类型',
        \`title\` VARCHAR(200) NOT NULL COMMENT '通知标题',
        \`content\` TEXT NOT NULL COMMENT '通知内容',
        \`link\` VARCHAR(500) DEFAULT NULL COMMENT '跳转链接',
        \`is_read\` BOOLEAN NOT NULL DEFAULT FALSE COMMENT '是否已读',
        \`read_at\` DATETIME DEFAULT NULL COMMENT '已读时间',
        \`sender_id\` INT UNSIGNED DEFAULT NULL COMMENT '发送人ID',
        \`extra_data\` JSON DEFAULT NULL COMMENT '额外数据',
        \`created_at\` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
        \`updated_at\` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
        PRIMARY KEY (\`id\`),
        INDEX \`idx_user_id\` (\`user_id\`),
        INDEX \`idx_type\` (\`type\`),
        INDEX \`idx_is_read\` (\`is_read\`),
        INDEX \`idx_created_at\` (\`created_at\`),
        CONSTRAINT \`fk_notifications_user\` FOREIGN KEY (\`user_id\`) REFERENCES \`users\` (\`id\`) ON DELETE CASCADE,
        CONSTRAINT \`fk_notifications_sender\` FOREIGN KEY (\`sender_id\`) REFERENCES \`users\` (\`id\`) ON DELETE SET NULL
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='消息通知表';
    `);

    console.log('✅ notifications 表创建成功！');
    
  } catch (error) {
    console.error('❌ 创建表失败:', error);
  } finally {
    await sequelize.close();
  }
}

createNotificationsTable();
