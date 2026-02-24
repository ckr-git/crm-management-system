/**
 * 数据分析API
 */
import request from '@/utils/request'

// 客户来源分析

/**
 * 获取客户来源统计
 */
export function getSourceStats(params?: any) {
  return request({
    url: '/analysis/source-stats',
    method: 'get',
    params
  })
}

/**
 * 获取客户来源趋势
 */
export function getSourceTrend(params?: any) {
  return request({
    url: '/analysis/source-trend',
    method: 'get',
    params
  })
}

/**
 * 获取来源转化率统计
 */
export function getSourceConversion(params?: any) {
  return request({
    url: '/analysis/source-conversion',
    method: 'get',
    params
  })
}

// 客户行业分析

/**
 * 获取客户行业统计
 */
export function getIndustryStats(params?: any) {
  return request({
    url: '/analysis/industry-stats',
    method: 'get',
    params
  })
}

/**
 * 获取行业对比分析
 */
export function getIndustryComparison(params?: any) {
  return request({
    url: '/analysis/industry-comparison',
    method: 'get',
    params
  })
}

// 销售行为分析

/**
 * 获取销售行为统计
 */
export function getBehaviorStats(params?: any) {
  return request({
    url: '/analysis/behavior-stats',
    method: 'get',
    params
  })
}

/**
 * 获取销售人员绩效对比
 */
export function getUserPerformance(params?: any) {
  return request({
    url: '/analysis/user-performance',
    method: 'get',
    params
  })
}
