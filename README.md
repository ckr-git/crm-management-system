# CRM客户关系管理系统

<div align="center">

**一个功能完整的企业级CRM系统**

基于 Vue 3 + Express 5 + MySQL 8 构建的现代化客户关系管理平台

[功能特性](#功能特性) • [技术栈](#技术栈) • [快速开始](#快速开始) • [项目结构](#项目结构) • [默认账号](#默认账号)

</div>

---

## 项目简介

企业级CRM（客户关系管理）系统，前后端分离架构，覆盖客户管理、销售漏斗、数据分析、权限管理等核心业务。内置完整种子数据，开箱即用。

### 核心亮点

- **完整的业务闭环**: 客户获取 → 跟进 → 销售机会 → 赢单/输单 → 数据分析
- **细粒度权限控制**: 角色权限 + 功能权限 + 数据权限（非管理员只能看自己的数据）
- **数据可视化**: 基于 ECharts 6 的多维度图表（来源分析、行业对比、销售绩效）
- **Redis 可选**: Redis 不可用时自动降级为内存缓存，开发环境零依赖
- **容器化部署**: Docker Compose 一键启动 MySQL + Redis
- **完整种子数据**: 15个客户、14个销售机会、22条跟进记录，覆盖6个行业

---

## 功能特性

### 客户管理
- 客户信息 CRUD、搜索、筛选、排序
- 客户分类（行业/等级/阶段）和标签管理
- 跟进记录管理（电话/拜访/邮件/微信）和附件上传
- 客户转移和公海池管理（自动回收 + 手动释放）

### 销售漏斗
- 销售机会创建和管理
- 可视化阶段看板（拖拽切换）：初步接触 → 需求确认 → 方案报价 → 商务谈判 → 合同签订
- 赢单/输单管理和原因记录
- 阶段变更历史追踪

### 数据分析
- 客户来源统计、来源趋势、来源转化率
- 行业分布统计、行业对比分析（客户数/机会数/成交额/转化率）
- 销售人员绩效对比（客户数/跟进数/成交额/星级评分）
- 销售行为分析（跟进频率/客户覆盖/平均间隔）
- Excel 报表导出

### 权限管理
- 用户管理（添加、编辑、启用/禁用）
- 角色管理：系统管理员、销售经理、销售人员、财务人员
- 细粒度权限配置（菜单权限 + 操作权限）
- 数据权限（非管理员只能查看自己负责的数据）
- 操作日志记录

### 其他功能
- 仪表盘（客户统计、销售漏斗、待办事项、最近跟进）
- 通知消息系统
- 审批工作流（流程定义、发起、审批）
- 系统配置管理

---

## 技术栈

### 前端
| 技术 | 版本 | 用途 |
|------|------|------|
| Vue 3 | 3.5 | 核心框架 (Composition API + `<script setup>`) |
| TypeScript | 5.9 | 类型安全 |
| Element Plus | 2.11 | UI 组件库 |
| Pinia | 3.0 | 状态管理 |
| Vue Router | 4.5 | 路由管理 |
| ECharts | 6.0 | 数据可视化 |
| Axios | 1.12 | HTTP 客户端 |
| Vite | 7.1 | 构建工具 |
| Vitest | 1.6 | 单元测试 |
| SCSS | - | 样式预处理 |

### 后端
| 技术 | 版本 | 用途 |
|------|------|------|
| Node.js | >= 18 | 运行环境 |
| Express | 5.1 | Web 框架 |
| Sequelize | 6.37 | ORM |
| MySQL | 8.0 | 主数据库 |
| Redis | 7 (可选) | 缓存（不可用时自动降级为内存缓存） |
| JWT | 9.0 | 身份认证 |
| ExcelJS | 4.4 | Excel 导出 |
| Multer | 2.0 | 文件上传 |
| Helmet | 8.1 | 安全头 |
| Jest | 29.7 | 测试框架 |

### 部署
- Docker Compose（MySQL 8.0 + Redis 7）
- Nginx 反向代理
- PM2 进程管理

---

## 快速开始

### 环境要求

- Node.js >= 18.0.0
- MySQL >= 8.0
- Redis >= 7.0（可选，不可用时自动降级为内存缓存）

### 方式一：Docker Compose（推荐）

```bash
# 1. 克隆项目
git clone https://github.com/ckr-git/crm-management-system.git
cd crm-management-system

# 2. 启动 MySQL + Redis
cd crm-system
docker-compose up -d

# 3. 安装后端依赖并初始化数据库
cd backend
npm install
cp .env.example .env  # 按需修改配置
npm run init-db       # 创建表结构和种子数据

# 4. 启动后端
npm run dev

# 5. 安装前端依赖并启动（新终端）
cd ../frontend
npm install
npm run dev
```

### 方式二：本地 MySQL

如果已有本地 MySQL，修改 `crm-system/backend/.env` 中的数据库连接信息即可，无需 Docker。

```bash
cd crm-system/backend
cp .env.example .env
# 编辑 .env，修改 DB_HOST/DB_PORT/DB_USER/DB_PASSWORD
npm install
npm run init-db
npm run dev

# 新终端
cd ../frontend
npm install
npm run dev
```

### 访问应用

- 前端地址: http://localhost:5174
- 后端 API: http://localhost:3000/api

---

## 默认账号

| 角色 | 用户名 | 密码 | 说明 |
|------|--------|------|------|
| 系统管理员 | admin | admin123 | 全部权限 |
| 销售经理 | manager01 | 123456 | 团队管理 |
| 销售人员 | sales01 | 123456 | 普通销售 |
| 销售人员 | sales02 | 123456 | 普通销售 |
| 销售人员 | sales03 | 123456 | 普通销售 |
| 销售人员 | sales04 | 123456 | 普通销售 |

---

## 项目结构

```
crm-system/
├── frontend/                   # 前端项目 (Vue 3 + TypeScript)
│   ├── src/
│   │   ├── api/               # API 接口层
│   │   ├── components/        # 可复用组件
│   │   ├── composables/       # 组合式函数
│   │   ├── directives/        # 自定义指令（权限控制）
│   │   ├── router/            # 路由配置
│   │   ├── stores/            # Pinia 状态管理
│   │   ├── styles/            # 全局样式 (SCSS)
│   │   ├── types/             # TypeScript 类型定义
│   │   ├── utils/             # 工具函数
│   │   └── views/             # 页面组件
│   │       ├── analysis/      # 数据分析页面
│   │       ├── customer/      # 客户管理页面
│   │       ├── dashboard/     # 仪表盘
│   │       ├── opportunity/   # 销售机会页面
│   │       ├── system/        # 系统管理页面
│   │       └── workflow/      # 工作流页面
│   └── tests/                 # 测试文件
│
├── backend/                    # 后端项目 (Express 5 + Sequelize)
│   ├── src/
│   │   ├── controllers/       # 控制器层
│   │   ├── models/            # Sequelize 数据模型
│   │   ├── routes/            # 路由定义
│   │   ├── middlewares/       # 中间件（认证/权限/日志/缓存）
│   │   ├── validations/       # 请求数据验证
│   │   ├── utils/             # 工具函数
│   │   ├── config/            # 配置文件
│   │   ├── constants/         # 常量定义
│   │   └── scripts/           # 数据库脚本
│   ├── database/
│   │   ├── init.sql           # 数据库初始化（表结构 + 种子数据）
│   │   └── migrations/        # 数据库迁移
│   └── tests/                 # 测试文件
│
├── docker-compose.yml          # MySQL 8.0 + Redis 7
├── nginx.conf                  # Nginx 配置
├── .env.example                # 环境变量模板
└── scripts/                    # 运维脚本
```


---

## 开发命令

### 前端 (`crm-system/frontend/`)

| 命令 | 说明 |
|------|------|
| `npm run dev` | 启动开发服务器 (Vite) |
| `npm run build` | TypeScript 检查 + 生产构建 |
| `npm run preview` | 预览生产构建 |
| `npm run test` | 运行单元测试 (Vitest) |
| `npm run test:coverage` | 测试覆盖率报告 |

### 后端 (`crm-system/backend/`)

| 命令 | 说明 |
|------|------|
| `npm run dev` | 启动开发服务器 (nodemon 热重载) |
| `npm start` | 启动生产服务器 |
| `npm run init-db` | 初始化数据库（建表 + 种子数据） |
| `npm run migrate` | 执行数据库迁移 |
| `npm run seed` | 填充客户种子数据 |
| `npm test` | 运行测试 (Jest + 覆盖率) |
| `npm run test:integration` | 仅运行集成测试 |

### 环境变量

后端环境变量配置 (`crm-system/backend/.env`)：

| 变量 | 必填 | 说明 | 默认值 |
|------|------|------|--------|
| `DB_HOST` | 是 | MySQL 主机 | localhost |
| `DB_PORT` | 是 | MySQL 端口 | 3307 (Docker) / 3306 (本地) |
| `DB_NAME` | 是 | 数据库名 | crm_system |
| `DB_USER` | 是 | 数据库用户 | root |
| `DB_PASSWORD` | 是 | 数据库密码 | - |
| `REDIS_HOST` | 否 | Redis 主机（不配置则用内存缓存） | localhost |
| `REDIS_PORT` | 否 | Redis 端口 | 6379 |
| `REDIS_PASSWORD` | 否 | Redis 密码 | - |
| `JWT_SECRET` | 是 | JWT 签名密钥 | - |
| `JWT_EXPIRES_IN` | 否 | Token 过期时间 | 7d |
| `PORT` | 否 | 后端服务端口 | 3000 |
| `NODE_ENV` | 否 | 运行环境 | development |

---

## 部署

### Docker Compose

```bash
cd crm-system
docker-compose up -d    # 启动 MySQL + Redis
docker-compose logs -f  # 查看日志
docker-compose down     # 停止服务
```

### PM2 生产部署

```bash
cd crm-system/backend
pm2 start ecosystem.config.js

cd ../frontend
npm run build
# 将 dist/ 部署到 Nginx
```

### Nginx 配置

```nginx
server {
    listen 80;
    server_name your-domain.com;

    location / {
        root /var/www/crm-frontend/dist;
        try_files $uri $uri/ /index.html;
    }

    location /api {
        proxy_pass http://localhost:3000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}
```

---

## 数据库

### 表结构概览

| 模块 | 表名 | 说明 |
|------|------|------|
| 用户权限 | users, roles, permissions, role_permissions, departments | 用户、角色、权限、部门 |
| 客户管理 | customers, contacts, followups, customer_pool, customer_transfers | 客户、联系人、跟进、公海、转移 |
| 销售机会 | opportunities, opportunity_stage_history | 机会、阶段变更历史 |
| 系统功能 | notifications, operation_logs, attachments, dictionaries | 通知、日志、附件、字典 |
| 工作流 | workflows, workflow_instances, workflow_tasks | 流程定义、实例、任务 |
| 系统配置 | system_settings, system_configs | 系统配置 |

### 种子数据

`init.sql` 包含完整的种子数据：
- 4 个系统角色（管理员/销售经理/销售/财务）
- 3 个部门 + 6 个用户
- 15 个客户（覆盖 IT/制造/金融/教育/医疗/地产 6 个行业）
- 14 个销售机会（7 个已成交，总额 ¥2,255,000）
- 22 条跟进记录
- 字典数据（客户来源/阶段/等级/行业/规模/销售阶段/跟进方式）

---

## 常见问题

| 问题 | 解决方案 |
|------|---------|
| 数据库连接失败 | 检查 MySQL 是否运行，确认 `.env` 中 DB_HOST/DB_PORT/DB_PASSWORD 正确 |
| Redis 连接警告 | 正常现象，Redis 不可用时自动降级为内存缓存，不影响功能 |
| 前端无法访问 API | 确认后端在 3000 端口运行，检查 `vite.config.ts` 中的代理配置 |
| 登录后权限异常 | 执行 `npm run init-db` 重新初始化权限数据 |
| MySQL collate 警告 | 已知的 mysql2 驱动警告，不影响功能 |

---

## 许可证

MIT License

