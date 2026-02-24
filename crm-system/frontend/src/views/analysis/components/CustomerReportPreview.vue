<template>
  <div class="customer-report-preview">
    <!-- 数据概览 -->
    <el-row :gutter="20" class="stats-row">
      <el-col :span="8">
        <div class="stat-card blue">
          <div class="stat-value">{{ data.total || 0 }}</div>
          <div class="stat-label">客户总数</div>
        </div>
      </el-col>
      <el-col :span="8">
        <div class="stat-card green">
          <div class="stat-value">{{ data.newCount || 0 }}</div>
          <div class="stat-label">新增客户</div>
        </div>
      </el-col>
      <el-col :span="8">
        <div class="stat-card orange">
          <div class="stat-value">{{ data.activeCount || 0 }}</div>
          <div class="stat-label">活跃客户</div>
        </div>
      </el-col>
    </el-row>

    <!-- 客户趋势图 -->
    <el-card class="chart-card">
      <template #header>
        <span>客户增长趋势</span>
      </template>
      <div ref="trendChart" style="width: 100%; height: 300px;"></div>
    </el-card>

    <!-- 行业分布 -->
    <el-card class="chart-card">
      <template #header>
        <span>行业分布</span>
      </template>
      <div ref="distributionChart" style="width: 100%; height: 300px;"></div>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, watch } from 'vue'
import * as echarts from 'echarts'

const props = defineProps<{
  data: {
    total: number
    newCount: number
    activeCount: number
    trend: Array<{ date: string; count: number }>
    distribution: Array<{ industry: string; count: number }>
  }
}>()

const trendChart = ref()
const distributionChart = ref()

let trendChartInstance: echarts.ECharts | null = null
let distributionChartInstance: echarts.ECharts | null = null

const initTrendChart = () => {
  if (!trendChart.value) return
  
  trendChartInstance = echarts.init(trendChart.value)
  const option = {
    tooltip: {
      trigger: 'axis'
    },
    xAxis: {
      type: 'category',
      data: props.data.trend.map(item => item.date)
    },
    yAxis: {
      type: 'value'
    },
    series: [{
      name: '客户数',
      type: 'line',
      data: props.data.trend.map(item => item.count),
      smooth: true,
      itemStyle: {
        color: '#409EFF'
      },
      areaStyle: {
        color: {
          type: 'linear',
          x: 0,
          y: 0,
          x2: 0,
          y2: 1,
          colorStops: [{
            offset: 0,
            color: 'rgba(64, 158, 255, 0.3)'
          }, {
            offset: 1,
            color: 'rgba(64, 158, 255, 0.05)'
          }]
        }
      }
    }]
  }
  trendChartInstance.setOption(option)
}

const initDistributionChart = () => {
  if (!distributionChart.value) return
  
  distributionChartInstance = echarts.init(distributionChart.value)
  const option = {
    tooltip: {
      trigger: 'item'
    },
    legend: {
      orient: 'vertical',
      left: 'left'
    },
    series: [{
      name: '客户数',
      type: 'pie',
      radius: '50%',
      data: props.data.distribution.map(item => ({
        value: item.count,
        name: item.industry
      })),
      emphasis: {
        itemStyle: {
          shadowBlur: 10,
          shadowOffsetX: 0,
          shadowColor: 'rgba(0, 0, 0, 0.5)'
        }
      }
    }]
  }
  distributionChartInstance.setOption(option)
}

onMounted(() => {
  if (props.data.trend.length > 0) {
    initTrendChart()
  }
  if (props.data.distribution.length > 0) {
    initDistributionChart()
  }
})

watch(() => props.data, () => {
  if (trendChartInstance && props.data.trend.length > 0) {
    initTrendChart()
  }
  if (distributionChartInstance && props.data.distribution.length > 0) {
    initDistributionChart()
  }
}, { deep: true })
</script>
<style lang="scss" scoped>
.customer-report-preview {
  .stats-row {
    margin-bottom: 20px;
  }

  .stat-card {
    padding: 20px;
    text-align: center;
    border-radius: 8px;
    color: white;

    &.blue {
      background: linear-gradient(135deg, #409EFF 0%, #2a5caa 100%);
    }

    &.green {
      background: linear-gradient(135deg, #67C23A 0%, #529B2E 100%);
    }

    &.orange {
      background: linear-gradient(135deg, #E6A23C 0%, #CF9236 100%);
    }

    .stat-value {
      font-size: 32px;
      font-weight: bold;
      margin-bottom: 8px;
    }

    .stat-label {
      font-size: 14px;
      opacity: 0.9;
    }
  }

  .chart-card {
    margin-bottom: 20px;
  }
}
</style>
