/**
 * 源文件完整性验证脚本
 * 验证 init.sql 和代码的一致性
 */

const fs = require('fs');
const path = require('path');

function verifySourceFiles() {
  console.log('🔍 验证源文件完整性...\n');
  
  const issues = [];
  
  // 1. 验证 config/index.js
  console.log('📋 检查 1: config/index.js');
  const configPath = path.join(__dirname, '../../src/config/index.js');
  const configContent = fs.readFileSync(configPath, 'utf8');
  
  // 检查 database 属性是否被正确导出
  const databaseLineMatch = configContent.match(/^  database: require\('\.\/database'\),?$/m);
  if (databaseLineMatch) {
    console.log('  ✅ database 配置行格式正确（独立一行）\n');
  } else {
    const commentIssue = configContent.match(/\/\/.*database:.*require/);
    if (commentIssue) {
      issues.push('❌ config/index.js: database 属性与注释在同一行');
      console.log('  ❌ database 属性与注释在同一行\n');
    } else {
      issues.push('❌ config/index.js: 找不到 database 配置行');
      console.log('  ❌ 找不到 database 配置行\n');
    }
  }
  
  // 2. 验证 init.sql - customers.owner_id
  console.log('📋 检查 2: init.sql - customers.owner_id');
  const initSqlPath = path.join(__dirname, '../../database/init.sql');
  const initSqlContent = fs.readFileSync(initSqlPath, 'utf8');
  
  if (initSqlContent.includes('`owner_id` INT UNSIGNED NULL') || 
      initSqlContent.includes('`owner_id` INT UNSIGNED DEFAULT NULL')) {
    console.log('  ✅ owner_id 允许 NULL\n');
  } else if (initSqlContent.includes('`owner_id` INT UNSIGNED NOT NULL')) {
    issues.push('❌ init.sql: customers.owner_id 仍是 NOT NULL');
    console.log('  ❌ owner_id 仍是 NOT NULL\n');
  }
  
  // 3. 验证 init.sql - permissions 表结构
  console.log('📋 检查 3: init.sql - permissions 表结构');
  const permissionsMatch = initSqlContent.match(/CREATE TABLE `permissions`[^;]+;/s);
  if (permissionsMatch) {
    const permissionsTableDef = permissionsMatch[0];
    const hasType = permissionsTableDef.includes('`type`');
    const hasSortOrder = permissionsTableDef.includes('`sort_order`');
    const hasUpdatedAt = permissionsTableDef.includes('`updated_at`');
    const hasDeletedAt = permissionsTableDef.includes('`deleted_at`');
    const hasResource = permissionsTableDef.includes('`resource`');
    const hasAction = permissionsTableDef.includes('`action`');
    
    if (hasType && hasSortOrder && hasUpdatedAt && hasDeletedAt) {
      console.log('  ✅ permissions 包含 type, sort_order, updated_at, deleted_at');
    } else {
      const missing = [];
      if (!hasType) missing.push('type');
      if (!hasSortOrder) missing.push('sort_order');
      if (!hasUpdatedAt) missing.push('updated_at');
      if (!hasDeletedAt) missing.push('deleted_at');
      issues.push(`❌ init.sql: permissions 缺少字段: ${missing.join(', ')}`);
      console.log(`  ❌ 缺少字段: ${missing.join(', ')}`);
    }
    
    if (hasResource || hasAction) {
      issues.push('❌ init.sql: permissions 仍有旧字段 resource/action');
      console.log('  ⚠️  仍包含旧字段: resource 或 action');
    }
  }
  console.log();
  
  // 4. 验证 init.sql - notifications 表结构
  console.log('📋 检查 4: init.sql - notifications 表结构');
  const notificationsMatch = initSqlContent.match(/CREATE TABLE `notifications`[^;]+;/s);
  if (notificationsMatch) {
    const notificationsTableDef = notificationsMatch[0];
    const hasSenderId = notificationsTableDef.includes('`sender_id`');
    const hasExtraData = notificationsTableDef.includes('`extra_data`');
    const hasUpdatedAt = notificationsTableDef.includes('`updated_at`');
    
    if (hasSenderId && hasExtraData && hasUpdatedAt) {
      console.log('  ✅ notifications 包含 sender_id, extra_data, updated_at');
    } else {
      const missing = [];
      if (!hasSenderId) missing.push('sender_id');
      if (!hasExtraData) missing.push('extra_data');
      if (!hasUpdatedAt) missing.push('updated_at');
      issues.push(`❌ init.sql: notifications 缺少字段: ${missing.join(', ')}`);
      console.log(`  ❌ 缺少字段: ${missing.join(', ')}`);
    }
  }
  console.log();
  
  // 5. 验证 init.sql - operation_logs 表结构
  console.log('📋 检查 5: init.sql - operation_logs 表结构');
  const operationLogsMatch = initSqlContent.match(/CREATE TABLE `operation_logs`[^;]+;/s);
  if (operationLogsMatch) {
    const operationLogsTableDef = operationLogsMatch[0];
    const hasUpdatedAt = operationLogsTableDef.includes('`updated_at`');
    const hasDeletedAt = operationLogsTableDef.includes('`deleted_at`');
    
    if (hasUpdatedAt && hasDeletedAt) {
      console.log('  ✅ operation_logs 包含 updated_at, deleted_at');
    } else {
      const missing = [];
      if (!hasUpdatedAt) missing.push('updated_at');
      if (!hasDeletedAt) missing.push('deleted_at');
      issues.push(`❌ init.sql: operation_logs 缺少字段: ${missing.join(', ')}`);
      console.log(`  ❌ 缺少字段: ${missing.join(', ')}`);
    }
  }
  console.log();
  
  // 最终结果
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
  if (issues.length === 0) {
    console.log('🎉 所有源文件验证通过！');
    console.log('✅ config/index.js 正确');
    console.log('✅ init.sql 所有表结构与模型一致');
    console.log('\n💡 可以安全地使用 init.sql 初始化新数据库了！\n');
    return true;
  } else {
    console.log('❌ 发现问题:\n');
    issues.forEach((issue, i) => {
      console.log(`  ${i + 1}. ${issue}`);
    });
    console.log('\n⚠️  请修复这些问题后再运行！\n');
    return false;
  }
}

// 运行验证
if (require.main === module) {
  const success = verifySourceFiles();
  process.exit(success ? 0 : 1);
}

module.exports = verifySourceFiles;
