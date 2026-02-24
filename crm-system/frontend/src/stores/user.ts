import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { UserInfo } from '@/types'

export const useUserStore = defineStore('user', () => {
  // 状态
  const token = ref<string>(localStorage.getItem('token') || '')
  const userInfo = ref<UserInfo | null>(null)
  const permissions = ref<string[]>([])
  
  // 计算属性：是否为管理员
  const isAdmin = computed(() => {
    return userInfo.value?.role?.code === 'admin'
  })
  
  // 设置token
  const setToken = (newToken: string) => {
    token.value = newToken
    localStorage.setItem('token', newToken)
  }
  
  // 设置用户信息
  const setUserInfo = (info: UserInfo) => {
    userInfo.value = info
    // 同时设置权限
    if (info?.permissions) {
      permissions.value = info.permissions
    }
  }
  
  // 设置权限列表
  const setPermissions = (perms: string[]) => {
    permissions.value = perms
  }
  
  // 检查是否拥有某个权限
  const hasPermission = (permission: string | string[]): boolean => {
    // 管理员拥有所有权限
    if (isAdmin.value) {
      return true
    }
    
    if (Array.isArray(permission)) {
      // 检查是否拥有任意一个权限
      return permission.some(p => permissions.value.includes(p))
    }
    
    return permissions.value.includes(permission)
  }
  
  // 检查是否拥有所有权限
  const hasAllPermissions = (perms: string[]): boolean => {
    // 管理员拥有所有权限
    if (isAdmin.value) {
      return true
    }
    
    return perms.every(p => permissions.value.includes(p))
  }
  
  // 刷新权限
  const refreshPermissions = async () => {
    try {
      const { refreshPermissions: refreshAPI } = await import('@/api/auth')
      const res = await refreshAPI()
      if (res.data?.permissions) {
        permissions.value = res.data.permissions
        return true
      }
      return false
    } catch (error) {
      console.error('刷新权限失败:', error)
      return false
    }
  }
  
  // 登出
  const logout = () => {
    token.value = ''
    userInfo.value = null
    permissions.value = []
    localStorage.removeItem('token')
  }
  
  return {
    token,
    userInfo,
    permissions,
    isAdmin,
    setToken,
    setUserInfo,
    setPermissions,
    hasPermission,
    hasAllPermissions,
    refreshPermissions,
    logout
  }
})
