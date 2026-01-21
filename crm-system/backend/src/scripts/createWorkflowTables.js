/**
 * 创建工作流相关表
 */
const { sequelize } = require('../models');

async function createWorkflowTables() {
  try {
    console.log('开始创建工作流相关表...');

    // 创建 workflows 表
    await sequelize.query(`
      CREATE TABLE IF NOT EXISTS \`workflows\` (
        \`id\` INT UNSIGNED NOT NULL AUTO_INCREMENT,
        \`name\` VARCHAR(100) NOT NULL COMMENT '工作流名称',
        \`code\` VARCHAR(50) NOT NULL UNIQUE COMMENT '工作流编码',
        \`description\` VARCHAR(500) DEFAULT NULL COMMENT '工作流描述',
        \`type\` VARCHAR(50) NOT NULL COMMENT '流程类型',
        \`config\` JSON NOT NULL COMMENT '流程配置',
        \`status\` TINYINT NOT NULL DEFAULT 1 COMMENT '状态',
        \`created_at\` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
        \`updated_at\` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        PRIMARY KEY (\`id\`),
        UNIQUE KEY \`uk_code\` (\`code\`)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='工作流定义表';
    `);
    console.log('✅ workflows 表创建成功');

    // 创建 workflow_instances 表
    await sequelize.query(`
      CREATE TABLE IF NOT EXISTS \`workflow_instances\` (
        \`id\` INT UNSIGNED NOT NULL AUTO_INCREMENT,
        \`workflow_id\` INT UNSIGNED NOT NULL COMMENT '工作流ID',
        \`title\` VARCHAR(200) NOT NULL COMMENT '流程标题',
        \`initiator_id\` INT UNSIGNED NOT NULL COMMENT '发起人ID',
        \`business_type\` VARCHAR(50) DEFAULT NULL COMMENT '业务类型',
        \`business_id\` INT UNSIGNED DEFAULT NULL COMMENT '业务ID',
        \`status\` VARCHAR(20) NOT NULL DEFAULT 'pending' COMMENT '流程状态',
        \`current_node\` VARCHAR(50) DEFAULT NULL COMMENT '当前节点',
        \`data\` JSON DEFAULT NULL COMMENT '流程数据',
        \`finished_at\` DATETIME DEFAULT NULL COMMENT '完成时间',
        \`created_at\` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
        \`updated_at\` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        PRIMARY KEY (\`id\`),
        INDEX \`idx_workflow_id\` (\`workflow_id\`),
        INDEX \`idx_initiator_id\` (\`initiator_id\`),
        INDEX \`idx_status\` (\`status\`),
        CONSTRAINT \`fk_instance_workflow\` FOREIGN KEY (\`workflow_id\`) REFERENCES \`workflows\` (\`id\`) ON DELETE CASCADE,
        CONSTRAINT \`fk_instance_initiator\` FOREIGN KEY (\`initiator_id\`) REFERENCES \`users\` (\`id\`) ON DELETE CASCADE
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='流程实例表';
    `);
    console.log('✅ workflow_instances 表创建成功');

    // 创建 workflow_tasks 表
    await sequelize.query(`
      CREATE TABLE IF NOT EXISTS \`workflow_tasks\` (
        \`id\` INT UNSIGNED NOT NULL AUTO_INCREMENT,
        \`instance_id\` INT UNSIGNED NOT NULL COMMENT '流程实例ID',
        \`node_id\` VARCHAR(50) NOT NULL COMMENT '节点ID',
        \`node_name\` VARCHAR(100) NOT NULL COMMENT '节点名称',
        \`assignee_id\` INT UNSIGNED NOT NULL COMMENT '处理人ID',
        \`status\` VARCHAR(20) NOT NULL DEFAULT 'pending' COMMENT '任务状态',
        \`comment\` TEXT DEFAULT NULL COMMENT '审批意见',
        \`handled_at\` DATETIME DEFAULT NULL COMMENT '处理时间',
        \`created_at\` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
        \`updated_at\` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        PRIMARY KEY (\`id\`),
        INDEX \`idx_instance_id\` (\`instance_id\`),
        INDEX \`idx_assignee_id\` (\`assignee_id\`),
        INDEX \`idx_status\` (\`status\`),
        CONSTRAINT \`fk_task_instance\` FOREIGN KEY (\`instance_id\`) REFERENCES \`workflow_instances\` (\`id\`) ON DELETE CASCADE,
        CONSTRAINT \`fk_task_assignee\` FOREIGN KEY (\`assignee_id\`) REFERENCES \`users\` (\`id\`) ON DELETE CASCADE
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='工作流任务表';
    `);
    console.log('✅ workflow_tasks 表创建成功');

    // 插入示例工作流
    await sequelize.query(`
      INSERT INTO \`workflows\` (\`name\`, \`code\`, \`description\`, \`type\`, \`config\`, \`status\`)
      VALUES 
      ('客户转移审批', 'customer_transfer', '客户转移时需要经理审批', 'approval', 
       '{"nodes":[{"id":"node1","name":"经理审批","type":"approval","assigneeId":1}]}', 1)
      ON DUPLICATE KEY UPDATE \`name\`=\`name\`;
    `);
    console.log('✅ 示例工作流插入成功');

    console.log('\n🎉 所有工作流表创建完成！');
    
  } catch (error) {
    console.error('❌ 创建表失败:', error.message);
  } finally {
    await sequelize.close();
  }
}

createWorkflowTables();
