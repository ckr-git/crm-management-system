const { models } = require('../models');

/**
 * 操作日志记录中间件
 */
const operationLog = (module, action) => {
  return async (req, res, next) => {
    // 保存原始的res.json方法
    const originalJson = res.json.bind(res);

    // 获取客户端IP
    const ip = req.ip || req.connection.remoteAddress || '';
    const userAgent = req.headers['user-agent'] || '';

    // 重写res.json方法以捕获响应
    res.json = function(data) {
      // 记录日志（异步，不阻塞响应）
      if (req.user) {
        const logData = {
          user_id: req.user.id,
          module,
          action,
          resource_type: module,
          resource_id: req.params.id || data.data?.id || null,
          description: generateDescription(module, action, req, data),
          ip: ip.replace('::ffff:', ''),
          user_agent: userAgent,
          request_data: {
            params: req.params,
            query: req.query,
            body: sanitizeBody(req.body)
          },
          response_data: {
            code: data.code,
            message: data.message
          },
          status: data.code === 200 ? 'success' : 'fail',
          error_message: data.code !== 200 ? data.message : null
        };

        models.OperationLog.create(logData).catch(err => {
          console.error('操作日志记录失败:', err);
        });
      }

      // 调用原始方法
      return originalJson(data);
    };

    next();
  };
};

/**
 * 生成操作描述
 */
const generateDescription = (module, action, req, data) => {
  const actionMap = {
    create: '创建',
    update: '更新',
    delete: '删除',
    transfer: '转移',
    claim: '领取',
    release: '释放',
    export: '导出',
    import: '导入'
  };

  const moduleMap = {
    user: '用户',
    role: '角色',
    customer: '客户',
    followup: '跟进记录',
    opportunity: '销售机会',
    pool: '公海客户'
  };

  const actionText = actionMap[action] || action;
  const moduleText = moduleMap[module] || module;
  
  let description = `${actionText}${moduleText}`;
  
  // 添加资源名称
  if (data.data?.name) {
    description += ` "${data.data.name}"`;
  }

  return description;
};

/**
 * 过滤敏感信息
 */
const sanitizeBody = (body) => {
  if (!body) return null;
  
  const sanitized = { ...body };
  
  // 移除密码字段
  if (sanitized.password) {
    sanitized.password = '******';
  }
  if (sanitized.new_password) {
    sanitized.new_password = '******';
  }
  
  return sanitized;
};

module.exports = operationLog;
