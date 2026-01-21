/**
 * Jest测试环境初始化
 * 在所有测试之前执行
 */

// 设置环境变量为测试环境
process.env.NODE_ENV = 'test';
process.env.JWT_SECRET = 'test_jwt_secret_key';
process.env.JWT_EXPIRES_IN = '1h';

// Mock console方法，避免测试输出过多
global.console = {
  ...console,
  error: jest.fn(),
  warn: jest.fn(),
  log: jest.fn()
};

// 增加测试超时时间
jest.setTimeout(10000);
