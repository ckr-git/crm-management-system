<template>
  <div class="report-center">
    <PageHeader title="报表中心" description="生成和导出各类业务报表" :show-back="false">
      <template #extra>
        <el-button type="primary" @click="handleExport" :loading="exporting">
          <el-icon><Download /></el-icon>
          导出报表
        </el-button>
      </template>
    </PageHeader>

    <!-- 报表配置 -->
    <el-card style="margin-bottom: 20px">
      <template #header>
        <span>报表配置</span>
      </template>
      <el-form :model="queryForm" label-width="100px">
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="报表类型">
              <el-select v-model="queryForm.type" placeholder="请选择报表类型" style="width: 100%">
                <el-option label="综合报表" value="comprehensive" />
                <el-option label="客户报表" value="customer" />
                <el-option label="销售机会报表" value="opportunity" />
                <el-option label="跟进记录报表" value="followup" />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="时间范围">
              <el-date-picker
                v-model="dateRange"
                type="daterange"
                range-separator="至"
                start-placeholder="开始日期"
                end-placeholder="结束日期"
                value-format="YYYY-MM-DD"
                style="width: 100%"
              />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row>
          <el-col :span="24" style="text-align: right">
            <el-button @click="resetQuery">重置</el-button>
            <el-button type="primary" @click="loadData">
              <el-icon><Search /></el-icon>
              生成报表
            </el-button>
          </el-col>
        </el-row>
      </el-form>
    </el-card>

    <!-- 报表预览 -->
    <el-card v-loading="loading">
      <template #header>
        <span>报表预览</span>
      </template>
      
      <el-tabs v-model="activeTab" v-if="hasData">
        <el-tab-pane label="客户报表" name="customer">
          <CustomerReportPreview :data="reportData.customer" />
        </el-tab-pane>
        <el-tab-pane label="销售机会报表" name="opportunity">
          <OpportunityReportPreview :data="reportData.opportunity" />
        </el-tab-pane>
        <el-tab-pane label="跟进记录报表" name="followup">
          <FollowupReportPreview :data="reportData.followup" />
        </el-tab-pane>
      </el-tabs>

      <el-empty v-else description="请选择报表类型并生成报表" />
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue'
import { ElMessage } from 'element-plus'
import { Download, Search } from '@element-plus/icons-vue'
import PageHeader from '@/components/common/PageHeader.vue'
import CustomerReportPreview from './components/CustomerReportPreview.vue'
import OpportunityReportPreview from './components/OpportunityReportPreview.vue'
import FollowupReportPreview from './components/FollowupReportPreview.vue'

// 响应式数据
const loading = ref(false)
const exporting = ref(false)
const hasData = ref(false)
const activeTab = ref('customer')
const dateRange = ref<string[]>([])

const queryForm = reactive({
  type: 'comprehensive'
})

const reportData = reactive({
  customer: {
    total: 0,
    newCount: 0,
    activeCount: 0,
    trend: [],
    distribution: []
  },
  opportunity: {
    total: 0,
    amount: 0,
    winRate: 0,
    stages: [],
    trend: []
  },
  followup: {
    total: 0,
    avgPerCustomer: 0,
    types: [],
    trend: []
  }
})

// 加载数据
const loadData = async () => {
  if (!dateRange.value || dateRange.value.length !== 2) {
    ElMessage.warning('请选择时间范围')
    return
  }

  loading.value = true
  try {
    // 模拟API调用
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    // 模拟数据
    reportData.customer = {
      total: 128,
      newCount: 23,
      activeCount: 95,
      trend: [
        { date: '2024-01', count: 100 },
        { date: '2024-02', count: 115 },
        { date: '2024-03', count: 128 }
      ],
      distribution: [
        { industry: '互联网', count: 45 },
        { industry: '制造业', count: 32 },
        { industry: '金融', count: 28 },
        { industry: '其他', count: 23 }
      ]
    }

    reportData.opportunity = {
      total: 45,
      amount: 1250000,
      winRate: 32.5,
      stages: [
        { stage: '初步接触', count: 12 },
        { stage: '需求确认', count: 15 },
        { stage: '方案报价', count: 10 },
        { stage: '谈判审核', count: 5 },
        { stage: '赢单', count: 3 }
      ],
      trend: [
        { month: '1月', count: 10, amount: 350000 },
        { month: '2月', count: 15, amount: 450000 },
        { month: '3月', count: 20, amount: 450000 }
      ]
    }

    reportData.followup = {
      total: 256,
      avgPerCustomer: 2.0,
      types: [
        { type: '电话', count: 120 },
        { type: '邮件', count: 80 },
        { type: '拜访', count: 40 },
        { type: '其他', count: 16 }
      ],
      trend: [
        { date: '2024-01', count: 75 },
        { date: '2024-02', count: 90 },
        { date: '2024-03', count: 91 }
      ]
    }

    hasData.value = true
    ElMessage.success('报表生成成功')
  } catch (error) {
    console.error('生成报表失败:', error)
    ElMessage.error('生成报表失败')
  } finally {
    loading.value = false
  }
}

// 重置查询
const resetQuery = () => {
  queryForm.type = 'comprehensive'
  dateRange.value = []
  hasData.value = false
}

// 导出报表
const handleExport = async () => {
  if (!hasData.value) {
    ElMessage.warning('请先生成报表')
    return
  }

  exporting.value = true
  try {
    // 模拟导出
    await new Promise(resolve => setTimeout(resolve, 1500))
    ElMessage.success('报表导出成功')
  } catch (error) {
    console.error('导出失败:', error)
    ElMessage.error('导出失败')
  } finally {
    exporting.value = false
  }
}
</script>

<style lang="scss" scoped>
.report-center {
  padding: 0;

  // 卡片样式
  :deep(.el-card) {
    border-radius: $border-radius-card;
    box-shadow: $box-shadow-light;
    margin-bottom: $spacing-lg;
    transition: all 0.3s ease;

    &:hover {
      box-shadow: $box-shadow-base;
    }

    .el-card__header {
      background: linear-gradient(
        90deg,
        rgba($color-primary, 0.05) 0%,
        transparent 100%
      );
      border-bottom: 2px solid $color-border-lighter;
      font-weight: $font-weight-semibold;
      color: $color-text-primary;
    }
  }

  // 表单样式
  :deep(.el-form) {
    .el-form-item {
      margin-bottom: $spacing-md;
    }

    .el-select,
    .el-date-picker {
      .el-input__wrapper {
        border-radius: $border-radius-base;
        transition: all 0.3s ease;

        &:hover {
          box-shadow: 0 0 0 1px rgba($color-primary, 0.3);
        }
      }
    }

    .el-button {
      border-radius: $border-radius-base;
      transition: all 0.3s ease;

      &:hover {
        transform: translateY(-2px);
        box-shadow: $box-shadow-base;
      }
    }
  }

  // Tabs样式
  :deep(.el-tabs) {
    .el-tabs__header {
      margin-bottom: $spacing-lg;
    }

    .el-tabs__nav-wrap {
      &::after {
        background-color: $color-border-lighter;
      }
    }

    .el-tabs__item {
      font-size: $font-size-base;
      padding: $spacing-md $spacing-lg;
      transition: all 0.3s ease;

      &:hover {
        color: $color-primary;
      }

      &.is-active {
        color: $color-primary;
        font-weight: $font-weight-semibold;
      }
    }

    .el-tabs__active-bar {
      background-color: $color-primary;
      height: 3px;
    }
  }

  // 空状
  :deep(.el-empty) {
    padding: $spacing-xxl 0;

    .el-empty__image {
      width: 200px;
    }

    .el-empty__description {
      margin-top: $spacing-lg;
      color: $color-text-secondary;
    }
  }

  // 移动端适配
  @include mobile {
    :deep(.el-form) {
      .el-row {
        .el-col {
          width: 100%;
          margin-bottom: $spacing-sm;
        }
      }
    }

    :deep(.el-tabs) {
      .el-tabs__item {
        padding: $spacing-sm $spacing-md;
        font-size: $font-size-small;
      }
    }
  }
}
</style>