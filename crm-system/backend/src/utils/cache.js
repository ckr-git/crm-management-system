/**
 * 缓存工具类
 */
const redis = require('../config/redis');

class CacheUtil {
  /**
   * 设置缓存
   */
  static async set(key, value, expire = 3600) {
    try {
      const data = JSON.stringify(value);
      if (expire) {
        await redis.setex(key, expire, data);
      } else {
        await redis.set(key, data);
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
      const data = await redis.get(key);
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
      await redis.del(key);
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
      const keys = await redis.keys(pattern);
      if (keys.length > 0) {
        await redis.del(...keys);
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
