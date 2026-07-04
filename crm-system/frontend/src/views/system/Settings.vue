<template>
  <div class="settings-page">
    <PageHeader title="系统设置" :show-back="true" back-path="/dashboard" />

    <el-tabs v-model="activeTab">
      <el-tab-pane label="个人设置" name="user">
        <el-card>
          <el-form :model="userForm" label-width="100px">
            <el-form-item label="用户名">
              <el-input v-model="userForm.username" disabled />
            </el-form-item>
            <el-form-item label="姓名">
              <el-input v-model="userForm.name" />
            </el-form-item>
            <el-form-item label="邮箱">
              <el-input v-model="userForm.email" />
            </el-form-item>
            <el-form-item label="手机">
              <el-input v-model="userForm.phone" />
            </el-form-item>
            <el-form-item>
              <el-button type="primary" @click="saveUserSettings">保存</el-button>
            </el-form-item>
          </el-form>
        </el-card>

        <el-card style="margin-top: 20px;">
          <template #header>修改密码</template>
          <el-form :model="passwordForm" label-width="100px">
            <el-form-item label="原密码">
              <el-input v-model="passwordForm.old_password" type="password" show-password />
            </el-form-item>
            <el-form-item label="新密码">
              <el-input v-model="passwordForm.new_password" type="password" show-password />
            </el-form-item>
            <el-form-item label="确认密码">
              <el-input v-model="passwordForm.confirm_password" type="password" show-password />
            </el-form-item>
            <el-form-item>
              <el-button type="primary" @click="changePassword">修改密码</el-button>
            </el-form-item>
          </el-form>
        </el-card>
      </el-tab-pane>

      <el-tab-pane label="系统设置" name="system">
        <el-card>
          <el-form :model="systemForm" label-width="150px">
            <el-form-item label="站点名称">
              <el-input v-model="systemForm.site_name" />
            </el-form-item>
            <el-form-item label="公海回收天数">
              <el-input-number v-model="systemForm.customer_pool_days" :min="1" :max="365" />
              <span style="margin-left: 10px; color: #909399;">天未跟进后自动释放到公海</span>
            </el-form-item>
            <el-form-item label="跟进提醒时间">
              <el-input-number v-model="systemForm.followup_reminder_hours" :min="1" :max="72" />
              <span style="margin-left: 10px; color: #909399;">小时前提醒</span>
            </el-form-item>
            <el-form-item label="启用通知">
              <el-switch v-model="systemForm.enable_notification" />
            </el-form-item>
            <el-form-item>
              <el-button type="primary" @click="saveSystemSettings">保存</el-button>
            </el-form-item>
          </el-form>
        </el-card>
      </el-tab-pane>

      <el-tab-pane label="外观设置" name="theme">
        <el-card>
          <el-form label-width="100px">
            <el-form-item label="主题模式">
              <el-radio-group v-model="themeMode" @change="changeTheme">
                <el-radio label="light">浅色</el-radio>
                <el-radio label="dark">深色</el-radio>
              </el-radio-group>
            </el-form-item>
            <el-form-item label="主题色">
              <el-color-picker v-model="themeColor" @change="changeColor" />
            </el-form-item>
          </el-form>
        </el-card>
      </el-tab-pane>
    </el-tabs>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { ElMessage } from 'element-plus'
import PageHeader from '@/components/common/PageHeader.vue'
import request from '@/utils/request'

const route = useRoute()
const activeTab = ref(route.query.tab as string || 'user')
const themeMode = ref('light')
const themeColor = ref('#409EFF')

const userForm = ref({
  username: '',
  name: '',
  email: '',
  phone: ''
})

const passwordForm = ref({
  old_password: '',
  new_password: '',
  confirm_password: ''
})

const systemForm = ref({
  site_name: '',
  customer_pool_days: 30,
  followup_reminder_hours: 24,
  enable_notification: true
})

const loadUserSettings = async () => {
  try {
    const res = await request.get('/settings/user')
    Object.assign(userForm.value, res.data)
  } catch (error) {
    ElMessage.error('加载用户设置失败')
  }
}

const saveUserSettings = async () => {
  try {
    await request.put('/settings/user', userForm.value)
    ElMessage.success('保存成功')
  } catch (error) {
    ElMessage.error('保存失败')
  }
}

const changePassword = async () => {
  if (passwordForm.value.new_password !== passwordForm.value.confirm_password) {
    return ElMessage.error('两次密码不一致')
  }
  try {
    await request.post('/settings/password', passwordForm.value)
    ElMessage.success('密码修改成功')
    passwordForm.value = { old_password: '', new_password: '', confirm_password: '' }
  } catch (error: any) {
    ElMessage.error(error.response?.data?.message || '修改失败')
  }
}

const loadSystemSettings = async () => {
  try {
    const res = await request.get('/settings/system')
    Object.assign(systemForm.value, res.data)
  } catch (error) {
    ElMessage.error('加载系统设置失败')
  }
}

const saveSystemSettings = async () => {
  try {
    await request.put('/settings/system', systemForm.value)
    ElMessage.success('保存成功')
  } catch (error) {
    ElMessage.error('保存失败')
  }
}

const changeTheme = (mode: string) => {
  document.documentElement.classList.toggle('dark', mode === 'dark')
  localStorage.setItem('theme', mode)
}

const changeColor = (color: string) => {
  document.documentElement.style.setProperty('--el-color-primary', color)
  localStorage.setItem('themeColor', color)
}

onMounted(() => {
  loadUserSettings()
  loadSystemSettings()
  
  const savedTheme = localStorage.getItem('theme')
  if (savedTheme) {
    themeMode.value = savedTheme
    changeTheme(savedTheme)
  }
  
  const savedColor = localStorage.getItem('themeColor')
  if (savedColor) {
    themeColor.value = savedColor
    changeColor(savedColor)
  }
})
</script>
<style lang="scss" scoped>

.settings-page {
  padding: 0;

  // Tabs样式
  :deep(.el-tabs) {
    .el-tabs__header {
      margin-bottom: $spacing-lg;
      background: $color-bg-card;
      padding: $spacing-md $spacing-lg 0;
      border-radius: $border-radius-card $border-radius-card 0 0;
      box-shadow: $box-shadow-light;

      .el-tabs__nav-wrap::after {
        background-color: $color-border-lighter;
      }

      .el-tabs__item {
        font-weight: $font-weight-medium;
        font-size: $font-size-base;
        padding: 0 $spacing-lg;
        height: 48px;
        line-height: 48px;
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
        height: 3px;
        background-color: $color-primary;
        border-radius: 2px;
      }
    }

    .el-tabs__content {
      padding: 0 $spacing-xs;
    }
  }

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
      padding: $spacing-md $spacing-lg;
      background: linear-gradient(
        to bottom,
        $color-bg-card 0%,
        rgba($color-bg-page, 0.3) 100%
      );
      border-bottom: 1px solid $color-border-light;
      font-weight: $font-weight-semibold;
      color: $color-text-primary;
    }

    .el-card__body {
      padding: $spacing-lg $spacing-xl;
    }
  }

  // 表单样式
  :deep(.el-form) {
    .el-form-item {
      margin-bottom: $spacing-lg;

      .el-form-item__label {
        font-weight: $font-weight-medium;
        color: $color-text-primary;
      }
    }
  }
}
</style>
