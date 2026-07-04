import type { Meta, StoryObj } from '@storybook/vue3'
import { ElRow, ElCol, ElCard, ElButton, ElForm, ElFormItem, ElInput, ElSelect, ElOption, ElTable, ElTableColumn, ElTag, ElIcon, ElEmpty } from 'element-plus'
import { User, Calendar, Check, Star, TrendCharts, Select, Refresh, Search, RefreshLeft, Plus } from '@element-plus/icons-vue'

// 客户公海池组件演示
const CustomerPoolDemo = {
  components: {
    ElRow, ElCol, ElCard, ElButton, ElForm, ElFormItem, ElInput, 
    ElSelect, ElOption, ElTable, ElTableColumn, ElTag, ElIcon, ElEmpty
  },
  setup() {
    // 模拟统计数据
    const poolStats = {
      availableCount: 156,
      todayClaimedCount: 8,
      dailyClaimLimit: 10,
      claimedCount: 89,
      myClaimedCount: 23,
      canClaimToday: true
    }

    // 模拟公海池数据
    const poolList = [
      {
        id: 1,
        customer: {
          id: 101,
          name: '深圳创新科技有限公司',
          contact: '张经理',
          phone: '138-0000-0001',
          industry: 'IT互联网',
          level: 'important'
        },
        previousOwner: {
          name: '王销售'
        },
        reason: '长期无联系',
        released_at: '2024-10-15 14:30:00',
        status: 'available'
      },
      {
        id: 2,
        customer: {
          id: 102,
          name: '北京智能制造公司',
          contact: '李总',
          phone: '139-0000-0002',
          industry: '制造业',
          level: 'vip'
        },
        previousOwner: {
          name: '陈顾问'
        },
        reason: '客户需求暂停',
        released_at: '2024-10-18 10:15:00',
        status: 'available'
      },
      {
        id: 3,
        customer: {
          id: 103,
          name: '上海金融服务集团',
          contact: '王董',
          phone: '137-0000-0003',
          industry: '金融服务',
          level: 'normal'
        },
        previousOwner: {
          name: '刘经理'
        },
        reason: '销售离职转移',
        released_at: '2024-10-20 09:45:00',
        status: 'available'
      },
      {
        id: 4,
        customer: {
          id: 104,
          name: '广州电商有限公司',
          contact: '赵经理',
          phone: '136-0000-0004',
          industry: '电子商务',
          level: 'important'
        },
        previousOwner: {
          name: '张销售'
        },
        reason: '客户主动要求',
        released_at: '2024-10-19 16:20:00',
        status: 'claimed',
        claimedBy: {
          name: '李销售'
        },
        claimed_at: '2024-10-21 08:30:00'
      }
    ]

    const searchForm = {
      name: '',
      industry: '',
      level: '',
      status: 'available'
    }

    const getLevelType = (level: string) => {
      const types: Record<string, any> = {
        normal: '',
        important: 'warning',
        vip: 'danger'
      }
      return types[level] || ''
    }

    const getLevelText = (level: string) => {
      const labels: Record<string, string> = {
        normal: '普通',
        important: '重要',
        vip: 'VIP'
      }
      return labels[level] || level
    }

    return {
      poolStats,
      poolList,
      searchForm,
      getLevelType,
      getLevelText,
      User, Calendar, Check, Star, TrendCharts, Select, Refresh, Search, RefreshLeft, Plus
    }
  },
  template: `
    <div class="customer-pool" style="padding: 20px; background: #f5f7fa; min-height: 100vh;">
      <!-- 页面头部 -->
      <div style="background: white; padding: 16px 20px; border-bottom: 1px solid #e4e7ed; margin-bottom: 20px; border-radius: 8px;">
        <div style="display: flex; align-items: center; justify-content: space-between;">
          <div>
            <h2 style="margin: 0; font-size: 18px; font-weight: 600; color: #303133;">客户公海</h2>
            <p style="margin: 4px 0 0 0; font-size: 14px; color: #909399;">管理公海池中的客户资源</p>
          </div>
          <el-button type="primary" size="default">
            <el-icon><Refresh /></el-icon>
            刷新
          </el-button>
        </div>
      </div>

      <!-- 统计卡片 -->
      <el-row :gutter="20" class="stats-row" style="margin-bottom: 20px;">
        <el-col :xs="12" :sm="8" :md="6" :lg="4" :xl="4">
          <el-card class="stat-card" style="margin-bottom: 12px;">
            <div class="stat-content" style="display: flex; align-items: center; gap: 12px;">
              <div class="stat-icon" style="width: 60px; height: 60px; border-radius: 8px; display: flex; align-items: center; justify-content: center; color: white; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);">
                <el-icon :size="32"><User /></el-icon>
              </div>
              <div class="stat-info" style="flex: 1;">
                <div class="stat-value" style="font-size: 24px; font-weight: bold; color: #303133; margin-bottom: 4px;">{{ poolStats.availableCount }}</div>
                <div class="stat-label" style="font-size: 12px; color: #909399;">可领取客户</div>
              </div>
            </div>
          </el-card>
        </el-col>
        <el-col :xs="12" :sm="8" :md="6" :lg="4" :xl="4">
          <el-card class="stat-card" style="margin-bottom: 12px;">
            <div class="stat-content" style="display: flex; align-items: center; gap: 12px;">
              <div class="stat-icon" style="width: 60px; height: 60px; border-radius: 8px; display: flex; align-items: center; justify-content: center; color: white; background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);">
                <el-icon :size="32"><Calendar /></el-icon>
              </div>
              <div class="stat-info" style="flex: 1;">
                <div class="stat-value" style="font-size: 20px; font-weight: bold; color: #303133; margin-bottom: 4px;">{{ poolStats.todayClaimedCount }}/{{ poolStats.dailyClaimLimit }}</div>
                <div class="stat-label" style="font-size: 12px; color: #909399;">今日已领取</div>
              </div>
            </div>
          </el-card>
        </el-col>
        <el-col :xs="12" :sm="8" :md="6" :lg="4" :xl="4">
          <el-card class="stat-card" style="margin-bottom: 12px;">
            <div class="stat-content" style="display: flex; align-items: center; gap: 12px;">
              <div class="stat-icon" style="width: 60px; height: 60px; border-radius: 8px; display: flex; align-items: center; justify-content: center; color: white; background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);">
                <el-icon :size="32"><Check /></el-icon>
              </div>
              <div class="stat-info" style="flex: 1;">
                <div class="stat-value" style="font-size: 24px; font-weight: bold; color: #303133; margin-bottom: 4px;">{{ poolStats.claimedCount }}</div>
                <div class="stat-label" style="font-size: 12px; color: #909399;">已领取客户</div>
              </div>
            </div>
          </el-card>
        </el-col>
        <el-col :xs="12" :sm="8" :md="6" :lg="4" :xl="4">
          <el-card class="stat-card" style="margin-bottom: 12px;">
            <div class="stat-content" style="display: flex; align-items: center; gap: 12px;">
              <div class="stat-icon" style="width: 60px; height: 60px; border-radius: 8px; display: flex; align-items: center; justify-content: center; color: white; background: linear-gradient(135deg, #fa709a 0%, #fee140 100%);">
                <el-icon :size="32"><Star /></el-icon>
              </div>
              <div class="stat-info" style="flex: 1;">
                <div class="stat-value" style="font-size: 24px; font-weight: bold; color: #303133; margin-bottom: 4px;">{{ poolStats.myClaimedCount }}</div>
                <div class="stat-label" style="font-size: 12px; color: #909399;">我领取的</div>
              </div>
            </div>
          </el-card>
        </el-col>
        <el-col :xs="12" :sm="8" :md="6" :lg="4" :xl="4">
          <el-card class="stat-card" style="margin-bottom: 12px;">
            <div class="stat-content" style="display: flex; align-items: center; gap: 12px;">
              <div class="stat-icon" style="width: 60px; height: 60px; border-radius: 8px; display: flex; align-items: center; justify-content: center; color: white; background: linear-gradient(135deg, #30cfd0 0%, #330867 100%);">
                <el-icon :size="32"><TrendCharts /></el-icon>
              </div>
              <div class="stat-info" style="flex: 1;">
                <div class="stat-value" style="font-size: 24px; font-weight: bold; color: #303133; margin-bottom: 4px;">{{ poolStats.availableCount + poolStats.claimedCount }}</div>
                <div class="stat-label" style="font-size: 12px; color: #909399;">公海总数</div>
              </div>
            </div>
          </el-card>
        </el-col>
        <el-col :xs="12" :sm="8" :md="6" :lg="4" :xl="4">
          <el-card class="stat-card" :class="{ 'stat-card-disabled': !poolStats.canClaimToday }" style="margin-bottom: 12px;">
            <div class="stat-content" style="display: flex; align-items: center; gap: 12px;">
              <div class="stat-icon" style="width: 60px; height: 60px; border-radius: 8px; display: flex; align-items: center; justify-content: center; color: white; background: linear-gradient(135deg, #a8edea 0%, #fed6e3 100%);">
                <el-icon :size="32"><Select /></el-icon>
              </div>
              <div class="stat-info" style="flex: 1;">
                <div class="stat-value" style="font-size: 16px; font-weight: bold; margin-bottom: 4px;" :style="{ color: poolStats.canClaimToday ? '#67c23a' : '#f56c6c' }">{{ poolStats.canClaimToday ? '可领取' : '已达限' }}</div>
                <div class="stat-label" style="font-size: 12px; color: #909399;">今日状态</div>
              </div>
            </div>
          </el-card>
        </el-col>
      </el-row>

      <!-- 搜索条件 -->
      <el-card class="search-card" style="margin-bottom: 20px;">
        <el-form :model="searchForm" inline>
          <el-form-item label="客户名称">
            <el-input v-model="searchForm.name" placeholder="请输入客户名称" clearable style="width: 200px" />
          </el-form-item>
          <el-form-item label="所属行业">
            <el-select v-model="searchForm.industry" placeholder="请选择行业" clearable style="width: 150px">
              <el-option label="IT互联网" value="IT互联网" />
              <el-option label="制造业" value="制造业" />
              <el-option label="金融服务" value="金融服务" />
              <el-option label="教育培训" value="教育培训" />
              <el-option label="医疗健康" value="医疗健康" />
            </el-select>
          </el-form-item>
          <el-form-item label="客户等级">
            <el-select v-model="searchForm.level" placeholder="请选择等级" clearable style="width: 120px">
              <el-option label="VIP客户" value="vip" />
              <el-option label="重要客户" value="important" />
              <el-option label="普通客户" value="normal" />
            </el-select>
          </el-form-item>
          <el-form-item label="状态">
            <el-select v-model="searchForm.status" placeholder="请选择状态" style="width: 120px">
              <el-option label="可领取" value="available" />
              <el-option label="已领取" value="claimed" />
            </el-select>
          </el-form-item>
          <el-form-item>
            <el-button type="primary">
              <el-icon><Search /></el-icon>
              搜索
            </el-button>
            <el-button>
              <el-icon><RefreshLeft /></el-icon>
              重置
            </el-button>
          </el-form-item>
        </el-form>
      </el-card>

      <!-- 公海池列表 -->
      <el-card class="table-card">
        <el-table :data="poolList" style="width: 100%">
          <el-table-column type="index" label="序号" width="60" />
          <el-table-column prop="customer" label="客户名称" min-width="150">
            <template #default="{ row }">
              {{ row.customer?.name || '-' }}
            </template>
          </el-table-column>
          <el-table-column prop="customer.contact" label="联系人" width="100">
            <template #default="{ row }">
              {{ row.customer?.contact || '-' }}
            </template>
          </el-table-column>
          <el-table-column prop="customer.phone" label="联系电话" width="130">
            <template #default="{ row }">
              {{ row.customer?.phone || '-' }}
            </template>
          </el-table-column>
          <el-table-column prop="customer.industry" label="所属行业" width="120">
            <template #default="{ row }">
              {{ row.customer?.industry || '-' }}
            </template>
          </el-table-column>
          <el-table-column prop="customer.level" label="客户等级" width="100">
            <template #default="{ row }">
              <el-tag v-if="row.customer && getLevelType(row.customer.level)" :type="getLevelType(row.customer.level)" size="small">
                {{ getLevelText(row.customer.level) }}
              </el-tag>
              <span v-else-if="row.customer">{{ getLevelText(row.customer.level) }}</span>
              <span v-else>-</span>
            </template>
          </el-table-column>
          <el-table-column prop="previousOwner" label="原负责人" width="100">
            <template #default="{ row }">
              {{ row.previousOwner?.name || '-' }}
            </template>
          </el-table-column>
          <el-table-column prop="reason" label="进入原因" width="120" />
          <el-table-column prop="released_at" label="进入时间" width="160" />
          <el-table-column prop="status" label="状态" width="100">
            <template #default="{ row }">
              <el-tag v-if="row.status === 'available'" type="success" size="small">可领取</el-tag>
              <el-tag v-else-if="row.status === 'claimed'" type="info" size="small">已领取</el-tag>
            </template>
          </el-table-column>
          <el-table-column label="操作" width="200" fixed="right">
            <template #default="{ row }">
              <el-button v-if="row.status === 'available'" type="primary" size="small" link>领取客户</el-button>
              <el-button type="primary" size="small" link>查看详情</el-button>
              <el-button type="info" size="small" link>联系记录</el-button>
            </template>
          </el-table-column>
        </el-table>
      </el-card>
    </div>
  `
}

const meta: Meta<typeof CustomerPoolDemo> = {
  title: 'Business/CustomerPool',
  component: CustomerPoolDemo as any,
  parameters: {
    layout: 'fullscreen',
  },
  tags: ['autodocs'],
}

export default meta
type Story = StoryObj<typeof CustomerPoolDemo>

export const Default: Story = {
  name: '客户公海池',
  parameters: {
    viewport: { defaultViewport: 'desktop' },
    docs: {
      description: {
        story: '客户公海池管理界面，包含统计卡片、搜索筛选和客户列表。销售人员可以在此领取公海客户。'
      }
    }
  }
}

export const LimitReached: Story = {
  name: '达到领取限制',
  render: () => ({
    components: { CustomerPoolDemo },
    setup() {
      // 修改统计数据显示已达到今日限制
      const modifiedStats = {
        availableCount: 156,
        todayClaimedCount: 10,
        dailyClaimLimit: 10,
        claimedCount: 89,
        myClaimedCount: 33,
        canClaimToday: false
      }
      return { modifiedStats }
    },
    template: `<CustomerPoolDemo />`,
  }),
  parameters: {
    viewport: { defaultViewport: 'desktop' },
    docs: {
      description: {
        story: '当销售人员已达到每日领取客户限制时的状态展示。'
      }
    }
  }
}

export const EmptyState: Story = {
  name: '空状态',
  render: () => ({
    components: {
      ElRow, ElCol, ElCard, ElButton, ElForm, ElFormItem, ElInput, 
      ElSelect, ElOption, ElTable, ElTableColumn, ElTag, ElIcon, ElEmpty
    },
    setup() {
      const poolStats = {
        availableCount: 0,
        todayClaimedCount: 0,
        dailyClaimLimit: 10,
        claimedCount: 0,
        myClaimedCount: 0,
        canClaimToday: true
      }
      const searchForm = {
        name: '',
        industry: '',
        level: '',
        status: 'available'
      }
      return { poolStats, searchForm, User, Calendar, Check, Star, TrendCharts, Select, Refresh, Search, RefreshLeft }
    },
    template: `
      <div class="customer-pool" style="padding: 20px; background: #f5f7fa; min-height: 100vh;">
        <!-- 页面头部省略... -->
        
        <!-- 统计卡片 - 全部为0 -->
        <el-row :gutter="20" class="stats-row" style="margin-bottom: 20px;">
          <el-col :xs="12" :sm="8" :md="6" :lg="4" :xl="4">
            <el-card class="stat-card" style="margin-bottom: 12px;">
              <div class="stat-content" style="display: flex; align-items: center; gap: 12px;">
                <div class="stat-icon" style="width: 60px; height: 60px; border-radius: 8px; display: flex; align-items: center; justify-content: center; color: white; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);">
                  <el-icon :size="32"><User /></el-icon>
                </div>
                <div class="stat-info" style="flex: 1;">
                  <div class="stat-value" style="font-size: 24px; font-weight: bold; color: #303133; margin-bottom: 4px;">0</div>
                  <div class="stat-label" style="font-size: 12px; color: #909399;">可领取客户</div>
                </div>
              </div>
            </el-card>
          </el-col>
        </el-row>

        <!-- 公海池列表 - 空状态 -->
        <el-card class="table-card">
          <el-table :data="[]" style="width: 100%">
            <template #empty>
              <el-empty description="公海池暂无客户" />
            </template>
            <el-table-column type="index" label="序号" width="60" />
            <el-table-column prop="customer" label="客户名称" min-width="150" />
            <el-table-column prop="customer.contact" label="联系人" width="100" />
            <el-table-column prop="customer.phone" label="联系电话" width="130" />
            <el-table-column prop="customer.industry" label="所属行业" width="120" />
            <el-table-column prop="customer.level" label="客户等级" width="100" />
            <el-table-column prop="previousOwner" label="原负责人" width="100" />
            <el-table-column prop="reason" label="进入原因" width="120" />
            <el-table-column prop="released_at" label="进入时间" width="160" />
            <el-table-column prop="status" label="状态" width="100" />
            <el-table-column label="操作" width="200" fixed="right" />
          </el-table>
        </el-card>
      </div>
    `,
  }),
  parameters: {
    viewport: { defaultViewport: 'desktop' },
    docs: {
      description: {
        story: '公海池为空时的状态展示。'
      }
    }
  }
}