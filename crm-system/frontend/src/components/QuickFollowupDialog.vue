<template>
  <el-dialog
    :model-value="visible"
    title="快速跟进" width="600px"
    @close="handleClose"
  >
    <el-form
      ref="formRef"
      :model="form"
      :rules="rules"
      label-width="100px"
    >
      <el-form-item label="客户">
        <el-input :value="customerName" disabled />
      </el-form-item>

      <el-form-item label="跟进方式" prop="type">
        <el-radio-group v-model="form.type">
          <el-radio value="phone">电话</el-radio>
          <el-radio value="visit">拜访</el-radio>
          <el-radio value="email">邮件</el-radio>
          <el-radio value="wechat">微信</el-radio>
        </el-radio-group>
      </el-form-item>

      <el-form-item label="跟进内容" prop="content">
        <el-input
          v-model="form.content"
          type="textarea"
          :rows="5"
          placeholder="请详细描述本次跟进的内容..."
          maxlength="500"
          show-word-limit
        />
      </el-form-item>

      <el-form-item label="跟进结果" prop="result">
        <el-input
          v-model="form.result"
          placeholder="请输入跟进结果"
        />
      </el-form-item>

      <el-form-item label="下次跟进时间" prop="next_followup_at">
        <el-date-picker
          v-model="form.next_followup_at"
          type="datetime"
          placeholder="请选择下次跟进时间"
          style="width: 100%"
          format="YYYY-MM-DD HH:mm"
          value-format="YYYY-MM-DD HH:mm:ss"
        />
      </el-form-item>
    </el-form>

    <template #footer>
      <el-button @click="handleClose">取消</el-button>
      <el-button type="primary" :loading="loading" @click="handleSubmit">
        {{ loading ? '提交..' : '确定' }}
      </el-button>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
import { ref, reactive, watch } from 'vue'
import { ElMessage } from 'element-plus'
import type { FormInstance } from 'element-plus'
import { createFollowup } from '@/api/followup'

const props = defineProps<{
  visible: boolean
  customerId?: number
  customerName?: string
}>()

const emit = defineEmits<{
  (e: 'close'): void
  (e: 'success'): void
}>()

const formRef = ref<FormInstance>()
const loading = ref(false)

// 表单数据
const form = reactive({
  customer_id: null as number | null,
  type: 'phone',
  content: '',
  result: '',
  next_followup_at: ''
})

// 表单验证规则
const rules = {
  type: [
    { required: true, message: '请选择跟进方式', trigger: 'change' }
  ],
  content: [
    { required: true, message: '请输入跟进内容', trigger: 'blur' },
    { min: 10, message: '跟进内容不能少于10个字', trigger: 'blur' }
  ]
}

// 重置表单
const resetForm = () => {
  Object.assign(form, {
    customer_id: null,
    type: 'phone',
    content: '',
    result: '',
    next_followup_at: ''
  })
  formRef.value?.clearValidate()
}

// 监听customerId变化
watch(() => props.customerId, (id) => {
  if (id) {
    form.customer_id = id
  } else {
    resetForm()
  }
}, { immediate: true })

// 关闭对话框
const handleClose = () => {
  resetForm()
  emit('close')
}

// 提交表单
const handleSubmit = async () => {
  if (!formRef.value) return

  await formRef.value.validate(async (valid) => {
    if (valid) {
      loading.value = true
      try {
        // 过滤掉空的可选字段
        const submitData: Record<string, unknown> = {
          customer_id: form.customer_id,
          type: form.type,
          content: form.content
        }
        if (form.result) submitData.result = form.result
        if (form.next_followup_at) submitData.next_followup_at = form.next_followup_at
        await createFollowup(submitData)
        ElMessage.success('跟进记录创建成功')
        emit('success')
        handleClose()
      } catch (error) {
        console.error('提交失败:', error)
        ElMessage.error('创建跟进记录失败')
      } finally {
        loading.value = false
      }
    }
  })
}
</script>

<style scoped>
.el-form {
  padding: 20px;
}
</style>