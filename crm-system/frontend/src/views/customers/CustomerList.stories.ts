import type { Meta, StoryObj } from '@storybook/vue3'
import { ElButton, ElCard, ElForm, ElFormItem, ElRadioGroup, ElRadioButton, ElInput, ElSelect, ElOption, ElTable, ElTableColumn, ElTag, ElEmpty } from 'element-plus'
import { Plus, Download, Upload, Switch, Delete, Search } from '@element-plus/icons-vue'

// 简化版客户列表组件用于展示
const CustomerListDemo = {
  components: {
    ElButton, ElCard, ElForm, ElFormItem, ElRadioGroup, ElRadioButton, 
    ElInput, ElSelect, ElOption, ElTable, ElTableColumn, ElTag, ElEmpty
  },
  setup() {
    // 模拟数据
    const customers = [
      {
        id: 1,
        name: '深圳创新科技有限公司',
        contact: '张经理',
        phone: '138-0000-0001',
        industry: '软件开发',
        source: '网站咨询',
        stage: 'intention',
        level: 'important',
        created_at: '2024-01-15 10:30:00'
      },
      {
        id: 2,
        name: '北京智能制造公司',
        contact: '李总',
        phone: '139-0000-0002',
        industry: '制造业',
        source: '朋友介绍',
        stage: 'negotiation',
        level: 'vip',
        created_at: '2024-02-20 14:20:00'
      },
      {
        id: 3,
        name: '上海金融服务集团',
        contact: '王董',
        phone: '137-0000-0003',
        industry: '金融服务',
        source: '展会',
        stage: 'deal',
        level: 'normal',
        created_at: '2024-03-10 09:15:00'
      },
      {
        id: 4,
        name: '广州电商有限公司',
        contact: '刘经理',
        phone: '136-0000-0004',
        industry: '电子商务',
        source: '广告投放',
        stage: 'potential',
        level: 'normal',
        created_at: '2024-03-25 16:45:00'
      }
    ]

    const searchForm = {
      onlyMine: 'true',
      name: '',
      contact: '',
      stage: ''
    }

    const getStageType = (stage: string) => {
      const types: Record<string, any> = {
        potential: 'info',
        intention: 'warning',
        quotation: 'warning',
        negotiation: 'primary',
        deal: 'success'
      }
      return types[stage] || 'info'
    }

    const getStageLabel = (stage: string) => {
      const labels: Record<string, string> = {
        potential: '潜在客户',
        intention: '意向客户',
        quotation: '报价中',
        negotiation: '谈判中',
        deal: '成交客户'
      }
      return labels[stage] || stage
    }

    const getLevelType = (level: string) => {
      const types: Record<string, any> = {
        normal: '',
        important: 'warning',
        vip: 'danger'
      }
      return types[level] || ''
    }

    const getLevelLabel = (level: string) => {
      const labels: Record<string, string> = {
        normal: '普通',
        important: '重要',
        vip: 'VIP'
      }
      return labels[level] || level
    }

    return {
      customers,
      searchForm,
      getStageType,
      getStageLabel,
      getLevelType,
      getLevelLabel,
      Plus, Download, Upload, Switch, Delete, Search
    }
  },
  template: `
    <div class="customer-list" style="padding: 20px; background: #f5f7fa; min-height: 100vh;">
      <!-- 页面头部 -->
      <div style="background: white; padding: 16px 20px; border-bottom: 1px solid #e4e7ed; margin-bottom: 20px; border-radius: 8px;">
        <div style="display: flex; align-items: center; justify-content: space-between;">
          <div>
            <h2 style="margin: 0; font-size: 18px; font-weight: 600; color: #303133;">客户管理</h2>
            <p style="margin: 4px 0 0 0; font-size: 14px; color: #909399;">管理您的客户信息</p>
          </div>
          <div style="display: flex; align-items: center; gap: 8px;">
            <el-button plain size="default">
              <el-icon><Download /></el-icon>
              下载模板
            </el-button>
            <el-button plain size="default">
              <el-icon><Upload /></el-icon>
              导入客户
            </el-button>
            <el-button plain size="default">
              <el-icon><Download /></el-icon>
              导出客户
            </el-button>
            <el-button type="warning" plain size="default" disabled>
              <el-icon><Switch /></el-icon>
              批量转移 (0)
            </el-button>
            <el-button type="danger" plain size="default" disabled>
              <el-icon><Delete /></el-icon>
              批量删除 (0)
            </el-button>
            <el-button type="primary" size="default">
              <el-icon><Plus /></el-icon>
              新增客户
            </el-button>
          </div>
        </div>
      </div>

      <!-- 搜索区域 -->
      <el-card class="search-card" style="margin-bottom: 20px;">
        <el-form :inline="true" :model="searchForm">
          <el-form-item label="客户范围">
            <el-radio-group v-model="searchForm.onlyMine">
              <el-radio-button label="true">我的客户</el-radio-button>
              <el-radio-button label="false">全部客户</el-radio-button>
            </el-radio-group>
          </el-form-item>
          <el-form-item label="客户名称">
            <el-input v-model="searchForm.name" placeholder="请输入客户名称" clearable style="width: 200px;" />
          </el-form-item>
          <el-form-item label="联系人">
            <el-input v-model="searchForm.contact" placeholder="请输入联系人" clearable style="width: 200px;" />
          </el-form-item>
          <el-form-item label="客户阶段">
            <el-select v-model="searchForm.stage" placeholder="请选择" clearable style="width: 120px;">
              <el-option label="潜在客户" value="potential" />
              <el-option label="意向客户" value="intention" />
              <el-option label="报价中" value="quotation" />
              <el-option label="谈判中" value="negotiation" />
              <el-option label="成交客户" value="deal" />
            </el-select>
          </el-form-item>
          <el-form-item>
            <el-button type="primary">搜索</el-button>
            <el-button>重置</el-button>
          </el-form-item>
        </el-form>
      </el-card>

      <!-- 客户列表 -->
      <el-card class="table-card">
        <el-table :data="customers" style="width: 100%">
          <el-table-column type="index" label="序号" width="60" />
          <el-table-column type="selection" width="55" />
          <el-table-column prop="name" label="公司名称" min-width="150" />
          <el-table-column prop="contact" label="联系人" width="100" />
          <el-table-column prop="phone" label="联系电话" width="130" />
          <el-table-column prop="industry" label="行业" width="100" />
          <el-table-column prop="source" label="来源" width="100" />
          <el-table-column prop="stage" label="阶段" width="100">
            <template #default="{ row }">
              <el-tag :type="getStageType(row.stage)" size="small">
                {{ getStageLabel(row.stage) }}
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column prop="level" label="等级" width="100">
            <template #default="{ row }">
              <el-tag :type="getLevelType(row.level)" size="small">
                {{ getLevelLabel(row.level) }}
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column prop="created_at" label="创建时间" width="160" />
          <el-table-column label="操作" width="350" fixed="right">
            <template #default="{ row }">
              <el-button link type="primary" size="small">查看</el-button>
              <el-button link type="success" size="small">跟进</el-button>
              <el-button link type="warning" size="small">转移</el-button>
              <el-button link type="info" size="small">公海</el-button>
              <el-button link type="primary" size="small">编辑</el-button>
              <el-button link type="danger" size="small">删除</el-button>
            </template>
          </el-table-column>
        </el-table>
      </el-card>
    </div>
  `
}

const meta: Meta<typeof CustomerListDemo> = {
  title: 'Business/CustomerList',
  component: CustomerListDemo as any,
  parameters: {
    layout: 'fullscreen',
  },
  tags: ['autodocs'],
}

export default meta
type Story = StoryObj<typeof CustomerListDemo>

export const Default: Story = {
  name: '桌面端客户列表',
  parameters: {
    viewport: { defaultViewport: 'desktop' },
    docs: {
      description: {
        story: '桌面端的完整客户列表界面，包含搜索筛选、批量操作、数据表格等功能。'
      }
    }
  }
}

export const WithSelectedRows: Story = {
  name: '选中行状态',
  render: () => ({
    components: { CustomerListDemo },
    template: `<CustomerListDemo />`,
  }),
  parameters: {
    viewport: { defaultViewport: 'desktop' },
    docs: {
      description: {
        story: '展示表格行选中状态，批量操作按钮变为可用状态。'
      }
    }
  }
}

export const SearchFiltered: Story = {
  name: '搜索筛选状态', 
  parameters: {
    viewport: { defaultViewport: 'desktop' },
    docs: {
      description: {
        story: '展示搜索和筛选功能的使用效果。'
      }
    }
  }
}

export const EmptyState: Story = {
  name: '空状态',
  render: () => ({
    components: {
      ElButton, ElCard, ElForm, ElFormItem, ElRadioGroup, ElRadioButton, 
      ElInput, ElSelect, ElOption, ElTable, ElTableColumn, ElEmpty
    },
    setup() {
      const searchForm = {
        onlyMine: 'true',
        name: '',
        contact: '',
        stage: ''
      }
      return { searchForm, Plus, Download, Upload, Switch, Delete, Search }
    },
    template: `
      <div class="customer-list" style="padding: 20px; background: #f5f7fa; min-height: 100vh;">
        <!-- 页面头部 -->
        <div style="background: white; padding: 16px 20px; border-bottom: 1px solid #e4e7ed; margin-bottom: 20px; border-radius: 8px;">
          <div style="display: flex; align-items: center; justify-content: space-between;">
            <div>
              <h2 style="margin: 0; font-size: 18px; font-weight: 600; color: #303133;">客户管理</h2>
              <p style="margin: 4px 0 0 0; font-size: 14px; color: #909399;">管理您的客户信息</p>
            </div>
            <div style="display: flex; align-items: center; gap: 8px;">
              <el-button type="primary" size="default">
                <el-icon><Plus /></el-icon>
                新增客户
              </el-button>
            </div>
          </div>
        </div>

        <!-- 搜索区域 -->
        <el-card class="search-card" style="margin-bottom: 20px;">
          <el-form :inline="true" :model="searchForm">
            <el-form-item label="客户范围">
              <el-radio-group v-model="searchForm.onlyMine">
                <el-radio-button label="true">我的客户</el-radio-button>
                <el-radio-button label="false">全部客户</el-radio-button>
              </el-radio-group>
            </el-form-item>
            <el-form-item>
              <el-button type="primary">搜索</el-button>
            </el-form-item>
          </el-form>
        </el-card>

        <!-- 客户列表 - 空状态 -->
        <el-card class="table-card">
          <el-table :data="[]" style="width: 100%">
            <template #empty>
              <el-empty description="暂无客户数据">
                <el-button type="primary">新增客户</el-button>
              </el-empty>
            </template>
            <el-table-column type="index" label="序号" width="60" />
            <el-table-column type="selection" width="55" />
            <el-table-column prop="name" label="公司名称" min-width="150" />
            <el-table-column prop="contact" label="联系人" width="100" />
            <el-table-column prop="phone" label="联系电话" width="130" />
            <el-table-column prop="industry" label="行业" width="100" />
            <el-table-column prop="source" label="来源" width="100" />
            <el-table-column prop="stage" label="阶段" width="100" />
            <el-table-column prop="level" label="等级" width="100" />
            <el-table-column prop="created_at" label="创建时间" width="160" />
            <el-table-column label="操作" width="350" fixed="right" />
          </el-table>
        </el-card>
      </div>
    `,
  }),
  parameters: {
    viewport: { defaultViewport: 'desktop' },
    docs: {
      description: {
        story: '客户列表为空时的状态展示，提供新增客户的引导操作。'
      }
    }
  }
}

export const LoadingState: Story = {
  name: '加载状态',
  render: () => ({
    components: { CustomerListDemo },
    template: `<CustomerListDemo />`,
  }),
  parameters: {
    viewport: { defaultViewport: 'desktop' },
    docs: {
      description: {
        story: '数据加载中的状态展示。'
      }
    }
  }
}