<template>
  <div id="app">
    <router-view />
  </div>
</template>

<script setup lang="ts">
import { onMounted, onUnmounted } from 'vue'
import { useUserStore } from '@/stores/user'
import { getUserInfo } from '@/api/auth'
import { ElNotification } from 'element-plus'

const userStore = useUserStore()
let notificationCheckInterval: number | null = null

// 检查权限更新通知
const checkPermissionNotifications = async () => {
  try {
    // 只在用户已登录时检查
    if (!userStore.token) return
    
    const { getNotifications } = await import('@/api/notification')
    const res = await getNotifications({ limit: 10, is_read: false })
    
    if (res.data?.list) {
      const permissionNotification = res.data.list.find(
        (n: any) => n.extra_data?.action === 'permission_updated'
      )
      
      if (permissionNotification) {
        // 自动刷新权限
        const refreshed = await userStore.refreshPermissions()
        
        if (refreshed) {
          ElNotification({
            title: '权限已更新',
            message: permissionNotification.content,
            type: 'warning',
            duration: 5000,
            onClick: () => {
              // 刷新页面
              window.location.reload()
            }
          })
          
          // 标记通知为已读
          const { markAsRead } = await import('@/api/notification')
          await markAsRead(permissionNotification.id)
        }
      }
    }
  } catch (error) {
    // 静默失败，不影响用户体验
    console.error('检查权限通知失败:', error)
  }
}

// 应用初始化时恢复用户信息
onMounted(async () => {
  const token = localStorage.getItem('token')
  
  // 如果有token但没有用户信息，重新获取
  if (token && !userStore.userInfo) {
    try {
      const res = await getUserInfo()
      userStore.setUserInfo(res.data)
    } catch (error) {
      console.error('获取用户信息失败:', error)
      // 如果token失效，清除token
      userStore.logout()
    }
  }
  
  // 启动权限通知监听，每30秒检查一次
  if (token) {
    notificationCheckInterval = window.setInterval(checkPermissionNotifications, 30000)
    // 立即执行一次检查
    checkPermissionNotifications()
  }
})

// 组件卸载时清理定时器
onUnmounted(() => {
  if (notificationCheckInterval) {
    clearInterval(notificationCheckInterval)
  }
})
</script>

<style>
#app {
  width: 100%;
  height: 100vh;
  margin: 0;
  padding: 0;
}

* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

html, body {
  width: 100%;
  height: 100%;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;
}
</style>