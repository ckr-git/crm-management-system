<template>
  <div class="followup-report-preview">
    <!-- 数据概览 -->
    <el-row :gutter="20" class="stats-row">
      <el-col :span="12">
        <div class="stat-card orange">
          <div class="stat-value">{{ data.total || 0 }}</div>
          <div class="stat-label">跟进总数</div>
        </div>
      </el-col>
      <el-col :span="12">
        <div class="stat-card blue">
          <div class="stat-value">{{ data.avgPerCustomer || 0 }}</div>
          <div class="stat-label">平均跟进次数</div>
        </div>
      </el-col>
    </el-row>

    <!-- 跟进方式分布 -->
    <el-card class="chart-card">
      <template #header>
        <span>跟进方式分布</span>
      </template>
      <div ref="typesChart" style="width: 100%; height: 300px;"></div>
    </el-card>

    <!-- 跟进趋势 -->
    <el-card class="chart-card">
      <template #header>
        <span>跟进趋势</span>
      </template>
      <div ref="trendChart" style="width: 100%; height: 300px;"></div>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, watch } from 'vue'
import * as echarts from 'echarts'

const props = defineProps<{
  data: {
    total: number
    avgPerCustomer: number
    types: Array<{ type: string; count: number }>
    trend: Array<{ date: string; count: number }>
  }
}>()

const typesChart = ref()
const trendChart = ref()

let typesChartInstance: echarts.ECharts | null = null
let trendChartInstance: echarts.ECharts | null = null

const initTypesChart = () => {
  if (!typesChart.value) return
  
  typesChartInstance = echarts.init(typesChart.value)
  const option = {
    tooltip: {
      trigger: 'item'
    },
    legend: {
      orient: 'vertical',
      left: 'left'
    },
    series: [{
      name: '跟进次数',
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
      data: props.data.types.map(item => ({
        value: item.count,
        name: item.type
      }))
    }]
  }
  typesChartInstance.setOption(option)
}

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
      name: '跟进次数',
      type: 'line',
      data: props.data.trend.map(item => item.count),
      smooth: true,
      itemStyle: {
        color: '#E6A23C'
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
            color: 'rgba(230, 162, 60, 0.3)'
          }, {
            offset: 1,
            color: 'rgba(230, 162, 60, 0.05)'
          }]
        }
      }
    }]
  }
  trendChartInstance.setOption(option)
}

onMounted(() => {
  if (props.data.types.length > 0) {
    initTypesChart()
  }
  if (props.data.trend.length > 0) {
    initTrendChart()
  }
})

watch(() => props.data, () => {
  if (typesChartInstance && props.data.types.length > 0) {
    initTypesChart()
  }
  if (trendChartInstance && props.data.trend.length > 0) {
    initTrendChart()
  }
}, { deep: true })
</script>
<style lang="scss" scoped>
.followup-report-preview {
  .stats-row {
    margin-bottom: 20px;
  }

  .stat-card {
    padding: 20px;
    text-align: center;
    border-radius: 8px;
    color: white;

    &.orange {
      background: linear-gradient(135deg, #E6A23C 0%, #F56C6C 100%);
    }

    &.blue {
      background: linear-gradient(135deg, #409EFF 0%, #67C23A 100%);
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
