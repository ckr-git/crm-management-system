const cache = require('./cacheManager');

/**
 * 缓存失效工具
 * 数据变更时自动清除相关缓存
 */

class CacheInvalidation {
  /**
   * 客户相关缓存失效
   * @param {number} customerId - 客户ID
   * @param {number} userId - 用户ID
   */
  static async invalidateCustomer(customerId, userId) {
    const patterns = [
      `${cache.constructor.KEYS.CUSTOMER}:*`,
      `${cache.constructor.KEYS.ANALYSIS}:${userId}:*`,
      `${cache.constructor.KEYS.DASHBOARD}:${userId}:*`,
      `${cache.constructor.KEYS.STATS}:*`
    ];

    for (const pattern of patterns) {
      await cache.deletePattern(pattern);
    }

    console.log(`清除客户 ${customerId} 相关缓存`);
  }

  /**
   * 销售机会相关缓存失效
   * @param {number} opportunityId - 机会ID
   * @param {number} userId - 用户ID
   */
  static async invalidateOpportunity(opportunityId, userId) {
    const patterns = [
      `${cache.constructor.KEYS.OPPORTUNITY}:*`,
      `${cache.constructor.KEYS.ANALYSIS}:${userId}:*`,
      `${cache.constructor.KEYS.DASHBOARD}:${userId}:*`,
      `${cache.constructor.KEYS.REPORT}:*`,
      `${cache.constructor.KEYS.STATS}:*`
    ];

    for (const pattern of patterns) {
      await cache.deletePattern(pattern);
    }

    console.log(`清除销售机会 ${opportunityId} 相关缓存`);
  }

  /**
   * 跟进记录相关缓存失效
   * @param {number} followupId - 跟进记录ID
   * @param {number} userId - 用户ID
   */
  static async invalidateFollowup(followupId, userId) {
    const patterns = [
      `${cache.constructor.KEYS.FOLLOWUP}:*`,
      `${cache.constructor.KEYS.ANALYSIS}:${userId}:*`,
      `${cache.constructor.KEYS.DASHBOARD}:${userId}:*`,
      `${cache.constructor.KEYS.STATS}:*`
    ];

    for (const pattern of patterns) {
      await cache.deletePattern(pattern);
    }

    console.log(`清除跟进记录 ${followupId} 相关缓存`);
  }

  /**
   * 用户相关缓存失效
   * @param {number} userId - 用户ID
   */
  static async invalidateUser(userId) {
    const patterns = [
      `${cache.constructor.KEYS.USER}:${userId}:*`,
      `${cache.constructor.KEYS.ANALYSIS}:${userId}:*`,
      `${cache.constructor.KEYS.DASHBOARD}:${userId}:*`,
      `${cache.constructor.KEYS.REPORT}:${userId}:*`
    ];

    for (const pattern of patterns) {
      await cache.deletePattern(pattern);
    }

    console.log(`清除用户 ${userId} 相关缓存`);
  }

  /**
   * 清除所有分析/报表缓存
   */
  static async invalidateAllAnalysis() {
    const patterns = [
      `${cache.constructor.KEYS.ANALYSIS}:*`,
      `${cache.constructor.KEYS.REPORT}:*`,
      `${cache.constructor.KEYS.DASHBOARD}:*`,
      `${cache.constructor.KEYS.STATS}:*`
    ];

    for (const pattern of patterns) {
      await cache.deletePattern(pattern);
    }

    console.log('清除所有分析/报表缓存');
  }

  /**
   * 创建缓存失效中间件
   * 在数据变更操作(POST/PUT/DELETE)后自动清除缓存
   */
  static middleware(invalidateType) {
    return async (req, res, next) => {
      // 拦截res.json
      const originalJson = res.json.bind(res);
      
      res.json = async (body) => {
        try {
          // 仅在成功响应时清除缓存
          if (body && body.code === 200) {
            const userId = req.user?.id;
            const resourceId = body.data?.id || req.params?.id;

            switch (invalidateType) {
              case 'customer':
                await CacheInvalidation.invalidateCustomer(resourceId, userId);
                break;
              case 'opportunity':
                await CacheInvalidation.invalidateOpportunity(resourceId, userId);
                break;
              case 'followup':
                await CacheInvalidation.invalidateFollowup(resourceId, userId);
                break;
              case 'user':
                await CacheInvalidation.invalidateUser(resourceId);
                break;
              case 'all':
                await CacheInvalidation.invalidateAllAnalysis();
                break;
            }
          }
        } catch (err) {
          console.error('缓存失效中间件错误:', err);
        }
        
        return originalJson(body);
      };

      next();
    };
  }
}

module.exports = CacheInvalidation;
