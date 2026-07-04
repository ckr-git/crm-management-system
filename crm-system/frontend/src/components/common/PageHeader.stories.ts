import type { Meta, StoryObj } from '@storybook/vue3'
import PageHeader from './PageHeader.vue'
import { ElButton } from 'element-plus'
import { Plus, Edit, Delete, Search } from '@element-plus/icons-vue'

const meta: Meta<typeof PageHeader> = {
  title: 'Common/PageHeader',
  component: PageHeader,
  parameters: {
    layout: 'fullscreen',
  },
  argTypes: {
    title: {
      control: 'text',
      description: '页面标题',
    },
    subtitle: {
      control: 'text',
      description: '副标题',
    },
    showBack: {
      control: 'boolean',
      description: '是否显示返回按钮',
    },
    backPath: {
      control: 'text',
      description: '返回路径',
    },
  },
  tags: ['autodocs'],
}

export default meta
type Story = StoryObj<typeof PageHeader>

export const Default: Story = {
  args: {
    title: '客户管理',
    showBack: false,
  },
  parameters: {
    viewport: { defaultViewport: 'desktop' },
  },
}

export const WithSubtitle: Story = {
  args: {
    title: '客户列表',
    subtitle: '共 156 条数据',
    showBack: false,
  },
  parameters: {
    viewport: { defaultViewport: 'desktop' },
  },
}

export const WithBackButton: Story = {
  args: {
    title: '客户详情',
    subtitle: '深圳创新科技有限公司',
    showBack: true,
  },
  parameters: {
    viewport: { defaultViewport: 'desktop' },
  },
}

export const WithActions: Story = {
  args: {
    title: '销售机会',
    subtitle: '本月新增 23 个机会',
    showBack: false,
  },
  render: (args) => ({
    components: { PageHeader, ElButton },
    setup() {
      return { args, Plus, Search }
    },
    template: `
      <PageHeader v-bind="args">
        <template #actions>
          <ElButton :icon="Search" size="default">搜索</ElButton>
          <ElButton :icon="Plus" type="primary" size="default">新增机会</ElButton>
        </template>
      </PageHeader>
    `,
  }),
  parameters: {
    viewport: { defaultViewport: 'desktop' },
  },
}

export const CustomerManagement: Story = {
  args: {
    title: '客户管理中心',
    subtitle: '活跃客户 89 | 潜在客户 67 | 今日新增 12',
    showBack: false,
  },
  render: (args) => ({
    components: { PageHeader, ElButton },
    setup() {
      return { args, Plus, Edit, Search }
    },
    template: `
      <PageHeader v-bind="args">
        <template #actions>
          <ElButton :icon="Search">高级搜索</ElButton>
          <ElButton :icon="Edit" type="warning">批量编辑</ElButton>
          <ElButton :icon="Plus" type="primary">添加客户</ElButton>
        </template>
      </PageHeader>
    `,
  }),
  parameters: {
    viewport: { defaultViewport: 'desktop' },
  },
}

export const OpportunityDetail: Story = {
  args: {
    title: 'CRM系统升级项目',
    subtitle: '预计金额 ¥50万 | 成功概率 80% | 预计成交 2024-12-31',
    showBack: true,
  },
  render: (args) => ({
    components: { PageHeader, ElButton },
    setup() {
      return { args, Edit, Delete }
    },
    template: `
      <PageHeader v-bind="args">
        <template #actions>
          <ElButton :icon="Edit" type="primary">编辑</ElButton>
          <ElButton :icon="Delete" type="danger">删除</ElButton>
        </template>
      </PageHeader>
    `,
  }),
  parameters: {
    viewport: { defaultViewport: 'desktop' },
  },
}

// 移动端版本
export const MobileDefault: Story = {
  args: {
    title: '客户管理',
    showBack: false,
  },
  parameters: {
    viewport: { defaultViewport: 'mobile' },
  },
}

export const MobileWithBack: Story = {
  args: {
    title: '客户详情',
    subtitle: '深圳创新科技',
    showBack: true,
  },
  parameters: {
    viewport: { defaultViewport: 'mobile' },
  },
}

export const MobileWithActions: Story = {
  args: {
    title: '销售机会',
    showBack: false,
  },
  render: (args) => ({
    components: { PageHeader, ElButton },
    setup() {
      return { args, Plus }
    },
    template: `
      <PageHeader v-bind="args">
        <template #actions>
          <ElButton :icon="Plus" type="primary" size="small" circle />
        </template>
      </PageHeader>
    `,
  }),
  parameters: {
    viewport: { defaultViewport: 'mobile' },
  },
}

// 长标题测试
export const LongTitle: Story = {
  args: {
    title: '这是一个非常长的页面标题，用来测试标题的省略显示效果',
    subtitle: '这也是一个很长的副标题，同样需要测试省略显示的情况',
    showBack: true,
  },
  parameters: {
    viewport: { defaultViewport: 'mobile' },
  },
}