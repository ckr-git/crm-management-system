import { describe, test, expect, beforeEach, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import { useUserStore } from '@/stores/user'

describe('User Store - 用户状态管理测试', () => {
  beforeEach(() => {
    // 创建一个新的pinia实例
    setActivePinia(createPinia())
    // 清理localStorage
    localStorage.clear()
  })

  test('应该初始化空的用户信息', () => {
    const store = useUserStore()

    expect(store.token).toBe('')
    expect(store.userInfo).toBeNull()
  })

  test('应该从localStorage加载token', () => {
    localStorage.setItem('token', 'test_token_123')

    const store = useUserStore()

    expect(store.token).toBe('test_token_123')
  })

  test('setToken应该设置token并保存到localStorage', () => {
    const store = useUserStore()
    const newToken = 'new_token_456'

    store.setToken(newToken)

    expect(store.token).toBe(newToken)
    expect(localStorage.getItem('token')).toBe(newToken)
  })

  test('setUserInfo应该设置用户信息', () => {
    const store = useUserStore()
    const userInfo = {
      id: 1,
      username: 'testuser',
      name: '测试用户',
      email: 'test@example.com'
    }

    store.setUserInfo(userInfo)

    expect(store.userInfo).toEqual(userInfo)
    expect(store.userInfo.username).toBe('testuser')
    expect(store.userInfo.name).toBe('测试用户')
  })

  test('logout应该清除所有用户数据', () => {
    const store = useUserStore()

    // 先设置数据
    store.setToken('test_token')
    store.setUserInfo({ id: 1, username: 'test' })

    // 登出
    store.logout()

    expect(store.token).toBe('')
    expect(store.userInfo).toBeNull()
    expect(localStorage.getItem('token')).toBeNull()
  })

  test('应该能连续设置和清除token', () => {
    const store = useUserStore()

    store.setToken('token1')
    expect(store.token).toBe('token1')

    store.setToken('token2')
    expect(store.token).toBe('token2')

    store.logout()
    expect(store.token).toBe('')
  })
})
