const bcrypt = require('bcryptjs');
const mysql = require('mysql2/promise');
require('dotenv').config();

async function resetAdminPassword() {
  let connection;
  
  try {
    // 生成BCrypt密码
    const password = 'admin123';
    const salt = bcrypt.genSaltSync(10);
    const hashedPassword = bcrypt.hashSync(password, salt);
    
    console.log('生成的密码哈希:', hashedPassword);
    
    // 连接数据库
    connection = await mysql.createConnection({
      host: process.env.DB_HOST || 'localhost',
      port: process.env.DB_PORT || 3307,
      user: process.env.DB_USER || 'crm_user',
      password: process.env.DB_PASSWORD || 'crm123456',
      database: process.env.DB_NAME || 'crm_system'
    });
    
    // 更新管理员密码
    await connection.execute(
      'UPDATE users SET password = ? WHERE username = ?',
      [hashedPassword, 'admin']
    );
    
    console.log('✅ 管理员密码重置成功！');
    console.log('');
    console.log('登录信息：');
    console.log('  用户名: admin');
    console.log('  密码: admin123');
    
  } catch (error) {
    console.error('❌ 密码重置失败:', error.message);
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

resetAdminPassword();
