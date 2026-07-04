import type { Meta, StoryObj } from '@storybook/vue3'
import MobilePageHeader from './MobilePageHeader.vue'
import { ElButton } from 'element-plus'
import { Plus, Search, More, Edit } from '@element-plus/icons-vue'

const meta: Meta<typeof MobilePageHeader> = {
  title: 'Common/MobilePageHeader',
  component: MobilePageHeader,
  parameters: {
    layout: 'fullscreen',
    viewport: { defaultViewport: 'mobile' },
  },
  argTypes: {
    title: {
      control: 'text',
      description: '页面标题',
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
type Story = StoryObj<typeof MobilePageHeader>

export const Default: Story = {
  args: {
    title: '客户管理',
    showBack: false,
  },
}

export const WithBackButton: Story = {
  args: {
    title: '客户详情',
    showBack: true,
  },
}

export const CustomerList: Story = {
  args: {
    title: '我的客户',
    showBack: false,
  },
  render: (args) => ({
    components: { MobilePageHeader, ElButton },
    setup() {
      return { args, Plus, Search }
    },
    template: `
      <MobilePageHeader v-bind="args">
        <template #actions>
          <ElButton :icon="Search" circle size="small" />
          <ElButton :icon="Plus" type="primary" circle size="small" />
        </template>
      </MobilePageHeader>
    `,
  }),
}

export const CustomerDetail: Story = {
  args: {
    title: '深圳创新科技有限公司',
    showBack: true,
  },
  render: (args) => ({
    components: { MobilePageHeader, ElButton },
    setup() {
      return { args, Edit, More }
    },
    template: `
      <MobilePageHeader v-bind="args">
        <template #actions>
          <ElButton :icon="Edit" circle size="small" type="primary" />
          <ElButton :icon="More" circle size="small" />
        </template>
      </MobilePageHeader>
    `,
  }),
}

export const OpportunityDetail: Story = {
  args: {
    title: 'CRM系统升级项目',
    showBack: true,
  },
  render: (args) => ({
    components: { MobilePageHeader, ElButton },
    setup() {
      return { args, Edit, More }
    },
    template: `
      <MobilePageHeader v-bind="args">
        <template #actions>
          <ElButton :icon="Edit" circle size="small" type="primary" />
          <ElButton :icon="More" circle size="small" />
        </template>
      </MobilePageHeader>
    `,
  }),
}

export const CustomerPool: Story = {
  args: {
    title: '公海池',
    showBack: false,
  },
  render: (args) => ({
    components: { MobilePageHeader, ElButton },
    setup() {
      return { args, Search }
    },
    template: `
      <MobilePageHeader v-bind="args">
        <template #actions>
          <ElButton :icon="Search" circle size="small" />
        </template>
      </MobilePageHeader>
    `,
  }),
}

export const FollowupList: Story = {
  args: {
    title: '跟进记录',
    showBack: true,
  },
  render: (args) => ({
    components: { MobilePageHeader, ElButton },
    setup() {
      return { args, Plus, Search }
    },
    template: `
      <MobilePageHeader v-bind="args">
        <template #actions>
          <ElButton :icon="Search" circle size="small" />
          <ElButton :icon="Plus" type="primary" circle size="small" />
        </template>
      </MobilePageHeader>
    `,
  }),
}

// 长标题测试
export const LongTitle: Story = {
  args: {
    title: '这是一个非常长的页面标题，用来测试移动端标题的省略显示效果',
    showBack: true,
  },
  render: (args) => ({
    components: { MobilePageHeader, ElButton },
    setup() {
      return { args, Edit, More }
    },
    template: `
      <MobilePageHeader v-bind="args">
        <template #actions>
          <ElButton :icon="Edit" circle size="small" type="primary" />
          <ElButton :icon="More" circle size="small" />
        </template>
      </MobilePageHeader>
    `,
  }),
}

// 无操作按钮
export const NoActions: Story = {
  args: {
    title: '系统设置',
    showBack: true,
  },
}

// 单个操作按钮
export const SingleAction: Story = {
  args: {
    title: '个人中心',
    showBack: true,
  },
  render: (args) => ({
    components: { MobilePageHeader, ElButton },
    setup() {
      return { args, Edit }
    },
    template: `
      <MobilePageHeader v-bind="args">
        <template #actions>
          <ElButton :icon="Edit" circle size="small" type="primary" />
        </template>
      </MobilePageHeader>
    `,
  }),
}