<template>
  <el-dialog
    v-model="dialogVisible"
    title="标记为输单" width="500px"
    @close="handleClose"
  >
    <el-form :model="formData" :rules="rules" ref="formRef" label-width="100px">
      <el-form-item label="机会名称">
        <el-input :model-value="opportunityName" disabled />
      </el-form-item>

      <el-form-item label="输单原因" prop="lost_reason">
        <el-select
          v-model="formData.lost_reason"
          placeholder="请选择输单原因"
          style="width: 100%"
        >
          <el-option label="价格因素" value="价格因素" />
          <el-option label="产品不匹配" value="产品不匹配" />
          <el-option label="竞争对手" value="竞争对手" />
          <el-option label="客户预算不足" value="客户预算不足" />
          <el-option label="决策周期过长" value="决策周期过长" />
          <el-option label="客户需求变化" value="客户需求变化" />
          <el-option label="服务问题" value="服务问题" />
          <el-option label="其他原因" value="其他原因" />
        </el-select>
      </el-form-item>

      <el-form-item label="竞争对手">
        <el-input
          v-model="formData.competitor"
          placeholder="请输入竞争对手名称（选填）"
          clearable
        />
      </el-form-item>

      <el-form-item label="详细说明" prop="remark">
        <el-input
          v-model="formData.remark"
          type="textarea"
          :rows="4"
          placeholder="请详细说明输单原因，以便后续改进"
          maxlength="500"
          show-word-limit
        />
      </el-form-item>
    </el-form>

    <el-alert
      type="warning"
      :closable="false"
      show-icon
      style="margin-bottom: 20px"
    >
      <template #title>
        <div>输单后该机会将不再出现在看板中，请谨慎操作！</div>
      </template>
    </el-alert>

    <template #footer>
      <el-button @click="handleClose">取消</el-button>
      <el-button type="danger" @click="handleSubmit" :loading="loading">
        确认输单
      </el-button>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
import { ref, reactive, watch } from 'vue'
import { ElMessage } from 'element-plus'
import { markOpportunityAsLost } from '@/api/opportunity'

interface Props {
  visible: boolean
  opportunityId?: number
  opportunityName?: string
}

const props = withDefaults(defineProps<Props>(), {
  visible: false,
  opportunityId: undefined,
  opportunityName: ''
})

const emit = defineEmits(['update:visible', 'success'])

const dialogVisible = ref(false)
const loading = ref(false)
const formRef = ref()

const formData = reactive({
  lost_reason: '',
  competitor: '',
  remark: ''
})

const rules = {
  lost_reason: [
    { required: true, message: '请选择输单原因', trigger: 'change' }
  ],
  remark: [
    { required: true, message: '请详细说明输单原因', trigger: 'blur' }
  ]
}

// 监听visible变化
watch(() => props.visible, (val) => {
  dialogVisible.value = val
})

// 监听dialogVisible变化
watch(dialogVisible, (val) => {
  if (!val) {
    emit('update:visible', false)
  }
})

// 关闭对话框
const handleClose = () => {
  dialogVisible.value = false
  formRef.value?.resetFields()
  formData.lost_reason = ''
  formData.competitor = ''
  formData.remark = ''
}

// 提交表单
const handleSubmit = async () => {
  try {
    await formRef.value?.validate()
    
    loading.value = true

    await markOpportunityAsLost(props.opportunityId!, {
      lost_reason: formData.lost_reason,
      competitor: formData.competitor,
      remark: formData.remark
    })

    ElMessage.success('标记为输单成功')
    handleClose()
    emit('success')
  } catch (error: any) {
    console.error('标记输单失败:', error)
    if (error.response?.data?.message) {
      ElMessage.error(error.response.data.message)
    } else {
      ElMessage.error('标记输单失败')
    }
  } finally {
    loading.value = false
  }
}
</script>

