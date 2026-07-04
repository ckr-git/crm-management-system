import type { Meta, StoryObj } from '@storybook/vue3'
import { setup } from '@storybook/vue3'
import MobileMenu from './MobileMenu.vue'
import { createPinia } from 'pinia'
import { createRouter, createWebHashHistory } from 'vue-router'

// 创建模拟的路由器
const mockRouter = createRouter({
  history: createWebHashHistory(),
  routes: [
    { path: '/', redirect: '/dashboard' },
    { path: '/dashboard', component: { template: '<div>首页</div>' } },
    { path: '/customers', component: { template: '<div>客户列表</div>' } },
    { path: '/opportunities', component: { template: '<div>销售机会</div>' } },
    { path: '/followups', component: { template: '<div>跟进记录</div>' } },
    { path: '/customer-pool', component: { template: '<div>公海池</div>' } },
    { path: '/analysis/source', component: { template: '<div>来源分析</div>' } },
    { path: '/analysis/industry', component: { template: '<div>行业分析</div>' } },
    { path: '/analysis/behavior', component: { template: '<div>行为分析</div>' } },
    { path: '/analysis/reports', component: { template: '<div>报表中心</div>' } },
    { path: '/system/users', component: { template: '<div>用户管理</div>' } },
    { path: '/system/roles', component: { template: '<div>角色管理</div>' } },
    { path: '/system/logs', component: { template: '<div>操作日志</div>' } },
    { path: '/system/notifications', component: { template: '<div>消息中心</div>' } },
  ]
})

const pinia = createPinia()

setup((app) => {
  app.use(pinia)
  app.use(mockRouter)
})

void mockRouter.push('/dashboard')

const meta: Meta<typeof MobileMenu> = {
  title: 'Mobile/MobileMenu',
  component: MobileMenu,
  parameters: {
    layout: 'fullscreen',
    viewport: { defaultViewport: 'mobile' },
  },
  decorators: [
    (story) => ({
      components: { story },
      setup() {
        return {}
      },
      template: `
        <div id="app">
          <div style="height: 100vh; background: #f5f7fa;">
            <story />
            <div style="margin-top: 50px; margin-bottom: 56px; padding: 20px;">
              <div style="background: white; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
                <h3>页面内容区域</h3>
                <p>这里是页面的主要内容区域，上方是固定的顶部导航，下方是底部标签栏。</p>
                <p>点击左上角的菜单按钮可以打开侧边抽屉菜单。</p>
              </div>
              <div style="background: white; padding: 20px; border-radius: 8px;">
                <h4>功能演示</h4>
                <p>• 点击菜单按钮展开侧边菜单</p>
                <p>• 点击底部标签页切换页面</p>
                <p>• 点击头像查看用户菜单</p>
              </div>
            </div>
          </div>
        </div>
      `,
    }),
  ],
  tags: ['autodocs'],
}

export default meta
type Story = StoryObj<typeof MobileMenu>

export const Default: Story = {
  name: '默认状态',
}

export const HomeTab: Story = {
  name: '首页标签激活',
  parameters: {
    docs: {
      description: {
        story: '首页标签处于激活状态，显示当前在首页。'
      }
    }
  },
}

export const CustomerTab: Story = {
  name: '客户标签激活',
  parameters: {
    docs: {
      description: {
        story: '客户标签处于激活状态，用户当前在客户管理页面。'
      }
    }
  },
}

export const OpportunityTab: Story = {
  name: '机会标签激活',
  parameters: {
    docs: {
      description: {
        story: '销售机会标签激活，用户在查看销售机会相关内容。'
      }
    }
  },
}

export const FollowupTab: Story = {
  name: '跟进标签激活',
  parameters: {
    docs: {
      description: {
        story: '跟进记录标签激活，用户在查看跟进相关功能。'
      }
    }
  },
}

// 用于展示菜单打开状态
export const MenuOpened: Story = {
  name: '菜单展开状态',
  render: () => ({
    components: { MobileMenu },
    setup() {
      return {}
    },
    template: `
      <div id="app">
        <div style="height: 100vh; background: #f5f7fa;">
          <MobileMenu />
          <div style="margin-top: 50px; margin-bottom: 56px; padding: 20px;">
            <div style="background: white; padding: 20px; border-radius: 8px;">
              <h3>菜单展开演示</h3>
              <p>当用户点击左上角的菜单按钮时，会从左侧滑出抽屉式菜单。</p>
              <p>菜单包含完整的功能导航，支持多级菜单结构。</p>
            </div>
          </div>
        </div>
      </div>
    `,
  }),
  parameters: {
    docs: {
      description: {
        story: '展示侧边抽屉菜单的完整结构和交互效果。菜单包含首页、客户管理、销售机会、跟进记录、数据分析和系统管理等功能模块。'
      }
    }
  },
}

// 不同用户角色的菜单展示
export const AdminUser: Story = {
  name: '管理员用户',
  parameters: {
    docs: {
      description: {
        story: '管理员用户可以看到完整的菜单选项，包括系统管理等高级功能。'
      }
    }
  },
}

export const SalesUser: Story = {
  name: '销售用户',
  parameters: {
    docs: {
      description: {
        story: '普通销售用户的菜单，主要包含客户管理、销售机会、跟进记录等核心业务功能。'
      }
    }
  },
}

// 交互状态演示
export const InteractionDemo: Story = {
  name: '交互演示',
  render: () => ({
    components: { MobileMenu },
    template: `
      <div id="app">
        <div style="height: 100vh; background: #f5f7fa; position: relative;">
          <MobileMenu />
          <div style="margin: 50px 20px 56px; padding: 20px; background: white; border-radius: 8px;">
            <h3>移动端菜单交互指南</h3>
            <div style="margin-top: 16px; line-height: 1.8;">
              <p><strong>顶部导航栏：</strong></p>
              <p>• 左侧：菜单按钮 - 点击打开/关闭侧边菜单</p>
              <p>• 中间：应用标题 "CRM系统"</p>
              <p>• 右侧：用户头像 - 点击查看用户菜单</p>
              
              <p style="margin-top: 16px;"><strong>底部标签栏：</strong></p>
              <p>• 首页：系统首页和概览信息</p>
              <p>• 客户：客户管理相关功能</p>
              <p>• 机会：销售机会管理</p>
              <p>• 跟进：跟进记录和任务</p>
              
              <p style="margin-top: 16px;"><strong>侧边菜单：</strong></p>
              <p>• 包含完整的功能导航</p>
              <p>• 支持多级菜单展开</p>
              <p>• 点击菜单项可跳转到对应页面</p>
            </div>
          </div>
        </div>
      </div>
    `,
  }),
  parameters: {
    docs: {
      description: {
        story: '完整的移动端菜单交互演示，包含所有功能说明和使用指导。'
      }
    }
  },
}