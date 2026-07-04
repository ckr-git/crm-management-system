<template>
  <div class="customer-detail">
    <PageHeader :title="`客户详情 - ${customerInfo.name || ''}`" description="查看客户详细信息和跟进记" back-path="/customers">
      <template #extra>
        <el-button type="primary" @click="handleQuickFollowup">
          <el-icon><Plus /></el-icon>
          添加跟进
        </el-button>
      </template>
    </PageHeader>

    <el-card v-loading="loading" shadow="hover">
      <template #header>
        <div class="card-header">
          <span>客户信息</span>
          <el-button type="primary" size="small" @click="handleEdit">编辑</el-button>
        </div>
      </template>
      <el-descriptions :column="2" border>
        <el-descriptions-item label="客户名称">
          {{ customerInfo.name }}
        </el-descriptions-item>
        <el-descriptions-item label="联系人">
          {{ customerInfo.contact }}
        </el-descriptions-item>
        <el-descriptions-item label="电话">
          {{ customerInfo.phone }}
        </el-descriptions-item>
        <el-descriptions-item label="邮箱">
          {{ customerInfo.email }}
        </el-descriptions-item>
        <el-descriptions-item label="客户等级">
          <el-tag :type="getLevelType(customerInfo.level)">
            {{ getLevelText(customerInfo.level) }}
          </el-tag>
        </el-descriptions-item>
        <el-descriptions-item label="客户阶段">
          <el-tag :type="getStageType(customerInfo.stage)">
            {{ getStageText(customerInfo.stage) }}
          </el-tag>
        </el-descriptions-item>
        <el-descriptions-item label="客户来源">
          {{ mapLabel(customerSourceMap, customerInfo.source) }}
        </el-descriptions-item>
        <el-descriptions-item label="行业">
          {{ mapLabel(industryMap, customerInfo.industry) }}
        </el-descriptions-item>
        <el-descriptions-item label="地址" :span="2">
          {{ customerInfo.address }}
        </el-descriptions-item>
        <el-descriptions-item label="备注" :span="2">
          {{ customerInfo.remark || '-' }}
        </el-descriptions-item>
      </el-descriptions>
    </el-card>

    <el-tabs v-model="activeTab">
      <el-tab-pane label="跟进记录" name="followups">
        <el-card shadow="hover" v-loading="followupsLoading">
          <template #header>
            <div class="card-header">
              <span>跟进记录</span>
              <el-button type="primary" size="small" @click="handleQuickFollowup">
                添加跟进
              </el-button>
            </div>
          </template>
          <el-timeline v-if="followups.length">
            <el-timeline-item
              v-for="item in followups"
              :key="item.id"
              :timestamp="formatDateTime(item.followup_time)"
              placement="top"
            >
              <el-card>
                <div class="followup-header">
                  <el-tag :type="getFollowupTypeTagType(item.followup_type)" size="small">
                    {{ getFollowupTypeText(item.followup_type) }}
                  </el-tag>
                  <span class="followup-user">跟进人: {{ item.creator_name }}</span>
                </div>
                <div class="followup-content">{{ item.content }}</div>
              </el-card>
            </el-timeline-item>
          </el-timeline>
          <el-empty v-else description="暂无跟进记录" />
        </el-card>
      </el-tab-pane>

      <el-tab-pane label="销售机会" name="opportunities">
        <el-card shadow="hover" v-loading="opportunitiesLoading">
          <template #header>
            <div class="card-header">
              <span>销售机会</span>
              <el-button type="primary" size="small" @click="handleCreateOpportunity">
                创建机会
              </el-button>
            </div>
          </template>
          <el-table v-if="opportunities.length" :data="opportunities" style="width: 100%">
            <el-table-column prop="name" label="机会名称" />
            <el-table-column label="阶段">
              <template #default="{ row }">
                <el-tag :type="getOppStageType(row.stage)">
                  {{ getOppStageLabel(row.stage) }}
                </el-tag>
              </template>
            </el-table-column>
            <el-table-column label="金额">
              <template #default="{ row }">
                ¥{{ formatAmount(row.amount) }}
              </template>
            </el-table-column>
            <el-table-column label="状态">
              <template #default="{ row }">
                <el-tag :type="getOppStatusType(row.status)">
                  {{ getOppStatusLabel(row.status) }}
                </el-tag>
              </template>
            </el-table-column>
            <el-table-column label="操作" width="120">
              <template #default="{ row }">
                <el-button type="primary" size="small" @click="handleViewOpportunity(row.id)">
                  查看
                </el-button>
              </template>
            </el-table-column>
          </el-table>
          <el-empty v-else description="暂无销售机会" />
        </el-card>
      </el-tab-pane>
    </el-tabs>

    <QuickFollowupDialog
      v-model="quickFollowupVisible"
      :customer-id="customerId"
      @success="handleFollowupSuccess"
    />

    <CustomerForm
      :visible="editFormVisible"
      :customer-id="customerId"
      @close="editFormVisible = false"
      @success="handleEditSuccess"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import PageHeader from '@/components/common/PageHeader.vue'
import QuickFollowupDialog from '@/components/QuickFollowupDialog.vue'
import CustomerForm from '@/views/customers/CustomerForm.vue'
import { getCustomerDetail } from '@/api/customer'
import { getFollowupList } from '@/api/followup'
import { getOpportunityList } from '@/api/opportunity'
import { customerSourceMap, customerStageMap, customerLevelMap, industryMap, mapLabel } from '@/utils/dict'

const route = useRoute()
const router = useRouter()

const customerId = ref<number>(Number(route.params.id))
const customerInfo = ref<any>({})
const loading = ref(false)

// Tab切换
const activeTab = ref('followups')

// 跟进记录
const followups = ref<any[]>([])
const followupsLoading = ref(false)

// 销售机会
const opportunities = ref<any[]>([])
const opportunitiesLoading = ref(false)

// 快速跟进
const quickFollowupVisible = ref(false)

// 编辑表单
const editFormVisible = ref(false)

// 加载客户详情
const loadCustomerDetail = async () => {
  loading.value = true
  try {
    const res = await getCustomerDetail(customerId.value)
    customerInfo.value = res.data
  } catch (error) {
    console.error('加载客户详情失败:', error)
    ElMessage.error('加载客户详情失败')
  } finally {
    loading.value = false
  }
}

// 加载跟进记录
const loadFollowups = async () => {
  followupsLoading.value = true
  try {
    const res = await getFollowupList({
      customer_id: customerId.value,
      page: 1,
      pageSize: 50
    })
    followups.value = res.data.list
  } catch (error) {
    console.error('加载跟进记录失败:', error)
    ElMessage.error('加载跟进记录失败')
  } finally {
    followupsLoading.value = false
  }
}

// 编辑
const handleEdit = () => {
  editFormVisible.value = true
}

// 编辑成功回调
const handleEditSuccess = () => {
  loadCustomerDetail()
}

// 快速跟进
const handleQuickFollowup = () => {
  quickFollowupVisible.value = true
}

// 跟进成功回调
const handleFollowupSuccess = () => {
  loadFollowups()
}

// 格式化日期时间
const formatDateTime = (dateTime: string) => {
  if (!dateTime) return '-'
  const date = new Date(dateTime)
  return date.toLocaleString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  })
}

// 获取等级标签类型
const getLevelType = (level: string) => {
  const map: Record<string, any> = {
    vip: 'danger',
    important: 'warning',
    normal: 'info'
  }
  return map[level] || 'info'
}

// 获取等级文本
const getLevelText = (level: string) => mapLabel(customerLevelMap, level)

// 获取阶段标签类型
const getStageType = (stage: string) => {
  const map: Record<string, any> = {
    potential: 'info',
    intention: 'primary',
    quotation: 'warning',
    negotiation: 'warning',
    deal: 'success'
  }
  return map[stage] || 'info'
}

// 获取阶段文本
const getStageText = (stage: string) => mapLabel(customerStageMap, stage)

// 获取跟进方式文本
const getFollowupTypeText = (type: string) => {
  const map: Record<string, string> = {
    phone: '电话',
    visit: '拜访',
    email: '邮件',
    wechat: '微信'
  }
  return map[type] || type
}

// 获取跟进方式标签类型
const getFollowupTypeTagType = (type: string) => {
  const map: Record<string, any> = {
    phone: 'primary',
    visit: 'success',
    email: 'info',
    wechat: 'warning'
  }
  return map[type] || ''
}

// 加载销售机会列表
const loadOpportunities = async () => {
  opportunitiesLoading.value = true
  try {
    const res = await getOpportunityList({
      page: 1,
      pageSize: 100,
      customer_id: customerId.value,
      onlyMine: 'false'
    })
    opportunities.value = res.data.list
  } catch (error) {
    console.error('加载机会列表失败:', error)
    ElMessage.error('加载机会列表失败')
  } finally {
    opportunitiesLoading.value = false
  }
}

// 查看机会详情
const handleViewOpportunity = (id: number) => {
  router.push(`/opportunities/${id}`)
}

// 创建机会
const handleCreateOpportunity = () => {
  router.push('/opportunities?customer=' + customerId.value)
}

// 格式化金额
const formatAmount = (amount: number) => {
  return amount.toLocaleString('zh-CN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
}

// 获取机会状态类型
const getOppStatusType = (status: string) => {
  const map: Record<string, string> = {
    won: 'success',
    lost: 'danger'
  }
  return map[status] || undefined
}

// 获取机会状态标签
const getOppStatusLabel = (status: string) => {
  const map: Record<string, string> = {
      open: '进行中',
      won: '已赢单',
      lost: '已输单'
  }
  return map[status] || status
}

// 获取机会阶段类型
const getOppStageType = (stage: string) => {
  const map: Record<string, string> = {
    initial: 'info',
    proposal: 'warning',
    negotiation: 'warning',
    closed_won: 'success',
    closed_lost: 'danger'
  }
  return map[stage] || undefined
}

// 获取机会阶段标签
const getOppStageLabel = (stage: string) => {
  const map: Record<string, string> = {
    initial: '初步沟通',
    demand: '需求确认',
    proposal: '方案报价',
    negotiation: '商务谈判',
    closed_won: '赢单',
    closed_lost: '输单'
  }
  return map[stage] || stage
}

// 监听Tab切换，懒加载机会列表
watch(activeTab, (newTab) => {
  if (newTab === 'opportunities' && opportunities.value.length === 0) {
    loadOpportunities()
  }
})

// 初始化
onMounted(() => {
  loadCustomerDetail()
  loadFollowups()
})
</script>
<style scoped lang="scss">
.customer-detail {
  padding: 0;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

// 通用卡片样式
:deep(.el-card) {
  border-radius: $border-radius-card;
  box-shadow: $box-shadow-light;
  transition: all 0.3s ease;
  margin-bottom: $spacing-lg;

  &:hover {
    box-shadow: $box-shadow-base;
  }

  .el-card__header {
    padding: $spacing-md $spacing-lg;
    background: linear-gradient(
      to bottom,
      $color-bg-card 0%,
      rgba($color-bg-page, 0.3) 100%
    );
    border-bottom: 1px solid $color-border-light;
  }

  .el-card__body {
    padding: $spacing-lg;
  }
}

 </style>