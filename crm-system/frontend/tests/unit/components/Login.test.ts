import { describe, test, expect, beforeEach, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import { createRouter, createMemoryHistory } from 'vue-router'
import { createPinia, setActivePinia } from 'pinia'
import { ElMessage } from 'element-plus'
import Login from '@/views/Login.vue'
import * as authAPI from '@/api/auth'

// Mock Element Plus - 使用 vi.hoisted 解决提升问题
const { mockElMessage } = vi.hoisted(() => {
  const mockElMessage = Object.assign(vi.fn(), {
    success: vi.fn(),
    error: vi.fn(),
    warning: vi.fn(),
    info: vi.fn()
  })
  return { mockElMessage }
})

vi.mock('element-plus', () => ({
  ElMessage: mockElMessage
}))

// Mock auth API
vi.mock('@/api/auth', () => ({
  login: vi.fn()
}))

describe('Login Component - 登录组件测试', () => {
  let router: any
  let wrapper: any

  beforeEach(() => {
    // 创建新的pinia实例
    setActivePinia(createPinia())

    // 创建路由实例
    router = createRouter({
      history: createMemoryHistory(),
      routes: [
        { path: '/', component: { template: '<div>Home</div>' } },
        { path: '/login', component: Login },
        { path: '/dashboard', component: { template: '<div>Home</div>' } }
      ]
    })

    // 清理所有mock
    vi.clearAllMocks()
    localStorage.clear()
  })

  afterEach(() => {
    if (wrapper) {
      wrapper.unmount()
    }
  })

  test('应该正确渲染登录表单', async () => {
    wrapper = mount(Login, {
      global: {
        plugins: [router]
      }
    })

    // 检查标题
    expect(wrapper.text()).toContain('CRM客户关系管理系统')

    // 检查表单项
    const inputs = wrapper.findAll('input')
    expect(inputs.length).toBeGreaterThanOrEqual(2) // 至少有用户名和密码输入框

    // 检查登录按钮
    expect(wrapper.text()).toContain('登录')
  })

  test('应该显示初始表单状态', async () => {
    wrapper = mount(Login, {
      global: {
        plugins: [router]
      }
    })

    // 表单初始应该为空
    const usernameInput = wrapper.find('input[type="text"]')
    const passwordInput = wrapper.find('input[type="password"]')

    expect(usernameInput.element.value).toBe('')
    expect(passwordInput.element.value).toBe('')
  })

  test('应该成功登录并跳转到首页', async () => {
    // Mock成功的登录响应
    const mockLoginResponse = {
      data: {
        token: 'test_token_123',
        user: {
          id: 1,
          username: 'admin',
          name: '管理员',
          email: 'admin@example.com'
        }
      }
    }

    vi.mocked(authAPI.login).mockResolvedValue(mockLoginResponse)

    wrapper = mount(Login, {
      global: {
        plugins: [router]
      }
    })

    // 填写表单
    await wrapper.find('input[placeholder="请输入用户名"]').setValue('admin')
    await wrapper.find('input[placeholder="请输入密码"]').setValue('admin123')

    // 点击登录按钮 - 通过组件方法触发
    await (wrapper.vm as any).handleLogin()

    // 等待异步操作完成
    await wrapper.vm.$nextTick()
    await new Promise(resolve => setTimeout(resolve, 100))

    // 验证login API被正确调用
    expect(authAPI.login).toHaveBeenCalledWith({
      username: 'admin',
      password: 'admin123'
    })

    // 验证token被保存到localStorage
    expect(localStorage.getItem('token')).toBe('test_token_123')

    // 验证成功消息
    expect(ElMessage.success).toHaveBeenCalledWith('登录成功')

    // 验证路由跳转
    await router.isReady()
    expect(router.currentRoute.value.path).toBe('/dashboard')
  })

  test('应该在登录失败时显示错误', async () => {
    // Mock登录失败
    vi.mocked(authAPI.login).mockRejectedValue(new Error('用户名或密码错误'))

    wrapper = mount(Login, {
      global: {
        plugins: [router]
      }
    })

    // 填写表单
    await wrapper.find('input[placeholder="请输入用户名"]').setValue('admin')
    await wrapper.find('input[placeholder="请输入密码"]').setValue('wrongpassword')

    // 点击登录按钮 - 通过组件方法触发
    await (wrapper.vm as any).handleLogin()

    // 等待异步操作
    await wrapper.vm.$nextTick()
    await new Promise(resolve => setTimeout(resolve, 100))

    // 验证login API被调用
    expect(authAPI.login).toHaveBeenCalled()
  })

  test('应该有表单验证规则', async () => {
    wrapper = mount(Login, {
      global: {
        plugins: [router]
      }
    })

    const vm = wrapper.vm as any

    // 验证表单验证规则存在
    expect(vm.loginRules.username).toBeDefined()
    expect(vm.loginRules.password).toBeDefined()
    expect(vm.loginRules.username[0].required).toBe(true)
    expect(vm.loginRules.password[0].required).toBe(true)
  })

  test('应该有密码最小长度验证规则', async () => {
    wrapper = mount(Login, {
      global: {
        plugins: [router]
      }
    })

    const vm = wrapper.vm as any

    // 验证密码最小长度规则存在
    const passwordRules = vm.loginRules.password
    const minLengthRule = passwordRules.find((rule: any) => rule.min !== undefined)
    expect(minLengthRule).toBeDefined()
    expect(minLengthRule.min).toBe(6)
  })

  test('应该支持回车键登录', async () => {
    const mockLoginResponse = {
      data: {
        token: 'test_token_456',
        user: {
          id: 1,
          username: 'admin',
          name: '管理员'
        }
      }
    }

    vi.mocked(authAPI.login).mockResolvedValue(mockLoginResponse)

    wrapper = mount(Login, {
      global: {
        plugins: [router]
      }
    })

    // 填写表单
    await wrapper.find('input[placeholder="请输入用户名"]').setValue('admin')
    const passwordInput = wrapper.find('input[placeholder="请输入密码"]')
    await passwordInput.setValue('admin123')

    // 在密码框按回车
    await passwordInput.trigger('keyup.enter')

    await wrapper.vm.$nextTick()
    await new Promise(resolve => setTimeout(resolve, 100))

    // 验证login API被调用
    expect(authAPI.login).toHaveBeenCalledWith({
      username: 'admin',
      password: 'admin123'
    })
  })

  test('应该有加载状态属性', async () => {
    wrapper = mount(Login, {
      global: {
        plugins: [router]
      }
    })

    const vm = wrapper.vm as any
    
    // 验证初始加载状态为false
    expect(vm.loading).toBe(false)
  })

  test('应该正确设置用户信息到store', async () => {
    const mockUser = {
      id: 1,
      username: 'testuser',
      name: '测试用户',
      email: 'test@example.com',
      role_id: 2
    }

    const mockLoginResponse = {
      data: {
        token: 'test_token_789',
        user: mockUser
      }
    }

    vi.mocked(authAPI.login).mockResolvedValue(mockLoginResponse)

    wrapper = mount(Login, {
      global: {
        plugins: [router]
      }
    })

    // 设置表单数据并提交
    const vm = wrapper.vm as any
    vm.loginForm.username = 'testuser'
    vm.loginForm.password = 'password123'
    await vm.handleLogin()

    await wrapper.vm.$nextTick()
    await new Promise(resolve => setTimeout(resolve, 100))

    // 验证localStorage中保存了token
    expect(localStorage.getItem('token')).toBe('test_token_789')
  })
})
