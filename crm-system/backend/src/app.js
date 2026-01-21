const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
require('dotenv').config();

// 创建Express应用
const app = express();

// 限流中间件
const { apiLimiter } = require('./middlewares/rateLimit');

// 中间件
app.use(helmet()); // 安全相关的HTTP头
app.use(cors()); // 跨域支持
app.use(morgan('dev')); // 日志
app.use('/api', apiLimiter); // API限流
app.use(express.json()); // 解析JSON
app.use(express.urlencoded({ extended: true })); // 解析URL编码

// 健康检查
app.get('/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    message: 'CRM API Server is running',
    timestamp: new Date().toISOString()
  });
});

// 认证中间件
const authMiddleware = require('./middlewares/auth');

// 公开路由（不需要认证）
app.use('/api/auth', require('./routes/auth'));

// 需要认证的路由
app.use('/api/users', authMiddleware, require('./routes/users'));
app.use('/api/roles', authMiddleware, require('./routes/roles'));
app.use('/api/permissions', authMiddleware, require('./routes/permissions'));
app.use('/api/logs', authMiddleware, require('./routes/logs'));
app.use('/api/customers', authMiddleware, require('./routes/customers'));
app.use('/api/followups', authMiddleware, require('./routes/followups'));
app.use('/api/customer-pool', authMiddleware, require('./routes/customerPool'));
app.use('/api/opportunities', authMiddleware, require('./routes/opportunities'));
app.use('/api/analysis', authMiddleware, require('./routes/analysis'));
app.use('/api/reports', authMiddleware, require('./routes/reports'));
app.use('/api/notifications', authMiddleware, require('./routes/notifications'));
app.use('/api/workflow', authMiddleware, require('./routes/workflow'));
app.use('/api/settings', authMiddleware, require('./routes/settings'));
app.use('/api/dashboard', authMiddleware, require('./routes/dashboard'));

// 404处理
app.use((req, res) => {
  res.status(404).json({
    code: 404,
    message: '接口不存在'
  });
});

// 统一错误处理
const errorHandler = require('./middlewares/errorHandler');
app.use(errorHandler);

module.exports = app;
