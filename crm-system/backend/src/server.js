const app = require('./app');
const config = require('./config');
const { testConnection } = require('./models');
const redis = require('./config/redis');

const PORT = config.app.port;

// 启动服务器
const startServer = async () => {
  try {
    // 测试数据库连接
    await testConnection();
    
    // 启动HTTP服务器
    app.listen(PORT, () => {
      console.log('');
      console.log('=================================');
      console.log('🚀 CRM API Server 启动成功！');
      console.log('=================================');
      console.log(`📡 服务地址: http://localhost:${PORT}`);
      console.log(`🌍 环境: ${config.app.env}`);
      console.log(`📊 数据库: MySQL ${process.env.DB_HOST}:${process.env.DB_PORT}`);
      console.log(`💾 缓存: Redis ${process.env.REDIS_HOST}:${process.env.REDIS_PORT}`);
      console.log('=================================');
      console.log('');
    });
  } catch (error) {
    console.error('❌ 服务器启动失败:', error);
    process.exit(1);
  }
};

// 优雅退出
process.on('SIGTERM', () => {
  console.log('收到SIGTERM信号，准备关闭服务器...');
  process.exit(0);
});

process.on('SIGINT', () => {
  console.log('收到SIGINT信号，准备关闭服务器...');
  process.exit(0);
});

startServer();
