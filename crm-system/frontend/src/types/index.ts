/**
 * 通用类型定义
 */

// API响应基础结构
export interface ApiResponse<T = any> {
  code: number
  message: string
  data: T
}

// 分页响应
export interface PaginatedResponse<T> {
  list: T[]
  total: number
  page: number
  pageSize: number
}

// 用户信息
export interface UserInfo {
  id: number
  username: string
  name: string
  email?: string
  phone?: string
  avatar?: string
  role_id: number
  department_id?: number
  manager_id?: number
  status: number
  last_login_at?: string
  login_count: number
  created_at: string
  updated_at: string
  role?: Role
  permissions?: string[]
}

// 角色
export interface Role {
  id: number
  name: string
  code: string
  description?: string
  is_system?: number
  permissions?: Permission[]
}

// 权限
export interface Permission {
  id: number
  code: string
  name: string
  description?: string
}

// 客户
export interface Customer {
  id: number
  code: string
  name: string
  short_name?: string
  contact: string
  phone: string
  mobile?: string
  email?: string
  source: CustomerSource
  level: CustomerLevel
  stage: CustomerStage
  industry?: string
  company_size?: string
  address?: string
  website?: string
  wechat?: string
  qq?: string
  tags?: string[]
  remark?: string
  owner_id?: number
  owner?: UserInfo
  last_followup_at?: string
  next_followup_at?: string
  created_at: string
  updated_at: string
}

// 客户来源
export type CustomerSource = 'website' | 'phone' | 'referral' | 'exhibition' | 'advertisement' | 'other'

// 客户等级
export type CustomerLevel = 'normal' | 'important' | 'vip'

// 客户阶段
export type CustomerStage = 'potential' | 'intention' | 'quotation' | 'negotiation' | 'deal'

// 销售机会
export interface Opportunity {
  id: number
  customer_id: number
  customer?: Customer
  name: string
  amount: number
  stage: OpportunityStage
  probability: number
  expected_close_date?: string
  actual_close_date?: string
  lost_reason?: string
  remark?: string
  owner_id: number
  owner?: UserInfo
  created_at: string
  updated_at: string
}

// 销售机会阶段
export type OpportunityStage = 'initial' | 'qualification' | 'proposal' | 'negotiation' | 'closed_won' | 'closed_lost'

// 跟进记录
export interface Followup {
  id: number
  customer_id: number
  customer?: Customer
  user_id: number
  user?: UserInfo
  type: FollowupType
  content: string
  result?: string
  next_plan?: string
  next_followup_at?: string
  attachments?: string[]
  created_at: string
  updated_at: string
}

// 跟进方式
export type FollowupType = 'phone' | 'visit' | 'email' | 'wechat'

// 操作日志
export interface OperationLog {
  id: number
  user_id: number
  user?: UserInfo
  module: string
  action: string
  target_id?: number
  target_type?: string
  details?: Record<string, any>
  ip?: string
  user_agent?: string
  created_at: string
}

// 通知
export interface Notification {
  id: number
  user_id: number
  type: string
  title: string
  content: string
  link?: string
  is_read: boolean
  sender_id?: number
  sender?: UserInfo
  extra_data?: Record<string, any>
  created_at: string
}

// 公海池记录
export interface CustomerPool {
  id: number
  customer_id: number
  customer?: Customer
  release_user_id: number
  release_user?: UserInfo
  release_reason: string
  release_time: string
  claim_user_id?: number
  claim_user?: UserInfo
  claim_time?: string
  status: 'available' | 'claimed'
}

// 登录请求
export interface LoginRequest {
  username: string
  password: string
}

// 登录响应
export interface LoginResponse {
  token: string
  user: UserInfo
}
