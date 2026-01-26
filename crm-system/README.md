# CRM 客户关系管理系统

一个现代化的企业级 CRM 系统，基于 Vue 3 + Node.js + MySQL 构建。

## 技术栈

### 前端
- Vue 3 + TypeScript
- Element Plus
- Vite 7
- Pinia 状态管理
- SCSS 主题系统

### 后端
- Node.js + Express 5
- MySQL + Sequelize ORM
- JWT 认证
- Redis 缓存（可选）

## 功能模块

- 客户管理：客户信息、公海池、客户转移
- 机会管理：销售机会、看板视图、机会分析
- 跟进记录：跟进管理、跟进统计
- 数据分析：报表中心、多维度分析
- 系统管理：用户、角色、权限、日志

## 快速开始

### 环境要求
- Node.js >= 18
- MySQL >= 8.0
- Redis（可选，不启动时自动使用内存缓存）

### 安装依赖

```bash
# 后端
cd backend
npm install

# 前端
cd frontend
npm install
```

### 配置环境变量

复制 `.env.example` 为 `.env` 并修改配置：

```bash
cp .env.example .env
```

### 启动服务

```bash
# 后端（端口 3000）
cd backend
npx nodemon src/server.js

# 前端（端口 5173/5174）
cd frontend
npx vite
```

### 访问系统

- 前端：http://localhost:5173
- 后端 API：http://localhost:3000
- 健康检查：http://localhost:3000/health

## 项目结构

```
crm-system/
├── backend/          # 后端服务
│   ├── src/
│   │   ├── config/   # 配置文件
│   │   ├── controllers/  # 控制器
│   │   ├── models/   # 数据模型
│   │   ├── routes/   # 路由
│   │   ├── middlewares/  # 中间件
│   │   └── utils/    # 工具函数
│   └── tests/        # 测试文件
├── frontend/         # 前端应用
│   ├── src/
│   │   ├── api/      # API 接口
│   │   ├── components/   # 组件
│   │   ├── views/    # 页面
│   │   ├── stores/   # 状态管理
│   │   └── styles/   # 样式系统
│   └── docs/         # 前端文档
├── scripts/          # 部署脚本
└── docker-compose.yml
```

## 部署

### Docker 部署

```bash
docker-compose up -d
```

### 手动部署

参考 `scripts/` 目录下的部署脚本。

## 许可证

MIT License
