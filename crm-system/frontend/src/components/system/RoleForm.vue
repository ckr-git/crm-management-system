<template>
  <el-dialog
    v-model="dialogVisible"
    :title="roleId ? '编辑角色' : '新增角色'"
    width="500px"
    @close="handleClose"
  >
    <el-form
      ref="formRef"
      :model="form"
      :rules="rules"
      label-width="100px"
    >
      <el-form-item label="角色名称" prop="name">
        <el-input v-model="form.name" placeholder="请输入角色名称" />
      </el-form-item>

      <el-form-item label="角色代码" prop="code">
        <el-input 
          v-model="form.code" 
          placeholder="请输入角色代码（如：customer_service）"
          :disabled="!!roleId"
        />
        <div class="form-tip">角色代码用于系统识别，创建后不可修改</div>
      </el-form-item>

      <el-form-item label="角色描述">
        <el-input 
          v-model="form.description" 
          type="textarea" 
          :rows="3"
          placeholder="请输入角色描述"
        />
      </el-form-item>
    </el-form>

    <template #footer>
      <el-button @click="handleClose">取消</el-button>
      <el-button type="primary" :loading="submitting" @click="handleSubmit">
        {{ submitting ? '提交中...' : '确定' }}
      </el-button>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
import { ref, reactive, watch } from 'vue'
import { ElMessage } from 'element-plus'
import type { FormInstance, FormRules } from 'element-plus'
import { getRoleDetail, createRole, updateRole } from '@/api/system'

const props = defineProps<{
  visible: boolean
  roleId?: number
}>()

const emit = defineEmits(['close', 'success'])

const formRef = ref<FormInstance>()
const dialogVisible = ref(false)
const submitting = ref(false)

const form = reactive({
  name: '',
  code: '',
  description: ''
})

const rules: FormRules = {
  name: [
    { required: true, message: '请输入角色名称', trigger: 'blur' }
  ],
  code: [
    { required: true, message: '请输入角色代码', trigger: 'blur' },
    { pattern: /^[a-z_]+$/, message: '只能输入小写字母和下划线', trigger: 'blur' }
  ]
}

// 监听visible变化
watch(() => props.visible, (val) => {
  dialogVisible.value = val
  if (val && props.roleId) {
    loadRoleDetail()
  }
})

// 加载角色详情
const loadRoleDetail = async () => {
  try {
    const res = await getRoleDetail(props.roleId!)
    const role = res.data
    
    form.name = role.name
    form.code = role.code
    form.description = role.description || ''
  } catch (error) {
    console.error('加载角色详情失败:', error)
    ElMessage.error('加载角色详情失败')
  }
}

// 提交表单
const handleSubmit = async () => {
  if (!formRef.value) return

  await formRef.value.validate(async (valid) => {
    if (!valid) return

    submitting.value = true
    try {
      if (props.roleId) {
        // 编辑
        await updateRole(props.roleId, {
          name: form.name,
          description: form.description
        })
        ElMessage.success('更新成功')
      } else {
        // 新增
        await createRole(form)
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
  form.name = ''
  form.code = ''
  form.description = ''
  
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