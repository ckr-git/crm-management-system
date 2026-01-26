/**
 * 缓存工具类 - 支持 Redis 和内存缓存
 */
const { redis, isAvailable } = require('../config/redis');

// 内存缓存
const memoryCache = new Map();
const memoryCacheExpiry = new Map();

// 清理过期的内存缓存
setInterval(() => {
  const now = Date.now();
  for (const [key, expiry] of memoryCacheExpiry.entries()) {
    if (expiry && expiry < now) {
      memoryCache.delete(key);
      memoryCacheExpiry.delete(key);
    }
  }
}, 60000); // 每分钟清理一次

class CacheUtil {
  /**
   * 设置缓存
   */
  static async set(key, value, expire = 3600) {
    try {
      const data = JSON.stringify(value);

      // 优先使用 Redis
      if (isAvailable() && redis) {
        if (expire) {
          await redis.setex(key, expire, data);
        } else {
          await redis.set(key, data);
        }
      } else {
        // 使用内存缓存
        memoryCache.set(key, data);
        if (expire) {
          memoryCacheExpiry.set(key, Date.now() + expire * 1000);
        }
      }
      return true;
    } catch (error) {
      console.error('设置缓存失败:', error);
      return false;
    }
  }

  /**
   * 获取缓存
   */
  static async get(key) {
    try {
      let data = null;

      if (isAvailable() && redis) {
        data = await redis.get(key);
      } else {
        // 检查内存缓存是否过期
        const expiry = memoryCacheExpiry.get(key);
        if (expiry && expiry < Date.now()) {
          memoryCache.delete(key);
          memoryCacheExpiry.delete(key);
        } else {
          data = memoryCache.get(key);
        }
      }

      return data ? JSON.parse(data) : null;
    } catch (error) {
      console.error('获取缓存失败:', error);
      return null;
    }
  }

  /**
   * 删除缓存
   */
  static async del(key) {
    try {
      if (isAvailable() && redis) {
        await redis.del(key);
      } else {
        memoryCache.delete(key);
        memoryCacheExpiry.delete(key);
      }
      return true;
    } catch (error) {
      console.error('删除缓存失败:', error);
      return false;
    }
  }

  /**
   * 删除匹配的缓存
   */
  static async delPattern(pattern) {
    try {
      if (isAvailable() && redis) {
        const keys = await redis.keys(pattern);
        if (keys.length > 0) {
          await redis.del(...keys);
        }
      } else {
        // 内存缓存模式匹配删除
        const regex = new RegExp('^' + pattern.replace(/\*/g, '.*') + '$');
        for (const key of memoryCache.keys()) {
          if (regex.test(key)) {
            memoryCache.delete(key);
            memoryCacheExpiry.delete(key);
          }
        }
      }
      return true;
    } catch (error) {
      console.error('删除匹配缓存失败:', error);
      return false;
    }
  }

  /**
   * 缓存装饰器
   */
  static cacheDecorator(keyPrefix, expire = 3600) {
    return function(target, propertyKey, descriptor) {
      const originalMethod = descriptor.value;

      descriptor.value = async function(...args) {
        const cacheKey = `${keyPrefix}:${JSON.stringify(args)}`;
        
        // 尝试从缓存获取
        const cached = await CacheUtil.get(cacheKey);
        if (cached) {
          return cached;
        }

        // 执行原方法
        const result = await originalMethod.apply(this, args);

        // 存入缓存
        await CacheUtil.set(cacheKey, result, expire);

        return result;
      };

      return descriptor;
    };
  }
}

module.exports = CacheUtil;
