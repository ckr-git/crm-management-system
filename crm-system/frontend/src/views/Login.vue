<template>
  <div class="login-container">
    <div class="login-box">
      <h1 class="login-title">CRM客户关系管理系统</h1>
      <el-form
        ref="loginFormRef"
        :model="loginForm"
        :rules="loginRules"
        class="login-form"
      >
        <el-form-item prop="username">
          <el-input
            v-model="loginForm.username"
            placeholder="请输入用户名"
            prefix-icon="User"
            size="large"
          />
        </el-form-item>
        <el-form-item prop="password">
          <el-input
            v-model="loginForm.password"
            type="password"
            placeholder="请输入密码"
            prefix-icon="Lock"
            size="large"
            show-password
            @keyup.enter="handleLogin"
          />
        </el-form-item>
        <el-form-item>
          <el-button
            type="primary"
            size="large"
            :loading="loading"
            class="login-button"
            @click="handleLogin"
          >
            {{ loading ? '登录中...' : '登录' }}
          </el-button>
        </el-form-item>
      </el-form>
    </div>
  </div>
</template>
<script setup lang="ts">
import { ref, reactive } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import type { FormInstance } from 'element-plus'
import { login } from '@/api/auth'
import { useUserStore } from '@/stores/user'

const router = useRouter()
const userStore = useUserStore()
const loginFormRef = ref<FormInstance>()
const loading = ref(false)

// 表单数据
const loginForm = reactive({
  username: '',
  password: ''
})

// 表单验证规则
const loginRules = {
  username: [
    { required: true, message: '请输入用户名', trigger: 'blur' }
  ],
  password: [
    { required: true, message: '请输入密码', trigger: 'blur' },
    { min: 6, message: '密码长度至少6位', trigger: 'blur' }
  ]
}

// 处理登录
const handleLogin = async () => {
  if (!loginFormRef.value) return
  
  await loginFormRef.value.validate(async (valid) => {
    if (valid) {
      loading.value = true
      try {
        const res = await login(loginForm)
        
        // 保存token和用户信息
        userStore.setToken(res.data.token)
        userStore.setUserInfo(res.data.user)
        
        ElMessage.success('登录成功')
        router.push('/home')
      } catch (error: any) {
        console.error('登录失败:', error)
        ElMessage({ message: error.response?.data?.message || '登录失败', type: 'error', duration: 3000 })
      } finally {
        loading.value = false
      }
    }
  })
}
</script>
<style lang="scss" scoped>

.login-container {
  width: 100%;
  height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;
  background: linear-gradient(
    135deg,
    #667eea 0%,
    #764ba2 50%,
    #f093fb 100%
  );
  background-size: 200% 200%;
  animation: gradientShift 15s ease infinite;
  position: relative;
  overflow: hidden;

  // 背景动画
  @keyframes gradientShift {
    0% {
      background-position: 0% 50%;
    }
    50% {
      background-position: 100% 50%;
    }
    100% {
      background-position: 0% 50%;
    }
  }

  // 浮动元素装饰
  &::before,
  &::after {
    content: '';
    position: absolute;
    border-radius: 50%;
    background: rgba(255, 255, 255, 0.1);
    animation: float 20s ease-in-out infinite;
  }

  &::before {
    width: 600px;
    height: 600px;
    top: -300px;
    left: -100px;
  }

  &::after {
    width: 400px;
    height: 400px;
    bottom: -200px;
    right: -100px;
    animation-delay: 5s;
  }

  @keyframes float {
    0%, 100% {
      transform: translateY(0) rotate(0deg);
    }
    50% {
      transform: translateY(-30px) rotate(180deg);
    }
  }
}

.login-box {
  width: 420px;
  padding: $spacing-xl * 2;
  background: $color-white;
  border-radius: $border-radius-card * 1.5;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
  position: relative;
  z-index: 1;
  animation: slideUp 0.6s ease-out;

  @keyframes slideUp {
    from {
      opacity: 0;
      transform: translateY(30px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }

  @include mobile {
    width: 90%;
    max-width: 380px;
    padding: $spacing-xl;
  }
}

.login-title {
  font-size: $font-size-xl * 1.5;
  font-weight: $font-weight-bold;
  text-align: center;
  margin-bottom: $spacing-xl;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  letter-spacing: 1px;

  @include mobile {
    font-size: $font-size-xl * 1.2;
  }
}

.login-form {
  margin-top: $spacing-lg;

  :deep(.el-form-item) {
    margin-bottom: $spacing-lg;

    .el-input {
      font-size: $font-size-base;

      input {
        height: 48px;
        line-height: 48px;
        border-radius: $border-radius-base;
      }
    }
  }
}

.login-button {
  width: 100%;
  height: 48px;
  font-size: $font-size-base;
  font-weight: $font-weight-semibold;
  border-radius: $border-radius-base;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border: none;
  transition: all 0.3s ease;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 20px rgba(102, 126, 234, 0.4);
  }

  &:active {
    transform: translateY(0);
  }
}

</style>
