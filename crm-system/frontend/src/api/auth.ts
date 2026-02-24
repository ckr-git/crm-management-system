import request from '@/utils/request'

/**
 * 用户登录
 */
export function login(data: { username: string; password: string }) {
  return request({
    url: '/auth/login',
    method: 'post',
    data
  })
}

/**
 * 获取用户信息
 */
export function getUserInfo() {
  return request({
    url: '/auth/userinfo',
    method: 'get'
  })
}

/**
 * 用户登出
 */
export function logout() {
  return request({
    url: '/auth/logout',
    method: 'post'
  })
}

/**
 * 刷新用户权限
 */
export function refreshPermissions() {
  return request({
    url: '/auth/refresh-permissions',
    method: 'get'
  })
}
