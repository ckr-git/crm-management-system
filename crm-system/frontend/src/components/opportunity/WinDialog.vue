<template>
  <el-dialog
    v-model="dialogVisible"
    title="🎉 标记为赢单" width="500px"
    @close="handleClose"
  >
    <el-form :model="formData" :rules="rules" ref="formRef" label-width="100px">
      <el-form-item label="机会名称">
        <el-input :model-value="opportunityName" disabled />
      </el-form-item>

      <el-form-item label="预期金额">
        <el-input :model-value="formatAmount(expectedAmount)" disabled>
          <template #append>元</template>
        </el-input>
      </el-form-item>

          <el-form-item label="实际成交金额" prop="actual_amount">
        <el-input-number
          v-model="formData.actual_amount"
          :min="0"
          :precision="2"
          :step="1000"
          style="width: 100%"
          placeholder="请输入实际成交金额"
        />
      </el-form-item>

      <el-form-item label="成交日期" prop="close_date">
        <el-date-picker
          v-model="formData.close_date"
          type="date"
          placeholder="选择成交日期"
          style="width: 100%"
          format="YYYY-MM-DD"
          value-format="YYYY-MM-DD"
        />
      </el-form-item>

      <el-form-item label="备注说明">
        <el-input
          v-model="formData.remark"
          type="textarea"
          :rows="3"
          placeholder="请输入备注说明（选填）" maxlength="200"
          show-word-limit
        />
      </el-form-item>
    </el-form>

    <template #footer>
      <el-button @click="handleClose">取消</el-button>
      <el-button type="success" @click="handleSubmit" :loading="loading">
        确认赢单
      </el-button>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
import { ref, reactive, watch } from 'vue'
import { ElMessage } from 'element-plus'
import { markOpportunityAsWon } from '@/api/opportunity'

interface Props {
  visible: boolean
  opportunityId?: number
  opportunityName?: string
  expectedAmount?: number
}

const props = withDefaults(defineProps<Props>(), {
  visible: false,
  opportunityId: undefined,
  opportunityName: '',
  expectedAmount: 0
})

const emit = defineEmits(['update:visible', 'success'])

const dialogVisible = ref(false)
const loading = ref(false)
const formRef = ref()

const formData = reactive({
  actual_amount: 0,
  close_date: '',
  remark: ''
})

const rules = {
  actual_amount: [
    { required: true, message: '请输入实际成交金额', trigger: 'blur' },
    { type: 'number', min: 0, message: '金额不能为负数', trigger: 'blur' }
  ],
  close_date: [
    { required: true, message: '请选择成交日期', trigger: 'change' }
  ]
}

// 监听visible变化
watch(() => props.visible, (val) => {
  dialogVisible.value = val
  if (val) {
    // 默认实际成交额等于预期金额
    formData.actual_amount = props.expectedAmount || 0
    // 默认成交日期为今天
    formData.close_date = new Date().toISOString().split('T')[0]
  }
})

// 监听dialogVisible变化
watch(dialogVisible, (val) => {
  if (!val) {
    emit('update:visible', false)
  }
})

// 格式化金额
const formatAmount = (amount: any) => {
  const num = parseFloat(amount)
  if (!num || isNaN(num)) return '0'
  return num.toLocaleString('zh-CN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
}

// 关闭对话框
const handleClose = () => {
  dialogVisible.value = false
  formRef.value?.resetFields()
  formData.actual_amount = 0
  formData.close_date = ''
  formData.remark = ''
}

// 提交表单
const handleSubmit = async () => {
  try {
    await formRef.value?.validate()
    
    loading.value = true

    await markOpportunityAsWon(props.opportunityId!, {
      actual_amount: formData.actual_amount,
      close_date: formData.close_date,
      remark: formData.remark
    })

    ElMessage.success('🎉 恭喜！标记为赢单成功')
    handleClose()
    emit('success')
  } catch (error: any) {
    console.error('标记赢单失败:', error)
    if (error.response?.data?.message) {
      ElMessage.error(error.response.data.message)
    } else {
      ElMessage.error('标记赢单失败')
    }
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
:deep(.el-input-number) {
  width: 100%;
}
</style>