const bcrypt = require('bcryptjs');
const mysql = require('mysql2/promise');
require('dotenv').config({ path: '../.env' });

async function resetAdminPassword() {
  const newPassword = 'admin123456';
  
  // 生成密码哈希
  const salt = bcrypt.genSaltSync(10);
  const hash = bcrypt.hashSync(newPassword, salt);
  
  console.log('新密码哈希:', hash);
  
  // 连接数据库
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 3307,
    user: process.env.DB_USER || 'crm_user',
    password: process.env.DB_PASSWORD || 'crm123456',
    database: process.env.DB_NAME || 'crm_system'
  });
  
  // 更新管理员密码
  const [result] = await connection.execute(
    'UPDATE users SET password = ? WHERE username = ?',
    [hash, 'admin']
  );
  
  console.log(`✅ 密码重置成功！`);
  console.log(`用户名: admin`);
  console.log(`新密码: ${newPassword}`);
  console.log(`影响行数: ${result.affectedRows}`);
  
  await connection.end();
}

resetAdminPassword().catch(console.error);
