/**
 * 权限指令
 * 用法: v-permission="['customer:create']"
 */
import type { Directive, DirectiveBinding } from 'vue'
import { useUserStore } from '@/stores/user'

/**
 * 检查是否有权限
 * 从userStore获取用户权限列表进行检查
 */
function checkPermission(value: string | string[]): boolean {
  if (!value || (Array.isArray(value) && value.length === 0)) {
    return true
  }

  const userStore = useUserStore()
  const permissions = Array.isArray(value) ? value : [value]
  
  // 管理员拥有所有权限
  if (userStore.isAdmin) {
    return true
  }
  
  // 检查是否拥有任意一个权限
  return permissions.some(permission => userStore.permissions.includes(permission))
}

/**
 * 权限指令
 */
export const permission: Directive = {
  mounted(el: HTMLElement, binding: DirectiveBinding) {
    const { value } = binding

    if (!checkPermission(value)) {
      // 移除元素（无权限时隐藏按钮）
      el.parentNode?.removeChild(el)
    }
  },
  
  updated(el: HTMLElement, binding: DirectiveBinding) {
    const { value } = binding
    
    if (!checkPermission(value)) {
      // 如果元素还在DOM中，移除它
      if (el.parentNode) {
        el.parentNode.removeChild(el)
      }
    }
  }
}

/**
 * 权限检查函数（用于JS代码中）
 * @param permissions - 权限代码，字符串或数组
 * @returns 是否拥有权限（满足任意一个即可）
 */
export function hasPermission(permissions: string | string[]): boolean {
  const userStore = useUserStore()
  return userStore.hasPermission(permissions)
}

/**
 * 权限检查函数（需要所有权限）
 * @param permissions - 权限代码数组
 * @returns 是否拥有所有权限
 */
export function hasAllPermissions(permissions: string[]): boolean {
  const userStore = useUserStore()
  return userStore.hasAllPermissions(permissions)
}
