<template>
  <div class="opportunity-detail">
    <PageHeader :title="opportunity.name || '销售机会详情'" :show-back="true">
      <template #extra>
        <el-button @click="handleEdit">
          <el-icon><Edit /></el-icon>
          编辑
        </el-button>
        <el-button type="success" @click="handleWin" v-if="opportunity.status === 'open'">
          <el-icon><SuccessFilled /></el-icon>
          标记赢单
        </el-button>
        <el-button type="danger" @click="handleLose" v-if="opportunity.status === 'open'">
          <el-icon><CloseBold /></el-icon>
          标记输单
        </el-button>
      </template>
    </PageHeader>

    <el-row :gutter="20" v-loading="loading">
      <!-- 左侧：基本信-->
      <el-col :span="16">
        <!-- 基本信息卡片 -->
        <el-card class="info-card">
          <template #header>
            <div class="card-header">
              <span>基本信息</span>
              <el-tag :type="getStatusType(opportunity.status)">
                {{ getStatusLabel(opportunity.status) }}
              </el-tag>
            </div>
          </template>
          
          <el-descriptions :column="2" border>
            <el-descriptions-item label="机会名称">
              {{ opportunity.name }}
            </el-descriptions-item>
            <el-descriptions-item label="预期金额">
              <span style="color: #f56c6c; font-weight: bold; font-size: 16px;">
                ¥{{ formatAmount(opportunity.amount || 0) }}
              </span>
            </el-descriptions-item>
            <el-descriptions-item label="销售阶段">
              <el-tag :type="getStageType(opportunity.stage)">
                {{ getStageLabel(opportunity.stage) }}
              </el-tag>
            </el-descriptions-item>
            <el-descriptions-item label="赢率">
              <el-progress :percentage="opportunity.probability || 0" />
            </el-descriptions-item>
            <el-descriptions-item label="优先级">
              <el-tag :type="getPriorityType(opportunity.priority)">
                {{ getPriorityLabel(opportunity.priority) }}
              </el-tag>
            </el-descriptions-item>
            <el-descriptions-item label="产品">
              {{ opportunity.product || '-' }}
            </el-descriptions-item>
            <el-descriptions-item label="预计成交日期">
              {{ opportunity.expected_close_date || '-' }}
            </el-descriptions-item>
            <el-descriptions-item label="实际成交日期">
              {{ opportunity.close_date || '-' }}
            </el-descriptions-item>
            <el-descriptions-item label="实际金额" v-if="opportunity.actual_amount">
              <span style="color: #67c23a; font-weight: bold;">
                ¥{{ formatAmount(opportunity.actual_amount) }}
              </span>
            </el-descriptions-item>
            <el-descriptions-item label="负责人">
              {{ opportunity.owner?.name || '-' }}
            </el-descriptions-item>
            <el-descriptions-item label="创建时间" :span="2">
              {{ formatDateTime(opportunity.created_at) }}
            </el-descriptions-item>
            <el-descriptions-item label="描述" :span="2">
              {{ opportunity.description || '-' }}
            </el-descriptions-item>
          </el-descriptions>
        </el-card>

        <!-- 销售进度 -->
        <el-card class="progress-card">
          <template #header>
            <span>销售进度</span>
          </template>
          <el-steps :active="getStageIndex(opportunity.stage)" align-center>
            <el-step title="初步沟通" description="10%" />
            <el-step title="需求确认" description="30%" />
            <el-step title="方案报价" description="50%" />
            <el-step title="商务谈判" description="70%" />
            <el-step title="赢单" description="100%" />
          </el-steps>
        </el-card>
      </el-col>

      <!-- 右侧：客户信-->
      <el-col :span="8">
        <el-card class="customer-card">
          <template #header>
            <div class="card-header">
              <span>客户信息</span>
              <el-button link type="primary" @click="viewCustomer">查看详情</el-button>
            </div>
          </template>
          
          <div class="customer-info" v-if="opportunity.customer">
            <div class="info-item">
              <span class="label">客户名称：</span>
              <span class="value">{{ opportunity.customer.name }}</span>
            </div>
            <div class="info-item">
              <span class="label">联系人：</span>
              <span class="value">{{ opportunity.customer.contact || '-' }}</span>
            </div>
            <div class="info-item">
              <span class="label">联系电话：</span>
              <span class="value">{{ opportunity.customer.phone || '-' }}</span>
            </div>
            <div class="info-item">
              <span class="label">所属行业：</span>
              <span class="value">{{ opportunity.customer.industry || '-' }}</span>
            </div>
            <div class="info-item">
              <span class="label">客户等级：</span>
              <el-tag v-if="getLevelType(opportunity.customer.level)" :type="getLevelType(opportunity.customer.level)">
                {{ getLevelText(opportunity.customer.level) }}
              </el-tag>
              <span v-else>{{ getLevelText(opportunity.customer.level) }}</span>
            </div>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <!-- 编辑对话-->
    <OpportunityForm
      :visible="formVisible"
      :opportunity-id="opportunityId"
      @close="formVisible = false"
      @success="loadDetail"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import PageHeader from '@/components/common/PageHeader.vue'
import OpportunityForm from './OpportunityForm.vue'
import { getOpportunityDetail, updateOpportunity } from '@/api/opportunity'

const route = useRoute()
const router = useRouter()

const opportunityId = ref(parseInt(route.params.id as string))
const opportunity = ref<any>({})
const loading = ref(false)
const formVisible = ref(false)

// 加载详情
const loadDetail = async () => {
  loading.value = true
  try {
    const res = await getOpportunityDetail(opportunityId.value)
    opportunity.value = res.data
  } catch (error) {
    console.error('加载详情失败:', error)
    ElMessage.error('加载详情失败')
  } finally {
    loading.value = false
  }
}

// 编辑
const handleEdit = () => {
  formVisible.value = true
}

// 标记赢单
const handleWin = () => {
  ElMessageBox.prompt('请输入赢单原因', '标记赢单', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    inputPattern: /.{5,}/,
    inputErrorMessage: '赢单原因不能少于5个字'
  }).then(async ({ value }) => {
    try {
      await updateOpportunity(opportunityId.value, {
        status: 'won',
        stage: 'closed_won',
        probability: 100,
        close_date: new Date().toISOString().split('T')[0],
        win_reason: value
      })
      ElMessage.success('已标记为赢单')
      loadDetail()
    } catch (error) {
      console.error('标记赢单失败:', error)
      ElMessage.error('标记赢单失败')
    }
  }).catch(() => {})
}

// 标记输单
const handleLose = () => {
  ElMessageBox.prompt('请输入输单原因', '标记输单', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    inputPattern: /.{5,}/,
    inputErrorMessage: '输单原因不能少于5个字'
  }).then(async ({ value }) => {
    try {
      await updateOpportunity(opportunityId.value, {
        status: 'lost',
        stage: 'closed_lost',
        probability: 0,
        close_date: new Date().toISOString().split('T')[0],
        lose_reason: value
      })
      ElMessage.success('已标记为输单')
      loadDetail()
    } catch (error) {
      console.error('标记输单失败:', error)
      ElMessage.error('标记输单失败')
    }
  }).catch(() => {})
}

// 查看客户
const viewCustomer = () => {
  if (opportunity.value.customer) {
    router.push(`/customers/${opportunity.value.customer.id}`)
  }
}

// 获取阶段索引
const getStageIndex = (stage: string) => {
  const map: Record<string, number> = {
    initial: 0,
    demand: 1,
    proposal: 2,
    negotiation: 3,
    closed_won: 5,  // 返回5表示所有步骤完成
    closed_lost: 5
  }
  return map[stage] || 0
}

// 格式化金额
const formatAmount = (amount: number) => {
  return amount.toLocaleString('zh-CN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
}

// 格式化日期时间
const formatDateTime = (dateTime: string) => {
  if (!dateTime) return '-'
  const date = new Date(dateTime)
  return date.toLocaleString('zh-CN')
}

// 获取阶段类型
const getStageType = (stage: string) => {
  const map: Record<string, any> = {
    initial: 'info',
    demand: 'primary',
    proposal: 'warning',
    negotiation: 'warning',
    closed_won: 'success',
    closed_lost: 'danger'
  }
  return map[stage] || 'info'
}

// 获取阶段标签
const getStageLabel = (stage: string) => {
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

// 获取状态类型
const getStatusType = (status: string) => {
  const map: Record<string, any> = {
    open: 'info',
    won: 'success',
    lost: 'danger'
  }
  return map[status] || 'info'
}

// 获取状态标签
const getStatusLabel = (status: string) => {
  const map: Record<string, string> = {
    open: '进行中',
    won: '已赢单',
    lost: '已输单'
  }
  return map[status] || status
}

// 获取优先级类型
const getPriorityType = (priority: string) => {
  const map: Record<string, any> = {
    low: 'info',
    medium: 'warning',
    high: 'danger'
  }
  return map[priority] || 'info'
}

// 获取优先级标签
const getPriorityLabel = (priority: string) => {
  const map: Record<string, string> = {
    low: '低',
    medium: '中',
    high: '高'
  }
  return map[priority] || priority
}

// 获取等级类型
const getLevelType = (level: string) => {
  const map: Record<string, any> = {
    vip: 'danger',
    important: 'warning',
    normal: 'info'
  }
  return map[level] || 'info'
}

// 获取等级文本
const getLevelText = (level: string) => {
  const map: Record<string, string> = {
    vip: 'VIP',
    important: '重要',
    normal: '普通'
  }
  return map[level] || level
}

onMounted(() => {
  loadDetail()
})
</script>

<style scoped>
.opportunity-detail {
  padding: 20px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.info-card,
.progress-card {
  margin-bottom: 20px;
}

.progress-card {
  padding: 20px 0;
}

.customer-card {
  height: fit-content;
}

.customer-info {
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.info-item {
  display: flex;
  align-items: center;
}

.info-item .label {
  color: #909399;
  margin-right: 10px;
  min-width: 80px;
}

.info-item .value {
  color: #606266;
  font-weight: 500;
}
</style>