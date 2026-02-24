/**
 * 字典映射 - 将数据库英文值转换为中文显示
 * 与 backend/database/init.sql 中的 dictionaries 表保持一致
 */

export const customerSourceMap: Record<string, string> = {
  website: '网站咨询',
  phone: '电话咨询',
  exhibition: '展会活动',
  referral: '老客户转介绍',
  advertisement: '广告投放',
  other: '其他',
}

export const customerStageMap: Record<string, string> = {
  potential: '潜在客户',
  intention: '意向客户',
  quotation: '报价中',
  negotiation: '谈判中',
  deal: '成交客户',
}

export const customerLevelMap: Record<string, string> = {
  normal: '普通客户',
  important: '重要客户',
  vip: 'VIP客户',
}

export const industryMap: Record<string, string> = {
  it: 'IT互联网',
  manufacturing: '制造业',
  finance: '金融服务',
  education: '教育培训',
  healthcare: '医疗健康',
  realestate: '房地产',
  other: '其他',
}

export const companySizeMap: Record<string, string> = {
  '1-20': '1-20人',
  '21-50': '21-50人',
  '51-100': '51-100人',
  '101-500': '101-500人',
  '500+': '500人以上',
}

export const followupTypeMap: Record<string, string> = {
  phone: '电话',
  visit: '拜访',
  email: '邮件',
  wechat: '微信',
  other: '其他',
}

/** 通用映射函数 */
export function mapLabel(map: Record<string, string>, value: string | null | undefined): string {
  if (!value) return '-'
  return map[value] || value
}
