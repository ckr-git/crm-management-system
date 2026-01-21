/**
 * 业务常量定义
 * 消除代码中的魔法字符串
 */

// 客户来源
const CUSTOMER_SOURCES = ['website', 'phone', 'referral', 'exhibition', 'advertisement', 'other'];

// 客户等级
const CUSTOMER_LEVELS = ['normal', 'important', 'vip'];

// 客户阶段
const CUSTOMER_STAGES = ['potential', 'intention', 'quotation', 'negotiation', 'deal'];

// 公司规模
const COMPANY_SIZES = ['20人以下', '20-50人', '50-100人', '100-500人', '500人以上'];

// 跟进方式
const FOLLOWUP_TYPES = ['phone', 'visit', 'email', 'wechat'];

// 销售机会阶段
const OPPORTUNITY_STAGES = ['initial', 'qualification', 'proposal', 'negotiation', 'closed_won', 'closed_lost'];

// 输单原因
const LOST_REASONS = ['price', 'competitor', 'budget', 'timing', 'no_need', 'other'];

// 用户状态
const USER_STATUS = {
  DISABLED: 0,
  ENABLED: 1
};

// 角色代码
const ROLE_CODES = {
  ADMIN: 'admin',
  MANAGER: 'manager',
  SALES: 'sales'
};

// 分页限制
const PAGINATION = {
  DEFAULT_PAGE: 1,
  DEFAULT_PAGE_SIZE: 10,
  MAX_PAGE_SIZE: 100 // 从10000降低到100
};

// 通知类型
const NOTIFICATION_TYPES = ['system', 'customer', 'opportunity', 'followup', 'task'];

module.exports = {
  CUSTOMER_SOURCES,
  CUSTOMER_LEVELS,
  CUSTOMER_STAGES,
  COMPANY_SIZES,
  FOLLOWUP_TYPES,
  OPPORTUNITY_STAGES,
  LOST_REASONS,
  USER_STATUS,
  ROLE_CODES,
  PAGINATION,
  NOTIFICATION_TYPES
};
