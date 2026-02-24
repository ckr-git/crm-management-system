<template>
  <div class="opportunity-report-preview">
    <!-- 数据概览 -->
    <el-row :gutter="20" class="stats-row">
      <el-col :span="8">
        <div class="stat-card green">
          <div class="stat-value">{{ data.total || 0 }}</div>
          <div class="stat-label">机会总数</div>
        </div>
      </el-col>
      <el-col :span="8">
        <div class="stat-card orange">
          <div class="stat-value">¥{{ formatAmount(data.amount || 0) }}</div>
          <div class="stat-label">总金额</div>
        </div>
      </el-col>
      <el-col :span="8">
        <div class="stat-card blue">
          <div class="stat-value">{{ data.winRate || 0 }}%</div>
          <div class="stat-label">赢单率</div>
        </div>
      </el-col>
    </el-row>

    <!-- 阶段分布 -->
    <el-card class="chart-card">
      <template #header>
        <span>机会阶段分布</span>
      </template>
      <div ref="stagesChart" style="width: 100%; height: 300px;"></div>
    </el-card>

    <!-- 机会趋势 -->
    <el-card class="chart-card">
      <template #header>
        <span>机会趋势</span>
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
    amount: number
    winRate: number
    stages: Array<{ stage: string; count: number }>
    trend: Array<{ month: string; count: number; amount: number }>
  }
}>()

const stagesChart = ref()
const trendChart = ref()

let stagesChartInstance: echarts.ECharts | null = null
let trendChartInstance: echarts.ECharts | null = null

const formatAmount = (amount: number) => {
  return (amount / 10000).toFixed(1) + '万'
}

const initStagesChart = () => {
  if (!stagesChart.value) return
  
  stagesChartInstance = echarts.init(stagesChart.value)
  const option = {
    tooltip: {
      trigger: 'axis',
      axisPointer: {
        type: 'shadow'
      }
    },
    xAxis: {
      type: 'category',
      data: props.data.stages.map(item => item.stage)
    },
    yAxis: {
      type: 'value'
    },
    series: [{
      name: '机会数',
      type: 'bar',
      data: props.data.stages.map(item => item.count),
      itemStyle: {
        color: '#67C23A'
      },
      emphasis: {
        itemStyle: {
          color: '#529B2E'
        }
      }
    }]
  }
  stagesChartInstance.setOption(option)
}

const initTrendChart = () => {
  if (!trendChart.value) return
  
  trendChartInstance = echarts.init(trendChart.value)
  const option = {
    tooltip: {
      trigger: 'axis'
    },
    legend: {
      data: ['数量', '金额(万元)']
    },
    xAxis: {
      type: 'category',
      data: props.data.trend.map(item => item.month)
    },
    yAxis: [
      {
        type: 'value',
        name: '数量'
      },
      {
        type: 'value',
        name: '金额(万元)'
      }
    ],
    series: [
      {
        name: '数量',
        type: 'line',
        data: props.data.trend.map(item => item.count),
        smooth: true,
        itemStyle: {
          color: '#67C23A'
        }
      },
      {
        name: '金额(万元)',
        type: 'line',
        yAxisIndex: 1,
        data: props.data.trend.map(item => (item.amount / 10000).toFixed(1)),
        smooth: true,
        itemStyle: {
          color: '#E6A23C'
        }
      }
    ]
  }
  trendChartInstance.setOption(option)
}

onMounted(() => {
  if (props.data.stages.length > 0) {
    initStagesChart()
  }
  if (props.data.trend.length > 0) {
    initTrendChart()
  }
})

watch(() => props.data, () => {
  if (stagesChartInstance && props.data.stages.length > 0) {
    initStagesChart()
  }
  if (trendChartInstance && props.data.trend.length > 0) {
    initTrendChart()
  }
}, { deep: true })
</script>
<style lang="scss" scoped>
.opportunity-report-preview {
  .stats-row {
    margin-bottom: 20px;
  }

  .stat-card {
    padding: 20px;
    text-align: center;
    border-radius: 8px;
    color: white;

    &.green {
      background: linear-gradient(135deg, #67C23A 0%, #529B2E 100%);
    }

    &.orange {
      background: linear-gradient(135deg, #E6A23C 0%, #CF9236 100%);
    }

    &.blue {
      background: linear-gradient(135deg, #409EFF 0%, #2a5caa 100%);
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
