<template>
  <el-dialog
    :model-value="visible"
    title="释放到公海" width="500px"
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

      <el-form-item label="释放原因" prop="reason">
        <el-input
          v-model="form.reason"
          type="textarea"
          :rows="4"
          placeholder="请输入释放到公海的原因.."
          maxlength="100"
          show-word-limit
        />
      </el-form-item>

      <el-alert
        title="提示"
        type="warning"
        :closable="false"
        show-icon
      >
        释放后该客户将进入公海池，其他销售人员可以领取
      </el-alert>
    </el-form>

    <template #footer>
      <el-button @click="handleClose">取消</el-button>
      <el-button type="danger" :loading="loading" @click="handleSubmit">
        {{ loading ? '释放..' : '确认释放' }}
      </el-button>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
import { ref, reactive, watch } from 'vue'
import { ElMessage } from 'element-plus'
import type { FormInstance } from 'element-plus'
import { releaseToPool } from '@/api/customerPool'

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
  reason: ''
})

// 表单验证规则
const rules = {
  reason: [
    { required: true, message: '请输入释放原因', trigger: 'blur' },
    { min: 5, message: '释放原因不能少于5个字符', trigger: 'blur' }
  ]
}

// 重置表单
const resetForm = () => {
  Object.assign(form, {
    customer_id: null,
    reason: ''
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
        await releaseToPool(form)
        ElMessage.success('已释放到公海')
        emit('success')
        handleClose()
      } catch (error: any) {
        console.error('释放失败:', error)
        const message = error?.response?.data?.message || '释放到公海失败'
        ElMessage.error(message)
      } finally {
        loading.value = false
      }
    }
  })
}
</script>

<style scoped>
.el-form {
  padding: 20px 0;
}

.el-alert {
  margin-top: 10px;
}
</style>