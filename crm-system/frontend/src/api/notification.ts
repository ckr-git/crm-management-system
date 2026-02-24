/**
 * 消息通知API
 */
import request from '@/utils/request'

/**
 * 获取通知列表
 */
export function getNotifications(params?: any) {
  return request({
    url: '/notifications',
    method: 'get',
    params
  })
}

/**
 * 获取未读消息数量
 */
export function getUnreadCount() {
  return request({
    url: '/notifications/unread-count',
    method: 'get'
  })
}

/**
 * 标记消息为已读
 */
export function markAsRead(id: number) {
  return request({
    url: `/notifications/${id}/read`,
    method: 'put'
  })
}

/**
 * 全部标记为已读
 */
export function markAllAsRead() {
  return request({
    url: '/notifications/read-all',
    method: 'put'
  })
}

/**
 * 删除通知
 */
export function deleteNotification(id: number) {
  return request({
    url: `/notifications/${id}`,
    method: 'delete'
  })
}

/**
 * 发送通知
 */
export function sendNotification(data: any) {
  return request({
    url: '/notifications',
    method: 'post',
    data
  })
}
