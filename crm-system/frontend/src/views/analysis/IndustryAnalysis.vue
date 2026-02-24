<template>
  <div class="industry-analysis">
    <PageHeader title="客户行业分析" description="分析客户行业分布、对比和转化效果" :show-back="false">
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
      <el-col :xs="12" :sm="12" :md="6" :lg="6" :xl="6">
        <el-card>
          <div class="stat-card">
            <div class="stat-icon" style="background: #409eff20">
              <el-icon :size="30" color="#409eff"><OfficeBuilding /></el-icon>
            </div>
            <div class="stat-content">
              <div class="stat-value">{{ totalCustomers }}</div>
              <div class="stat-label">总客户数</div>
            </div>
          </div>
        </el-card>
      </el-col>
      <el-col :xs="12" :sm="12" :md="6" :lg="6" :xl="6">
        <el-card>
          <div class="stat-card">
            <div class="stat-icon" style="background: #67c23a20">
              <el-icon :size="30" color="#67c23a"><PieChart /></el-icon>
            </div>
            <div class="stat-content">
              <div class="stat-value">{{ industryCount }}</div>
              <div class="stat-label">行业类别</div>
            </div>
          </div>
        </el-card>
      </el-col>
      <el-col :xs="12" :sm="12" :md="6" :lg="6" :xl="6">
        <el-card>
          <div class="stat-card">
            <div class="stat-icon" style="background: #e6a23c20">
              <el-icon :size="30" color="#e6a23c"><TrendCharts /></el-icon>
            </div>
            <div class="stat-content">
              <div class="stat-value">{{ topIndustry }}</div>
              <div class="stat-label">主要行业</div>
            </div>
          </div>
        </el-card>
      </el-col>
      <el-col :xs="12" :sm="12" :md="6" :lg="6" :xl="6">
        <el-card>
          <div class="stat-card">
            <div class="stat-icon" style="background: #f56c6c20">
              <el-icon :size="30" color="#f56c6c"><Money /></el-icon>
            </div>
            <div class="stat-content">
              <div class="stat-value">{{ bestIndustry }}</div>
              <div class="stat-label">最佳转化</div>
            </div>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <!-- 图表区域 -->
    <el-row :gutter="20">
      <el-col :xs="24" :sm="24" :md="12" :lg="12" :xl="12">
        <el-card>
          <template #header>
            <div class="card-header">
              <span>行业分布</span>
            </div>
          </template>
          <div ref="pieChartRef" style="width: 100%; height: 400px"></div>
        </el-card>
      </el-col>
      <el-col :xs="24" :sm="24" :md="12" :lg="12" :xl="12">
        <el-card>
          <template #header>
            <div class="card-header">
              <span>行业对比</span>
            </div>
          </template>
          <div ref="barChartRef" style="width: 100%; height: 400px"></div>
        </el-card>
      </el-col>
    </el-row>

    <!-- 行业对比表格 -->
    <el-card style="margin-top: 20px">
      <template #header>
        <div class="card-header">
          <span>行业详细对比</span>
        </div>
      </template>
      <el-table :data="comparisonData" v-loading="loading">
        <el-table-column label="行业" width="150">
          <template #default="{ row }">
            {{ mapLabel(industryMap, row.industry) }}
          </template>
        </el-table-column>
        <el-table-column prop="customer_count" label="客户数" width="100" />
        <el-table-column prop="opportunity_count" label="机会数" width="100" />
        <el-table-column prop="won_count" label="成交数" width="100" />
        <el-table-column prop="total_amount" label="成交金额" width="120">
          <template #default="{ row }">
            ¥{{ Number(row.total_amount).toLocaleString() }}
          </template>
        </el-table-column>
        <el-table-column prop="conversion_rate" label="转化率" width="120">
          <template #default="{ row }">
            <el-tag :type="getConversionType(row.conversion_rate)">
              {{ row.conversion_rate }}%
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="转化进度">
          <template #default="{ row }">
            <el-progress 
              :percentage="parseFloat(row.conversion_rate)" 
              :color="getProgressColor(parseFloat(row.conversion_rate))"
            />
          </template>
        </el-table-column>
      </el-table>
    </el-card>

    <!-- 销售绩效对比表 -->
    <el-card style="margin-top: 20px">
      <template #header>
        <div class="card-header">
          <span>销售绩效对比</span>
        </div>
      </template>
      <el-table :data="performanceData" v-loading="loading">
        <el-table-column prop="user_name" label="销售人员" width="120" fixed />
        <el-table-column prop="customer_count" label="客户数" width="100" sortable />
        <el-table-column prop="opportunity_count" label="机会数" width="100" sortable />
        <el-table-column prop="won_count" label="成交数" width="100" sortable />
        <el-table-column prop="total_amount" label="成交金额" width="150" sortable>
          <template #default="{ row }">
            <span style="color: #f56c6c; font-weight: bold">
              ￥{{ Number(row.total_amount).toLocaleString() }}
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
import { getIndustryStats, getIndustryComparison, getUserPerformance } from '@/api/analysis'
import { industryMap, mapLabel } from '@/utils/dict'

const dateRange = ref<string[]>([])
const loading = ref(false)
const totalCustomers = ref(0)
const industryCount = ref(0)
const topIndustry = ref('--')
const bestIndustry = ref('--')

const pieChartRef = ref()
const barChartRef = ref()
let pieChart: any = null
let barChart: any = null

const comparisonData = ref<any[]>([])
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

    const [statsRes, comparisonRes, performanceRes] = await Promise.all([
      getIndustryStats(params),
      getIndustryComparison(params),
      getUserPerformance(params)
    ])

    // 统计数据
    const stats = statsRes.data
    totalCustomers.value = stats.total
    industryCount.value = stats.stats.length
    topIndustry.value = mapLabel(industryMap, stats.stats[0]?.industry) || '--'

    // 对比数据
    comparisonData.value = comparisonRes.data
    
    // 销售绩效数据
    performanceData.value = performanceRes.data
    
    // 找出转化率最高的行业
    const sortedByConversion = [...comparisonRes.data].sort((a, b) => 
      parseFloat(b.conversion_rate) - parseFloat(a.conversion_rate)
    )
    bestIndustry.value = mapLabel(industryMap, sortedByConversion[0]?.industry) || '--'

    // 渲染图表
    renderPieChart(stats.stats)
    renderBarChart(comparisonRes.data)

  } catch (error) {
    console.error('加载数据失败:', error)
    ElMessage.error('加载数据失败')
  } finally {
    loading.value = false
  }
}

// 渲染饼图
const renderPieChart = (stats: any[]) => {
  if (!pieChart) {
    pieChart = echarts.init(pieChartRef.value)
  }

  const option = {
    tooltip: {
      trigger: 'item',
      formatter: '{a} <br/>{b}: {c} ({d}%)'
    },
    legend: {
      orient: 'vertical',
      left: 'left'
    },
    series: [
      {
        name: '客户行业',
        type: 'pie',
        radius: ['40%', '70%'],
        avoidLabelOverlap: false,
        itemStyle: {
          borderRadius: 10,
          borderColor: '#fff',
          borderWidth: 2
        },
        label: {
          show: false,
          position: 'center'
        },
        emphasis: {
          label: {
            show: true,
            fontSize: 20,
            fontWeight: 'bold'
          }
        },
        labelLine: {
          show: false
        },
        data: stats.map(item => ({
          name: mapLabel(industryMap, item.industry),
          value: item.count
        }))
      }
    ]
  }

  pieChart.setOption(option)
}

// 渲染柱状图
const renderBarChart = (data: any[]) => {
  if (!barChart) {
    barChart = echarts.init(barChartRef.value)
  }

  // 取前10个行业
  const topData = data.slice(0, 10)

  const option = {
    tooltip: {
      trigger: 'axis',
      axisPointer: {
        type: 'shadow'
      }
    },
    legend: {
      data: ['客户数', '成交数', '转化率']
    },
    grid: {
      left: '3%',
      right: '4%',
      bottom: '3%',
      containLabel: true
    },
    xAxis: {
      type: 'category',
      data: topData.map(item => mapLabel(industryMap, item.industry))
    },
    yAxis: [
      {
        type: 'value',
        name: '数量'
      },
      {
        type: 'value',
        name: '转化率(%)',
        max: 100
      }
    ],
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
        name: '转化率',
        type: 'line',
        yAxisIndex: 1,
        data: topData.map(item => parseFloat(item.conversion_rate)),
        itemStyle: { color: '#e6a23c' }
      }
    ]
  }

  barChart.setOption(option)
}

// 获取转化率类型
const getConversionType = (rate: string) => {
  const value = parseFloat(rate)
  if (value >= 30) return 'success'
  if (value >= 15) return 'warning'
  return 'info'
}

// 获取进度条颜色
const getProgressColor = (percentage: number) => {
  if (percentage >= 30) return '#67c23a'
  if (percentage >= 15) return '#e6a23c'
  return '#909399'
}

// 获取销售绩效评分
const getPerformanceRating = (row: any) => {
  let score = 0
  
  // 确保数据有效
  if (!row) return 0
  
  // 客户数评分（最高1星）
  const customerCount = Number(row.customer_count) || 0
  if (customerCount >= 20) score += 1
  else if (customerCount >= 10) score += 0.5
  
  // 机会数评分（最高1星）
  const opportunityCount = Number(row.opportunity_count) || 0
  if (opportunityCount >= 30) score += 1
  else if (opportunityCount >= 15) score += 0.5
  
  // 成交数评分（最高1星）
  const wonCount = Number(row.won_count) || 0
  if (wonCount >= 10) score += 1
  else if (wonCount >= 5) score += 0.5
  
  // 金额评分（最高1星）
  const amount = parseFloat(row.total_amount) || 0
  if (amount >= 100000) score += 1
  else if (amount >= 50000) score += 0.5
  
  // 转化率评分（最星）
  const conversion = parseFloat(row.conversion_rate) || 0
  if (conversion >= 30) score += 1
  else if (conversion >= 15) score += 0.5
  
  // 返回0-5之间的评分
  return Math.min(Math.max(score, 0), 5)
}

// 窗口resize处理
const handleResize = () => {
  pieChart?.resize()
  barChart?.resize()
}

onMounted(() => {
  loadData()
  window.addEventListener('resize', handleResize)
})

onUnmounted(() => {
  pieChart?.dispose()
  barChart?.dispose()
  window.removeEventListener('resize', handleResize)
})
</script>

<style scoped>
.industry-analysis {
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