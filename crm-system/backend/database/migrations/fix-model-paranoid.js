/**
 * 模型 Paranoid 配置修复脚本
 * 
 * 问题说明:
 * - config/database.js 全局启用了 paranoid: true
 * - 但某些表（permissions, operation_logs, notifications）没有 deleted_at 列
 * - 导致查询时出现 "Unknown column 'deleted_at'" 错误
 * 
 * 解决方案:
 * 方案1: 在表中添加 deleted_at 列（推荐）- 见 fix-schema-mismatches.sql
 * 方案2: 在模型中明确禁用 paranoid（本脚本）
 */

const { sequelize, models } = require('../../src/models');

async function fixParanoidConfig() {
  console.log('🔧 开始修复模型 Paranoid 配置...\n');
  
  try {
    // 1. 测试数据库连接
    await sequelize.authenticate();
    console.log('✅ 数据库连接成功\n');
    
    // 2. 检查每个需要修复的表
    const tablesToCheck = [
      { model: 'Permission', table: 'permissions' },
      { model: 'OperationLog', table: 'operation_logs' },
      { model: 'Notification', table: 'notifications' }
    ];
    
    console.log('📋 检查表结构:\n');
    
    for (const { model, table } of tablesToCheck) {
      console.log(`检查 ${table}...`);
      
      try {
        // 查询表结构
        const [columns] = await sequelize.query(`DESCRIBE ${table}`);
        const hasDeletedAt = columns.some(col => col.Field === 'deleted_at');
        const hasUpdatedAt = columns.some(col => col.Field === 'updated_at');
        
        console.log(`  - updated_at: ${hasUpdatedAt ? '✅' : '❌ 缺失'}`);
        console.log(`  - deleted_at: ${hasDeletedAt ? '✅' : '❌ 缺失'}`);
        
        if (!hasDeletedAt || !hasUpdatedAt) {
          console.log(`  ⚠️  ${model} 模型需要修复`);
          console.log(`  建议: 执行 fix-schema-mismatches.sql 添加缺失的列\n`);
        } else {
          console.log(`  ✅ ${model} 配置正常\n`);
        }
      } catch (error) {
        console.log(`  ❌ 表 ${table} 不存在: ${error.message}\n`);
      }
    }
    
    // 3. 提供修复建议
    console.log('\n📝 修复建议:\n');
    console.log('方案1 (推荐): 执行数据库迁移');
    console.log('  mysql -h localhost -P 3307 -u crm_user -p < backend/database/migrations/fix-schema-mismatches.sql\n');
    
    console.log('方案2: 修改模型配置');
    console.log('  在对应的模型文件中添加 paranoid: false');
    console.log('  例如: backend/src/models/Permission.js');
    console.log('  ```javascript');
    console.log('  }, {');
    console.log('    tableName: \'permissions\',');
    console.log('    timestamps: true,');
    console.log('    paranoid: false,  // <-- 添加这行');
    console.log('    createdAt: \'created_at\',');
    console.log('  ```\n');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ 检查失败:', error.message);
    process.exit(1);
  }
}

// 如果直接运行此脚本
if (require.main === module) {
  fixParanoidConfig();
}

module.exports = fixParanoidConfig;
