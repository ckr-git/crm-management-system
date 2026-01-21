const mysql = require('mysql2/promise');
const fs = require('fs').promises;
const path = require('path');
require('dotenv').config();

/**
 * 初始化数据库
 */
async function initDatabase() {
  let connection;
  
  try {
    console.log('开始初始化数据库...');
    
    // 创建数据库连接
    connection = await mysql.createConnection({
      host: process.env.DB_HOST || 'localhost',
      port: process.env.DB_PORT || 3307,
      user: 'root',
      password: 'root123456',
      multipleStatements: true
    });
    
    console.log('✅ 连接到MySQL成功');
    
    // 读取SQL脚本
    const sqlFile = path.join(__dirname, '../../database/init.sql');
    const sql = await fs.readFile(sqlFile, 'utf8');
    
    console.log('📄 读取SQL脚本成功');
    
    // 执行SQL脚本
    await connection.query(sql);
    
    console.log('✅ 数据库初始化完成！');
    console.log('');
    console.log('数据库信息：');
    console.log('  - 数据库名：crm_system');
    console.log('  - 数据表数：17张');
    console.log('  - 初始角色：4个');
    console.log('  - 管理员账号：admin / admin123');
    console.log('');
    
    return true;
  } catch (error) {
    console.error('❌ 数据库初始化失败:', error.message);
    return false;
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

// 如果直接运行此文件
if (require.main === module) {
  initDatabase()
    .then(() => process.exit(0))
    .catch((err) => {
      console.error(err);
      process.exit(1);
    });
}

module.exports = initDatabase;
