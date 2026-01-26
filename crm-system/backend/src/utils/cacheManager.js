const { redis, isAvailable } = require('../config/redis');

// 内存缓存
const memoryCache = new Map();
const memoryCacheExpiry = new Map();

// 清理过期缓存
setInterval(() => {
  const now = Date.now();
  for (const [key, expiry] of memoryCacheExpiry.entries()) {
    if (expiry && expiry < now) {
      memoryCache.delete(key);
      memoryCacheExpiry.delete(key);
    }
  }
}, 60000);

/**
 * 缓存管理工具类 - 支持 Redis 和内存缓存
 */
class CacheManager {
  constructor() {
    this.defaultTTL = 3600;
  }

  /**
   * 生成缓存key
   * @param {string} prefix - key前缀
   * @param {Object} params - 参数对象
   * @returns {string} 生成的key
   */
  generateKey(prefix, params = {}) {
    const sortedParams = Object.keys(params)
      .sort()
      .map(key => `${key}:${params[key]}`)
      .join('|');
    
    return sortedParams ? `${prefix}:${sortedParams}` : prefix;
  }

  /**
   * 获取缓存
   * @param {string} key - 缓存key
   * @returns {Promise<any>} 缓存数据
   */
  async get(key) {
    try {
      let data = null;
      if (isAvailable() && redis) {
        data = await redis.get(key);
      } else {
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
      console.error('缓存GET错误:', error);
      return null;
    }
  }

  /**
   * 设置缓存
   * @param {string} key - 缓存key
   * @param {any} value - 缓存值
   * @param {number} ttl - 过期时间(秒)
   * @returns {Promise<boolean>} 是否成功
   */
  async set(key, value, ttl = this.defaultTTL) {
    try {
      const serialized = JSON.stringify(value);
      if (isAvailable() && redis) {
        if (ttl > 0) {
          await redis.setex(key, ttl, serialized);
        } else {
          await redis.set(key, serialized);
        }
      } else {
        memoryCache.set(key, serialized);
        if (ttl > 0) {
          memoryCacheExpiry.set(key, Date.now() + ttl * 1000);
        }
      }
      return true;
    } catch (error) {
      console.error('缓存SET错误:', error);
      return false;
    }
  }

  /**
   * 删除缓存
   * @param {string|string[]} keys - 缓存key或key数组
   * @returns {Promise<number>} 删除的数量
   */
  async delete(keys) {
    try {
      if (!keys) return 0;
      const keyArray = Array.isArray(keys) ? keys : [keys];
      if (keyArray.length === 0) return 0;

      if (isAvailable() && redis) {
        return await redis.del(...keyArray);
      } else {
        let count = 0;
        for (const key of keyArray) {
          if (memoryCache.has(key)) {
            memoryCache.delete(key);
            memoryCacheExpiry.delete(key);
            count++;
          }
        }
        return count;
      }
    } catch (error) {
      console.error('缓存DELETE错误:', error);
      return 0;
    }
  }

  /**
   * 批量删除匹配的key
   * @param {string} pattern - 匹配模式 (如: user:*)
   * @returns {Promise<number>} 删除的数量
   */
  async deletePattern(pattern) {
    try {
      if (isAvailable() && redis) {
        const keys = await redis.keys(pattern);
        if (keys.length === 0) return 0;
        return await redis.del(...keys);
      } else {
        const regex = new RegExp('^' + pattern.replace(/\*/g, '.*') + '$');
        let count = 0;
        for (const key of memoryCache.keys()) {
          if (regex.test(key)) {
            memoryCache.delete(key);
            memoryCacheExpiry.delete(key);
            count++;
          }
        }
        return count;
      }
    } catch (error) {
      console.error('缓存DELETE PATTERN错误:', error);
      return 0;
    }
  }

  /**
   * 检查key是否存在
   * @param {string} key - 缓存key
   * @returns {Promise<boolean>} 是否存在
   */
  async exists(key) {
    try {
      if (isAvailable() && redis) {
        const result = await redis.exists(key);
        return result === 1;
      } else {
        const expiry = memoryCacheExpiry.get(key);
        if (expiry && expiry < Date.now()) {
          memoryCache.delete(key);
          memoryCacheExpiry.delete(key);
          return false;
        }
        return memoryCache.has(key);
      }
    } catch (error) {
      console.error('缓存EXISTS错误:', error);
      return false;
    }
  }

  /**
   * 设置过期时间
   * @param {string} key - 缓存key
   * @param {number} ttl - 过期时间(秒)
   * @returns {Promise<boolean>} 是否成功
   */
  async expire(key, ttl) {
    try {
      if (isAvailable() && redis) {
        const result = await redis.expire(key, ttl);
        return result === 1;
      } else {
        if (memoryCache.has(key)) {
          memoryCacheExpiry.set(key, Date.now() + ttl * 1000);
          return true;
        }
        return false;
      }
    } catch (error) {
      console.error('缓存EXPIRE错误:', error);
      return false;
    }
  }

  /**
   * 获取剩余过期时间
   * @param {string} key - 缓存key
   * @returns {Promise<number>} 剩余秒数，-1表示永不过期，-2表示key不存在
   */
  async ttl(key) {
    try {
      if (isAvailable() && redis) {
        return await redis.ttl(key);
      } else {
        const expiry = memoryCacheExpiry.get(key);
        if (!memoryCache.has(key)) return -2;
        if (!expiry) return -1;
        const remaining = Math.ceil((expiry - Date.now()) / 1000);
        return remaining > 0 ? remaining : -2;
      }
    } catch (error) {
      console.error('缓存TTL错误:', error);
      return -2;
    }
  }

  /**
   * 缓存包装函数 - 如果缓存不存在则执行函数并缓存结果
   * @param {string} key - 缓存key
   * @param {Function} fn - 数据获取函数
   * @param {number} ttl - 过期时间(秒)
   * @returns {Promise<any>} 数据
   */
  async wrap(key, fn, ttl = this.defaultTTL) {
    // 先尝试从缓存获取
    const cached = await this.get(key);
    if (cached !== null) {
      return cached;
    }

    // 缓存不存在，执行函数获取数据
    const data = await fn();
    
    // 缓存数据
    if (data !== null && data !== undefined) {
      await this.set(key, data, ttl);
    }

    return data;
  }

  /**
   * 清除所有缓存
   * @returns {Promise<boolean>} 是否成功
   */
  async clear() {
    try {
      if (isAvailable() && redis) {
        await redis.flushdb();
      } else {
        memoryCache.clear();
        memoryCacheExpiry.clear();
      }
      return true;
    } catch (error) {
      console.error('缓存CLEAR错误:', error);
      return false;
    }
  }

  /**
   * 获取缓存统计信息
   * @returns {Promise<Object>} 统计信息
   */
  async stats() {
    try {
      if (isAvailable() && redis) {
        const info = await redis.info('stats');
        const dbSize = await redis.dbsize();
        return {
          dbSize,
          type: 'redis',
          info: info.split('\r\n').reduce((acc, line) => {
            const [key, value] = line.split(':');
            if (key && value) acc[key] = value;
            return acc;
          }, {})
        };
      } else {
        return {
          dbSize: memoryCache.size,
          type: 'memory',
          info: {}
        };
      }
    } catch (error) {
      console.error('缓存STATS错误:', error);
      return { dbSize: 0, type: 'unknown', info: {} };
    }
  }

  /**
   * 用户相关缓存key前缀
   */
  static KEYS = {
    USER: 'user',
    CUSTOMER: 'customer',
    OPPORTUNITY: 'opportunity',
    FOLLOWUP: 'followup',
    ANALYSIS: 'analysis',
    REPORT: 'report',
    DASHBOARD: 'dashboard',
    STATS: 'stats'
  };

  /**
   * 缓存TTL常量(秒)
   */
  static TTL = {
    SHORT: 300,      // 5分钟
    MEDIUM: 1800,    // 30分钟
    LONG: 3600,      // 1小时
    VERY_LONG: 7200, // 2小时
    DAY: 86400       // 1天
  };
}

// 导出单例
module.exports = new CacheManager();
