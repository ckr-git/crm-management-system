import request from '@/utils/request'

// 用户管理

/**
 * 获取用户列表
 */
export function getUserList(params: any) {
  return request({
    url: '/users',
    method: 'get',
    params
  })
}

/**
 * 获取可用用户列表（下拉选择）
 */
export function getAvailableUsers() {
  return request({
    url: '/users/available',
    method: 'get'
  })
}

/**
 * 获取用户详情
 */
export function getUserDetail(id: number) {
  return request({
    url: `/users/${id}`,
    method: 'get'
  })
}

/**
 * 创建用户
 */
export function createUser(data: any) {
  return request({
    url: '/users',
    method: 'post',
    data
  })
}

/**
 * 更新用户
 */
export function updateUser(id: number, data: any) {
  return request({
    url: `/users/${id}`,
    method: 'put',
    data
  })
}

/**
 * 删除用户
 */
export function deleteUser(id: number) {
  return request({
    url: `/users/${id}`,
    method: 'delete'
  })
}

/**
 * 启用/禁用用户
 */
export function updateUserStatus(id: number, status: number) {
  return request({
    url: `/users/${id}/status`,
    method: 'put',
    data: { status }
  })
}

/**
 * 重置密码
 */
export function resetPassword(id: number, new_password: string) {
  return request({
    url: `/users/${id}/reset-password`,
    method: 'put',
    data: { new_password }
  })
}

// 角色管理

/**
 * 获取角色列表
 */
export function getRoleList() {
  return request({
    url: '/roles',
    method: 'get'
  })
}

/**
 * 获取角色详情
 */
export function getRoleDetail(id: number) {
  return request({
    url: `/roles/${id}`,
    method: 'get'
  })
}

/**
 * 创建角色
 */
export function createRole(data: any) {
  return request({
    url: '/roles',
    method: 'post',
    data
  })
}

/**
 * 更新角色
 */
export function updateRole(id: number, data: any) {
  return request({
    url: `/roles/${id}`,
    method: 'put',
    data
  })
}

/**
 * 删除角色
 */
export function deleteRole(id: number) {
  return request({
    url: `/roles/${id}`,
    method: 'delete'
  })
}

// 权限管理

/**
 * 获取权限列表（树形结构）
 */
export function getPermissionList() {
  return request({
    url: '/permissions',
    method: 'get'
  })
}

/**
 * 获取角色权限
 */
export function getRolePermissions(id: number) {
  return request({
    url: `/permissions/role/${id}`,
    method: 'get'
  })
}

/**
 * 更新角色权限
 */
export function updateRolePermissions(id: number, permission_ids: number[]) {
  return request({
    url: `/permissions/role/${id}`,
    method: 'put',
    data: { permission_ids }
  })
}

// 操作日志管理

/**
 * 获取操作日志列表
 */
export function getOperationLogs(params: any) {
  return request({
    url: '/logs',
    method: 'get',
    params
  })
}

/**
 * 获取日志详情
 */
export function getLogDetail(id: number) {
  return request({
    url: `/logs/${id}`,
    method: 'get'
  })
}

/**
 * 导出操作日志
 */
export function exportLogs(params: any) {
  return request({
    url: '/logs/export/excel',
    method: 'get',
    params,
    responseType: 'blob'
  })
}
