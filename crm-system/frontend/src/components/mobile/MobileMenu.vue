<template>
  <div class="mobile-menu">
    <!-- 顶部导航栏 -->
    <div class="mobile-header">
      <el-button
        :icon="Expand"
        circle
        @click="toggleMenu"
        class="menu-toggle"
      />
      <div class="header-title">CRM系统</div>
      <el-dropdown @command="handleCommand">
        <el-avatar :size="32" :icon="UserFilled" />
        <template #dropdown>
          <el-dropdown-menu>
            <el-dropdown-item>{{ userName }}</el-dropdown-item>
            <el-dropdown-item divided command="logout">退出登录</el-dropdown-item>
          </el-dropdown-menu>
        </template>
      </el-dropdown>
    </div>

    <!-- 侧边菜单抽屉 -->
    <transition name="slide">
      <div v-if="menuVisible" class="menu-drawer" @click.self="toggleMenu">
        <div class="menu-content">
          <div class="menu-header">
            <span>菜单</span>
            <el-button :icon="Close" circle @click="toggleMenu" />
          </div>
          <el-menu
            :default-active="activeMenu"
            class="mobile-menu-list"
            @select="handleMenuSelect"
          >
            <el-menu-item index="/dashboard">
              <el-icon><HomeFilled /></el-icon>
              <span>首页</span>
            </el-menu-item>
            <el-menu-item index="/customers">
              <el-icon><User /></el-icon>
              <span>客户管理</span>
            </el-menu-item>
            <el-menu-item index="/opportunities">
              <el-icon><TrendCharts /></el-icon>
              <span>销售机会</span>
            </el-menu-item>
            <el-menu-item index="/followups">
              <el-icon><ChatDotRound /></el-icon>
              <span>跟进记录</span>
            </el-menu-item>
            <el-menu-item index="/customer-pool">
              <el-icon><Management /></el-icon>
              <span>客户池</span>
            </el-menu-item>
            <ElSubMenu index="analysis">
              <template #title>
                <el-icon><DataAnalysis /></el-icon>
                <span>数据分析</span>
              </template>
              <el-menu-item index="/opportunity-analysis">商机分析</el-menu-item>
              <el-menu-item index="/followup-stats">跟进统计</el-menu-item>
            </ElSubMenu>
            <ElSubMenu index="system">
              <template #title>
                <el-icon><Setting /></el-icon>
                <span>系统设置</span>
              </template>
              <el-menu-item index="/system/settings">个人设置</el-menu-item>
            </ElSubMenu>
          </el-menu>
        </div>
      </div>
    </transition>

    <!-- 底部标签栏 -->
    <div class="bottom-tabs">
      <div
        v-for="tab in tabs"
        :key="tab.path"
        :class="['tab-item', { active: activeTab === tab.path }]"
        @click="handleTabClick(tab.path)"
      >
        <el-icon><component :is="tab.icon" /></el-icon>
        <span>{{ tab.label }}</span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useUserStore } from '@/stores/user'
import {
  Expand,
  UserFilled,
  Management,
  HomeFilled,
  User,
  TrendCharts,
  ChatDotRound,
  DataAnalysis,
  Setting,
  Close
} from '@element-plus/icons-vue'

const router = useRouter()
const route = useRoute()
const userStore = useUserStore()

const menuVisible = ref(false)
const activeMenu = computed(() => route.path)
const activeTab = computed(() => route.path)

const userName = computed(() => userStore.userInfo?.name || userStore.userInfo?.username || '用户')

const tabs = [
  { path: '/dashboard', label: '首页', icon: HomeFilled },
  { path: '/customers', label: '客户', icon: User },
  { path: '/opportunities', label: '机会', icon: TrendCharts },
  { path: '/followups', label: '跟进', icon: ChatDotRound }
]

const toggleMenu = () => {
  menuVisible.value = !menuVisible.value
}

const handleMenuSelect = (path: string) => {
  router.push(path)
  menuVisible.value = false
}

const handleTabClick = (path: string) => {
  router.push(path)
}

const handleCommand = (command: string) => {
  if (command === 'logout') {
    userStore.logout()
    router.push('/login')
  }
}
</script>
<style scoped lang="scss">
.mobile-menu {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 1000;
  pointer-events: none;

  > * {
    pointer-events: auto;
  }
}

.mobile-header {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  height: 50px;
  background: $color-bg-card;
  border-bottom: 1px solid $color-border-light;
  box-shadow: $box-shadow-light;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 $spacing-md;
  z-index: 1001;

  .menu-toggle {
    border: none;
    transition: all 0.3s ease;

    &:hover {
      background: $color-bg-page;
      transform: rotate(180deg);
    }

    &:active {
      transform: rotate(180deg) scale(0.95);
    }
  }

  .header-title {
    font-size: $font-size-lg;
    font-weight: $font-weight-semibold;
    color: $color-text-primary;
  }

  :deep(.el-dropdown) {
    .el-avatar {
      cursor: pointer;
      transition: all 0.3s ease;

      &:hover {
        transform: scale(1.1);
        box-shadow: $box-shadow-base;
      }
    }
  }
}

.menu-drawer {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  z-index: 1002;

  .menu-content {
    position: absolute;
    left: 0;
    top: 0;
    bottom: 0;
    width: 280px;
    background: $color-bg-card;
    box-shadow: $box-shadow-base;
    overflow-y: auto;

    .menu-header {
      height: 50px;
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 0 $spacing-md;
      border-bottom: 1px solid $color-border-light;
      font-size: $font-size-lg;
      font-weight: $font-weight-semibold;
    }

    .mobile-menu-list {
      border: none;
    }
  }
}

.slide-enter-active,
.slide-leave-active {
  transition: all 0.3s ease;
}

.slide-enter-from,
.slide-leave-to {
  opacity: 0;
  
  .menu-content {
    transform: translateX(-100%);
  }
}

.bottom-tabs {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  height: 56px;
  background: $color-bg-card;
  border-top: 1px solid $color-border-light;
  display: flex;
  align-items: center;
  justify-content: space-around;
  z-index: 1001;
  box-shadow: 0 -2px 8px rgba(0, 0, 0, 0.05);

  .tab-item {
    flex: 1;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 4px;
    cursor: pointer;
    transition: all 0.3s ease;
    color: $color-text-secondary;
    font-size: 12px;

    .el-icon {
      font-size: 20px;
    }

    &.active {
      color: $color-primary;
    }

    &:active {
      transform: scale(0.95);
    }
  }
}
</style>
