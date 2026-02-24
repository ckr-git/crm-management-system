<template>
  <div class="opportunity-list">
    <PageHeader title="销售机会" description="管理您的销售机会" :show-back="false">
      <template #extra>
        <el-button type="primary" @click="handleAdd">
          <el-icon><Plus /></el-icon>
          新增机会
        </el-button>
      </template>
    </PageHeader>

    <!-- 统计卡片 -->
    <el-row :gutter="20" class="stats-row">
      <el-col :span="6">
        <el-card shadow="hover">
          <div class="stat-item">
            <div class="stat-label">总机会数</div>
            <div class="stat-value">{{ stats.total || 0 }}</div>
          </div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card shadow="hover">
          <div class="stat-item">
            <div class="stat-label">进行中</div>
            <div class="stat-value">{{ stats.open || 0 }}</div>
          </div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card shadow="hover">
          <div class="stat-item">
            <div class="stat-label">已赢单</div>
            <div class="stat-value" style="color: #67c23a;">{{ stats.won || 0 }}</div>
          </div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card shadow="hover">
          <div class="stat-item">
            <div class="stat-label">总金额</div>
            <div class="stat-value">¥{{ formatAmount(stats.totalAmount || 0) }}</div>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <!-- 搜索表单 -->
    <el-card shadow="hover" style="margin-bottom: 20px;">
      <el-form :model="searchForm" inline>
        <el-form-item label="机会名称">
          <el-input v-model="searchForm.name" placeholder="请输入机会名称" clearable />
        </el-form-item>
        <el-form-item label="机会阶段">
          <el-select v-model="searchForm.stage" placeholder="请选择阶段" clearable>
            <el-option label="初步沟通" value="initial" />
            <el-option label="需求确认" value="demand" />
            <el-option label="方案报价" value="proposal" />
            <el-option label="商务谈判" value="negotiation" />
            <el-option label="赢单" value="closed_won" />
            <el-option label="输单" value="closed_lost" />
          </el-select>
        </el-form-item>
        <el-form-item label="机会状态">
          <el-select v-model="searchForm.status" placeholder="请选择状态" clearable>
            <el-option label="进行中" value="open" />
            <el-option label="已赢单" value="won" />
            <el-option label="已输单" value="lost" />
          </el-select>
        </el-form-item>
        <el-form-item label="显示范围">
          <el-select v-model="searchForm.onlyMine" placeholder="请选择">
            <el-option label="我的机会" value="true" />
            <el-option label="全部机会" value="false" />
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="handleSearch">
            <el-icon><Search /></el-icon>
            搜索
          </el-button>
          <el-button @click="handleReset">
            <el-icon><RefreshRight /></el-icon>
            重置
          </el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <!-- 机会表格 -->
    <el-card shadow="hover">
      <el-table
        :data="opportunities"
        v-loading="loading"
        style="width: 100%"
      >
        <el-table-column prop="name" label="机会名称" min-width="150" />
        <el-table-column label="客户名称" width="120">
          <template #default="{ row }">
            {{ row.customer?.name || row.customer_name || '-' }}
          </template>
        </el-table-column>
        <el-table-column label="机会阶段" width="120">
          <template #default="{ row }">
            <el-tag :type="getStageType(row.stage)">
              {{ getStageLabel(row.stage) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="金额" width="120">
          <template #default="{ row }">
            ¥{{ formatAmount(row.amount) }}
          </template>
        </el-table-column>
        <el-table-column label="状态" width="100">
          <template #default="{ row }">
            <el-tag :type="getStatusType(row.status)">
              {{ getStatusLabel(row.status) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="负责人" width="100">
          <template #default="{ row }">
            {{ row.owner?.name || row.owner_name || '-' }}
          </template>
        </el-table-column>
        <el-table-column label="预计成交日期" width="120">
          <template #default="{ row }">
            {{ row.expected_close_date || '-' }}
          </template>
        </el-table-column>
        <el-table-column label="操作" width="220" fixed="right">
          <template #default="{ row }">
            <el-button type="primary" size="small" @click="handleView(row)">
              查看
            </el-button>
            <el-button type="primary" size="small" plain @click="handleEdit(row)">
              编辑
            </el-button>
            <el-button type="danger" size="small" plain @click="handleDelete(row)">
              删除
            </el-button>
          </template>
        </el-table-column>
      </el-table>

      <!-- 分页 -->
      <el-pagination
        v-model:current-page="pagination.page"
        v-model:page-size="pagination.pageSize"
        :total="pagination.total"
        :page-sizes="[10, 20, 50, 100]"
        layout="total, sizes, prev, pager, next, jumper"
        @size-change="getOpportunities"
        @current-change="getOpportunities"
        style="margin-top: 20px; justify-content: flex-end;"
      />
    </el-card>

    <!-- 机会表单对话框 -->
    <OpportunityForm
      :visible="formVisible"
      :opportunity-id="currentOpportunityId"
      @close="formVisible = false"
      @success="handleFormSuccess"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import PageHeader from '@/components/common/PageHeader.vue'
import OpportunityForm from './OpportunityForm.vue'
import { getOpportunityList, deleteOpportunity, getOpportunityStats } from '@/api/opportunity'

const router = useRouter()

// 搜索表单
const searchForm = reactive({
  name: '',
  stage: '',
  status: '',
  onlyMine: 'true'
})

// 机会列表
const opportunities = ref<any[]>([])
const loading = ref(false)

// 统计数据
const stats = ref<any>({
  total: 0,
  open: 0,
  won: 0,
  lost: 0,
  totalAmount: 0
})

// 分页
const pagination = reactive({
  page: 1,
  pageSize: 10,
  total: 0
})

// 表单对话框
const formVisible = ref(false)
const currentOpportunityId = ref<number | undefined>()

// 获取机会列表
const getOpportunities = async () => {
  loading.value = true
  try {
    const res = await getOpportunityList({
      ...searchForm,
      page: pagination.page,
      pageSize: pagination.pageSize
    })
    
    opportunities.value = res.data.list
    pagination.total = res.data.total
  } catch (error) {
    console.error('获取机会列表失败:', error)
    ElMessage.error('获取机会列表失败')
  } finally {
    loading.value = false
  }
}

// 获取统计数据
const loadStats = async () => {
  try {
    const res = await getOpportunityStats()
    stats.value = res.data
  } catch (error) {
    console.error('获取统计数据失败:', error)
  }
}

// 搜索
const handleSearch = () => {
  pagination.page = 1
  getOpportunities()
}

// 重置
const handleReset = () => {
  searchForm.name = ''
  searchForm.stage = ''
  searchForm.status = ''
  searchForm.onlyMine = 'true'
  handleSearch()
}

// 查看详情
const handleView = (row: any) => {
  router.push(`/opportunities/${row.id}`)
}

// 新增
const handleAdd = () => {
  currentOpportunityId.value = undefined
  formVisible.value = true
}

// 编辑
const handleEdit = (row: any) => {
  currentOpportunityId.value = row.id
  formVisible.value = true
}

// 删除
const handleDelete = (row: any) => {
  ElMessageBox.confirm(`确定要删除机会"${row.name}"吗？`, '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(async () => {
    try {
      await deleteOpportunity(row.id)
      ElMessage.success('删除成功')
      getOpportunities()
      loadStats()
    } catch (error) {
      console.error('删除失败:', error)
      ElMessage.error('删除失败')
    }
  }).catch(() => {
    // 取消删除
  })
}

// 表单提交成功
const handleFormSuccess = () => {
  getOpportunities()
  loadStats()
}

// 格式化金额
const formatAmount = (amount: number) => {
  return amount.toLocaleString('zh-CN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
}

// 获取阶段类型
const getStageType = (stage: string) => {
  const map: Record<string, any> = {
    initial: 'info',
    demand: undefined,
    proposal: 'warning',
    negotiation: 'warning',
    closed_won: 'success',
    closed_lost: 'danger'
  }
  return map[stage]
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
    open: undefined,
    won: 'success',
    lost: 'danger'
  }
  return map[status]
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
onMounted(() => {
  getOpportunities()
  loadStats()
})
</script>
<style lang="scss" scoped>
.opportunity-list {
  padding: 0;
}

.stats-row {
  margin-bottom: 20px;
}

.stat-item {
  text-align: center;
  padding: 20px 0;

  .stat-label {
    font-size: 14px;
    color: #909399;
    margin-bottom: 8px;
  }

  .stat-value {
    font-size: 24px;
    font-weight: bold;
    color: #303133;
  }
}
</style>
