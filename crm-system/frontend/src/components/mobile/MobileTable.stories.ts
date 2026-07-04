import type { Meta, StoryObj } from '@storybook/vue3'
import MobileTable from './MobileTable.vue'
import { ElButton, ElTag } from 'element-plus'
import { Edit, Delete } from '@element-plus/icons-vue'

const meta: Meta<typeof MobileTable> = {
  title: 'Mobile/MobileTable',
  component: MobileTable,
  parameters: {
    layout: 'padded',
  },
  argTypes: {
    loading: {
      control: 'boolean',
      description: '加载状态',
    },
    showActions: {
      control: 'boolean',
      description: '显示操作按钮',
    },
    showPagination: {
      control: 'boolean',
      description: '显示分页',
    },
    total: {
      control: 'number',
      description: '总记录数',
    },
    currentPage: {
      control: 'number',
      description: '当前页码',
    },
    pageSize: {
      control: 'number',
      description: '每页条数',
    },
  },
}

export default meta
type Story = StoryObj<typeof MobileTable>

// 模拟数据
const customerData = [
  {
    id: 1,
    name: '深圳创新科技有限公司',
    contact: '张经理',
    phone: '138-0000-0001',
    email: 'zhang@example.com',
    industry: '软件开发',
    status: '活跃',
    createTime: '2024-01-15',
  },
  {
    id: 2,
    name: '北京智能制造公司',
    contact: '李总',
    phone: '139-0000-0002',
    email: 'li@example.com',
    industry: '制造业',
    status: '跟进中',
    createTime: '2024-02-20',
  },
  {
    id: 3,
    name: '上海金融服务集团',
    contact: '王董',
    phone: '137-0000-0003',
    email: 'wang@example.com',
    industry: '金融服务',
    status: '已签约',
    createTime: '2024-03-10',
  },
]

const customerColumns = [
  { prop: 'name', label: '公司名称' },
  { prop: 'contact', label: '联系人' },
  { prop: 'phone', label: '电话' },
  { prop: 'industry', label: '行业' },
  { prop: 'status', label: '状态' },
]

export const Default: Story = {
  args: {
    data: customerData,
    columns: customerColumns,
    loading: false,
    showActions: false,
    showPagination: false,
  },
  render: (args) => ({
    components: { MobileTable },
    setup() {
      const handleItemClick = (item: any) => {
        alert(`点击了客户: ${item.name}`)
      }
      return { args, handleItemClick }
    },
    template: `
      <MobileTable v-bind="args" @itemClick="handleItemClick" />
    `,
  }),
}

export const Loading: Story = {
  args: {
    data: [],
    columns: customerColumns,
    loading: true,
  },
  render: (args) => ({
    components: { MobileTable },
    setup() {
      return { args }
    },
    template: `
      <MobileTable v-bind="args" />
    `,
  }),
}

export const Empty: Story = {
  args: {
    data: [],
    columns: customerColumns,
    loading: false,
  },
  render: (args) => ({
    components: { MobileTable },
    setup() {
      return { args }
    },
    template: `
      <MobileTable v-bind="args" />
    `,
  }),
}

export const WithActions: Story = {
  args: {
    data: customerData,
    columns: customerColumns,
    loading: false,
    showActions: true,
    actions: [
      {
        label: '编辑',
        type: 'primary',
        icon: Edit,
        handler: (row: any) => alert(`编辑客户: ${row.name}`)
      },
      {
        label: '删除',
        type: 'danger',
        icon: Delete,
        handler: (row: any) => alert(`删除客户: ${row.name}`)
      },
    ],
  },
  render: (args) => ({
    components: { MobileTable },
    setup() {
      return { args }
    },
    template: `
      <MobileTable v-bind="args" />
    `,
  }),
}

export const WithPagination: Story = {
  args: {
    data: customerData,
    columns: customerColumns,
    loading: false,
    showPagination: true,
    total: 100,
    currentPage: 1,
    pageSize: 10,
  },
  render: (args) => ({
    components: { MobileTable },
    setup() {
      const handlePageChange = (page: number) => {
        alert(`切换到第 ${page} 页`)
      }
      return { args, handlePageChange }
    },
    template: `
      <MobileTable v-bind="args" @pageChange="handlePageChange" />
    `,
  }),
}

export const CustomSlot: Story = {
  args: {
    data: customerData,
    loading: false,
  },
  render: (args) => ({
    components: { MobileTable, ElTag, ElButton },
    setup() {
      const getStatusType = (status: string) => {
        const typeMap: Record<string, any> = {
          '活跃': 'success',
          '跟进中': 'warning',
          '已签约': 'primary',
          '已流失': 'info',
        }
        return typeMap[status] || 'info'
      }
      
      const handleEdit = (row: any) => {
        alert(`编辑: ${row.name}`)
      }
      
      const handleView = (row: any) => {
        alert(`查看详情: ${row.name}`)
      }
      
      return { args, getStatusType, handleEdit, handleView }
    },
    template: `
      <MobileTable v-bind="args">
        <template #default="{ row }">
          <div style="display: flex; flex-direction: column; gap: 8px;">
            <div style="display: flex; justify-content: space-between; align-items: center;">
              <h4 style="margin: 0; color: #409EFF;">{{ row.name }}</h4>
              <el-tag :type="getStatusType(row.status)" size="small">{{ row.status }}</el-tag>
            </div>
            <div><strong>联系人：</strong>{{ row.contact }}</div>
            <div><strong>电话：</strong>{{ row.phone }}</div>
            <div><strong>行业：</strong>{{ row.industry }}</div>
            <div><strong>创建时间：</strong>{{ row.createTime }}</div>
          </div>
        </template>
        
        <template #actions="{ row }">
          <el-button size="small" type="primary" @click="handleEdit(row)">编辑</el-button>
          <el-button size="small" @click="handleView(row)">详情</el-button>
        </template>
      </MobileTable>
    `,
  }),
}

export const OpportunityTable: Story = {
  render: () => ({
    components: { MobileTable, ElTag, ElButton },
    setup() {
      const opportunityData = [
        {
          id: 1,
          name: 'CRM系统升级项目',
          customer: 'ABC科技公司',
          amount: 500000,
          stage: '需求分析',
          probability: 60,
          closeDate: '2024-12-31',
          owner: '张销售',
        },
        {
          id: 2,
          name: 'ERP系统实施',
          customer: 'XYZ制造公司',
          amount: 800000,
          stage: '方案确认',
          probability: 80,
          closeDate: '2024-11-30',
          owner: '李顾问',
        },
        {
          id: 3,
          name: '移动办公平台',
          customer: '创新科技集团',
          amount: 300000,
          stage: '商务谈判',
          probability: 45,
          closeDate: '2025-01-15',
          owner: '王经理',
        },
      ]
      
      const getStageType = (stage: string) => {
        const typeMap: Record<string, any> = {
          '需求分析': 'info',
          '方案确认': 'warning', 
          '商务谈判': 'primary',
          '合同签署': 'success',
          '项目实施': 'success',
        }
        return typeMap[stage] || 'info'
      }
      
      const formatAmount = (amount: number) => {
        return `¥${(amount / 10000).toFixed(1)}万`
      }
      
      return { opportunityData, getStageType, formatAmount }
    },
    template: `
      <MobileTable :data="opportunityData" :show-pagination="true" :total="30">
        <template #default="{ row }">
          <div style="display: flex; flex-direction: column; gap: 8px;">
            <div style="display: flex; justify-content: space-between; align-items: center;">
              <h4 style="margin: 0; color: #409EFF;">{{ row.name }}</h4>
              <span style="color: #E6A23C; font-weight: bold;">{{ formatAmount(row.amount) }}</span>
            </div>
            <div><strong>客户：</strong>{{ row.customer }}</div>
            <div>
              <strong>阶段：</strong>
              <el-tag :type="getStageType(row.stage)" size="small">{{ row.stage }}</el-tag>
            </div>
            <div><strong>成功概率：</strong>{{ row.probability }}%</div>
            <div><strong>预计成交：</strong>{{ row.closeDate }}</div>
            <div><strong>负责人：</strong>{{ row.owner }}</div>
          </div>
        </template>
      </MobileTable>
    `,
  }),
}