<template>
  <div class="mobile-table">
    <div v-if="loading" class="loading">
      <el-icon class="is-loading"><Loading /></el-icon>
      <span>加载中...</span>
    </div>
    
    <div v-else-if="data.length === 0" class="empty">
      <el-empty description="暂无数据" />
    </div>

    <div v-else class="table-list">
      <div
        v-for="(item, index) in data"
        :key="item.id || index"
        class="table-item"
        @click="handleItemClick(item)"
      >
        <slot :row="item" :index="index">
          <!-- 默认显示 -->
          <div class="item-content">
            <div v-for="col in columns" :key="col.prop" class="item-row">
              <span class="label">{{ col.label }}：</span>
              <span class="value">{{ item[col.prop] }}</span>
            </div>
          </div>
        </slot>
        
        <div v-if="showActions" class="item-actions">
          <slot name="actions" :row="item" :index="index">
            <el-button
              v-for="action in actions"
              :key="action.label"
              :type="action.type || 'primary'"
              :icon="action.icon"
              size="small"
              link
              @click.stop="action.handler(item)"
            >
              {{ action.label }}
            </el-button>
          </slot>
        </div>
      </div>
    </div>

    <!-- 分页 -->
    <div v-if="showPagination && total > 0" class="mobile-pagination">
      <el-pagination
        :current-page="currentPage"
        :page-size="pageSize"
        :total="total"
        layout="prev, pager, next"
        small
        @current-change="handlePageChange"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { Loading } from '@element-plus/icons-vue'

interface Column {
  prop: string
  label: string
}

interface Action {
  label: string
  type?: 'primary' | 'success' | 'warning' | 'danger'
  icon?: any
  handler: (row: any) => void
}

interface Props {
  data: any[]
  columns?: Column[]
  loading?: boolean
  showActions?: boolean
  actions?: Action[]
  showPagination?: boolean
  total?: number
  currentPage?: number
  pageSize?: number
}

withDefaults(defineProps<Props>(), {
  columns: () => [],
  loading: false,
  showActions: false,
  actions: () => [],
  showPagination: false,
  total: 0,
  currentPage: 1,
  pageSize: 10
})

const emit = defineEmits<{
  itemClick: [item: any]
  pageChange: [page: number]
}>()

const handleItemClick = (item: any) => {
  emit('itemClick', item)
}

const handlePageChange = (page: number) => {
  emit('pageChange', page)
}
</script>

<style scoped lang="scss">
.mobile-table {
  width: 100%;
  overflow-x: hidden;
  
  .loading {
    padding: $spacing-xl * 2;
    text-align: center;
    color: $color-text-secondary;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: $spacing-md;

    .el-icon {
      font-size: 32px;
      color: $color-primary;
    }

    span {
      font-size: $font-size-sm;
    }
  }

  .empty {
    padding: $spacing-xl;
    background: $color-bg-card;
    border-radius: $border-radius-card;
  }

  .table-list {
    width: 100%;
    
    .table-item {
      background: $color-bg-card;
      border-radius: $border-radius-card; // 12px
      padding: $spacing-md; // 16px
      margin-bottom: $spacing-md;
      box-shadow: $box-shadow-light;
      cursor: pointer;
      transition: all 0.3s ease;
      border: 1px solid transparent;

      &:hover {
        box-shadow: $box-shadow-base;
        border-color: rgba($color-primary, 0.2);
      }

      &:active {
        transform: scale(0.98);
        box-shadow: $box-shadow-light;
      }

      &:last-child {
        margin-bottom: 0;
      }

      .item-content {
        .item-row {
          display: flex;
          margin-bottom: $spacing-sm;
          font-size: $font-size-sm;
          line-height: 1.6;

          &:last-child {
            margin-bottom: 0;
          }

          .label {
            color: $color-text-secondary;
            min-width: 80px;
            flex-shrink: 0;
            font-weight: $font-weight-regular;
          }

          .value {
            color: $color-text-primary;
            flex: 1;
            word-break: break-all;
            font-weight: $font-weight-medium;
          }
        }
      }

      .item-actions {
        margin-top: $spacing-md;
        padding-top: $spacing-md;
        border-top: 1px solid $color-border-light;
        display: flex;
        gap: $spacing-sm;
        justify-content: flex-end;

        :deep(.el-button) {
          transition: all 0.3s ease;

          &:active {
            transform: scale(0.95);
          }
        }
      }
    }
  }

  .mobile-pagination {
    padding: $spacing-lg 0;
    display: flex;
    justify-content: center;

    :deep(.el-pagination) {
      .btn-prev,
      .btn-next,
      .el-pager li {
        min-width: 32px;
        height: 32px;
        line-height: 32px;
        border-radius: $border-radius-base;
        transition: all 0.3s ease;

        &:active {
          transform: scale(0.95);
        }
      }

      .el-pager li.is-active {
        background: $color-primary;
        color: $color-white;
      }
    }
  }
}
</style>