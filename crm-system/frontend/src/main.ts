import { createApp } from 'vue'
import ElementPlus from 'element-plus'
import zhCn from 'element-plus/dist/locale/zh-cn.mjs'
import 'element-plus/dist/index.css'
import * as ElementPlusIconsVue from '@element-plus/icons-vue'
import { createPinia } from 'pinia'
import router from './router'
import App from './App.vue'

// 新的主题样式系统
import './styles/index.scss'        // 主题样式 (包含变量、mixins、base、element-plus)
import './styles/responsive.css'    // 响应式样式 (保留)

import { permission } from './directives/permission'

const app = createApp(App)

// 先注册 Pinia 状态管理
app.use(createPinia())

// 注册 Element Plus 组件库（确保在路由之前）
app.use(ElementPlus, {
  locale: zhCn,
})

// 注册所有 Element Plus 图标
for (const [key, component] of Object.entries(ElementPlusIconsVue)) {
  app.component(key, component)
}

// 注册全局权限指令
app.directive('permission', permission)

// 最后注册路由
app.use(router)
app.mount('#app')
