<template>
  <div class="customer-pool">
    <PageHeader title="客户公海" description="管理公海池中的客户资源" :show-back="false">
      <template #extra>
        <el-button type="primary" @click="loadPoolList">
          <el-icon><Refresh /></el-icon>
          刷新
        </el-button>
      </template>
    </PageHeader>

    <!-- 统计卡片 -->
    <el-row :gutter="20" class="stats-row">
      <el-col :xs="12" :sm="8" :md="6" :lg="4" :xl="4">
        <el-card class="stat-card">
          <div class="stat-content">
            <div class="stat-icon" style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);">
              <el-icon :size="32"><User /></el-icon>
            </div>
            <div class="stat-info">
              <div class="stat-value">{{ poolStats.availableCount || 0 }}</div>
              <div class="stat-label">可领取客户</div>
            </div>
          </div>
        </el-card>
      </el-col>
      <el-col :xs="12" :sm="8" :md="6" :lg="4" :xl="4">
        <el-card class="stat-card">
          <div class="stat-content">
            <div class="stat-icon" style="background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);">
              <el-icon :size="32"><Calendar /></el-icon>
            </div>
            <div class="stat-info">
              <div class="stat-value">{{ poolStats.todayClaimedCount || 0 }}/{{ poolStats.dailyClaimLimit || 10 }}</div>
              <div class="stat-label">今日已领取</div>
            </div>
          </div>
        </el-card>
      </el-col>
      <el-col :xs="12" :sm="8" :md="6" :lg="4" :xl="4">
        <el-card class="stat-card">
          <div class="stat-content">
            <div class="stat-icon" style="background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);">
              <el-icon :size="32"><Check /></el-icon>
            </div>
            <div class="stat-info">
              <div class="stat-value">{{ poolStats.claimedCount || 0 }}</div>
              <div class="stat-label">已领取客户</div>
            </div>
          </div>
        </el-card>
      </el-col>
      <el-col :xs="12" :sm="8" :md="6" :lg="4" :xl="4">
        <el-card class="stat-card">
          <div class="stat-content">
            <div class="stat-icon" style="background: linear-gradient(135deg, #fa709a 0%, #fee140 100%);">
              <el-icon :size="32"><Star /></el-icon>
            </div>
            <div class="stat-info">
              <div class="stat-value">{{ poolStats.myClaimedCount || 0 }}</div>
              <div class="stat-label">我领取的</div>
            </div>
          </div>
        </el-card>
      </el-col>
      <el-col :xs="12" :sm="8" :md="6" :lg="4" :xl="4">
        <el-card class="stat-card">
          <div class="stat-content">
            <div class="stat-icon" style="background: linear-gradient(135deg, #30cfd0 0%, #330867 100%);">
              <el-icon :size="32"><TrendCharts /></el-icon>
            </div>
            <div class="stat-info">
              <div class="stat-value">{{ (poolStats.availableCount || 0) + (poolStats.claimedCount || 0) }}</div>
              <div class="stat-label">公海总数</div>
            </div>
          </div>
        </el-card>
      </el-col>
      <el-col :xs="12" :sm="8" :md="6" :lg="4" :xl="4">
        <el-card class="stat-card" :class="{ 'stat-card-disabled': !poolStats.canClaimToday }">
          <div class="stat-content">
            <div class="stat-icon" style="background: linear-gradient(135deg, #a8edea 0%, #fed6e3 100%);">
              <el-icon :size="32"><Select /></el-icon>
            </div>
            <div class="stat-info">
              <div class="stat-value">{{ poolStats.canClaimToday ? '可领取' : '已达上限' }}</div>
              <div class="stat-label">今日状态</div>
            </div>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <!-- 搜索条件 -->
    <el-card class="search-card">
      <el-form :model="searchForm" inline>
        <el-form-item label="客户名称">
          <el-input
            v-model="searchForm.name"
            placeholder="请输入客户名称"
            clearable style="width: 200px"
          />
        </el-form-item>
        <el-form-item label="所属行业">
          <el-select
            v-model="searchForm.industry"
            placeholder="请选择行业"
            clearable
            style="width: 150px"
          >
            <el-option label="IT互联网" value="IT互联网" />
            <el-option label="制造业" value="制造业" />
            <el-option label="金融服务" value="金融服务" />
            <el-option label="教育培训" value="教育培训" />
            <el-option label="医疗健康" value="医疗健康" />
          </el-select>
        </el-form-item>
        <el-form-item label="客户等级">
          <el-select
            v-model="searchForm.level"
            placeholder="请选择等级"
            clearable
            style="width: 120px"
          >
            <el-option label="VIP客户" value="vip" />
            <el-option label="重要客户" value="important" />
            <el-option label="普通客户" value="normal" />
          </el-select>
        </el-form-item>
        <el-form-item label="状态">
          <el-select
            v-model="searchForm.status"
            placeholder="请选择状态" style="width: 120px"
          >
            <el-option label="可领取" value="available" />
            <el-option label="已领取" value="claimed" />
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="handleSearch">
            <el-icon><Search /></el-icon>
            搜索
          </el-button>
          <el-button @click="handleReset">
            <el-icon><RefreshLeft /></el-icon>
            重置
          </el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <!-- 公海池列-->
    <el-card class="table-card">
      <el-table
        :data="poolList"
        v-loading="loading"
        element-loading-text="加载中..."
        style="width: 100%"
      >
        <template #empty>
          <el-empty description="公海池暂无客户" />
        </template>
        
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
            <el-tag v-if="row.customer && getLevelType(row.customer.level)" :type="getLevelType(row.customer.level)">
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
        <el-table-column prop="reason" label="进入原因" width="120" show-overflow-tooltip />
        <el-table-column prop="enter_at" label="进入时间" width="180">
          <template #default="{ row }">
            {{ formatDateTime(row.enter_at) }}
          </template>
        </el-table-column>
        <el-table-column prop="status" label="状态" width="100">
          <template #default="{ row }">
            <el-tag :type="row.status === 'available' ? 'success' : 'info'">
              {{ row.status === 'available' ? '可领取' : '已领取' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="180" fixed="right">
          <template #default="{ row }">
            <el-button
              v-if="row.status === 'available'"
              link
              type="primary"
              :disabled="!poolStats.canClaimToday"
              @click="handleClaim(row)"
            >
              <el-icon><Select /></el-icon>
              {{ poolStats.canClaimToday ? '领取' : '已达上限' }}
            </el-button>
            <el-button
              v-else
              link
              type="success"
              disabled
            >
              <el-icon><Check /></el-icon>
              已领取
            </el-button>
            <el-button link type="primary" @click="handleViewCustomer(row)">
              <el-icon><View /></el-icon>
              查看客户
            </el-button>
          </template>
        </el-table-column>
      </el-table>

      <!-- 分页 -->
      <div class="pagination">
        <el-pagination
          v-model:current-page="pagination.page"
          v-model:page-size="pagination.pageSize"
          :total="pagination.total"
          :page-sizes="[10, 20, 50, 100]"
          layout="total, sizes, prev, pager, next, jumper"
          @size-change="loadPoolList"
          @current-change="loadPoolList"
        />
      </div>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import PageHeader from '@/components/common/PageHeader.vue'
import { getPoolList, claimFromPool, getPoolStats } from '@/api/customerPool'

const router = useRouter()

// 搜索表单
const searchForm = reactive({
  name: '',
  industry: '',
  level: '',
  status: 'available'
})

// 公海池列表
const poolList = ref<any[]>([])
const loading = ref(false)

// 统计数据
const poolStats = ref<any>({
  availableCount: 0,
  claimedCount: 0,
  myClaimedCount: 0
})

// 分页
const pagination = reactive({
  page: 1,
  pageSize: 10,
  total: 0
})

// 加载公海池列表
const loadPoolList = async () => {
  loading.value = true
  try {
    const res = await getPoolList({
      ...searchForm,
      page: pagination.page,
      pageSize: pagination.pageSize
    })
    
    poolList.value = res.data.list
    pagination.total = res.data.total
  } catch (error) {
    console.error('加载公海池列表失败', error)
    ElMessage.error('加载公海池列表失败')
  } finally {
    loading.value = false
  }
}

// 加载统计数据
const loadPoolStats = async () => {
  try {
    const res = await getPoolStats()
    poolStats.value = res.data
  } catch (error) {
    console.error('加载统计数据失败:', error)
  }
}

// 搜索
const handleSearch = () => {
  pagination.page = 1
  loadPoolList()
}

// 重置
const handleReset = () => {
  searchForm.name = ''
  searchForm.industry = ''
  searchForm.level = ''
  searchForm.status = 'available'
  pagination.page = 1
  loadPoolList()
}

// 领取客户
const handleClaim = (row: any) => {
  // 检查今日限额
  if (!poolStats.value.canClaimToday) {
    ElMessage.warning(`您今日已达领取上限（${poolStats.value.dailyClaimLimit}天），请明日再试`)
    return
  }

  const currentCount = poolStats.value.todayClaimedCount || 0
  const limitCount = poolStats.value.dailyClaimLimit || 10
  
  ElMessageBox.confirm(
    `确定要领取客户${row.customer?.name}"吗？`,
    '领取客户',
    {
      confirmButtonText: '确定领取',
      cancelButtonText: '取消',
      type: 'warning',
      message: `领取后该客户将成为你的负责客户。今日已领取 ${currentCount}/${limitCount} 个客户。`
    }
  ).then(async () => {
    try {
      const res = await claimFromPool(row.id)
      ElMessage.success(res.message || '领取成功')
      loadPoolList()
      loadPoolStats()
    } catch (error: any) {
      console.error('领取失败:', error)
      ElMessage.error(error.response?.data?.message || '领取失败')
    }
  }).catch(() => {
    // 取消领取
  })
}

// 查看客户详情
const handleViewCustomer = (row: any) => {
  if (row.customer && row.customer.id) {
    router.push(`/customers/${row.customer.id}`)
  } else {
      ElMessage.warning('客户信息不存在')
  }
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
const getLevelText = (level: string) => {
  const map: Record<string, string> = {
    vip: 'VIP',
      important: '重要',
      normal: '普通'
  }
  return map[level] || level
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

// 初始化
onMounted(() => {
  loadPoolList()
  loadPoolStats()
})
</script>

<style scoped>
.customer-pool {
  padding: 20px;
}

.stats-row {
  margin-bottom: 20px;
}

.stat-card {
  cursor: pointer;
  transition: transform 0.3s, box-shadow 0.3s;
}

.stat-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.1);
}

.stat-content {
  display: flex;
  align-items: center;
  gap: 15px;
}

.stat-icon {
  width: 60px;
  height: 60px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
}

.stat-info {
  flex: 1;
}

.stat-value {
  font-size: 28px;
  font-weight: bold;
  color: #333;
}

.stat-label {
  font-size: 14px;
  color: #999;
  margin-top: 5px;
}

.search-card {
  margin-bottom: 20px;
}

.table-card {
  min-height: 400px;
}

.pagination {
  margin-top: 20px;
  display: flex;
  justify-content: flex-end;
}
</style>