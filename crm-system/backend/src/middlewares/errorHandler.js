/**
 * 统一错误处理中间件
 */
const { ERROR_CODES, ApiResponse, AppError } = require('../constants/errorCodes');

// Sequelize错误处理
const handleSequelizeError = (err, res) => {
  if (err.name === 'SequelizeValidationError') {
    return res.status(400).json(
      ApiResponse.error(
        ERROR_CODES.VALIDATION_ERROR,
        '数据验证失败',
        {
          errors: err.errors.map(e => ({
            field: e.path,
            message: e.message,
            value: e.value
          }))
        }
      )
    );
  }

  if (err.name === 'SequelizeUniqueConstraintError') {
    return res.status(400).json(
      ApiResponse.error(
        ERROR_CODES.DUPLICATE_ERROR,
        '数据已存在',
        {
          errors: err.errors.map(e => ({
            field: e.path,
            message: `${e.path}已存在`
          }))
        }
      )
    );
  }

  if (err.name === 'SequelizeForeignKeyConstraintError') {
    return res.status(400).json(
      ApiResponse.error(ERROR_CODES.VALIDATION_ERROR, '关联数据不存在')
    );
  }

  return null;
};

// JWT错误处理
const handleJWTError = (err, res) => {
  if (err.name === 'JsonWebTokenError') {
    return res.status(401).json(
      ApiResponse.error(ERROR_CODES.INVALID_TOKEN)
    );
  }

  if (err.name === 'TokenExpiredError') {
    return res.status(401).json(
      ApiResponse.error(ERROR_CODES.TOKEN_EXPIRED)
    );
  }

  return null;
};

// 主错误处理中间件
const errorHandler = (err, req, res, next) => {
  // 记录错误日志
  console.error('=== 错误处理中间件 ===');
  console.error('错误名称:', err.name);
  console.error('错误信息:', err.message);
  console.error('请求URL:', req.url);
  console.error('请求方法:', req.method);
  if (process.env.NODE_ENV === 'development') {
    console.error('错误堆栈:', err.stack);
  }

  // 处理自定义AppError
  if (err instanceof AppError) {
    return res.status(err.statusCode).json(
      ApiResponse.error(err.errorCode, err.message)
    );
  }

  // 尝试处理Sequelize错误
  const sequelizeResult = handleSequelizeError(err, res);
  if (sequelizeResult !== null) return sequelizeResult;

  // 尝试处理JWT错误
  const jwtResult = handleJWTError(err, res);
  if (jwtResult !== null) return jwtResult;

  // 处理已知的HTTP错误（向后兼容）
  if (err.statusCode) {
    return res.status(err.statusCode).json({
      code: err.statusCode,
      message: err.message || '请求失败'
    });
  }

  // 默认500错误
  const response = ApiResponse.error(
    ERROR_CODES.INTERNAL_ERROR,
    process.env.NODE_ENV === 'development' ? err.message : '服务器内部错误'
  );
  
  if (process.env.NODE_ENV === 'development') {
    response.stack = err.stack;
  }
  
  res.status(500).json(response);
};

module.exports = errorHandler;
