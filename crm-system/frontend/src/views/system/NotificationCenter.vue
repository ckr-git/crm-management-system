<template>
  <div class="notification-center">
    <PageHeader title="消息中心" description="查看和管理系统消息通知" :show-back="false">
      <template #extra>
        <el-button @click="handleMarkAllRead" :disabled="unreadCount === 0">
          <el-icon><Check /></el-icon>
          全部已读
        </el-button>
      </template>
    </PageHeader>

    <el-card style="margin-bottom: 20px;">
      <el-form inline>
        <el-form-item label="消息类型">
          <el-select v-model="queryForm.type" placeholder="请选择类型" clearable>
            <el-option label="系统通知" value="system" />
            <el-option label="任务提醒" value="task" />
            <el-option label="审批通知" value="approval" />
            <el-option label="客户相关" value="customer" />
          </el-select>
        </el-form-item>
        <el-form-item label="阅读状态">
          <el-select v-model="queryForm.is_read" placeholder="请选择状态" clearable>
            <el-option label="未读" value="0" />
            <el-option label="已读" value="1" />
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="loadNotifications">
            <el-icon><Search /></el-icon>
            查询
          </el-button>
          <el-button @click="resetQuery">
            <el-icon><RefreshRight /></el-icon>
            重置
          </el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <el-card v-loading="loading">
      <div v-if="notifications.length > 0" class="notification-list">
        <div
          v-for="item in notifications"
          :key="item.id"
          class="notification-item"
          :class="{ unread: !item.is_read }"
          @click="handleItemClick(item)"
        >
          <div class="notification-icon" :style="{ color: getTypeColor(item.type) }">
            <component :is="getTypeIcon(item.type)" />
          </div>
          <div class="notification-content">
            <div class="notification-title">{{ item.title }}</div>
            <div class="notification-desc">{{ item.content }}</div>
            <div class="notification-time">{{ formatTime(item.created_at) }}</div>
          </div>
          <div class="notification-actions">
            <el-button v-if="!item.is_read" type="primary" size="small" text @click.stop="handleMarkRead(item.id)">
              标记已读
            </el-button>
            <el-button type="danger" size="small" text @click.stop="handleDelete(item.id)">
              删除
            </el-button>
          </div>
        </div>
      </div>
      <el-empty v-else description="暂无消息" />

      <el-pagination
        v-if="total > 0"
        v-model:current-page="queryForm.page"
        v-model:page-size="queryForm.limit"
        :total="total"
        :page-sizes="[20, 50, 100]"
        layout="total, sizes, prev, pager, next"
        @change="loadNotifications"
        style="margin-top: 20px; justify-content: center;"
      />
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { useRouter } from 'vue-router'
import { Bell, Message, DocumentChecked, User } from '@element-plus/icons-vue'
import dayjs from 'dayjs'
import relativeTime from 'dayjs/plugin/relativeTime'
import 'dayjs/locale/zh-cn'
import PageHeader from '@/components/common/PageHeader.vue'
import { getNotifications, markAsRead, markAllAsRead, deleteNotification, getUnreadCount } from '@/api/notification'

dayjs.extend(relativeTime)
dayjs.locale('zh-cn')

const router = useRouter()
const loading = ref(false)
const notifications = ref<any[]>([])
const total = ref(0)
const unreadCount = ref(0)

const queryForm = reactive({
  page: 1,
  limit: 20,
  type: '',
  is_read: ''
})

// 加载通知列表
const loadNotifications = async () => {
  loading.value = true
  try {
    const res = await getNotifications(queryForm)
    notifications.value = res.data.list
    total.value = res.data.total

    // 更新未读数量
    loadUnreadCount()
  } catch (error) {
    console.error('加载通知失败:', error)
    ElMessage.error('加载通知失败')
  } finally {
    loading.value = false
  }
}

// 加载未读数量
const loadUnreadCount = async () => {
  try {
    const res = await getUnreadCount()
    unreadCount.value = res.data.count
  } catch (error) {
    console.error('加载未读数量失败:', error)
  }
}

// 标记单条已读
const handleMarkRead = async (id: number) => {
  try {
    await markAsRead(id)
    ElMessage.success('标记成功')
    loadNotifications()
  } catch (error) {
    console.error('标记已读失败:', error)
    ElMessage.error('标记已读失败')
  }
}

// 全部标记已读
const handleMarkAllRead = async () => {
  try {
    await ElMessageBox.confirm('确定将所有未读消息标记为已读吗？', '提示', {
      type: 'warning'
    })
    
    await markAllAsRead()
    ElMessage.success('全部标记成功')
    loadNotifications()
  } catch (error: any) {
    if (error !== 'cancel') {
      console.error('全部标记已读失败:', error)
      ElMessage.error('全部标记已读失败')
    }
  }
}

// 删除通知
const handleDelete = async (id: number) => {
  try {
    await ElMessageBox.confirm('确定删除这条通知吗？', '提示', {
      type: 'warning'
    })
    
    await deleteNotification(id)
    ElMessage.success('删除成功')
    loadNotifications()
  } catch (error: any) {
    if (error !== 'cancel') {
      console.error('删除通知失败:', error)
      ElMessage.error('删除通知失败')
    }
  }
}

// 点击通知
const handleItemClick = async (item: any) => {
  // 如果未读，先标记为已读
  if (!item.is_read) {
    await markAsRead(item.id)
    loadNotifications()
  }

  // 如果有跳转链接，则跳转
  if (item.link) {
    router.push(item.link)
  }
}

// 重置查询
const resetQuery = () => {
  queryForm.page = 1
  queryForm.type = ''
  queryForm.is_read = ''
  loadNotifications()
}

// 获取类型图标
const getTypeIcon = (type: string) => {
  const icons: Record<string, any> = {
    'system': Bell,
    'task': DocumentChecked,
    'approval': DocumentChecked,
    'customer': User
  }
  return icons[type] || Message
}

// 获取类型颜色
const getTypeColor = (type: string) => {
  const colors: Record<string, string> = {
    'system': '#409eff',
    'task': '#e6a23c',
    'approval': '#67c23a',
    'customer': '#f56c6c'
  }
  return colors[type] || '#909399'
}

// 格式化时间
const formatTime = (time: string) => {
  return dayjs(time).fromNow()
}

onMounted(() => {
  loadNotifications()
})
</script>
<style lang="scss" scoped>

.notification-center {
  padding: 0;

  // 筛选卡片
  :deep(.el-card) {
    border-radius: $border-radius-card;
    box-shadow: $box-shadow-light;
    margin-bottom: $spacing-lg;

    &:hover {
      box-shadow: $box-shadow-base;
    }

    .el-card__body {
      padding: $spacing-md $spacing-lg;
    }
  }

  .notification-list {
    .notification-item {
      display: flex;
      align-items: flex-start;
      padding: 16px;
      border-bottom: 1px solid #f0f0f0;
      cursor: pointer;
      transition: background-color 0.3s;

      &:hover {
        background-color: #f5f7fa;
      }

      &.unread {
        background-color: #ecf5ff;
      }

      &:last-child {
        border-bottom: none;
      }

      .notification-icon {
        font-size: 24px;
        margin-right: 16px;
        margin-top: 4px;
      }

      .notification-content {
        flex: 1;

        .notification-title {
          font-size: 16px;
          font-weight: 600;
          color: #303133;
          margin-bottom: 8px;
        }

        .notification-desc {
          font-size: 14px;
          color: #606266;
          margin-bottom: 8px;
          line-height: 1.5;
        }

        .notification-time {
          font-size: 12px;
          color: #909399;
        }
      }

      .notification-actions {
        display: flex;
        flex-direction: column;
        gap: 8px;
      }
    }
  }
}
</style>
