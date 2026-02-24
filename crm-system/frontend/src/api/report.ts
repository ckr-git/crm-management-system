/**
 * 报表API
 */
import request from '@/utils/request'

/**
 * 获取综合报表
 */
export function getComprehensiveReport(params?: any) {
  return request({
    url: '/reports/comprehensive',
    method: 'get',
    params
  })
}

/**
 * 导出Excel报表
 */
export function exportExcelReport(params?: any) {
  return request({
    url: '/reports/export-excel',
    method: 'get',
    params,
    responseType: 'blob'
  })
}
