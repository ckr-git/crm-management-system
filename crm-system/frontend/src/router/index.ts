import { createRouter, createWebHistory } from 'vue-router'
import { useUserStore } from '@/stores/user'
import { ElMessage } from 'element-plus'

const routes = [
  {
    path: '/',
    redirect: '/login'
  },
  {
    path: '/login',
    name: 'Login',
    component: () => import('@/views/Login.vue')
  },
  {
    path: '/home',
    redirect: '/dashboard'
  },
  {
    path: '/dashboard',
    name: 'Dashboard',
    component: () => import('@/views/Dashboard.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/customers',
    name: 'CustomerList',
    component: () => import('@/views/customers/CustomerList.vue'),
    meta: { 
      requiresAuth: true,
      permission: ['customer:read']
    }
  },
  {
    path: '/customers/:id',
    name: 'CustomerDetail',
    component: () => import('@/views/customers/CustomerDetail.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/followups',
    name: 'FollowupList',
    component: () => import('@/views/followups/FollowupList.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/followup-stats',
    name: 'FollowupStats',
    component: () => import('@/views/followups/FollowupStats.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/customer-pool',
    name: 'CustomerPoolList',
    component: () => import('@/views/customerPool/CustomerPoolList.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/opportunities',
    name: 'OpportunityList',
    component: () => import('@/views/opportunities/OpportunityList.vue'),
    meta: { 
      requiresAuth: true,
      permission: ['opportunity:read']
    }
  },
  {
    path: '/opportunity-kanban',
    name: 'OpportunityKanban',
    component: () => import('@/views/opportunities/OpportunityKanban.vue'),
    meta: { 
      requiresAuth: true,
      permission: ['opportunity:read']
    }
  },
  {
    path: '/opportunities/:id',
    name: 'OpportunityDetail',
    component: () => import('@/views/opportunities/OpportunityDetail.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/opportunity-analysis',
    name: 'OpportunityAnalysis',
    component: () => import('@/views/opportunities/OpportunityAnalysis.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/system/users',
    name: 'UserList',
    component: () => import('@/views/system/UserList.vue'),
    meta: { 
      requiresAuth: true,
      permission: ['user:read']
    }
  },
  {
    path: '/system/roles',
    name: 'RoleList',
    component: () => import('@/views/system/RoleList.vue'),
    meta: { 
      requiresAuth: true,
      permission: ['role:read']
    }
  },
  {
    path: '/system/logs',
    name: 'OperationLogList',
    component: () => import('@/views/system/OperationLogList.vue'),
    meta: { 
      requiresAuth: true,
      permission: ['user:read', 'role:read'] // 日志查看需要管理权限
    }
  },
  {
    path: '/analysis/source',
    name: 'SourceAnalysis',
    component: () => import('@/views/analysis/SourceAnalysis.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/analysis/industry',
    name: 'IndustryAnalysis',
    component: () => import('@/views/analysis/IndustryAnalysis.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/analysis/behavior',
    name: 'BehaviorAnalysis',
    component: () => import('@/views/analysis/BehaviorAnalysis.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/analysis/reports',
    name: 'ReportCenter',
    component: () => import('@/views/analysis/ReportCenter.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/system/notifications',
    name: 'NotificationCenter',
    component: () => import('@/views/system/NotificationCenter.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/system/settings',
    name: 'Settings',
    component: () => import('@/views/system/Settings.vue'),
    meta: { requiresAuth: true }
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

// 路由守卫
router.beforeEach(async (to, from, next) => {
  const token = localStorage.getItem('token')
  const userStore = useUserStore()
  
  // 1. 检查是否需要登录
  if (to.meta.requiresAuth && !token) {
    ElMessage.warning('请先登录')
    next('/login')
    return
  }
  
  // 2. 已登录用户访问登录页，跳转到首页
  if (to.path === '/login' && token) {
    next('/dashboard')
    return
  }
  
  // 3. 如果有token但用户信息为空，先获取用户信息（处理刷新场景）
  if (token && !userStore.userInfo && to.path !== '/login') {
    try {
      // 动态导入避免循环依赖
      const { getUserInfo } = await import('@/api/auth')
      const res = await getUserInfo()
      userStore.setUserInfo(res.data)
    } catch (error) {
      console.error('获取用户信息失败:', error)
      // token失效，清除并跳转登录
      userStore.logout()
      ElMessage.error('登录已失效，请重新登录')
      next('/login')
      return
    }
  }
  
  // 4. 检查页面权限
  if (to.meta.permission) {
    const permissions = Array.isArray(to.meta.permission) 
      ? to.meta.permission 
      : [to.meta.permission]
    
    // 管理员拥有所有权限
    if (userStore.isAdmin) {
      next()
      return
    }
    
    // 检查是否有权限（满足任意一个即可）
    const hasPermission = permissions.some(p => 
      userStore.permissions.includes(p as string)
    )
    
    if (!hasPermission) {
      ElMessage.error('没有访问权限')
      next(from.path || '/dashboard')
      return
    }
  }
  
  next()
})

export default router
