<template>
  <div class="behavior-analysis">
    <PageHeader title="销售行为分析" description="分析销售人员跟进行为、频率和转化效率" :show-back="false">
      <template #extra>
        <el-date-picker
          v-model="dateRange"
          type="daterange"
          range-separator="至"
          start-placeholder="开始日期"
          end-placeholder="结束日期"
          value-format="YYYY-MM-DD"
          @change="loadData"
        />
        <el-button type="primary" @click="loadData" style="margin-left: 10px">
          <el-icon><Refresh /></el-icon>
          刷新
        </el-button>
      </template>
    </PageHeader>

    <!-- 统计卡片 -->
    <el-row :gutter="20" style="margin-bottom: 20px">
      <el-col :span="6">
        <el-card>
          <div class="stat-card">
            <div class="stat-icon" style="background: #409eff20">
              <el-icon :size="30" color="#409eff"><User /></el-icon>
            </div>
            <div class="stat-content">
              <div class="stat-value">{{ totalSales }}</div>
              <div class="stat-label">销售人数</div>
            </div>
          </div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card>
          <div class="stat-card">
            <div class="stat-icon" style="background: #67c23a20">
              <el-icon :size="30" color="#67c23a"><ChatDotRound /></el-icon>
            </div>
            <div class="stat-content">
              <div class="stat-value">{{ totalFollowups }}</div>
              <div class="stat-label">总跟进次数</div>
            </div>
          </div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card>
          <div class="stat-card">
            <div class="stat-icon" style="background: #e6a23c20">
              <el-icon :size="30" color="#e6a23c"><TrendCharts /></el-icon>
            </div>
            <div class="stat-content">
              <div class="stat-value">{{ topSales }}</div>
              <div class="stat-label">最勤奋销售</div>
            </div>
          </div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card>
          <div class="stat-card">
            <div class="stat-icon" style="background: #f56c6c20">
              <el-icon :size="30" color="#f56c6c"><Star /></el-icon>
            </div>
            <div class="stat-content">
              <div class="stat-value">{{ bestPerformer }}</div>
              <div class="stat-label">最佳业绩</div>
            </div>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <!-- 图表区域 -->
    <el-row :gutter="20">
      <el-col :span="12">
        <el-card>
          <template #header>
            <div class="card-header">
              <span>跟进频率排行</span>
            </div>
          </template>
          <div ref="followupChartRef" style="width: 100%; height: 400px"></div>
        </el-card>
      </el-col>
      <el-col :span="12">
        <el-card>
          <template #header>
            <div class="card-header">
              <span>销售绩效对比</span>
            </div>
          </template>
          <div ref="performanceChartRef" style="width: 100%; height: 400px"></div>
        </el-card>
      </el-col>
    </el-row>

    <!-- 行为统计表格 -->
    <el-card style="margin-top: 20px">
      <template #header>
        <div class="card-header">
          <span>销售行为统计</span>
        </div>
      </template>
      <el-table :data="behaviorData" v-loading="loading">
        <el-table-column prop="user_name" label="销售人员" width="120" fixed />
        <el-table-column prop="followup_count" label="跟进次数" width="100" sortable />
        <el-table-column prop="customer_count" label="客户数" width="100" sortable />
        <el-table-column prop="avg_followup_per_customer" label="人均跟进" width="100" sortable>
          <template #default="{ row }">
            {{ row.avg_followup_per_customer }}次
          </template>
        </el-table-column>
        <el-table-column prop="avg_interval_days" label="跟进间隔" width="120" sortable>
          <template #default="{ row }">
            <el-tag :type="getIntervalType(row.avg_interval_days)">
              {{ row.avg_interval_days }}天
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="活跃度">
          <template #default="{ row }">
            <el-progress 
              :percentage="getActivityPercentage(row)" 
              :color="getActivityColor(row)"
            />
          </template>
        </el-table-column>
      </el-table>
    </el-card>

    <!-- 绩效对比表格 -->
    <el-card style="margin-top: 20px">
      <template #header>
        <div class="card-header">
          <span>销售绩效对比</span>
        </div>
      </template>
      <el-table :data="performanceData" v-loading="loading">
        <el-table-column prop="user_name" label="销售人员" width="120" fixed />
        <el-table-column prop="customer_count" label="客户数" width="100" sortable />
        <el-table-column prop="followup_count" label="跟进数" width="100" sortable />
        <el-table-column prop="opportunity_count" label="机会数" width="100" sortable />
        <el-table-column prop="won_count" label="成交数" width="100" sortable />
        <el-table-column prop="total_amount" label="成交金额" width="150" sortable>
          <template #default="{ row }">
            <span style="color: #f56c6c; font-weight: bold">
              ¥{{ Number(row.total_amount).toLocaleString() }}
            </span>
          </template>
        </el-table-column>
        <el-table-column prop="conversion_rate" label="转化率" width="120" sortable>
          <template #default="{ row }">
            <el-tag :type="getConversionType(row.conversion_rate)">
              {{ row.conversion_rate }}%
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="综合评价" width="180" align="center">
          <template #default="{ row }">
            <div style="display: flex; align-items: center; justify-content: center; gap: 8px;">
              <el-rate 
                :model-value="getPerformanceRating(row)" 
                disabled
                show-score
                text-color="#ff9900"
                score-template="{value}"
                :colors="['#99A9BF', '#F7BA2A', '#FF9900']"
              />
            </div>
          </template>
        </el-table-column>
      </el-table>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import { ElMessage } from 'element-plus'
import * as echarts from 'echarts'
import PageHeader from '@/components/common/PageHeader.vue'
import { getBehaviorStats, getUserPerformance } from '@/api/analysis'

const dateRange = ref<string[]>([])
const loading = ref(false)
const totalSales = ref(0)
const totalFollowups = ref(0)
const topSales = ref('--')
const bestPerformer = ref('--')

const followupChartRef = ref()
const performanceChartRef = ref()
let followupChart: any = null
let performanceChart: any = null

const behaviorData = ref<any[]>([])
const performanceData = ref<any[]>([])

// 加载数据
const loadData = async () => {
  loading.value = true
  try {
    const params: any = {}
    if (dateRange.value && dateRange.value.length === 2) {
      params.start_date = dateRange.value[0]
      params.end_date = dateRange.value[1]
    }

    const [behaviorRes, performanceRes] = await Promise.all([
      getBehaviorStats(params),
      getUserPerformance(params)
    ])

    // 行为数据
    behaviorData.value = behaviorRes.data
    totalSales.value = behaviorRes.data.length
    totalFollowups.value = behaviorRes.data.reduce((sum: number, item: any) => sum + item.followup_count, 0)
    topSales.value = behaviorRes.data[0]?.user_name || '--'

    // 绩效数据
    performanceData.value = performanceRes.data
    bestPerformer.value = performanceRes.data[0]?.user_name || '--'

    // 渲染图表
    renderFollowupChart(behaviorRes.data)
    renderPerformanceChart(performanceRes.data)

  } catch (error) {
    console.error('加载数据失败:', error)
    ElMessage.error('加载数据失败')
  } finally {
    loading.value = false
  }
}

// 渲染跟进频率图表
const renderFollowupChart = (data: any[]) => {
  if (!followupChart) {
    followupChart = echarts.init(followupChartRef.value)
  }

  // 取前10
  const topData = data.slice(0, 10)

  const option = {
    tooltip: {
      trigger: 'axis',
      axisPointer: {
        type: 'shadow'
      }
    },
    grid: {
      left: '3%',
      right: '4%',
      bottom: '3%',
      containLabel: true
    },
    xAxis: {
      type: 'value'
    },
    yAxis: {
      type: 'category',
      data: topData.map(item => item.user_name)
    },
    series: [
      {
        name: '跟进次数',
        type: 'bar',
        data: topData.map(item => item.followup_count),
        itemStyle: {
          color: new echarts.graphic.LinearGradient(0, 0, 1, 0, [
            { offset: 0, color: '#409eff' },
            { offset: 1, color: '#67c23a' }
          ])
        },
        label: {
          show: true,
          position: 'right'
        }
      }
    ]
  }

  followupChart.setOption(option)
}

// 渲染绩效对比图表
const renderPerformanceChart = (data: any[]) => {
  if (!performanceChart) {
    performanceChart = echarts.init(performanceChartRef.value)
  }

  // 取前10
  const topData = data.slice(0, 10)

  const option = {
    tooltip: {
      trigger: 'axis',
      axisPointer: {
        type: 'shadow'
      }
    },
    legend: {
      data: ['客户数', '成交数', '成交金额(千元)']
    },
    grid: {
      left: '3%',
      right: '4%',
      bottom: '3%',
      containLabel: true
    },
    xAxis: {
      type: 'category',
      data: topData.map(item => item.user_name)
    },
    yAxis: {
      type: 'value'
    },
    series: [
      {
        name: '客户数',
        type: 'bar',
        data: topData.map(item => item.customer_count),
        itemStyle: { color: '#409eff' }
      },
      {
        name: '成交数',
        type: 'bar',
        data: topData.map(item => item.won_count),
        itemStyle: { color: '#67c23a' }
      },
      {
        name: '成交金额(千元)',
        type: 'line',
        data: topData.map(item => (parseFloat(item.total_amount) / 1000).toFixed(2)),
        itemStyle: { color: '#f56c6c' },
        yAxisIndex: 0
      }
    ]
  }

  performanceChart.setOption(option)
}

// 获取跟进间隔类型
const getIntervalType = (days: number) => {
  if (days <= 3) return 'success'
  if (days <= 7) return 'warning'
  return 'danger'
}

// 获取活跃度百分比
const getActivityPercentage = (row: any) => {
  // 基于跟进次数和间隔计算活跃度
  const followupScore = Math.min(row.followup_count * 2, 50)
  const intervalScore = row.avg_interval_days > 0 ? Math.max(50 - row.avg_interval_days * 5, 0) : 0
  return Math.min(followupScore + intervalScore, 100)
}

// 获取活跃度颜色
const getActivityColor = (row: any) => {
  const percentage = getActivityPercentage(row)
  if (percentage >= 70) return '#67c23a'
  if (percentage >= 40) return '#e6a23c'
  return '#f56c6c'
}

// 获取转化率类型
const getConversionType = (rate: string) => {
  const value = parseFloat(rate)
  if (value >= 30) return 'success'
  if (value >= 15) return 'warning'
  return 'info'
}

// 获取绩效评分
const getPerformanceRating = (row: any) => {
  let score = 0
  
  // 确保数据有效
  if (!row) return 0
  
  // 客户数评分（最高1星）
  const customerCount = Number(row.customer_count) || 0
  if (customerCount >= 20) score += 1
  else if (customerCount >= 10) score += 0.5
  
  // 跟进数评分（最高1星）
  const followupCount = Number(row.followup_count) || 0
  if (followupCount >= 50) score += 1
  else if (followupCount >= 20) score += 0.5
  
  // 成交数评分（最高1星）
  const wonCount = Number(row.won_count) || 0
  if (wonCount >= 10) score += 1
  else if (wonCount >= 5) score += 0.5
  
  // 金额评分（最高1星）
  const amount = parseFloat(row.total_amount) || 0
  if (amount >= 100000) score += 1
  else if (amount >= 50000) score += 0.5
  
  // 转化率评分（最高1星）
  const conversion = parseFloat(row.conversion_rate) || 0
  if (conversion >= 30) score += 1
  else if (conversion >= 15) score += 0.5
  
  // 返回0-5之间的评分
  const finalScore = Math.min(Math.max(score, 0), 5)
  console.log('Performance rating for', row.user_name, ':', {
    customerCount,
    followupCount,
    wonCount,
    amount,
    conversion,
    finalScore
  })
  return finalScore
}

// 窗口resize处理
const handleResize = () => {
  followupChart?.resize()
  performanceChart?.resize()
}

onMounted(() => {
  loadData()
  window.addEventListener('resize', handleResize)
})

onUnmounted(() => {
  followupChart?.dispose()
  performanceChart?.dispose()
  window.removeEventListener('resize', handleResize)
})
</script>

<style scoped>
.behavior-analysis {
  padding: 0;
}

.stat-card {
  display: flex;
  align-items: center;
  gap: 15px;
}

.stat-icon {
  width: 60px;
  height: 60px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.stat-content {
  flex: 1;
}

.stat-value {
  font-size: 24px;
  font-weight: bold;
  color: #303133;
}

.stat-label {
  font-size: 14px;
  color: #909399;
  margin-top: 5px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}
</style>