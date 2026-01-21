# CRM客户关系管理系统

<div align="center">

**一个功能完整的企业级CRM系统**

基于 Vue 3 + Node.js + MySQL 构建的现代化客户关系管理平台

[功能特性](#功能特性) • [技术栈](#技术栈) • [快速开始](#快速开始) • [项目结构](#项目结构) • [代码风格](#代码风格)

</div>

---

## 项目简介

这是一个功能完整的企业级CRM（客户关系管理）系统，采用前后端分离架构，支持客户管理、销售漏斗、数据分析、权限管理等核心功能。项目代码规范、文档完善，适合作为学习全栈开发或企业级应用开发的参考项目。

### 核心亮点

- **完整的业务闭环**: 从客户获取、跟进、转化到数据分析的完整流程
- **细粒度权限控制**: 支持角色权限、功能权限和数据权限的多维度管理
- **数据可视化**: 基于 ECharts 的丰富图表展示，支持多维度数据分析
- **响应式设计**: 支持 PC 端和移动端访问，自适应不同屏幕尺寸
- **容器化部署**: 提供 Docker Compose 配置，一键启动开发环境
- **完善的文档**: 包含需求分析、架构设计、开发指南等完整文档体系

---

## 功能特性

### 客户管理模块
- 客户信息的增删改查操作
- 客户列表的搜索、筛选、排序功能
- 客户分类和标签管理
- 跟进记录管理和附件上传
- 客户转移和公海池管理

### 销售漏斗模块
- 销售机会的创建和管理
- 可视化销售阶段看板（拖拽切换阶段）
- 销售阶段：初步接触 → 需求确认 → 方案报价 → 商务谈判 → 合同签订
- 机会优先级设置和待办任务管理
- 赢单/输单管理和原因分析

### 数据分析模块
- 销售业绩统计（按月/季度/年度）
- 销售排行榜和客户来源分析
- 销售漏斗转化率分析
- 客户行业分布和成交周期分析
- 趋势图表展示和 Excel 报表导出

### 权限管理模块
- 用户管理（添加、编辑、禁用）
- 角色管理（管理员、销售经理、销售、财务等）
- 权限配置（功能权限和数据权限）
- 操作日志记录和账号安全管理

---

## 技术栈

### 前端技术
- **核心框架**: Vue 3.4 (Composition API + TypeScript)
- **UI 组件库**: Element Plus 2.5
- **状态管理**: Pinia 2.1
- **路由管理**: Vue Router 4.2
- **HTTP 客户端**: Axios 1.6
- **数据可视化**: ECharts 5.4
- **构建工具**: Vite 5.0
- **代码规范**: ESLint + Prettier
- **测试框架**: Vitest + Vue Test Utils

### 后端技术
- **运行环境**: Node.js 18 LTS
- **Web 框架**: Express 4.18
- **数据库**: MySQL 8.0
- **缓存**: Redis 7.2
- **ORM 框架**: Sequelize 6.35
- **身份认证**: JWT (jsonwebtoken)
- **日志管理**: Morgan + Winston
- **文件上传**: Multer 2.0
- **数据导出**: ExcelJS + XLSX

### 部署运维
- **Web 服务器**: Nginx 1.24
- **容器化**: Docker + Docker Compose
- **进程管理**: PM2
- **推荐系统**: Ubuntu 22.04 LTS

---

## 快速开始

### 环境要求

- Node.js >= 18.0.0
- MySQL >= 8.0
- Redis >= 7.0
- npm 或 yarn

### 使用 Docker Compose（推荐）

```bash
# 1. 克隆项目
git clone <repository-url>
cd crm管理系统

# 2. 启动数据库服务
docker-compose up -d

# 3. 安装依赖
cd crm-system/backend
npm install

cd ../frontend
npm install

# 4. 初始化数据库
cd ../backend
npm run init-db

# 5. 启动后端服务
npm run dev

# 6. 启动前端服务（新终端）
cd ../frontend
npm run dev
```

### 手动安装

#### 后端配置

```bash
# 1. 进入后端目录
cd crm-system/backend

# 2. 安装依赖
npm install

# 3. 配置环境变量
cp .env.example .env
# 编辑 .env 文件，配置数据库连接信息

# 4. 初始化数据库
npm run init-db

# 5. 启动开发服务器
npm run dev
```

#### 前端配置

```bash
# 1. 进入前端目录
cd crm-system/frontend

# 2. 安装依赖
npm install

# 3. 启动开发服务器
npm run dev
```

### 访问应用

- 前端地址: http://localhost:5174
- 后端 API: http://localhost:3000
- 默认账号: admin / admin123

---

## 项目结构

```
crm管理系统/
├── crm-system/                 # 主项目目录
│   ├── frontend/               # 前端项目
│   │   ├── src/
│   │   │   ├── api/           # API 接口层
│   │   │   ├── components/    # 可复用组件
│   │   │   ├── composables/   # 组合式函数
│   │   │   ├── router/        # 路由配置
│   │   │   ├── stores/        # Pinia 状态管理
│   │   │   ├── styles/        # 全局样式
│   │   │   ├── types/         # TypeScript 类型定义
│   │   │   ├── utils/         # 工具函数
│   │   │   └── views/         # 页面组件
│   │   ├── tests/             # 测试文件
│   │   ├── vite.config.ts     # Vite 配置
│   │   └── package.json
│   │
│   └── backend/                # 后端项目
│       ├── src/
│       │   ├── controllers/   # 控制器层
│       │   ├── models/        # 数据模型
│       │   ├── routes/        # 路由定义
│       │   ├── middlewares/   # 中间件
│       │   ├── utils/         # 工具函数
│       │   └── config/        # 配置文件
│       ├── database/          # 数据库脚本
│       └── package.json
│
├── CRM-Project-Docs/          # 项目文档
│   ├── 01-需求分析/
│   ├── 02-系统架构/
│   ├── 03-数据库设计/
│   ├── 04-功能模块设计/
│   ├── 05-前端开发指南/
│   ├── 06-后端开发指南/
│   ├── 07-测试文档/
│   └── 08-部署运维/
│
├── docker-compose.yml         # Docker 容器编排
├── nginx.conf                 # Nginx 配置
└── README.md                  # 项目说明文档
```

---

## 代码风格

本项目遵循统一的代码规范，确保代码的可读性和可维护性。

### 前端代码风格

#### Vue 3 Composition API

使用 `<script setup>` 语法和组合式 API，代码更简洁清晰：

```vue
<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import type { Customer } from '@/types/customer'

// 响应式数据
const customerList = ref<Customer[]>([])
const loading = ref(false)

// 计算属性
const totalCount = computed(() => customerList.value.length)

// 生命周期
onMounted(() => {
  fetchCustomers()
})

// 方法
const fetchCustomers = async () => {
  loading.value = true
  try {
    const response = await customerApi.getList()
    customerList.value = response.data
  } finally {
    loading.value = false
  }
}
</script>
```

#### TypeScript 类型定义

所有接口和数据结构都有完整的类型定义：

```typescript
// types/customer.ts
export interface Customer {
  id: number
  name: string
  company: string
  phone: string
  email: string
  source: CustomerSource
  status: CustomerStatus
  createdAt: string
  updatedAt: string
}

export enum CustomerSource {
  WEBSITE = 'website',
  REFERRAL = 'referral',
  ADVERTISEMENT = 'advertisement'
}
```

#### API 层分离

所有 HTTP 请求统一在 `api/` 目录管理：

```typescript
// api/customer.ts
import request from '@/utils/request'
import type { Customer, CustomerQuery } from '@/types/customer'

export const customerApi = {
  // 获取客户列表
  getList(params: CustomerQuery) {
    return request.get<Customer[]>('/api/customers', { params })
  },

  // 获取客户详情
  getDetail(id: number) {
    return request.get<Customer>(`/api/customers/${id}`)
  },

  // 创建客户
  create(data: Partial<Customer>) {
    return request.post<Customer>('/api/customers', data)
  }
}
```

#### 组合式函数（Composables）

可复用的业务逻辑封装为组合式函数：

```typescript
// composables/usePermission.ts
import { computed } from 'vue'
import { useUserStore } from '@/stores/user'

export function usePermission() {
  const userStore = useUserStore()

  const hasPermission = (permission: string) => {
    return userStore.permissions.includes(permission)
  }

  const hasRole = (role: string) => {
    return userStore.roles.includes(role)
  }

  return {
    hasPermission,
    hasRole
  }
}
```

#### 自定义指令

权限控制使用自定义指令：

```typescript
// directives/permission.ts
import type { Directive } from 'vue'
import { useUserStore } from '@/stores/user'

export const permission: Directive = {
  mounted(el, binding) {
    const userStore = useUserStore()
    const { value } = binding

    if (value && !userStore.permissions.includes(value)) {
      el.parentNode?.removeChild(el)
    }
  }
}
```

### 后端代码风格

#### MVC 架构模式

采用清晰的 MVC 架构，职责分离：

```javascript
// controllers/customerController.js
const { Customer } = require('../models')
const { validateCustomer } = require('../validations/customerValidation')

class CustomerController {
  // 获取客户列表
  async getList(req, res, next) {
    try {
      const { page = 1, pageSize = 10, keyword } = req.query

      const where = {}
      if (keyword) {
        where.name = { [Op.like]: `%${keyword}%` }
      }

      const { rows, count } = await Customer.findAndCountAll({
        where,
        limit: pageSize,
        offset: (page - 1) * pageSize,
        order: [['createdAt', 'DESC']]
      })

      res.json({
        code: 200,
        data: { list: rows, total: count }
      })
    } catch (error) {
      next(error)
    }
  }
}

module.exports = new CustomerController()
```

#### 中间件模式

使用中间件处理鉴权、日志、验证等横切关注点：

```javascript
// middlewares/auth.js
const jwt = require('jsonwebtoken')
const { User } = require('../models')

// JWT 认证中间件
const authenticate = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '')

    if (!token) {
      return res.status(401).json({ code: 401, message: '未提供认证令牌' })
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET)
    const user = await User.findByPk(decoded.userId)

    if (!user) {
      return res.status(401).json({ code: 401, message: '用户不存在' })
    }

    req.user = user
    next()
  } catch (error) {
    res.status(401).json({ code: 401, message: '认证失败' })
  }
}

// 权限检查中间件
const checkPermission = (permission) => {
  return async (req, res, next) => {
    const userPermissions = await req.user.getPermissions()

    if (!userPermissions.includes(permission)) {
      return res.status(403).json({ code: 403, message: '权限不足' })
    }

    next()
  }
}

module.exports = { authenticate, checkPermission }
```

#### 数据验证

使用 express-validator 进行请求数据验证：

```javascript
// validations/customerValidation.js
const { body, validationResult } = require('express-validator')

const validateCustomer = [
  body('name').trim().notEmpty().withMessage('客户名称不能为空'),
  body('phone').matches(/^1[3-9]\d{9}$/).withMessage('手机号格式不正确'),
  body('email').isEmail().withMessage('邮箱格式不正确'),

  (req, res, next) => {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      return res.status(400).json({
        code: 400,
        message: '数据验证失败',
        errors: errors.array()
      })
    }
    next()
  }
]

module.exports = { validateCustomer }
```

#### 统一错误处理

全局错误处理中间件：

```javascript
// middlewares/errorHandler.js
const logger = require('../utils/logger')

const errorHandler = (err, req, res, next) => {
  // 记录错误日志
  logger.error({
    message: err.message,
    stack: err.stack,
    url: req.url,
    method: req.method
  })

  // 返回错误响应
  res.status(err.status || 500).json({
    code: err.status || 500,
    message: err.message || '服务器内部错误'
  })
}

module.exports = errorHandler
```

### 通用代码规范

#### 命名规范

- **文件命名**: 使用小驼峰命名法（camelCase）
  - 组件文件: `CustomerList.vue`
  - 工具文件: `formatDate.js`
  - 类型文件: `customer.ts`

- **变量命名**: 使用小驼峰命名法
  ```javascript
  const customerList = []
  const isLoading = false
  ```

- **常量命名**: 使用大写下划线命名法
  ```javascript
  const API_BASE_URL = 'http://localhost:3000'
  const MAX_PAGE_SIZE = 100
  ```

- **类/接口命名**: 使用大驼峰命名法（PascalCase）
  ```typescript
  class CustomerController {}
  interface UserInfo {}
  ```

#### 注释规范

- **函数注释**: 使用 JSDoc 格式
  ```javascript
  /**
   * 获取客户列表
   * @param {Object} params - 查询参数
   * @param {number} params.page - 页码
   * @param {number} params.pageSize - 每页数量
   * @returns {Promise<Object>} 客户列表数据
   */
  async function getCustomerList(params) {
    // 实现代码
  }
  ```

- **复杂逻辑注释**: 解释为什么这样做，而不是做了什么
  ```javascript
  // 使用 Redis 缓存字典数据，避免频繁查询数据库
  const cachedData = await redis.get(cacheKey)
  ```

#### 代码格式化

项目使用 ESLint + Prettier 统一代码格式：

```json
// .eslintrc.js
module.exports = {
  extends: ['eslint:recommended', 'plugin:vue/vue3-recommended'],
  rules: {
    'semi': ['error', 'never'],
    'quotes': ['error', 'single'],
    'indent': ['error', 2]
  }
}
```

---

## 开发指南

### 开发命令

#### 前端命令

```bash
npm run dev          # 启动开发服务器
npm run build        # 构建生产版本
npm run preview      # 预览生产构建
npm run test         # 运行测试
npm run lint         # 代码检查
npm run format       # 代码格式化
```

#### 后端命令

```bash
npm run dev          # 启动开发服务器（nodemon）
npm start            # 启动生产服务器
npm run init-db      # 初始化数据库
npm test             # 运行测试
npm run lint         # 代码检查
```

### 环境变量配置

后端 `.env` 文件配置示例：

```env
# 服务器配置
PORT=3000
NODE_ENV=development

# 数据库配置
DB_HOST=localhost
DB_PORT=3307
DB_NAME=crm_system
DB_USER=root
DB_PASSWORD=root123

# Redis 配置
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=redis123

# JWT 配置
JWT_SECRET=your-secret-key
JWT_EXPIRES_IN=2h

# 文件上传
UPLOAD_PATH=./uploads
MAX_FILE_SIZE=5242880
```

---

## 部署指南

### 生产环境部署

#### 使用 Docker Compose

```bash
# 1. 构建镜像
docker-compose build

# 2. 启动服务
docker-compose up -d

# 3. 查看日志
docker-compose logs -f
```

#### 使用 PM2

```bash
# 1. 安装 PM2
npm install -g pm2

# 2. 启动后端服务
cd crm-system/backend
pm2 start ecosystem.config.js

# 3. 构建前端
cd ../frontend
npm run build

# 4. 配置 Nginx
# 将 dist 目录部署到 Nginx 静态目录
```

### Nginx 配置示例

```nginx
server {
    listen 80;
    server_name your-domain.com;

    # 前端静态文件
    location / {
        root /var/www/crm-frontend/dist;
        try_files $uri $uri/ /index.html;
    }

    # 后端 API 代理
    location /api {
        proxy_pass http://localhost:3000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}
```

---

## 文档

详细的项目文档位于 `CRM-Project-Docs/` 目录：

- **[项目总览](./CRM-Project-Docs/00-项目总览.md)** - 5分钟了解整个项目
- **[需求分析](./CRM-Project-Docs/01-需求分析/)** - 业务需求和功能清单
- **[系统架构](./CRM-Project-Docs/02-系统架构/)** - 技术选型和架构设计
- **[数据库设计](./CRM-Project-Docs/03-数据库设计/)** - 数据表结构和关系
- **[功能模块设计](./CRM-Project-Docs/04-功能模块设计/)** - 各模块详细设计
- **[前端开发指南](./CRM-Project-Docs/05-前端开发指南/)** - 前端开发规范
- **[后端开发指南](./CRM-Project-Docs/06-后端开发指南/)** - 后端开发规范
- **[测试文档](./CRM-Project-Docs/07-测试文档/)** - 测试计划和用例
- **[部署运维](./CRM-Project-Docs/08-部署运维/)** - 部署和运维指南

---

## 贡献指南

欢迎贡献代码和提出建议！

### 贡献流程

1. Fork 本项目
2. 创建特性分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 提交 Pull Request

### 代码审查标准

- 遵循项目代码风格规范
- 添加必要的单元测试
- 更新相关文档
- 确保所有测试通过

---

## 常见问题

### 数据库连接失败

确保 MySQL 和 Redis 服务已启动，并检查 `.env` 文件中的配置是否正确。

### 前端无法访问后端 API

检查后端服务是否正常运行，以及 Vite 配置中的代理设置是否正确。

### 权限相关问题

确保用户已登录并拥有相应的权限，可以在数据库中检查用户的角色和权限配置。

---

## 许可证

本项目采用 MIT 许可证。详见 [LICENSE](./LICENSE) 文件。

---

## 联系方式

如有问题或建议，欢迎通过以下方式联系：

- 提交 Issue
- 发起 Pull Request
- 邮件联系

---

## 致谢

感谢所有为本项目做出贡献的开发者！

---

**开始你的 CRM 开发之旅吧！**

