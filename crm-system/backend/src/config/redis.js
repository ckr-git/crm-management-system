require('dotenv').config();

let redis = null;
let redisAvailable = false;

// 检查是否启用 Redis
const REDIS_ENABLED = process.env.REDIS_ENABLED !== 'false';

if (REDIS_ENABLED) {
  try {
    const Redis = require('ioredis');

    const redisConfig = {
      host: process.env.REDIS_HOST || 'localhost',
      port: process.env.REDIS_PORT || 6379,
      password: process.env.REDIS_PASSWORD || 'redis123456',
      db: 0,
      maxRetriesPerRequest: 1,
      retryStrategy: (times) => {
        if (times > 3) {
          console.log('⚠️ Redis连接失败，将使用内存缓存');
          return null; // 停止重试
        }
        return Math.min(times * 100, 1000);
      }
    };

    redis = new Redis(redisConfig);

    redis.on('connect', () => {
      redisAvailable = true;
      console.log('✅ Redis连接成功');
    });

    redis.on('error', (err) => {
      if (redisAvailable) {
        console.error('❌ Redis连接错误:', err.message);
      }
      redisAvailable = false;
    });

    redis.on('close', () => {
      redisAvailable = false;
    });
  } catch (err) {
    console.log('⚠️ Redis未安装或配置错误，将使用内存缓存');
  }
} else {
  console.log('ℹ️ Redis已禁用，使用内存缓存');
}

module.exports = {
  redis,
  isAvailable: () => redisAvailable
};
