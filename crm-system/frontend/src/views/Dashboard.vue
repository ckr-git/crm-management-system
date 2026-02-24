<template>
  <div class="dashboard">
    <PageHeader 
      title="工作台" 
      description="欢迎回来，这里是您的数据概览" 
      :show-back="false"
    />

    <el-row :gutter="20" class="stats-row">
      <el-col :xs="12" :sm="6">
        <el-card shadow="hover" class="stat-card" @click="$router.push('/customers')">
          <div class="stat-content">
            <div class="stat-icon" style="background: #409EFF;">
              <el-icon :size="32"><User /></el-icon>
            </div>
            <div class="stat-info">
              <div class="stat-value">{{ stats.customerCount }}</div>
              <div class="stat-label">我的客户</div>
            </div>
          </div>
        </el-card>
      </el-col>

      <el-col :xs="12" :sm="6">
        <el-card shadow="hover" class="stat-card" @click="$router.push('/opportunities')">
          <div class="stat-content">
            <div class="stat-icon" style="background: #67C23A;">
              <el-icon :size="32"><TrendCharts /></el-icon>
            </div>
            <div class="stat-info">
              <div class="stat-value">{{ stats.opportunityCount }}</div>
              <div class="stat-label">进行中机会</div>
            </div>
          </div>
        </el-card>
      </el-col>

      <el-col :xs="12" :sm="6">
        <el-card shadow="hover" class="stat-card" @click="$router.push('/followups')">
          <div class="stat-content">
            <div class="stat-icon" style="background: #E6A23C;">
              <el-icon :size="32"><ChatDotRound /></el-icon>
            </div>
            <div class="stat-info">
              <div class="stat-value">{{ stats.followupCount }}</div>
              <div class="stat-label">跟进记录</div>
            </div>
          </div>
        </el-card>
      </el-col>

      <el-col :xs="12" :sm="6">
        <el-card shadow="hover" class="stat-card">
          <div class="stat-content">
            <div class="stat-icon" style="background: #F56C6C;">
              <el-icon :size="32"><Bell /></el-icon>
            </div>
            <div class="stat-info">
              <div class="stat-value">{{ stats.todayFollowupCount }}</div>
              <div class="stat-label">今日待跟进</div>
            </div>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <el-row :gutter="20">
      <el-col :span="24">
        <el-card>
          <template #header>快捷操作</template>
          <div class="quick-actions">
            <el-button type="primary" @click="$router.push('/customers?action=add')">
              <el-icon><Plus /></el-icon>
              新增客户
            </el-button>
            <el-button type="success" @click="$router.push('/opportunities?action=add')">
              <el-icon><Plus /></el-icon>
              创建机会
            </el-button>
            <el-button type="warning" @click="$router.push('/followups?action=add')">
              <el-icon><Plus /></el-icon>
              添加跟进
            </el-button>
            <el-button @click="$router.push('/customer-pool')">
              <el-icon><UserFilled /></el-icon>
              客户池
            </el-button>
          </div>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { User, TrendCharts, ChatDotRound, Bell, Plus, UserFilled } from '@element-plus/icons-vue'
import PageHeader from '@/components/common/PageHeader.vue'
import request from '@/utils/request'

const stats = ref({
  customerCount: 0,
  opportunityCount: 0,
  followupCount: 0,
  todayFollowupCount: 0
})

const loadStats = async () => {
  try {
    const res = await request.get('/dashboard/stats')
    stats.value = res.data
  } catch (error) {
    console.error('加载统计数据失败:', error)
  }
}

onMounted(() => {
  loadStats()
})
</script>
<style scoped lang="scss">
.dashboard {
  padding: 0 $spacing-lg $spacing-lg;

  @include mobile {
    padding: 0 $spacing-md $spacing-md;
  }
}

.stats-row {
  margin-bottom: $spacing-lg;
}

.stat-card {
  cursor: pointer;
  transition: all 0.3s ease;

  &:hover {
    transform: translateY(-4px);
  }

  .stat-content {
    display: flex;
    align-items: center;
    padding: 10px 0;

    @include mobile {
      padding: 8px 0;
    }

    .stat-icon {
      width: 64px;
      height: 64px;
      border-radius: 12px;
      display: flex;
      align-items: center;
      justify-content: center;
      color: white;
      margin-right: 16px;

      @include mobile {
        width: 48px;
        height: 48px;
        margin-right: 12px;

        .el-icon {
          font-size: 24px !important;
        }
      }
    }

    .stat-info {
      flex: 1;

      .stat-value {
        font-size: 28px;
        font-weight: bold;
        color: #303133;
        line-height: 1.2;

        @include mobile {
          font-size: 20px;
        }
      }

      .stat-label {
        font-size: 14px;
        color: #909399;
        margin-top: 4px;

        @include mobile {
          font-size: 12px;
        }
      }
    }
  }
}

.quick-actions {
  display: flex;
  gap: 16px;
  flex-wrap: wrap;

  @include mobile {
    .el-button {
      flex: 1 1 calc(50% - 8px);
      justify-content: center;
    }
  }
}
</style>
