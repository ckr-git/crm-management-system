# API接口文档

> 📌 本文档详细定义CRM系统所有API接口规范

---

## 📋 接口概览

### 接口分类
1. **认证接口**（5个）- 登录、注销、Token刷新等
2. **客户管理接口**（15个）- 客户CRUD、转移、导入导出等
3. **跟进记录接口**（5个）- 跟进记录CRUD、统计
4. **销售漏斗接口**（8个）- 销售机会管理、漏斗分析
5. **数据分析接口**（10个）- 业绩统计、客户分析等
6. **系统管理接口**（12个）- 用户、角色、权限管理

**总计**：约55个API接口

---

## 🔐 认证接口

### 1. 用户登录
**接口地址**：`POST /api/auth/login`

**请求参数**：
```json
{
  "username": "13800138000",
  "password": "123456"
}
```

**响应示例**：
```json
{
  "code": 200,
  "message": "登录成功",
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "id": 1,
      "username": "13800138000",
      "name": "张三",
      "role": {
        "id": 2,
        "name": "销售人员",
        "code": "salesperson"
      },
      "department": {
        "id": 2,
        "name": "华东区销售"
      }
    },
    "permissions": [
      "customer:view",
      "customer:create",
      "customer:update"
    ]
  }
}
```

---

### 2. 获取当前用户信息
**接口地址**：`GET /api/auth/me`

**请求头**：
```
Authorization: Bearer <token>
```

**响应示例**：
```json
{
  "code": 200,
  "message": "查询成功",
  "data": {
    "id": 1,
    "name": "张三",
    "username": "13800138000",
    "email": "zhangsan@example.com",
    "avatar": "https://example.com/avatar.jpg",
    "role": {
      "id": 2,
      "name": "销售人员"
    }
  }
}
```

---

### 3. 用户登出
**接口地址**：`POST /api/auth/logout`

**响应示例**：
```json
{
  "code": 200,
  "message": "登出成功"
}
```

---

### 4. 刷新Token
**接口地址**：`POST /api/auth/refresh`

**请求参数**：
```json
{
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**响应示例**：
```json
{
  "code": 200,
  "message": "刷新成功",
  "data": {
    "token": "new_token_here",
    "refreshToken": "new_refresh_token_here"
  }
}
```

---

### 5. 修改密码
**接口地址**：`PUT /api/auth/password`

**请求参数**：
```json
{
  "oldPassword": "123456",
  "newPassword": "new123456"
}
```

---

## 👥 客户管理接口

### 1. 获取客户列表
**接口地址**：`GET /api/customers`

**请求参数**：
| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| page | number | 否 | 页码，默认1 |
| pageSize | number | 否 | 每页数量，默认20 |
| keyword | string | 否 | 搜索关键词（姓名/公司/电话）|
| stage | string | 否 | 销售阶段筛选 |
| source | string | 否 | 客户来源筛选 |
| industry | string | 否 | 行业筛选 |
| startDate | string | 否 | 创建开始日期 YYYY-MM-DD |
| endDate | string | 否 | 创建结束日期 YYYY-MM-DD |
| sortBy | string | 否 | 排序字段（createdAt/lastFollowupAt）|
| sortOrder | string | 否 | 排序方式（asc/desc）|

**请求示例**：
```
GET /api/customers?page=1&pageSize=20&keyword=张三&stage=prospect&sortBy=lastFollowupAt&sortOrder=desc
```

**响应示例**：
```json
{
  "code": 200,
  "message": "查询成功",
  "data": {
    "list": [
      {
        "id": 1,
        "customerNo": "C202501120001",
        "name": "张三",
        "phone": "138****1234",
        "company": "XX科技有限公司",
        "stage": "prospect",
        "stageName": "意向客户",
        "source": "exhibition",
        "sourceName": "展会",
        "industry": "tech",
        "industryName": "科技/互联网",
        "tags": ["重点客户", "预算充足"],
        "owner": {
          "id": 2,
          "name": "小李"
        },
        "followupCount": 5,
        "lastFollowupAt": "2025-01-10T10:30:00.000Z",
        "lastFollowupContent": "客户表示对产品感兴趣，已发送详细资料",
        "createdAt": "2025-01-08T09:00:00.000Z"
      }
    ],
    "total": 150,
    "page": 1,
    "pageSize": 20,
    "totalPages": 8
  }
}
```

---

### 2. 获取客户详情
**接口地址**：`GET /api/customers/:id`

**响应示例**：
```json
{
  "code": 200,
  "message": "查询成功",
  "data": {
    "id": 1,
    "customerNo": "C202501120001",
    "name": "张三",
    "phone": "13800138000",
    "company": "XX科技有限公司",
    "companyPhone": "021-12345678",
    "email": "zhangsan@example.com",
    "position": "技术总监",
    "wechat": "zhangsan_wx",
    "address": "上海市浦东新区XX路XX号",
    "website": "https://example.com",
    "source": "exhibition",
    "sourceName": "展会",
    "industry": "tech",
    "industryName": "科技/互联网",
    "stage": "prospect",
    "stageName": "意向客户",
    "tags": ["重点客户", "预算充足"],
    "budgetRange": "50k-100k",
    "budgetRangeName": "5-10万",
    "expectedDealDate": "2025-03-01",
    "requirement": "需要一套CRM系统管理销售团队，支持50人使用",
    "remark": "客户对价格比较敏感，需要重点跟进",
    "owner": {
      "id": 2,
      "name": "小李",
      "phone": "13900139000"
    },
    "creator": {
      "id": 2,
      "name": "小李"
    },
    "followupCount": 5,
    "lastFollowupAt": "2025-01-10T10:30:00.000Z",
    "createdAt": "2025-01-08T09:00:00.000Z",
    "updatedAt": "2025-01-10T10:30:00.000Z"
  }
}
```

---

### 3. 创建客户
**接口地址**：`POST /api/customers`

**请求参数**：
```json
{
  "name": "张三",
  "phone": "13800138000",
  "company": "XX科技有限公司",
  "companyPhone": "021-12345678",
  "email": "zhangsan@example.com",
  "position": "技术总监",
  "wechat": "zhangsan_wx",
  "address": "上海市浦东新区XX路XX号",
  "website": "https://example.com",
  "source": "exhibition",
  "industry": "tech",
  "stage": "lead",
  "tags": ["重点客户"],
  "budgetRange": "50k-100k",
  "expectedDealDate": "2025-03-01",
  "requirement": "需要一套CRM系统",
  "remark": "展会现场沟通"
}
```

**响应示例**：
```json
{
  "code": 201,
  "message": "创建成功",
  "data": {
    "id": 100,
    "customerNo": "C202501120100",
    "name": "张三",
    "phone": "13800138000",
    // ... 其他字段
  }
}
```

---

### 4. 更新客户
**接口地址**：`PUT /api/customers/:id`

**请求参数**：（与创建客户相同）

---

### 5. 删除客户
**接口地址**：`DELETE /api/customers/:id`

**响应示例**：
```json
{
  "code": 200,
  "message": "删除成功"
}
```

---

### 6. 批量删除客户
**接口地址**：`POST /api/customers/batch-delete`

**请求参数**：
```json
{
  "ids": [1, 2, 3, 4, 5]
}
```

---

### 7. 转移客户
**接口地址**：`POST /api/customers/:id/transfer`

**请求参数**：
```json
{
  "targetUserId": 3,
  "reason": "销售离职，重新分配客户"
}
```

---

### 8. 批量转移客户
**接口地址**：`POST /api/customers/batch-transfer`

**请求参数**：
```json
{
  "customerIds": [1, 2, 3],
  "targetUserId": 3,
  "reason": "销售离职，重新分配客户"
}
```

---

### 9. 导出客户
**接口地址**：`GET /api/customers/export`

**请求参数**：（与获取客户列表相同，用于筛选）

**响应**：返回Excel文件流

---

### 10. 下载导入模板
**接口地址**：`GET /api/customers/import-template`

**响应**：返回Excel模板文件

---

### 11. 批量导入客户
**接口地址**：`POST /api/customers/import`

**请求参数**：
```
Content-Type: multipart/form-data

file: <Excel文件>
```

**响应示例**：
```json
{
  "code": 200,
  "message": "导入完成",
  "data": {
    "total": 100,
    "success": 95,
    "failed": 5,
    "errors": [
      {
        "row": 3,
        "reason": "手机号格式错误"
      },
      {
        "row": 15,
        "reason": "手机号重复"
      }
    ]
  }
}
```

---

### 12. 放入公海池
**接口地址**：`POST /api/customers/:id/to-pool`

**请求参数**：
```json
{
  "reason": "客户明确拒绝"
}
```

---

### 13. 获取公海池列表
**接口地址**：`GET /api/customer-pool`

**请求参数**：
| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| page | number | 否 | 页码 |
| pageSize | number | 否 | 每页数量 |
| reason | string | 否 | 进入原因筛选 |

**响应示例**：
```json
{
  "code": 200,
  "message": "查询成功",
  "data": {
    "list": [
      {
        "id": 1,
        "customer": {
          "id": 10,
          "name": "李四",
          "company": "YY贸易",
          "phone": "139****5678",
          "stage": "lead"
        },
        "previousOwner": {
          "id": 5,
          "name": "小刘"
        },
        "enterReason": "long_time_no_followup",
        "enterReasonName": "超期未跟进",
        "enterAt": "2025-01-01T00:00:00.000Z",
        "status": "available",
        "daysinPool": 15
      }
    ],
    "total": 50,
    "page": 1,
    "pageSize": 20
  }
}
```

---

### 14. 从公海池领取客户
**接口地址**：`POST /api/customer-pool/:id/claim`

**响应示例**：
```json
{
  "code": 200,
  "message": "领取成功",
  "data": {
    "customer": {
      "id": 10,
      "name": "李四",
      "company": "YY贸易"
    },
    "firstFollowupDeadline": "2025-01-20T00:00:00.000Z"
  }
}
```

---

### 15. 获取客户统计
**接口地址**：`GET /api/customers/statistics`

**响应示例**：
```json
{
  "code": 200,
  "message": "查询成功",
  "data": {
    "total": 328,
    "todayAdded": 5,
    "todayFollowup": 12,
    "overdueFollowup": 8,
    "inPool": 23,
    "byStage": [
      { "stage": "lead", "count": 120 },
      { "stage": "prospect", "count": 80 },
      { "stage": "qualified", "count": 50 },
      { "stage": "negotiation", "count": 30 },
      { "stage": "won", "count": 48 }
    ]
  }
}
```

---

## 📝 跟进记录接口

### 1. 获取跟进记录列表
**接口地址**：`GET /api/followups`

**请求参数**：
| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| customerId | number | 是 | 客户ID |
| page | number | 否 | 页码 |
| pageSize | number | 否 | 每页数量，默认20 |

**响应示例**：
```json
{
  "code": 200,
  "message": "查询成功",
  "data": {
    "list": [
      {
        "id": 1,
        "type": "phone",
        "typeName": "电话",
        "content": "客户表示对产品感兴趣，要求发送详细资料和报价",
        "feedback": "客户反馈积极，预算5-10万，预计2月底决策",
        "nextPlan": "本周五前发送产品资料和初步报价",
        "nextFollowupAt": "2025-01-15T10:00:00.000Z",
        "stageBefore": "lead",
        "stageAfter": "prospect",
        "followupAt": "2025-01-12T14:30:00.000Z",
        "user": {
          "id": 2,
          "name": "小李"
        },
        "createdAt": "2025-01-12T14:35:00.000Z"
      }
    ],
    "total": 15,
    "page": 1,
    "pageSize": 20
  }
}
```

---

### 2. 创建跟进记录
**接口地址**：`POST /api/followups`

**请求参数**：
```json
{
  "customerId": 1,
  "type": "phone",
  "content": "客户表示对产品感兴趣",
  "feedback": "客户反馈积极",
  "nextPlan": "本周五前发送产品资料",
  "nextFollowupAt": "2025-01-15T10:00:00.000Z",
  "stageAfter": "prospect",
  "followupAt": "2025-01-12T14:30:00.000Z"
}
```

**响应示例**：
```json
{
  "code": 201,
  "message": "添加成功",
  "data": {
    "id": 100,
    // ... 完整跟进记录信息
  }
}
```

---

### 3. 更新跟进记录
**接口地址**：`PUT /api/followups/:id`

---

### 4. 删除跟进记录
**接口地址**：`DELETE /api/followups/:id`

---

### 5. 获取待跟进提醒
**接口地址**：`GET /api/followups/reminders`

**请求参数**：
| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| type | string | 否 | today今日/week本周/overdue超期 |

**响应示例**：
```json
{
  "code": 200,
  "message": "查询成功",
  "data": {
    "today": 8,
    "week": 23,
    "overdue": 5,
    "list": [
      {
        "id": 1,
        "customer": {
          "id": 10,
          "name": "张三",
          "company": "XX科技"
        },
        "nextFollowupAt": "2025-01-12T10:00:00.000Z",
        "nextPlan": "发送产品演示视频",
        "overdayDays": 0
      }
    ]
  }
}
```

---

## 💰 销售漏斗接口

### 1. 获取漏斗看板数据
**接口地址**：`GET /api/funnel/board`

**请求参数**：
| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| view | string | 否 | personal个人/team团队/company全公司 |

**响应示例**：
```json
{
  "code": 200,
  "message": "查询成功",
  "data": {
    "stages": [
      {
        "stage": "lead",
        "stageName": "潜在客户",
        "count": 120,
        "customers": [
          {
            "id": 1,
            "name": "张三",
            "company": "XX科技",
            "amount": 50000,
            "daysInStage": 3,
            "urgency": "normal"
          }
        ]
      },
      {
        "stage": "prospect",
        "stageName": "意向客户",
        "count": 80,
        "customers": [...]
      }
    ]
  }
}
```

---

### 2. 获取漏斗转化分析
**接口地址**：`GET /api/funnel/analysis`

**请求参数**：
| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| startDate | string | 否 | 开始日期 |
| endDate | string | 否 | 结束日期 |
| view | string | 否 | personal/team/company |

**响应示例**：
```json
{
  "code": 200,
  "message": "查询成功",
  "data": {
    "funnel": [
      {
        "stage": "lead",
        "stageName": "潜在客户",
        "count": 1000,
        "percentage": 100,
        "conversionRate": null
      },
      {
        "stage": "prospect",
        "stageName": "意向客户",
        "count": 500,
        "percentage": 50,
        "conversionRate": 50
      },
      {
        "stage": "won",
        "stageName": "成交",
        "count": 30,
        "percentage": 3,
        "conversionRate": 6
      }
    ],
    "overallConversionRate": 3,
    "avgCycleDays": 45,
    "industryAvgRate": 3.5
  }
}
```

---

## 📊 数据分析接口

### 1. 获取业绩统计
**接口地址**：`GET /api/stats/performance`

**请求参数**：
| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| period | string | 否 | day/week/month/quarter/year |
| startDate | string | 否 | 开始日期 |
| endDate | string | 否 | 结束日期 |
| view | string | 否 | personal/team/company |

**响应示例**：
```json
{
  "code": 200,
  "message": "查询成功",
  "data": {
    "summary": {
      "newCustomers": 45,
      "wonDeals": 8,
      "wonAmount": 320000,
      "targetAmount": 400000,
      "completionRate": 80,
      "conversionRate": 17.8,
      "avgDealAmount": 40000
    },
    "trend": [
      { "date": "2025-01-01", "amount": 50000, "count": 2 },
      { "date": "2025-01-08", "amount": 80000, "count": 3 },
      { "date": "2025-01-15", "amount": 120000, "count": 2 }
    ],
    "ranking": [
      { "userId": 2, "userName": "小李", "amount": 150000, "count": 5, "rank": 1 },
      { "userId": 3, "userName": "小王", "amount": 120000, "count": 4, "rank": 2 }
    ]
  }
}
```

---

### 2. 获取客户来源分析
**接口地址**：`GET /api/stats/source`

**响应示例**：
```json
{
  "code": 200,
  "message": "查询成功",
  "data": {
    "sources": [
      {
        "source": "exhibition",
        "sourceName": "展会",
        "count": 80,
        "percentage": 40,
        "wonCount": 5,
        "wonRate": 6.25,
        "avgCycleDays": 45
      },
      {
        "source": "website",
        "sourceName": "官网",
        "count": 50,
        "percentage": 25,
        "wonCount": 3,
        "wonRate": 6.0,
        "avgCycleDays": 60
      }
    ]
  }
}
```

---

### 3. 获取客户行业分析
**接口地址**：`GET /api/stats/industry`

---

### 4. 获取销售行为分析
**接口地址**：`GET /api/stats/behavior`

**响应示例**：
```json
{
  "code": 200,
  "message": "查询成功",
  "data": {
    "avgDailyCustomers": 3.5,
    "avgDailyFollowups": 8.2,
    "avgFollowupFrequency": 5.5,
    "avgResponseTime": 2.5,
    "followupCompletionRate": 85,
    "overdueFollowups": 12
  }
}
```

---

## 🔧 系统管理接口

### 1. 获取用户列表
**接口地址**：`GET /api/users`

---

### 2. 创建用户
**接口地址**：`POST /api/users`

**请求参数**：
```json
{
  "username": "13900139000",
  "name": "王五",
  "email": "wangwu@example.com",
  "roleId": 2,
  "departmentId": 2,
  "managerId": 5
}
```

---

### 3. 更新用户
**接口地址**：`PUT /api/users/:id`

---

### 4. 停用/启用用户
**接口地址**：`PATCH /api/users/:id/status`

**请求参数**：
```json
{
  "status": 0
}
```

---

### 5. 重置用户密码
**接口地址**：`POST /api/users/:id/reset-password`

---

### 6. 获取角色列表
**接口地址**：`GET /api/roles`

---

### 7. 创建角色
**接口地址**：`POST /api/roles`

---

### 8. 更新角色权限
**接口地址**：`PUT /api/roles/:id/permissions`

**请求参数**：
```json
{
  "permissions": [
    "customer:view",
    "customer:create",
    "customer:update"
  ]
}
```

---

### 9. 获取字典列表
**接口地址**：`GET /api/dictionaries`

**请求参数**：
| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| type | string | 否 | 字典类型 |

**响应示例**：
```json
{
  "code": 200,
  "message": "查询成功",
  "data": [
    {
      "id": 1,
      "type": "customer_source",
      "label": "展会",
      "value": "exhibition",
      "sort": 1
    }
  ]
}
```

---

### 10. 获取操作日志
**接口地址**：`GET /api/logs`

**请求参数**：
| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| page | number | 否 | 页码 |
| pageSize | number | 否 | 每页数量 |
| module | string | 否 | 模块筛选 |
| action | string | 否 | 操作类型筛选 |
| userId | number | 否 | 操作人筛选 |
| startDate | string | 否 | 开始日期 |
| endDate | string | 否 | 结束日期 |

---

### 11. 获取系统配置
**接口地址**：`GET /api/settings`

---

### 12. 更新系统配置
**接口地址**：`PUT /api/settings/:key`

**请求参数**：
```json
{
  "value": "30"
}
```

---

## ⚠️ 错误码说明

| 错误码 | 说明 | 示例 |
|--------|------|------|
| 200 | 成功 | - |
| 201 | 创建成功 | - |
| 400 | 请求参数错误 | 手机号格式错误 |
| 401 | 未授权（未登录或Token过期）| Token无效 |
| 403 | 无权限操作 | 您没有删除客户的权限 |
| 404 | 资源不存在 | 客户不存在 |
| 409 | 数据冲突 | 手机号已存在 |
| 429 | 请求过于频繁 | 操作过于频繁，请稍后再试 |
| 500 | 服务器内部错误 | 服务器异常，请联系管理员 |

---

## 📝 接口调用示例

### JavaScript (Axios)
```javascript
// 获取客户列表
const getCustomerList = async (params) => {
  const response = await axios.get('/api/customers', { params })
  return response.data
}

// 创建客户
const createCustomer = async (data) => {
  const response = await axios.post('/api/customers', data)
  return response.data
}
```

### cURL
```bash
# 登录
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"13800138000","password":"123456"}'

# 获取客户列表（需要Token）
curl -X GET "http://localhost:3000/api/customers?page=1&pageSize=20" \
  -H "Authorization: Bearer <your_token>"
```

---

## 🔗 相关文档

- [02-系统架构设计](./02-系统架构设计.md) - 了解接口在架构中的位置
- [06-后端开发指南](../06-后端开发指南/) - 查看接口实现细节

---

*本文档最后更新：2025-10-12*

*建议使用Apifox或Postman导入此文档进行接口测试*
