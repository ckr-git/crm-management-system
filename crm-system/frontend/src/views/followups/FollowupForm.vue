<template>
  <el-dialog
    :model-value="visible"
    :title="isEdit ? '编辑跟进记录' : '新增跟进记录'"
    width="700px"
    @close="handleClose"
  >
    <el-form
      ref="formRef"
      :model="form"
      :rules="rules"
      label-width="120px"
    >
      <el-form-item label="客户" prop="customer_id">
        <el-select
          v-model="form.customer_id"
          placeholder="请选择客户"
          filterable
          style="width: 100%"
          :loading="customersLoading"
          @focus="loadCustomers"
        >
          <el-option
            v-for="customer in customers"
            :key="customer.id"
            :label="`${customer.name} - ${customer.contact}`"
            :value="customer.id"
          />
        </el-select>
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
          maxlength="1000"
          show-word-limit
        />
      </el-form-item>

      <el-form-item label="跟进结果" prop="result">
        <el-input
          v-model="form.result"
          placeholder="请输入跟进结果"
        />
      </el-form-item>

      <el-form-item label="下次计划" prop="next_plan">
        <el-input
          v-model="form.next_plan"
          type="textarea"
          :rows="3"
          placeholder="请输入下次跟进计划..."
          maxlength="500"
          show-word-limit
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
import { createFollowup, updateFollowup, getFollowupDetail } from '@/api/followup'
import { getCustomerList } from '@/api/customer'

const props = defineProps<{
  visible: boolean
  followupId?: number
}>()

const emit = defineEmits<{
  (e: 'close'): void
  (e: 'success'): void
}>()

const formRef = ref<FormInstance>()
const loading = ref(false)
const isEdit = ref(false)

// 客户列表
const customers = ref<any[]>([])
const customersLoading = ref(false)

// 表单数据
const form = reactive({
  customer_id: null as number | null,
  type: 'phone',
  content: '',
  result: '',
  next_plan: '',
  next_followup_at: ''
})

// 表单验证规则
const rules = {
  customer_id: [
    { required: true, message: '请选择客户', trigger: 'change' }
  ],
  type: [
    { required: true, message: '请选择跟进方式', trigger: 'change' }
  ],
  content: [
    { required: true, message: '请输入跟进内容', trigger: 'blur' },
    { min: 10, message: '跟进内容不能少于10个字', trigger: 'blur' }
  ]
}

// 加载客户列表
const loadCustomers = async () => {
  if (customers.value.length > 0) return
  
  customersLoading.value = true
  try {
    const res = await getCustomerList({ page: 1, pageSize: 100 })
    customers.value = res.data.list
  } catch (error) {
    console.error('加载客户列表失败:', error)
    ElMessage.error('加载客户列表失败')
  } finally {
    customersLoading.value = false
  }
}

// 重置表单
const resetForm = () => {
  Object.assign(form, {
    customer_id: null,
    type: 'phone',
    content: '',
    result: '',
    next_plan: '',
    next_followup_at: ''
  })
  formRef.value?.clearValidate()
}

// 加载跟进记录详情
const loadFollowup = async (id: number) => {
  try {
    const res = await getFollowupDetail(id)
    Object.assign(form, res.data)
  } catch (error) {
    console.error('加载跟进记录详情失败:', error)
    ElMessage.error('加载跟进记录详情失败')
  }
}

// 监听followupId变化
watch(() => props.followupId, (id) => {
  if (id) {
    isEdit.value = true
    loadFollowup(id)
    loadCustomers() // 编辑时也需要加载客户列表
  } else {
    isEdit.value = false
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
        if (isEdit.value && props.followupId) {
          await updateFollowup(props.followupId, form)
          ElMessage.success('更新成功')
        } else {
          await createFollowup(form)
          ElMessage.success('创建成功')
        }
        emit('success')
        handleClose()
      } catch (error) {
        console.error('提交失败:', error)
      } finally {
        loading.value = false
      }
    }
  })
}
</script>
<style lang="scss" scoped>

:deep(.el-dialog) {
  border-radius: $border-radius-card;

  .el-dialog__header {
    padding: $spacing-lg;
    background: linear-gradient(
      135deg,
      $color-primary 0%,
      darken($color-primary, 8%) 100%
    );
    border-radius: $border-radius-card $border-radius-card 0 0;

    .el-dialog__title {
      color: $color-white;
      font-weight: $font-weight-semibold;
      font-size: $font-size-lg;
    }

    .el-dialog__headerbtn {
      .el-dialog__close {
        color: $color-white;
        font-size: $font-size-lg;

        &:hover {
          color: rgba($color-white, 0.8);
        }
      }
    }
  }

  .el-dialog__body {
    padding: $spacing-lg $spacing-xl;
  }

  .el-dialog__footer {
    padding: $spacing-md $spacing-xl $spacing-lg;
    border-top: 1px solid $color-border-lighter;
  }
}

.el-form {
  :deep(.el-form-item) {
    margin-bottom: $spacing-lg;

    .el-form-item__label {
      font-weight: $font-weight-medium;
      color: $color-text-primary;
    }
  }
}
</style>
