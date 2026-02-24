import { config } from '@vue/test-utils'
import ElementPlus from 'element-plus'
import * as ElementPlusIconsVue from '@element-plus/icons-vue'
import { createPinia } from 'pinia'
import { vi } from 'vitest'
import { h, defineComponent } from 'vue'

// 创建图标 stub 组件
const createIconStub = (name: string) => defineComponent({
  name,
  render() {
    return h('i', { class: `el-icon-${name.toLowerCase()}` })
  }
})

// 生成所有图标的 stubs
const iconStubs: Record<string, any> = {}
for (const [key] of Object.entries(ElementPlusIconsVue)) {
  iconStubs[key] = createIconStub(key)
}

// 全局注册Element Plus 和 图标组件
config.global.plugins = [ElementPlus, createPinia()]
config.global.stubs = {
  ...iconStubs,
  // 添加常用图标组件的显式 stub
  Download: true,
  Upload: true,
  Switch: true,
  Delete: true,
  Plus: true,
  Search: true,
  RefreshRight: true,
  User: true,
  Lock: true,
  Odometer: true,
  Grid: true,
  ChatDotRound: true,
  Collection: true,
  TrendCharts: true,
  Setting: true,
  ArrowDown: true,
  Opportunity: true,
}

// Mock window.matchMedia
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn().mockImplementation((query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
})

// Mock localStorage with actual storage functionality
let storage: Record<string, string> = {}
const localStorageMock = {
  getItem: vi.fn((key: string) => storage[key] ?? null),
  setItem: vi.fn((key: string, value: string) => { storage[key] = value }),
  removeItem: vi.fn((key: string) => { delete storage[key] }),
  clear: vi.fn(() => { storage = {} }),
}
Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
})

// Reset storage before each test
import { beforeEach } from 'vitest'
beforeEach(() => {
  storage = {}
  vi.clearAllMocks()
})

// Mock ResizeObserver
global.ResizeObserver = vi.fn().mockImplementation(() => ({
  observe: vi.fn(),
  unobserve: vi.fn(),
  disconnect: vi.fn(),
}))
