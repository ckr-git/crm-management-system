import request from '@/utils/request'

/**
 * 获取公海池列表
 */
export function getPoolList(params: any) {
  return request({
    url: '/customer-pool',
    method: 'get',
    params
  })
}

/**
 * 释放客户到公海
 */
export function releaseToPool(data: any) {
  return request({
    url: '/customer-pool/release',
    method: 'post',
    data
  })
}

/**
 * 从公海领取客户
 */
export function claimFromPool(id: number) {
  return request({
    url: `/customer-pool/${id}/claim`,
    method: 'post'
  })
}

/**
 * 获取公海池统计
 */
export function getPoolStats() {
  return request({
    url: '/customer-pool/stats',
    method: 'get'
  })
}

/**
 * 获取公海池详情
 */
export function getPoolDetail(id: number) {
  return request({
    url: `/customer-pool/${id}`,
    method: 'get'
  })
}
