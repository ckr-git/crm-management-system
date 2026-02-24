<template>
  <div class="source-analysis">
    <PageHeader title="客户来源分析" description="分析客户来源分布、趋势和转化效果" :show-back="false">
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
              <div class="stat-value">{{ totalCustomers }}</div>
              <div class="stat-label">总客户数</div>
            </div>
          </div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card>
          <div class="stat-card">
            <div class="stat-icon" style="background: #67c23a20">
              <el-icon :size="30" color="#67c23a"><DataAnalysis /></el-icon>
            </div>
            <div class="stat-content">
              <div class="stat-value">{{ sourceCount }}</div>
              <div class="stat-label">来源渠道</div>
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
              <div class="stat-value">{{ topSource }}</div>
              <div class="stat-label">主要来源</div>
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
              <div class="stat-value">{{ bestConversion }}</div>
              <div class="stat-label">最佳转化</div>
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
              <span>来源分布</span>
            </div>
          </template>
          <div ref="pieChartRef" style="width: 100%; height: 400px"></div>
        </el-card>
      </el-col>
      <el-col :span="12">
        <el-card>
          <template #header>
            <div class="card-header">
              <span>来源趋势</span>
            </div>
          </template>
          <div ref="trendChartRef" style="width: 100%; height: 400px"></div>
        </el-card>
      </el-col>
    </el-row>

    <!-- 转化率表-->
    <el-card style="margin-top: 20px">
      <template #header>
        <div class="card-header">
          <span>来源转化率</span>
        </div>
      </template>
      <el-table :data="conversionData" v-loading="loading">
        <el-table-column label="来源" width="150">
          <template #default="{ row }">
            {{ mapLabel(customerSourceMap, row.source) }}
          </template>
        </el-table-column>
        <el-table-column prop="total" label="客户数" width="120" />
        <el-table-column prop="converted" label="成交数" width="120" />
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
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import { ElMessage } from 'element-plus'
import * as echarts from 'echarts'
import PageHeader from '@/components/common/PageHeader.vue'
import { getSourceStats, getSourceTrend, getSourceConversion } from '@/api/analysis'
import { customerSourceMap, mapLabel } from '@/utils/dict'

const dateRange = ref<string[]>([])
const loading = ref(false)
const totalCustomers = ref(0)
const sourceCount = ref(0)
const topSource = ref('--')
const bestConversion = ref('--')

const pieChartRef = ref()
const trendChartRef = ref()
let pieChart: any = null
let trendChart: any = null

const conversionData = ref<any[]>([])

// 加载数据
const loadData = async () => {
  loading.value = true
  try {
    const params: any = {}
    if (dateRange.value && dateRange.value.length === 2) {
      params.start_date = dateRange.value[0]
      params.end_date = dateRange.value[1]
    }

    const [statsRes, trendRes, conversionRes] = await Promise.all([
      getSourceStats(params),
      getSourceTrend(params),
      getSourceConversion(params)
    ])

    // 统计数据
    const stats = statsRes.data
    totalCustomers.value = stats.total
    sourceCount.value = stats.stats.length
    topSource.value = mapLabel(customerSourceMap, stats.stats[0]?.source) || '--'

    // 转化数据
    conversionData.value = conversionRes.data
    bestConversion.value = mapLabel(customerSourceMap, conversionRes.data[0]?.source) || '--'

    // 渲染饼图
    renderPieChart(stats.stats)

    // 渲染趋势图
    renderTrendChart(trendRes.data)

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
        name: '客户来源',
        type: 'pie',
        radius: '60%',
        data: stats.map(item => ({
          name: mapLabel(customerSourceMap, item.source),
          value: item.count
        })),
        emphasis: {
          itemStyle: {
            shadowBlur: 10,
            shadowOffsetX: 0,
            shadowColor: 'rgba(0, 0, 0, 0.5)'
          }
        }
      }
    ]
  }

  pieChart.setOption(option)
}

// 渲染趋势图
const renderTrendChart = (data: any) => {
  if (!trendChart) {
    trendChart = echarts.init(trendChartRef.value)
  }

  const series = Object.keys(data.series).map(source => ({
    name: mapLabel(customerSourceMap, source),
    type: 'line',
    smooth: true,
    data: data.series[source]
  }))

  const option = {
    tooltip: {
      trigger: 'axis'
    },
    legend: {
      data: Object.keys(data.series).map(s => mapLabel(customerSourceMap, s))
    },
    grid: {
      left: '3%',
      right: '4%',
      bottom: '3%',
      containLabel: true
    },
    xAxis: {
      type: 'category',
      boundaryGap: false,
      data: data.dates
    },
    yAxis: {
      type: 'value'
    },
    series
  }

  trendChart.setOption(option)
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

// 窗口resize处理
const handleResize = () => {
  pieChart?.resize()
  trendChart?.resize()
}

onMounted(() => {
  loadData()
  window.addEventListener('resize', handleResize)
})

onUnmounted(() => {
  pieChart?.dispose()
  trendChart?.dispose()
  window.removeEventListener('resize', handleResize)
})
</script>

<style scoped>
.source-analysis {
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