const cache = require('../utils/cacheManager');

/**
 * 分析/报表缓存中间件
 * - 自动按用户、时间范围、查询参数生成缓存key
 * - 命中缓存时直接返回
 * - 未命中时放行，响应发送后写入缓存
 */
function analysisCache(ttl = cache.constructor.TTL.MEDIUM) {
  return async (req, res, next) => {
    try {
      const userId = req.user?.id || 'guest';
      const { start_date, end_date, ...rest } = req.query || {};

      const key = cache.generateKey(
        `${cache.constructor.KEYS.ANALYSIS}:${userId}:${req.path}`,
        { start_date, end_date, ...rest }
      );

      // 命中缓存
      const cached = await cache.get(key);
      if (cached) {
        return res.json(cached);
      }

      // 未命中缓存，拦截res.json以便写入缓存
      const originalJson = res.json.bind(res);
      res.json = async (body) => {
        try {
          // 仅缓存成功响应
          if (body && body.code === 200) {
            await cache.set(key, body, ttl);
          }
        } catch (err) {
          console.error('写入分析缓存失败:', err);
        }
        return originalJson(body);
      };

      next();
    } catch (error) {
      console.error('分析缓存中间件错误:', error);
      next();
    }
  };
}

module.exports = {
  analysisCache
};
