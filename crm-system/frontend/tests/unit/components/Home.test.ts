import { describe, test, expect, beforeEach, vi } from 'vitest'
import { mount, flushPromises } from '@vue/test-utils'
import { createRouter, createMemoryHistory } from 'vue-router'
import { createPinia, setActivePinia } from 'pinia'
import { ElMessageBox, ElMessage } from 'element-plus'
import Home from '@/views/Home.vue'
import { useUserStore } from '@/stores/user'

// Mock Element Plus
vi.mock('element-plus', () => ({
  ElMessageBox: {
    confirm: vi.fn()
  },
  ElMessage: {
    success: vi.fn(),
    info: vi.fn()
  }
}))

describe('Home Component - 首页组件测试', () => {
  let router: any
  let wrapper: any
  let userStore: any

  beforeEach(() => {
    // 创建新的pinia实例
    setActivePinia(createPinia())
    userStore = useUserStore()

    // 设置测试用户
    userStore.setToken('test_token')
    userStore.setUserInfo({
      id: 1,
      username: 'admin',
      name: '管理员',
      email: 'admin@example.com'
    })

    // 创建路由实例
    router = createRouter({
      history: createMemoryHistory(),
      routes: [
        { path: '/', redirect: '/dashboard' },
        { path: '/dashboard', component: Home },
        { path: '/login', component: { template: '<div>Login</div>' } },
        { path: '/customers', component: { template: '<div>Customers</div>' } },
        { path: '/opportunities', component: { template: '<div>Opportunities</div>' } },
        { path: '/opportunity-kanban', component: { template: '<div>Kanban</div>' } },
        { path: '/followups', component: { template: '<div>Followups</div>' } },
        { path: '/customer-pool', component: { template: '<div>Pool</div>' } },
        { path: '/opportunity-analysis', component: { template: '<div>Analysis</div>' } },
        { path: '/followup-stats', component: { template: '<div>Stats</div>' } },
        { path: '/system/users', component: { template: '<div>Users</div>' } },
        { path: '/system/roles', component: { template: '<div>Roles</div>' } },
        { path: '/system/logs', component: { template: '<div>Logs</div>' } },
        { path: '/system/settings', component: { template: '<div>Settings</div>' } }
      ]
    })

    // 清理mock
    vi.clearAllMocks()
  })

  afterEach(() => {
    if (wrapper) {
      wrapper.unmount()
    }
  })

  test('应该正确渲染首页布局', async () => {
    wrapper = mount(Home, {
      global: {
        plugins: [router]
      }
    })

    // 检查标题
    expect(wrapper.text()).toContain('CRM客户关系管理系统')
  })

  test('应该显示用户名', async () => {
    wrapper = mount(Home, {
      global: {
        plugins: [router]
      }
    })

    // 应该显示用户名称
    expect(wrapper.text()).toContain('管理员')
  })

  test('应该显示菜单项', async () => {
    wrapper = mount(Home, {
      global: {
        plugins: [router]
      }
    })

    // 检查菜单项
    expect(wrapper.text()).toContain('数据概览')
    expect(wrapper.text()).toContain('客户管理')
    expect(wrapper.text()).toContain('商机管理')
    expect(wrapper.text()).toContain('商机看板')
  })

  test('应该显示完整的菜单项', async () => {
    wrapper = mount(Home, {
      global: {
        plugins: [router]
      }
    })

    // 检查主要菜单项
    expect(wrapper.text()).toContain('数据概览')
    expect(wrapper.text()).toContain('客户管理')
    expect(wrapper.text()).toContain('商机管理')
    expect(wrapper.text()).toContain('商机看板')
    expect(wrapper.text()).toContain('跟进记录')
    expect(wrapper.text()).toContain('客户池')
    // 检查子菜单标题
    expect(wrapper.text()).toContain('商机分析')
    expect(wrapper.text()).toContain('跟进统计')
  })

  test('应该支持客户页路由跳转', async () => {
    wrapper = mount(Home, {
      global: {
        plugins: [router]
      }
    })

    await router.push('/dashboard')
    await router.isReady()
    await router.push('/customers')

    await wrapper.vm.$nextTick()
    expect(router.currentRoute.value.path).toBe('/customers')
  })

  test('应该触发退出登录确认对话框', async () => {
    // Mock确认对话框 - 返回 Promise
    const confirmPromise = Promise.resolve('confirm')
    vi.mocked(ElMessageBox.confirm).mockReturnValue(confirmPromise as any)

    wrapper = mount(Home, {
      global: {
        plugins: [router]
      }
    })

    await router.push('/dashboard')
    await router.isReady()

    // 触发退出登录
    const component = wrapper.vm as any
    component.handleCommand('logout')

    // 等待 Promise 和异步操作完成
    await confirmPromise
    await flushPromises()
    await wrapper.vm.$nextTick()

    // 验证确认对话框被调用
    expect(ElMessageBox.confirm).toHaveBeenCalledWith(
      '确定要退出登录吗？',
      '提示',
      expect.objectContaining({
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      })
    )
  })

  test('应该处理取消退出登录', async () => {
    // Mock取消对话框
    vi.mocked(ElMessageBox.confirm).mockRejectedValue('cancel')

    wrapper = mount(Home, {
      global: {
        plugins: [router]
      }
    })

    await router.push('/dashboard')
    await router.isReady()

    // 触发退出登录
    const component = wrapper.vm as any
    await component.handleCommand('logout')

    await wrapper.vm.$nextTick()
    await new Promise(resolve => setTimeout(resolve, 50))

    // 验证用户信息未被清除
    expect(userStore.token).toBe('test_token')
    expect(userStore.userInfo).toBeDefined()

    // 验证仍在首页
    expect(router.currentRoute.value.path).toBe('/dashboard')
  })

  test('应该处理个人中心菜单', async () => {
    wrapper = mount(Home, {
      global: {
        plugins: [router]
      }
    })

    await router.push('/dashboard')
    await router.isReady()

    const component = wrapper.vm as any
    await component.handleCommand('profile')

    await wrapper.vm.$nextTick()
    await new Promise(resolve => setTimeout(resolve, 50))

    // 验证路由跳转到个人设置页面
    expect(router.currentRoute.value.path).toBe('/system/settings')
    expect(router.currentRoute.value.query.tab).toBe('user')
  })

  test('应该处理系统设置菜单', async () => {
    wrapper = mount(Home, {
      global: {
        plugins: [router]
      }
    })

    await router.push('/dashboard')
    await router.isReady()

    const component = wrapper.vm as any
    await component.handleCommand('setting')

    await wrapper.vm.$nextTick()
    await new Promise(resolve => setTimeout(resolve, 50))

    // 验证路由跳转到系统设置页面
    expect(router.currentRoute.value.path).toBe('/system/settings')
  })

  test('应该支持核心页面路由切换', async () => {
    wrapper = mount(Home, {
      global: {
        plugins: [router]
      }
    })

    await router.push('/dashboard')
    await router.isReady()

    const testCases = [
      '/dashboard',
      '/customers',
      '/opportunities',
      '/opportunity-kanban',
      '/followups',
      '/customer-pool',
      '/opportunity-analysis',
      '/followup-stats',
      '/system/users',
      '/system/roles',
      '/system/logs'
    ]

    for (const path of testCases) {
      await router.push(path)
      await wrapper.vm.$nextTick()
      expect(router.currentRoute.value.path).toBe(path)
    }
  })

  test('应该在未登录时显示默认用户名', async () => {
    // 清除用户信息
    userStore.logout()

    wrapper = mount(Home, {
      global: {
        plugins: [router]
      }
    })

    // 应该显示默认用户名
    expect(wrapper.text()).toContain('管理员')
  })

  test('应该显示用户名称', async () => {
    wrapper = mount(Home, {
      global: {
        plugins: [router]
      }
    })

    // 检查用户名称显示
    expect(wrapper.text()).toContain('管理员')
  })
})
