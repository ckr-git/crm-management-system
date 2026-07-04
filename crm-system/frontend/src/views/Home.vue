<template>
  <!-- 移动端布局 -->
  <div v-if="isMobile" class="mobile-layout">
    <MobileMenu />
    <div class="mobile-content">
      <router-view />
    </div>
  </div>

  <!-- 桌面端布局 -->
  <div v-else class="home-container">
    <el-container>
      <el-header class="header">
        <div class="header-left">
          <h2>CRM客户关系管理系统</h2>
        </div>
        <div class="header-right">
          <el-dropdown @command="handleCommand">
            <span class="user-info">
              <el-icon><User /></el-icon>
              <span>{{ userStore.userInfo?.name || '管理员' }}</span>
              <el-icon class="el-icon--right"><arrow-down /></el-icon>
            </span>
            <template #dropdown>
              <el-dropdown-menu>
                <el-dropdown-item command="profile">个人中心</el-dropdown-item>
                <el-dropdown-item command="setting">系统设置</el-dropdown-item>
                <el-dropdown-item divided command="logout">退出登录</el-dropdown-item>
              </el-dropdown-menu>
            </template>
          </el-dropdown>
        </div>
      </el-header>
      
      <el-aside width="200px" class="sidebar">
        <el-menu
          :default-active="$route.path"
          class="el-menu-vertical"
          router
        >
          <el-menu-item index="/dashboard">
            <el-icon><Odometer /></el-icon>
            <span>数据概览</span>
          </el-menu-item>
          <el-menu-item index="/customers">
            <el-icon><User /></el-icon>
            <span>客户管理</span>
          </el-menu-item>
          <el-menu-item index="/opportunities">
            <el-icon><Opportunity /></el-icon>
            <span>商机管理</span>
          </el-menu-item>
          <el-menu-item index="/opportunity-kanban">
            <el-icon><Grid /></el-icon>
            <span>商机看板</span>
          </el-menu-item>
          <el-menu-item index="/followups">
            <el-icon><ChatDotRound /></el-icon>
            <span>跟进记录</span>
          </el-menu-item>
          <el-menu-item index="/customer-pool">
            <el-icon><Collection /></el-icon>
            <span>客户池</span>
          </el-menu-item>
          <ElSubMenu index="analysis">
            <template #title>
              <el-icon><TrendCharts /></el-icon>
              <span>数据分析</span>
            </template>
            <el-menu-item index="/opportunity-analysis">商机分析</el-menu-item>
            <el-menu-item index="/followup-stats">跟进统计</el-menu-item>
            <el-menu-item index="/analysis/source">来源分析</el-menu-item>
            <el-menu-item index="/analysis/industry">行业分析</el-menu-item>
            <el-menu-item index="/analysis/behavior">行为分析</el-menu-item>
            <el-menu-item index="/analysis/reports">分析报告</el-menu-item>
          </ElSubMenu>
          <ElSubMenu index="system">
            <template #title>
              <el-icon><Setting /></el-icon>
              <span>系统管理</span>
            </template>
            <el-menu-item index="/system/users">用户管理</el-menu-item>
            <el-menu-item index="/system/roles">角色管理</el-menu-item>
            <el-menu-item index="/system/logs">操作日志</el-menu-item>
            <el-menu-item index="/system/notifications">消息中心</el-menu-item>
            <el-menu-item index="/system/settings">系统设置</el-menu-item>
          </ElSubMenu>
        </el-menu>
      </el-aside>
      
      <el-main class="main-content">
        <router-view />
      </el-main>
    </el-container>
  </div>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router'
import { ElMessageBox, ElMessage } from 'element-plus'
import { useUserStore } from '@/stores/user'
import { useResponsive } from '@/composables/useResponsive'
import MobileMenu from '@/components/mobile/MobileMenu.vue'

const { isMobile } = useResponsive()
const router = useRouter()
const userStore = useUserStore()

// 处理下拉菜单命令
const handleCommand = (command: string) => {
  if (command === 'logout') {
    ElMessageBox.confirm('确定要退出登录吗？', '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    }).then(() => {
      userStore.logout()
      ElMessage.success('已退出登录')
      router.push('/login')
    }).catch(() => {
      // 取消退出
    })
  } else if (command === 'profile') {
    router.push('/system/settings?tab=user')
  } else if (command === 'setting') {
    router.push('/system/settings')
  }
}

</script>
<style scoped lang="scss">
/* 移动端布局 */
.mobile-layout {
  width: 100vw;
  height: 100vh;
  overflow: hidden;
  
  .mobile-content {
    padding-top: 50px;
    padding-bottom: 56px;
    height: 100vh;
    overflow-y: auto;
    overflow-x: hidden;
    background: $color-bg-page;
    width: 100%;
  }
}

/* 桌面端布局 */
.home-container {
  width: 100%;
  height: 100vh;
}

.el-container {
  height: 100%;
}

 </style>