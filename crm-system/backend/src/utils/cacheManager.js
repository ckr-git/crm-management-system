const redis = require('../config/redis');

/**
 * Redis缓存管理工具类
 * 提供统一的缓存操作接口
 */

class CacheManager {
  constructor() {
    this.redis = redis;
    this.defaultTTL = 3600; // 默认过期时间：1小时
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
      const data = await this.redis.get(key);
      if (!data) return null;
      
      return JSON.parse(data);
    } catch (error) {
      console.error('Redis GET错误:', error);
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
      
      if (ttl > 0) {
        await this.redis.setex(key, ttl, serialized);
      } else {
        await this.redis.set(key, serialized);
      }
      
      return true;
    } catch (error) {
      console.error('Redis SET错误:', error);
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
      
      return await this.redis.del(...keyArray);
    } catch (error) {
      console.error('Redis DELETE错误:', error);
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
      const keys = await this.redis.keys(pattern);
      if (keys.length === 0) return 0;
      
      return await this.redis.del(...keys);
    } catch (error) {
      console.error('Redis DELETE PATTERN错误:', error);
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
      const result = await this.redis.exists(key);
      return result === 1;
    } catch (error) {
      console.error('Redis EXISTS错误:', error);
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
      const result = await this.redis.expire(key, ttl);
      return result === 1;
    } catch (error) {
      console.error('Redis EXPIRE错误:', error);
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
      return await this.redis.ttl(key);
    } catch (error) {
      console.error('Redis TTL错误:', error);
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
      await this.redis.flushdb();
      return true;
    } catch (error) {
      console.error('Redis CLEAR错误:', error);
      return false;
    }
  }

  /**
   * 获取缓存统计信息
   * @returns {Promise<Object>} 统计信息
   */
  async stats() {
    try {
      const info = await this.redis.info('stats');
      const dbSize = await this.redis.dbsize();
      
      return {
        dbSize,
        info: info.split('\r\n').reduce((acc, line) => {
          const [key, value] = line.split(':');
          if (key && value) {
            acc[key] = value;
          }
          return acc;
        }, {})
      };
    } catch (error) {
      console.error('Redis STATS错误:', error);
      return { dbSize: 0, info: {} };
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
