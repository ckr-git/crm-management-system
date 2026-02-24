<template>
  <el-dialog
    v-model="dialogVisible"
    :title="userId ? '编辑用户' : '新增用户'"
    width="600px"
    @close="handleClose"
  >
    <el-form
      ref="formRef"
      :model="form"
      :rules="rules"
      label-width="100px"
    >
      <el-form-item label="用户" prop="username">
        <el-input 
          v-model="form.username" 
          placeholder="请输入用户名（手机号）"
          :disabled="!!userId"
        />
        <div class="form-tip">用户名作为登录账号，建议使用手机号</div>
      </el-form-item>

      <el-form-item label="姓名" prop="name">
        <el-input v-model="form.name" placeholder="请输入姓名" />
      </el-form-item>

      <el-form-item v-if="!userId" label="密码" prop="password">
        <el-input 
          v-model="form.password" 
          type="password" 
          placeholder="请输入密码（至少6位）"
          show-password
        />
        <div class="form-tip">初始密码，用户首次登录后可修改</div>
      </el-form-item>

      <el-form-item label="邮箱" prop="email">
        <el-input v-model="form.email" placeholder="请输入邮箱" />
      </el-form-item>

      <el-form-item label="手机" prop="phone">
        <el-input v-model="form.phone" placeholder="请输入手机号" />
      </el-form-item>

      <el-form-item label="角色" prop="role_id">
        <el-select v-model="form.role_id" placeholder="请选择角色" style="width: 100%">
          <el-option 
            v-for="role in roles" 
            :key="role.id" 
            :label="role.name" 
            :value="role.id"
          >
            <span>{{ role.name }}</span>
            <span style="float: right; color: #8492a6; font-size: 13px">
              {{ role.description }}
            </span>
          </el-option>
        </el-select>
      </el-form-item>
    </el-form>

    <template #footer>
      <el-button @click="handleClose">取消</el-button>
      <el-button type="primary" :loading="submitting" @click="handleSubmit">
        {{ submitting ? '提交..' : '确定' }}
      </el-button>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
import { ref, reactive, watch } from 'vue'
import { ElMessage } from 'element-plus'
import type { FormInstance, FormRules } from 'element-plus'
import { getUserDetail, createUser, updateUser } from '@/api/system'

const props = defineProps<{
  visible: boolean
  userId?: number
  roles: any[]
}>()

const emit = defineEmits(['close', 'success'])

const formRef = ref<FormInstance>()
const dialogVisible = ref(false)
const submitting = ref(false)

const form = reactive({
  username: '',
  password: '',
  name: '',
  email: '',
  phone: '',
  role_id: undefined as number | undefined
})

const rules: FormRules = {
  username: [
    { required: true, message: '请输入用户名', trigger: 'blur' },
    { pattern: /^1[3-9]\d{9}$/, message: '请输入正确的手机号', trigger: 'blur' }
  ],
  password: [
    { required: true, message: '请输入密码', trigger: 'blur' },
    { min: 6, message: '密码至少6位', trigger: 'blur' }
  ],
  name: [
    { required: true, message: '请输入姓名', trigger: 'blur' }
  ],
  email: [
    { type: 'email', message: '请输入正确的邮箱', trigger: 'blur' }
  ],
  phone: [
    { 
      validator: (rule: any, value: string, callback: any) => {
        if (!value || value === '') {
          callback();
        } else if (!/^1[3-9]\d{9}$/.test(value)) {
          callback(new Error('请输入正确的手机号'));
        } else {
          callback();
        }
      }, 
      trigger: 'blur' 
    }
  ],
  role_id: [
    { required: true, message: '请选择角色', trigger: 'change' }
  ]
}

// 监听visible变化
watch(() => props.visible, (val) => {
  dialogVisible.value = val
  if (val && props.userId) {
    loadUserDetail()
  }
})

// 加载用户详情
const loadUserDetail = async () => {
  try {
    const res = await getUserDetail(props.userId!)
    const user = res.data
    
    form.username = user.username
    form.name = user.name
    form.email = user.email || ''
    form.phone = user.phone || ''
    form.role_id = user.role_id
  } catch (error) {
    console.error('加载用户详情失败:', error)
    ElMessage.error('加载用户详情失败')
  }
}

// 提交表单
const handleSubmit = async () => {
  if (!formRef.value) return

  await formRef.value.validate(async (valid) => {
    if (!valid) return

    submitting.value = true
    try {
      if (props.userId) {
        // 编辑
        await updateUser(props.userId, {
          name: form.name,
          email: form.email,
          phone: form.phone,
          role_id: form.role_id
        })
        ElMessage.success('更新成功')
      } else {
        // 新增
        await createUser(form)
        ElMessage.success('创建成功')
      }
      
      emit('success')
      handleClose()
    } catch (error: any) {
      console.error('提交失败:', error)
      ElMessage.error(error.response?.data?.message || '提交失败')
    } finally {
      submitting.value = false
    }
  })
}

// 关闭对话框
const handleClose = () => {
  formRef.value?.resetFields()
  form.username = ''
  form.password = ''
  form.name = ''
  form.email = ''
  form.phone = ''
  form.role_id = undefined
  
  emit('close')
}
</script>

<style scoped>
.form-tip {
  font-size: 12px;
  color: #999;
  margin-top: 4px;
}
</style>