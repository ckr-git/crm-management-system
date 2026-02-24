<template>
  <div class="opportunity-card">
    <div class="card-header" @click="$emit('view', opportunity.id)">
      <div class="opportunity-name">{{ opportunity.name }}</div>
      <div class="opportunity-amount">¥{{ formatAmount(opportunity.amount) }}</div>
    </div>
    
    <div class="card-body" @click="$emit('view', opportunity.id)">
      <div class="card-row">
        <el-icon><OfficeBuilding /></el-icon>
        <span class="customer-name">{{ opportunity.customer?.name || '未关联客户' }}</span>
      </div>
      
      <div class="card-row">
        <el-icon><User /></el-icon>
        <span>{{ opportunity.owner?.name || '未分配' }}</span>
      </div>
      
      <div class="card-row">
        <el-icon><Calendar /></el-icon>
        <span>{{ formatDate(opportunity.expected_close_date) }}</span>
      </div>
    </div>
    
    <div class="card-footer" @click="$emit('view', opportunity.id)">
      <el-progress 
        :percentage="opportunity.probability || 0" 
        :stroke-width="6"
        :show-text="false"
      />
      <span class="probability-text">{{ opportunity.probability || 0 }}%</span>
    </div>

    <div class="card-actions" @click.stop>
      <el-button
        type="success"
        size="small"
        @click.stop="$emit('win', opportunity)"
      >
        赢单
      </el-button>
      <el-button
        type="danger"
        size="small"
        @click.stop="$emit('lost', opportunity)"
      >
        输单
      </el-button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { OfficeBuilding, User, Calendar } from '@element-plus/icons-vue'

interface Props {
  opportunity: any
}

defineProps<Props>()
defineEmits(['view', 'win', 'lost'])
// 格式化金额
const formatAmount = (amount: any) => {
  const num = parseFloat(amount)
  if (!num || isNaN(num)) return '0'
  if (num >= 10000) {
    return (num / 10000).toFixed(1) + '万'
  }
  return num.toFixed(0)
}

// 格式化日期
const formatDate = (date: string) => {
  if (!date) return '未设置'
  return new Date(date).toLocaleDateString('zh-CN', {
    month: 'numeric',
    day: 'numeric'
  })
}
</script>

<style lang="scss" scoped>

.opportunity-card {
  background: $color-bg-card;
  border-radius: $border-radius-card;
  padding: $spacing-md;
  margin-bottom: $spacing-sm;
  box-shadow: $box-shadow-light;
  cursor: pointer;
  transition: all 0.3s ease;
  border: 1px solid $color-border-light;

  &:hover {
    box-shadow: $box-shadow-base;
    transform: translateY(-2px);
    border-color: rgba($color-primary, 0.4);
  }

  .card-header {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    margin-bottom: $spacing-sm;
    gap: $spacing-xs;

    .opportunity-name {
      font-size: $font-size-base;
      font-weight: $font-weight-semibold;
      color: $color-text-primary;
      flex: 1;
      overflow: hidden;
      text-overflow: ellipsis;
      display: -webkit-box;
      -webkit-line-clamp: 2;
      -webkit-box-orient: vertical;
      line-height: 1.4;
    }

    .opportunity-amount {
      font-size: $font-size-lg;
      font-weight: $font-weight-bold;
      color: $color-danger;
      white-space: nowrap;
      font-family: 'Helvetica Neue', Arial, sans-serif;
      letter-spacing: 0.5px;
    }
  }

  .card-body {
    display: flex;
    flex-direction: column;
    gap: $spacing-xs;
    margin-bottom: $spacing-sm;

    .card-row {
      display: flex;
      align-items: center;
      gap: $spacing-xs;
      font-size: $font-size-sm;
      color: $color-text-regular;

      .el-icon {
        font-size: 14px;
        color: $color-text-secondary;
      }

      .customer-name {
        font-weight: $font-weight-medium;
      }
    }
  }

  .card-footer {
    display: flex;
    align-items: center;
    gap: $spacing-sm;

    :deep(.el-progress) {
      flex: 1;

      .el-progress-bar__inner {
        transition: width 0.4s ease;
      }
    }

    .probability-text {
      font-size: $font-size-xs;
      font-weight: $font-weight-semibold;
      color: $color-primary;
      min-width: 35px;
      text-align: right;
    }
  }

  .card-actions {
    display: flex;
    gap: $spacing-sm;
    padding-top: $spacing-sm;
    border-top: 1px solid $color-border-lighter;

    :deep(.el-button) {
      flex: 1;
    }
  }
}
</style>