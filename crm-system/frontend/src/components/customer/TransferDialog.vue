<template>
  <el-dialog
    v-model="dialogVisible"
    :title="isBatch ? '批量转移客户' : '转移客户'"
    width="500px"
    @close="handleClose"
  >
    <el-form :model="formData" :rules="rules" ref="formRef" label-width="100px">
      <el-form-item v-if="!isBatch && customerName" label="客户名称">
        <el-input :model-value="customerName" disabled />
      </el-form-item>
      
      <el-form-item v-if="isBatch" label="转移数量">
        <el-tag type="info">已选择 {{ customerIds.length }} 个客户</el-tag>
      </el-form-item>

      <el-form-item label="新负责人" prop="to_user_id">
        <el-select
          v-model="formData.to_user_id"
          placeholder="请选择新负责人"
          filterable
          style="width: 100%"
        >
          <el-option
            v-for="user in userList"
            :key="user.id"
            :label="user.name"
            :value="user.id"
          />
        </el-select>
      </el-form-item>

      <el-form-item label="转移原因" prop="reason">
        <el-select
          v-model="formData.reason"
          placeholder="请选择转移原因"
          style="width: 100%"
        >
          <el-option label="人员离职" value="人员离职" />
          <el-option label="客户调整" value="客户调整" />
          <el-option label="负载均衡" value="负载均衡" />
          <el-option label="管理员分配" value="管理员分配" />
          <el-option label="其他" value="其他" />
        </el-select>
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
      <el-button type="primary" @click="handleSubmit" :loading="loading">
        确定转移
      </el-button>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
import { ref, reactive, watch } from 'vue'
import { ElMessage } from 'element-plus'
import { getAvailableUsers } from '@/api/system'
import { transferCustomer, batchTransferCustomers } from '@/api/customer'

interface Props {
  visible: boolean
  customerId?: number
  customerName?: string
  customerIds?: number[]
}

const props = withDefaults(defineProps<Props>(), {
  visible: false,
  customerId: undefined,
  customerName: '',
  customerIds: () => []
})

const emit = defineEmits(['update:visible', 'success'])

const dialogVisible = ref(false)
const loading = ref(false)
const formRef = ref()
const userList = ref<any[]>([])

const formData = reactive({
  to_user_id: undefined as number | undefined,
  reason: '',
  remark: ''
})

const rules = {
  to_user_id: [
    { required: true, message: '请选择新负责人', trigger: 'change' }
  ],
  reason: [
    { required: true, message: '请选择转移原因', trigger: 'change' }
  ]
}

// 是否批量转移
const isBatch = ref(false)

// 监听visible变化
watch(() => props.visible, (val) => {
  dialogVisible.value = val
  if (val) {
    isBatch.value = props.customerIds && props.customerIds.length > 0
    loadUserList()
  }
})

// 监听dialogVisible变化
watch(dialogVisible, (val) => {
  if (!val) {
    emit('update:visible', false)
  }
})

// 加载用户列表
const loadUserList = async () => {
  try {
    const res = await getAvailableUsers()
    userList.value = res.data.list || res.data || []
  } catch (error) {
    console.error('加载用户列表失败:', error)
    ElMessage.error('加载用户列表失败')
  }
}

// 关闭对话框
const handleClose = () => {
  dialogVisible.value = false
  formRef.value?.resetFields()
  formData.to_user_id = undefined
  formData.reason = ''
  formData.remark = ''
}

// 提交表单
const handleSubmit = async () => {
  try {
    await formRef.value?.validate()
    
    loading.value = true

    if (isBatch.value) {
      // 批量转移
      await batchTransferCustomers({
        customer_ids: props.customerIds,
        to_user_id: formData.to_user_id,
        reason: formData.reason,
        remark: formData.remark
      })
      ElMessage.success('批量转移成功')
    } else {
      // 单个转移
      await transferCustomer(props.customerId!, {
        to_user_id: formData.to_user_id,
        reason: formData.reason,
        remark: formData.remark
      })
      ElMessage.success('客户转移成功')
    }

    handleClose()
    emit('success')
  } catch (error: any) {
    console.error('转移失败:', error)
    if (error.response?.data?.message) {
      ElMessage.error(error.response.data.message)
    } else {
      ElMessage.error('转移失败')
    }
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.el-select {
  width: 100%;
}
</style>