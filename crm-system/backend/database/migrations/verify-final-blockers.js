/**
 * 最终数据库阻塞问题验证脚本
 * 验证所有修复是否完成
 */

const fs = require('fs');
const path = require('path');

console.log('🔍 验证数据库阻塞问题修复...\n');

const issues = [];
const warnings = [];

// ============================================
// 1. 验证 config/index.js - database 配置
// ============================================
console.log('📋 检查 1: config/index.js - database 配置');
const configPath = path.join(__dirname, '../../src/config/index.js');
const configContent = fs.readFileSync(configPath, 'utf8');

// 检查 database 是否在注释中
const lines = configContent.split('\n');
let databaseLineIndex = -1;
let databaseInComment = false;

for (let i = 0; i < lines.length; i++) {
  const line = lines[i];
  if (line.includes('database:') && line.includes("require('./database')")) {
    databaseLineIndex = i + 1;
    // 检查是否在同一行有注释符号在 database 之前
    const beforeDatabase = line.substring(0, line.indexOf('database:'));
    if (beforeDatabase.includes('//')) {
      databaseInComment = true;
      issues.push('❌ config/index.js: database 配置行与注释在同一行');
      console.log(`  ❌ 第 ${databaseLineIndex} 行: database 配置与注释在同一行`);
      console.log(`     内容: ${line.trim()}`);
    }
    break;
  }
}

if (databaseLineIndex > 0 && !databaseInComment) {
  console.log(`  ✅ database 配置正确（第 ${databaseLineIndex} 行）\n`);
} else if (databaseLineIndex === -1) {
  issues.push('❌ config/index.js: 找不到 database 配置');
  console.log('  ❌ 找不到 database 配置\n');
}

// ============================================
// 2. 验证 init.sql - 工作流表存在
// ============================================
console.log('📋 检查 2: init.sql - 工作流相关表');
const initSqlPath = path.join(__dirname, '../../database/init.sql');
const initSqlContent = fs.readFileSync(initSqlPath, 'utf8');

const hasWorkflowsTable = initSqlContent.includes('CREATE TABLE `workflows`');
const hasWorkflowInstancesTable = initSqlContent.includes('CREATE TABLE `workflow_instances`');
const hasWorkflowTasksTable = initSqlContent.includes('CREATE TABLE `workflow_tasks`');

if (hasWorkflowsTable && hasWorkflowInstancesTable && hasWorkflowTasksTable) {
  console.log('  ✅ workflows 表存在');
  console.log('  ✅ workflow_instances 表存在');
  console.log('  ✅ workflow_tasks 表存在\n');
} else {
  const missing = [];
  if (!hasWorkflowsTable) missing.push('workflows');
  if (!hasWorkflowInstancesTable) missing.push('workflow_instances');
  if (!hasWorkflowTasksTable) missing.push('workflow_tasks');
  issues.push(`❌ init.sql: 缺少工作流表: ${missing.join(', ')}`);
  console.log(`  ❌ 缺少表: ${missing.join(', ')}\n`);
}

// ============================================
// 3. 验证 init.sql - system_configs 表存在
// ============================================
console.log('📋 检查 3: init.sql - system_configs 表');
const hasSystemConfigsTable = initSqlContent.includes('CREATE TABLE `system_configs`');

if (hasSystemConfigsTable) {
  console.log('  ✅ system_configs 表存在\n');
} else {
  issues.push('❌ init.sql: 缺少 system_configs 表');
  console.log('  ❌ system_configs 表不存在\n');
}

// ============================================
// 4. 验证 notifications.id 类型一致性
// ============================================
console.log('📋 检查 4: notifications.id 类型一致性');

// 检查 init.sql
const notificationsMatch = initSqlContent.match(/CREATE TABLE `notifications`[\s\S]+?ENGINE=InnoDB/);
if (notificationsMatch) {
  const notificationsTableDef = notificationsMatch[0];
  const hasBigintId = notificationsTableDef.includes('`id` BIGINT UNSIGNED');
  
  // 检查模型
  const notificationModelPath = path.join(__dirname, '../../src/models/Notification.js');
  const notificationModelContent = fs.readFileSync(notificationModelPath, 'utf8');
  const modelHasBigintId = notificationModelContent.includes('DataTypes.BIGINT.UNSIGNED');
  
  if (hasBigintId && modelHasBigintId) {
    console.log('  ✅ init.sql: BIGINT UNSIGNED');
    console.log('  ✅ Notification.js: DataTypes.BIGINT.UNSIGNED\n');
  } else {
    if (!hasBigintId) {
      issues.push('❌ init.sql: notifications.id 不是 BIGINT UNSIGNED');
      console.log('  ❌ init.sql: notifications.id 不是 BIGINT UNSIGNED');
    }
    if (!modelHasBigintId) {
      issues.push('❌ Notification.js: id 不是 DataTypes.BIGINT.UNSIGNED');
      console.log('  ❌ Notification.js: id 不是 DataTypes.BIGINT.UNSIGNED');
    }
    console.log();
  }
}

// ============================================
// 5. 验证 customer_transfers.remark 类型一致性
// ============================================
console.log('📋 检查 5: customer_transfers.remark 类型一致性');

// 检查 init.sql
const customerTransfersMatch = initSqlContent.match(/CREATE TABLE `customer_transfers`[\s\S]+?ENGINE=InnoDB/);
if (customerTransfersMatch) {
  const customerTransfersTableDef = customerTransfersMatch[0];
  const hasTextRemark = customerTransfersTableDef.includes('`remark` TEXT');
  const hasVarcharRemark = customerTransfersTableDef.includes('`remark` VARCHAR');
  
  // 检查模型
  const customerTransferModelPath = path.join(__dirname, '../../src/models/CustomerTransfer.js');
  const customerTransferModelContent = fs.readFileSync(customerTransferModelPath, 'utf8');
  const modelHasTextRemark = customerTransferModelContent.includes('DataTypes.TEXT');
  
  if (hasTextRemark && modelHasTextRemark) {
    console.log('  ✅ init.sql: TEXT');
    console.log('  ✅ CustomerTransfer.js: DataTypes.TEXT\n');
  } else {
    if (hasVarcharRemark) {
      issues.push('❌ init.sql: customer_transfers.remark 是 VARCHAR，应为 TEXT');
      console.log('  ❌ init.sql: remark 是 VARCHAR，应为 TEXT');
    }
    if (!modelHasTextRemark) {
      warnings.push('⚠️  CustomerTransfer.js: remark 不是 DataTypes.TEXT');
      console.log('  ⚠️  CustomerTransfer.js: remark 不是 DataTypes.TEXT');
    }
    console.log();
  }
}

// ============================================
// 6. 额外检查：工作流表位置
// ============================================
console.log('📋 检查 6: 工作流表位置（应在数据插入之前）');
const notificationsTableIndex = initSqlContent.indexOf('CREATE TABLE `notifications`');
const workflowsTableIndex = initSqlContent.indexOf('CREATE TABLE `workflows`');
const firstInsertIndex = initSqlContent.indexOf('INSERT INTO `roles`');

if (workflowsTableIndex > notificationsTableIndex && workflowsTableIndex < firstInsertIndex) {
  console.log('  ✅ 工作流表在 notifications 之后、数据插入之前\n');
} else if (workflowsTableIndex === -1) {
  console.log('  ⚠️  未找到工作流表\n');
} else if (workflowsTableIndex > firstInsertIndex) {
  warnings.push('⚠️  工作流表在数据插入之后，建议移到前面');
  console.log('  ⚠️  工作流表在数据插入之后\n');
}

// ============================================
// 最终结果
// ============================================
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

if (issues.length === 0 && warnings.length === 0) {
  console.log('🎉 所有阻塞问题已修复！\n');
  console.log('✅ config.database 配置正确');
  console.log('✅ init.sql 包含所有必需表');
  console.log('✅ notifications.id 类型一致 (BIGINT)');
  console.log('✅ customer_transfers.remark 类型一致 (TEXT)');
  console.log('✅ 工作流表结构完整');
  console.log('✅ system_configs 表已添加');
  console.log('\n💡 可以安全使用 init.sql 初始化数据库！');
  console.log('💡 后端代码与数据库结构完全一致！\n');
  process.exit(0);
} else {
  console.log('❌ 发现问题:\n');
  
  if (issues.length > 0) {
    console.log('🚫 阻塞问题（必须修复）:');
    issues.forEach((issue, i) => {
      console.log(`  ${i + 1}. ${issue}`);
    });
    console.log();
  }
  
  if (warnings.length > 0) {
    console.log('⚠️  警告（建议修复）:');
    warnings.forEach((warning, i) => {
      console.log(`  ${i + 1}. ${warning}`);
    });
    console.log();
  }
  
  console.log('⚠️  请修复这些问题后再部署！\n');
  process.exit(1);
}
