<template>
  <div class="followup-stats">
    <PageHeader title="跟进统计" description="查看个人和团队的跟进数据统计" :show-back="false" />

    <!-- 统计卡片 -->
    <el-row :gutter="20" class="stats-row">
      <el-col :span="6">
        <el-card shadow="hover" class="stat-card">
          <div class="stat-content">
            <div class="stat-icon" style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%)">
              <el-icon :size="32"><Document /></el-icon>
            </div>
            <div class="stat-info">
              <div class="stat-value">{{ userStats.totalCount || 0 }}</div>
              <div class="stat-label">跟进总次数</div>
            </div>
          </div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card shadow="hover" class="stat-card">
          <div class="stat-content">
            <div class="stat-icon" style="background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%)">
              <el-icon :size="32"><User /></el-icon>
            </div>
            <div class="stat-info">
              <div class="stat-value">{{ userStats.customerCount || 0 }}</div>
              <div class="stat-label">跟进客户数</div>
            </div>
          </div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card shadow="hover" class="stat-card">
          <div class="stat-content">
            <div class="stat-icon" style="background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)">
              <el-icon :size="32"><TrendCharts /></el-icon>
            </div>
            <div class="stat-info">
              <div class="stat-value">{{ userStats.avgPerDay || 0 }}</div>
              <div class="stat-label">日均跟进</div>
            </div>
          </div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card shadow="hover" class="stat-card">
          <div class="stat-content">
            <div class="stat-icon" style="background: linear-gradient(135deg, #fa709a 0%, #fee140 100%)">
              <el-icon :size="32"><Bell /></el-icon>
            </div>
            <div class="stat-info">
              <div class="stat-value">{{ reminders.totalCount || 0 }}</div>
              <div class="stat-label">待跟进提醒</div>
            </div>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <!-- 图表区域 -->
    <el-row :gutter="20" class="charts-row">
      <el-col :span="12">
        <el-card shadow="hover">
          <template #header>
            <span>最近7天跟进趋势</span>
          </template>
          <div ref="dailyChartRef" class="chart-container"></div>
        </el-card>
      </el-col>
      <el-col :span="12">
        <el-card shadow="hover">
          <template #header>
            <span>跟进类型分布</span>
          </template>
          <div ref="typeChartRef" class="chart-container"></div>
        </el-card>
      </el-col>
    </el-row>

    <!-- 团队对比 -->
    <el-row :gutter="20" class="charts-row">
      <el-col :span="24">
        <el-card shadow="hover">
          <template #header>
            <span>团队跟进对比</span>
          </template>
          <div ref="teamChartRef" class="chart-container"></div>
        </el-card>
      </el-col>
    </el-row>

    <!-- 待跟进提醒 -->
    <el-card v-if="reminders.list?.length" shadow="hover" class="reminders-card">
      <template #header>
        <span>待跟进提醒</span>
      </template>
      <el-table :data="reminders.list" style="width: 100%">
        <el-table-column prop="customerName" label="客户名称" />
        <el-table-column prop="content" label="提醒内容" />
        <el-table-column prop="remindTime" label="提醒时间" />
        <el-table-column label="操作" width="120">
          <template #default="{ row }">
            <el-button type="primary" size="small" @click="goToCustomer(row.customerId)">
              查看
            </el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import * as echarts from 'echarts'
import PageHeader from '@/components/common/PageHeader.vue'
import { getUserFollowupStats, getTeamFollowupStats, getFollowupReminders } from '@/api/followup'

const router = useRouter()

const userStats = ref<any>({})
const teamStats = ref<any[]>([])
const reminders = ref<any>({})

const dailyChartRef = ref<HTMLElement>()
const typeChartRef = ref<HTMLElement>()
const teamChartRef = ref<HTMLElement>()

let dailyChart: echarts.ECharts | null = null
let typeChart: echarts.ECharts | null = null
let teamChart: echarts.ECharts | null = null

// 加载个人统计
const loadUserStats = async () => {
  try {
    const res = await getUserFollowupStats()
    userStats.value = res.data
    initDailyChart()
    initTypeChart()
  } catch (error) {
    console.error('加载个人统计失败:', error)
  }
}

// 加载团队统计
const loadTeamStats = async () => {
  try {
    const res = await getTeamFollowupStats()
    teamStats.value = res.data.teamStats || []
    initTeamChart()
  } catch (error) {
    console.error('加载团队统计失败:', error)
  }
}

// 加载提醒列表
const loadReminders = async () => {
  try {
    const res = await getFollowupReminders()
    reminders.value = res.data
  } catch (error) {
    console.error('加载提醒列表失败:', error)
  }
}

// 初始化日趋势图
const initDailyChart = () => {
  if (!dailyChartRef.value) return
  if (dailyChart) dailyChart.dispose()

  dailyChart = echarts.init(dailyChartRef.value)
  const dailyStats = userStats.value.dailyStats || []

  const option = {
    tooltip: { trigger: 'axis' },
    xAxis: {
      type: 'category',
      data: dailyStats.map((item: any) => item.date)
    },
    yAxis: { type: 'value' },
    series: [
      {
        name: '跟进次数',
        type: 'line',
        data: dailyStats.map((item: any) => item.count),
        smooth: true,
        itemStyle: { color: '#409eff' },
        areaStyle: { opacity: 0.3 }
      }
    ]
  }

  dailyChart.setOption(option)
}

// 初始化类型饼图
const initTypeChart = () => {
  if (!typeChartRef.value) return
  if (typeChart) typeChart.dispose()

  typeChart = echarts.init(typeChartRef.value)
  const typeStats = userStats.value.typeStats || {}
  
  const typeMap: Record<string, string> = {
    phone: '电话',
    visit: '拜访',
    email: '邮件',
    wechat: '微信'
  }

  const data = Object.entries(typeStats).map(([type, count]) => ({
    name: typeMap[type] || type,
    value: count
  }))

  const option = {
    tooltip: { trigger: 'item' },
    series: [
      {
        type: 'pie',
        radius: ['40%', '70%'],
        data,
        emphasis: { itemStyle: { shadowBlur: 10, shadowOffsetX: 0, shadowColor: 'rgba(0, 0, 0, 0.5)' } }
      }
    ]
  }

  typeChart.setOption(option)
}

// 初始化团队对比图
const initTeamChart = () => {
  if (!teamChartRef.value) return
  if (teamChart) teamChart.dispose()

  teamChart = echarts.init(teamChartRef.value)

  const option = {
    tooltip: { trigger: 'axis' },
      legend: { data: ['跟进次数', '客户数'] },
    xAxis: {
      type: 'category',
      data: teamStats.value.map(item => item.userName)
    },
    yAxis: { type: 'value' },
    series: [
      {
        name: '跟进次数',
        type: 'bar',
        data: teamStats.value.map(item => item.followupCount),
        itemStyle: { color: '#409eff' }
      },
      {
        name: '客户数',
        type: 'bar',
        data: teamStats.value.map(item => item.customerCount),
        itemStyle: { color: '#67c23a' }
      }
    ]
  }

  teamChart.setOption(option)
}

// 跳转到客户详情
const goToCustomer = (id: number) => {
  router.push(`/customers/${id}`)
}

// 窗口resize
const handleResize = () => {
  dailyChart?.resize()
  typeChart?.resize()
  teamChart?.resize()
}

onMounted(() => {
  loadUserStats()
  loadTeamStats()
  loadReminders()
  window.addEventListener('resize', handleResize)
})

onUnmounted(() => {
  dailyChart?.dispose()
  typeChart?.dispose()
  teamChart?.dispose()
  window.removeEventListener('resize', handleResize)
})
</script>
<style lang="scss" scoped>
.followup-stats {
  padding: 0;

  .stats-row {
    margin-bottom: 20px;
  }

  .stat-card {
    .stat-content {
      display: flex;
      align-items: center;
      padding: 10px 0;

      .stat-icon {
        width: 64px;
        height: 64px;
        border-radius: 12px;
        display: flex;
        align-items: center;
        justify-content: center;
        color: white;
        margin-right: 16px;
      }

      .stat-info {
        flex: 1;

        .stat-value {
          font-size: 28px;
          font-weight: bold;
          color: #303133;
          line-height: 1.2;
        }

        .stat-label {
          font-size: 14px;
          color: #909399;
          margin-top: 4px;
        }
      }
    }
  }

  .charts-row {
    margin-bottom: 20px;
  }

  .chart-container {
    height: 300px;
    width: 100%;
  }

  .reminders-card {
    margin-top: 20px;
  }
}
</style>
