<template>
  <div class="opportunity-analysis">
    <PageHeader title="销售数据分析" :show-back="false">
      <template #extra>
        <el-button @click="refreshData" :loading="refreshing">
          <el-icon><Refresh /></el-icon>
          刷新数据
        </el-button>
        <el-button type="primary" @click="handleExport">
          <el-icon><Download /></el-icon>
          导出Excel
        </el-button>
      </template>
    </PageHeader>

    <!-- 时间范围筛-->
    <el-card class="filter-card" shadow="hover">
      <el-form :inline="true">
        <el-form-item label="时间范围">
          <el-radio-group v-model="timeRange" @change="handleTimeRangeChange">
            <el-radio-button label="week">本周</el-radio-button>
            <el-radio-button label="month">本月</el-radio-button>
            <el-radio-button label="quarter">本季度</el-radio-button>
            <el-radio-button label="year">本年</el-radio-button>
            <el-radio-button label="custom">自定义</el-radio-button>
          </el-radio-group>
        </el-form-item>
        <el-form-item v-if="timeRange === 'custom'" label="开始日期">
          <el-date-picker
            v-model="customStartDate"
            type="date"
            placeholder="选择开始日期"
            @change="handleCustomDateChange"
          />
        </el-form-item>
        <el-form-item v-if="timeRange === 'custom'" label="结束日期">
          <el-date-picker
            v-model="customEndDate"
            type="date"
            placeholder="选择结束日期"
            @change="handleCustomDateChange"
          />
        </el-form-item>
      </el-form>
    </el-card>

    <!-- 统计卡片 -->
    <el-row :gutter="20" class="stats-row">
      <el-col :span="6">
        <el-card shadow="hover" class="stat-card">
          <div class="stat-content">
            <div class="stat-icon" style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%)">
              <el-icon :size="32"><Opportunity /></el-icon>
            </div>
            <div class="stat-info">
              <div class="stat-value">{{ stats.total || 0 }}</div>
              <div class="stat-label">总机会数</div>
            </div>
          </div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card shadow="hover" class="stat-card">
          <div class="stat-content">
            <div class="stat-icon" style="background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%)">
              <el-icon :size="32"><Clock /></el-icon>
            </div>
            <div class="stat-info">
              <div class="stat-value">{{ stats.open || 0 }}</div>
              <div class="stat-label">进行中</div>
            </div>
          </div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card shadow="hover" class="stat-card">
          <div class="stat-content">
            <div class="stat-icon" style="background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)">
              <el-icon :size="32"><SuccessFilled /></el-icon>
            </div>
            <div class="stat-info">
              <div class="stat-value">{{ stats.won || 0 }}</div>
              <div class="stat-label">已赢单</div>
            </div>
          </div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card shadow="hover" class="stat-card">
          <div class="stat-content">
            <div class="stat-icon" style="background: linear-gradient(135deg, #fa709a 0%, #fee140 100%)">
              <el-icon :size="32"><Money /></el-icon>
            </div>
            <div class="stat-info">
              <div class="stat-value">¥{{ formatAmount(forecast.forecastAmount || 0) }}</div>
              <div class="stat-label">预测金额</div>
            </div>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <!-- 图表区域第一行：漏斗图和饼图 -->
    <el-row :gutter="20" class="charts-row">
      <el-col :span="12">
        <el-card shadow="hover">
          <template #header>
            <div class="card-header">
              <span>销售漏斗图</span>
              <el-tag type="info" size="small">{{ funnelData.length }}个阶段</el-tag>
            </div>
          </template>
          <div ref="funnelChartRef" style="width: 100%; height: 400px"></div>
        </el-card>
      </el-col>
      <el-col :span="12">
        <el-card shadow="hover">
          <template #header>
            <div class="card-header">
              <span>阶段分布</span>
              <el-tag type="info" size="small">{{ stageData.length }}个阶段</el-tag>
            </div>
          </template>
          <div ref="pieChartRef" style="width: 100%; height: 400px"></div>
        </el-card>
      </el-col>
    </el-row>

    <!-- 图表区域第二行：趋势图和团队对比 -->
    <el-row :gutter="20" class="charts-row">
      <el-col :span="12">
        <el-card shadow="hover">
          <template #header>
            <div class="card-header">
              <span>趋势分析</span>
              <el-tag type="info" size="small">最近{{ trendData.length }}天</el-tag>
            </div>
          </template>
          <div ref="trendChartRef" style="width: 100%; height: 400px"></div>
        </el-card>
      </el-col>
      <el-col :span="12">
        <el-card shadow="hover">
          <template #header>
            <div class="card-header">
              <span>团队业绩对比</span>
              <el-tag type="info" size="small">{{ teamData.length }}人</el-tag>
            </div>
          </template>
          <div ref="teamChartRef" style="width: 100%; height: 400px"></div>
        </el-card>
      </el-col>
    </el-row>

    <!-- 详细统计表格 -->
    <el-row :gutter="20" class="detail-row">
      <el-col :span="24">
        <el-card shadow="hover">
          <template #header>
            <span>阶段详细统计</span>
          </template>
          <el-table :data="stageData" border>
            <el-table-column prop="stageName" label="销售阶段" width="150">
              <template #default="{ row }">
                <el-tag :type="getStageTagType(row.stage)">
                  {{ row.stageName }}
                </el-tag>
              </template>
            </el-table-column>
            <el-table-column prop="count" label="机会数量" width="120" align="center">
              <template #default="{ row }">
                <span style="font-weight: bold; color: #409eff;">{{ row.count }}</span>
              </template>
            </el-table-column>
            <el-table-column prop="amount" label="总金额" width="200" align="right">
              <template #default="{ row }">
                <span style="color: #f56c6c; font-weight: bold;">
                  ¥{{ formatAmount(row.amount) }}
                </span>
              </template>
            </el-table-column>
            <el-table-column label="平均金额" align="right">
              <template #default="{ row }">
                <span style="color: #67c23a;">
                  ¥{{ formatAmount(row.count > 0 ? row.amount / row.count : 0) }}
                </span>
              </template>
            </el-table-column>
            <el-table-column prop="percentage" label="占比" width="120" align="center">
              <template #default="{ row }">
                <el-progress
                  :percentage="calculatePercentage(row.count)"
                  :stroke-width="12"
                  :show-text="true"
                />
              </template>
            </el-table-column>
          </el-table>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, computed } from 'vue'
import { ElMessage } from 'element-plus'
import * as echarts from 'echarts'
import * as XLSX from 'xlsx'
import dayjs from 'dayjs'
import PageHeader from '@/components/common/PageHeader.vue'
import {
  getOpportunityStats,
  getOpportunityFunnel,
  getOpportunityStageStats,
  getOpportunityForecast,
  getOpportunityTrend,
  getOpportunityTeamComparison,
  getOpportunityStatsWithTimeRange
} from '@/api/opportunity'

const stats = ref<any>({})
const forecast = ref<any>({})
const funnelData = ref<any[]>([])
const stageData = ref<any[]>([])
const trendData = ref<any[]>([])
const teamData = ref<any[]>([])
const refreshing = ref(false)

const funnelChartRef = ref<HTMLElement>()
const pieChartRef = ref<HTMLElement>()
const trendChartRef = ref<HTMLElement>()
const teamChartRef = ref<HTMLElement>()

let funnelChart: echarts.ECharts | null = null
let pieChart: echarts.ECharts | null = null
let trendChart: echarts.ECharts | null = null
let teamChart: echarts.ECharts | null = null

// 时间范围
const timeRange = ref('month')
const customStartDate = ref('')
const customEndDate = ref('')

// 计算日期范围
const dateRange = computed(() => {
  const now = dayjs()
  let start, end

  switch (timeRange.value) {
    case 'week':
      start = now.startOf('week')
      end = now.endOf('week')
      break
    case 'month':
      start = now.startOf('month')
      end = now.endOf('month')
      break
    case 'quarter':
      start = now.startOf('quarter')
      end = now.endOf('quarter')
      break
    case 'year':
      start = now.startOf('year')
      end = now.endOf('year')
      break
    case 'custom':
      if (customStartDate.value && customEndDate.value) {
        start = dayjs(customStartDate.value)
        end = dayjs(customEndDate.value)
      } else {
        return null
      }
      break
    default:
      start = now.startOf('month')
      end = now.endOf('month')
  }

  return {
    startDate: start.format('YYYY-MM-DD'),
    endDate: end.format('YYYY-MM-DD')
  }
})

// 加载所有数据
const loadAllData = async () => {
  const params = dateRange.value || {}
  
  await Promise.all([
    loadStats(params),
    loadForecast(params),
    loadFunnelData(params),
    loadStageData(params),
    loadTrendData(params),
    loadTeamData(params)
  ])
}

// 加载统计数据
const loadStats = async (params: any) => {
  try {
    const res = await getOpportunityStatsWithTimeRange(params)
    stats.value = res.data
  } catch (error) {
    console.error('加载统计数据失败:', error)
  }
}

// 加载预测数据
const loadForecast = async (params: any) => {
  try {
    const res = await getOpportunityForecast(params)
    forecast.value = res.data
  } catch (error) {
    console.error('加载预测数据失败:', error)
  }
}

// 加载漏斗数据
const loadFunnelData = async (params: any) => {
  try {
    const res = await getOpportunityFunnel(params)
    funnelData.value = res.data.funnel || []
    initFunnelChart()
  } catch (error) {
    console.error('加载漏斗数据失败:', error)
  }
}

// 加载阶段统计
const loadStageData = async (params: any) => {
  try {
    const res = await getOpportunityStageStats(params)
    stageData.value = res.data.stages || []
    initPieChart()
  } catch (error) {
    console.error('加载阶段统计失败:', error)
  }
}

// 加载趋势数据
const loadTrendData = async (params: any) => {
  try {
    const res = await getOpportunityTrend(params)
    trendData.value = res.data.trend || []
    initTrendChart()
  } catch (error) {
    console.error('加载趋势数据失败:', error)
  }
}

// 加载团队数据
const loadTeamData = async (params: any) => {
  try {
    const res = await getOpportunityTeamComparison(params)
    teamData.value = res.data.comparison || []
    initTeamChart()
  } catch (error) {
    console.error('加载团队数据失败:', error)
  }
}

// 初始化漏斗图
const initFunnelChart = () => {
  if (!funnelChartRef.value) return

  if (funnelChart) {
    funnelChart.dispose()
  }

  funnelChart = echarts.init(funnelChartRef.value)

  const option = {
    tooltip: {
      trigger: 'item',
      formatter: '{b}: {c}个机会<br/>金额: ¥{@amount}'
    },
    series: [
      {
        name: '销售漏斗图',
        type: 'funnel',
        left: '10%',
        top: 60,
        bottom: 60,
        width: '80%',
        min: 0,
        max: 100,
        minSize: '0%',
        maxSize: '100%',
        sort: 'descending',
        gap: 2,
        label: {
          show: true,
          position: 'inside',
          formatter: '{b}\n{c}'
        },
        labelLine: {
          length: 10,
          lineStyle: {
            width: 1,
            type: 'solid'
          }
        },
        itemStyle: {
          borderColor: '#fff',
          borderWidth: 1
        },
        emphasis: {
          label: {
            fontSize: 20
          }
        },
        data: funnelData.value.map(item => ({
          value: item.count,
          name: item.stageName,
          amount: item.amount
        }))
      }
    ]
  }

  funnelChart.setOption(option)
}

// 初始化饼图
const initPieChart = () => {
  if (!pieChartRef.value) return

  if (pieChart) {
    pieChart.dispose()
  }

  pieChart = echarts.init(pieChartRef.value)

  const option = {
    tooltip: {
      trigger: 'item',
      formatter: '{b}: {c}({d}%)'
    },
    legend: {
      orient: 'vertical',
      right: 10,
      top: 'center'
    },
    series: [
      {
        name: '阶段分布',
        type: 'pie',
        radius: ['40%', '70%'],
        avoidLabelOverlap: false,
        itemStyle: {
          borderRadius: 10,
          borderColor: '#fff',
          borderWidth: 2
        },
        label: {
          show: true,
          formatter: '{b}\n{d}%'
        },
        emphasis: {
          label: {
            show: true,
            fontSize: 16,
            fontWeight: 'bold'
          }
        },
        data: stageData.value.map(item => ({
          value: item.count,
          name: item.stageName
        }))
      }
    ]
  }

  pieChart.setOption(option)
}

// 初始化趋势图
const initTrendChart = () => {
  if (!trendChartRef.value) return

  if (trendChart) {
    trendChart.dispose()
  }

  trendChart = echarts.init(trendChartRef.value)

  const dates = trendData.value.map(item => item.date)
  const counts = trendData.value.map(item => item.count)
  const amounts = trendData.value.map(item => item.amount)
  const wonCounts = trendData.value.map(item => item.wonCount)

  const option = {
    tooltip: {
      trigger: 'axis'
    },
    legend: {
      data: ['新增机会', '成交数', '金额趋势']
    },
    xAxis: {
      type: 'category',
      boundaryGap: false,
      data: dates
    },
    yAxis: [
      {
        type: 'value',
        name: '数量',
        position: 'left'
      },
      {
        type: 'value',
        name: '金额(万)',
        position: 'right'
      }
    ],
    series: [
      {
        name: '新增机会',
        type: 'line',
        data: counts,
        smooth: true,
        itemStyle: { color: '#409eff' }
      },
      {
        name: '成交数',
        type: 'line',
        data: wonCounts,
        smooth: true,
        itemStyle: { color: '#67c23a' }
      },
      {
        name: '金额趋势',
        type: 'line',
        yAxisIndex: 1,
        data: amounts,
        smooth: true,
        itemStyle: { color: '#f56c6c' }
      }
    ]
  }

  trendChart.setOption(option)
}

// 初始化团队对比图
const initTeamChart = () => {
  if (!teamChartRef.value) return

  if (teamChart) {
    teamChart.dispose()
  }

  teamChart = echarts.init(teamChartRef.value)

  const userNames = teamData.value.map(item => item.userName)
  const counts = teamData.value.map(item => item.count)
  const wonCounts = teamData.value.map(item => item.wonCount)
  const amounts = teamData.value.map(item => item.amount)

  const option = {
    tooltip: {
      trigger: 'axis',
      axisPointer: {
        type: 'shadow'
      }
    },
    legend: {
      data: ['机会总数', '成交数', '金额']
    },
    xAxis: {
      type: 'category',
      data: userNames
    },
    yAxis: [
      {
        type: 'value',
        name: '数量',
        position: 'left'
      },
      {
        type: 'value',
        name: '金额(万)',
        position: 'right'
      }
    ],
    series: [
      {
        name: '机会总数',
        type: 'bar',
        data: counts,
        itemStyle: { color: '#409eff' }
      },
      {
        name: '成交数',
        type: 'bar',
        data: wonCounts,
        itemStyle: { color: '#67c23a' }
      },
      {
        name: '金额',
        type: 'line',
        yAxisIndex: 1,
        data: amounts,
        itemStyle: { color: '#f56c6c' }
      }
    ]
  }

  teamChart.setOption(option)
}

// 格式化金额
const formatAmount = (amount: number) => {
  return amount.toLocaleString('zh-CN', { minimumFractionDigits: 0, maximumFractionDigits: 0 })
}

// 计算百分比
const calculatePercentage = (count: number) => {
  const total = stageData.value.reduce((sum, item) => sum + item.count, 0)
  return total > 0 ? Math.round((count / total) * 100) : 0
}

// 获取阶段标签类型
const getStageTagType = (stage: string) => {
  const map: Record<string, string> = {
    initial: 'info',
    demand: '',
    proposal: 'warning',
    negotiation: 'warning',
    closed_won: 'success',
    closed_lost: 'danger'
  }
  return map[stage] || undefined
}

// 时间范围变化
const handleTimeRangeChange = () => {
  if (timeRange.value !== 'custom') {
    loadAllData()
  }
}

// 自定义日期变化
const handleCustomDateChange = () => {
  if (customStartDate.value && customEndDate.value) {
    loadAllData()
  }
}

// 刷新数据
const refreshData = async () => {
  refreshing.value = true
  try {
    await loadAllData()
    ElMessage.success('数据已刷新')
  } finally {
    refreshing.value = false
  }
}

// 导出Excel
const handleExport = () => {
  try {
    // 准备导出数据
    const exportData = stageData.value.map(item => ({
      '销售阶段': item.stageName,
      '机会数量': item.count,
      '总金额': item.amount,
      '平均金额': item.count > 0 ? Math.round(item.amount / item.count) : 0,
      '占比': calculatePercentage(item.count) + '%'
    }))

    // 创建工作表
    const ws = XLSX.utils.json_to_sheet(exportData)
    const wb = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(wb, ws, '销售数据分析')

    // 导出文件
    const fileName = `销售数据分析_${dayjs().format('YYYY-MM-DD')}.xlsx`
    XLSX.writeFile(wb, fileName)

    ElMessage.success('导出成功')
  } catch (error) {
    console.error('导出失败:', error)
    ElMessage.error('导出失败')
  }
}

// 窗口大小调整
const handleResize = () => {
  funnelChart?.resize()
  pieChart?.resize()
  trendChart?.resize()
  teamChart?.resize()
}

onMounted(() => {
  loadAllData()
  window.addEventListener('resize', handleResize)
})

onUnmounted(() => {
  funnelChart?.dispose()
  pieChart?.dispose()
  trendChart?.dispose()
  teamChart?.dispose()
  window.removeEventListener('resize', handleResize)
})
</script>

<style lang="scss" scoped>

.opportunity-analysis {
  padding: 0;

  .filter-card {
    margin-bottom: $spacing-lg;
    border-radius: $border-radius-card;
    box-shadow: $box-shadow-light;

    :deep(.el-card__body) {
      padding: $spacing-md $spacing-lg;
    }

    :deep(.el-radio-button__inner) {
      border-radius: 0;
    }

    :deep(.el-form-item) {
      margin-bottom: $spacing-sm;
    }
  }

  .stats-row {
    margin-bottom: $spacing-lg;

    .stat-card {
      cursor: pointer;
      border-radius: $border-radius-card;
      box-shadow: $box-shadow-light;
      transition: all 0.3s ease;

      &:hover {
        transform: translateY(-4px);
        box-shadow: $box-shadow-base;
      }

      :deep(.el-card__body) {
        padding: $spacing-lg;
      }

      .stat-content {
        display: flex;
        align-items: center;
        gap: $spacing-md;

        .stat-icon {
          width: 60px;
          height: 60px;
          border-radius: $border-radius-base;
          display: flex;
          align-items: center;
          justify-content: center;
          color: $color-white;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
        }

        .stat-info {
          flex: 1;

          .stat-value {
            font-size: $font-size-xl * 1.5;
            font-weight: $font-weight-bold;
            color: $color-text-primary;
            margin-bottom: $spacing-xs;
          }

          .stat-label {
            font-size: $font-size-sm;
            color: $color-text-secondary;
          }
        }
      }
    }
  }

  .charts-row {
    margin-bottom: $spacing-lg;

    :deep(.el-card) {
      border-radius: $border-radius-card;
      box-shadow: $box-shadow-light;
      transition: all 0.3s ease;

      &:hover {
        box-shadow: $box-shadow-base;
      }

      .card-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        font-weight: $font-weight-medium;
        padding: $spacing-md $spacing-lg;
        background: linear-gradient(
          to bottom,
          $color-bg-card 0%,
          rgba($color-bg-page, 0.3) 100%
        );
        border-bottom: 1px solid $color-border-light;
      }

      :deep(.el-card__body) {
        padding: $spacing-lg;
      }
    }
  }

  .detail-row {
    margin-bottom: $spacing-lg;

    :deep(.el-card) {
      border-radius: $border-radius-card;
      box-shadow: $box-shadow-light;

      :deep(.el-card__body) {
        padding: 0;
      }

      :deep(.el-table) {
        .el-table__header th {
          background: $color-bg-page;
          color: $color-text-primary;
          font-weight: $font-weight-semibold;
        }

        .el-table__row:hover {
          background-color: rgba($color-primary, 0.03);
        }
      }
    }
  }
}
</style>