require('dotenv').config();

// 生产环境必须配置的环境变量检查
const isProduction = process.env.NODE_ENV === 'production';

if (isProduction) {
  const requiredEnvVars = ['JWT_SECRET', 'DB_PASSWORD', 'REDIS_PASSWORD'];
  const missing = requiredEnvVars.filter(key => !process.env[key]);
  if (missing.length > 0) {
    console.error(`\n❌ 生产环境缺少必要的环境变量: ${missing.join(', ')}`);
    console.error('请在 .env 文件或环境中配置这些变量\n');
    process.exit(1);
  }
}

// 开发环境默认值警告
if (!isProduction && !process.env.JWT_SECRET) {
  console.warn('⚠️  警告: 使用默认JWT密钥，仅限开发环境');
}

module.exports = {
  // 应用配置
  app: {
    port: process.env.PORT || 3000,
    env: process.env.NODE_ENV || 'development',
    isProduction
  },
  
  // JWT配置 - 生产环境必须配置
  jwt: {
    secret: process.env.JWT_SECRET || (isProduction ? undefined : 'crm_dev_secret_key_2025'),
    expiresIn: process.env.JWT_EXPIRES_IN || '7d'
  },
  
  // 数据库配置
  database: require('./database'),
  
  // Redis配置 - 生产环境必须配置
  redis: {
    host: process.env.REDIS_HOST || 'localhost',
    port: parseInt(process.env.REDIS_PORT) || 6379,
    password: process.env.REDIS_PASSWORD || (isProduction ? undefined : 'redis123456')
  }
};
