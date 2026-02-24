import request from '@/utils/request'

/**
 * 获取跟进记录列表
 */
export function getFollowupList(params: any) {
  return request({
    url: '/followups',
    method: 'get',
    params
  })
}

/**
 * 创建跟进记录
 */
export function createFollowup(data: any) {
  return request({
    url: '/followups',
    method: 'post',
    data
  })
}

/**
 * 获取跟进记录详情
 */
export function getFollowupDetail(id: number) {
  return request({
    url: `/followups/${id}`,
    method: 'get'
  })
}

/**
 * 更新跟进记录
 */
export function updateFollowup(id: number, data: any) {
  return request({
    url: `/followups/${id}`,
    method: 'put',
    data
  })
}

/**
 * 删除跟进记录
 */
export function deleteFollowup(id: number) {
  return request({
    url: `/followups/${id}`,
    method: 'delete'
  })
}

/**
 * 获取客户的跟进记录统计
 */
export function getFollowupStats(customer_id: number) {
  return request({
    url: '/followups/stats',
    method: 'get',
    params: { customer_id }
  })
}

/**
 * 获取跟进提醒列表
 */
export function getFollowupReminders() {
  return request({
    url: '/followups/reminders',
    method: 'get'
  })
}

/**
 * 获取逾期未跟进列表
 */
export function getOverdueFollowups() {
  return request({
    url: '/followups/overdue',
    method: 'get'
  })
}

/**
 * 获取个人跟进统计
 */
export function getUserFollowupStats(params?: any) {
  return request({
    url: '/followups/stats/user',
    method: 'get',
    params
  })
}

/**
 * 获取团队跟进统计
 */
export function getTeamFollowupStats(params?: any) {
  return request({
    url: '/followups/stats/team',
    method: 'get',
    params
  })
}

/**
 * 导出跟进记录
 */
export function exportFollowups(params?: any) {
  return request({
    url: '/followups/export',
    method: 'get',
    params,
    responseType: 'blob'
  })
}

/**
 * 下载跟进导入模板
 */
export function downloadFollowupTemplate() {
  return request({
    url: '/followups/template',
    method: 'get',
    responseType: 'blob'
  })
}

/**
 * 批量导入跟进记录
 */
export function importFollowups(file: File) {
  const formData = new FormData()
  formData.append('file', file)
  return request({
    url: '/followups/import',
    method: 'post',
    data: formData,
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  })
}
