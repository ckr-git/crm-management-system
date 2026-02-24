<template>
  <el-dialog
    :model-value="visible"
    :title="opportunityId ? '编辑销售机会' : '新增销售机会'"
    width="800px"
    @close="handleClose"
  >
    <el-form
      ref="formRef"
      :model="form"
      :rules="rules"
      label-width="120px"
    >
      <el-row :gutter="20">
        <el-col :span="12">
          <el-form-item label="机会名称" prop="name">
            <el-input v-model="form.name" placeholder="请输入机会名称" />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="客户" prop="customer_id">
            <el-select
              v-model="form.customer_id"
              placeholder="请选择客户"
              filterable
              style="width: 100%"
            >
              <el-option
                v-for="customer in customers"
                :key="customer.id"
                :label="customer.name"
                :value="customer.id"
              />
            </el-select>
          </el-form-item>
        </el-col>
      </el-row>

      <el-row :gutter="20">
        <el-col :span="12">
          <el-form-item label="预期金额" prop="amount">
            <el-input-number
              v-model="form.amount"
              :min="0"
              :precision="2"
              :step="1000"
              controls-position="right"
              style="width: 100%"
            />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="销售阶段" prop="stage">
            <el-select v-model="form.stage" placeholder="请选择" style="width: 100%">
              <el-option label="初步沟通" value="initial" />
              <el-option label="需求确认" value="demand" />
              <el-option label="方案报价" value="proposal" />
              <el-option label="商务谈判" value="negotiation" />
              <el-option label="赢单" value="closed_won" />
              <el-option label="输单" value="closed_lost" />
            </el-select>
          </el-form-item>
        </el-col>
      </el-row>

      <el-row :gutter="20">
        <el-col :span="12">
          <el-form-item label="赢单率" prop="probability">
            <el-slider
              v-model="form.probability"
              :min="0"
              :max="100"
              :step="10"
              show-input
            />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="状态" prop="status">
            <el-select v-model="form.status" placeholder="请选择" style="width: 100%">
              <el-option label="进行中" value="open" />
              <el-option label="已赢单" value="won" />
              <el-option label="已输单" value="lost" />
            </el-select>
          </el-form-item>
        </el-col>
      </el-row>

      <el-row :gutter="20">
        <el-col :span="12">
          <el-form-item label="预计成交日期" prop="expected_close_date">
            <el-date-picker
              v-model="form.expected_close_date"
              type="date"
              placeholder="选择日期"
              value-format="YYYY-MM-DD"
              style="width: 100%"
            />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="成交日期" prop="close_date">
            <el-date-picker
              v-model="form.close_date"
              type="date"
              placeholder="选择日期"
              value-format="YYYY-MM-DD"
              style="width: 100%"
            />
          </el-form-item>
        </el-col>
      </el-row>

      <el-row :gutter="20">
        <el-col :span="12">
          <el-form-item label="优先级" prop="priority">
            <el-select v-model="form.priority" placeholder="请选择" style="width: 100%">
              <el-option label="低" value="low" />
              <el-option label="中" value="medium" />
              <el-option label="高" value="high" />
            </el-select>
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="产品" prop="product">
            <el-input v-model="form.product" placeholder="请输入产品名称" />
          </el-form-item>
        </el-col>
      </el-row>

      <el-row :gutter="20">
        <el-col :span="12">
          <el-form-item label="实际金额" prop="actual_amount">
            <el-input-number
              v-model="form.actual_amount"
              :min="0"
              :precision="2"
              :step="1000"
              controls-position="right"
              style="width: 100%"
            />
          </el-form-item>
        </el-col>
      </el-row>

      <el-form-item label="描述" prop="description">
        <el-input
          v-model="form.description"
          type="textarea"
          :rows="4"
          placeholder="请输入机会描述"
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
import { getCustomerList } from '@/api/customer'
import { createOpportunity, updateOpportunity, getOpportunityDetail } from '@/api/opportunity'

const props = defineProps<{
  visible: boolean
  opportunityId?: number
}>()

const emit = defineEmits<{
  (e: 'close'): void
  (e: 'success'): void
}>()

const formRef = ref<FormInstance>()
const loading = ref(false)
const customers = ref<any[]>([])

// 表单数据
const form = reactive({
  customer_id: null as number | null,
  name: '',
  amount: 0,
  stage: 'initial',
  probability: 10,
  expected_close_date: '',
  close_date: '',
  priority: 'medium',
  product: '',
  actual_amount: null as number | null,
  win_reason: '',
  lose_reason: '',
  description: '',
  status: 'open'
})

// 表单验证规则
const rules = {
  customer_id: [
    { required: true, message: '请选择客户', trigger: 'change' }
  ],
  name: [
    { required: true, message: '请输入机会名称', trigger: 'blur' },
    { min: 2, max: 100, message: '长度2-100个字', trigger: 'blur' }
  ],
  amount: [
    { required: true, message: '请输入预期金额', trigger: 'blur' }
  ],
  stage: [
    { required: true, message: '请选择销售阶段', trigger: 'change' }
  ],
  expected_close_date: [
    { required: false }
  ],
  status: [
    { required: true, message: '请选择状态', trigger: 'change' }
  ]
}

// 重置表单
const resetForm = () => {
  Object.assign(form, {
    customer_id: null,
    name: '',
    amount: 0,
    stage: 'initial',
    probability: 10,
    expected_close_date: '',
    close_date: '',
    priority: 'medium',
    product: '',
    actual_amount: null,
    win_reason: '',
    lose_reason: '',
    description: '',
    status: 'open'
  })
  formRef.value?.clearValidate()
}

// 加载客户列表
const loadCustomers = async () => {
  try {
    const res = await getCustomerList({ page: 1, pageSize: 100, onlyMine: 'false' })
    customers.value = res.data.list
  } catch (error) {
    console.error('加载客户列表失败:', error)
  }
}

// 加载机会详情
const loadOpportunityDetail = async (id: number) => {
  try {
    const res = await getOpportunityDetail(id)
    const data = res.data
    // 转换数字类型
    Object.assign(form, {
      ...data,
      amount: parseFloat(data.amount) || 0,
      actual_amount: data.actual_amount ? parseFloat(data.actual_amount) : null,
      probability: parseInt(data.probability) || 0
    })
  } catch (error) {
    console.error('加载机会详情失败:', error)
    ElMessage.error('加载机会详情失败')
  }
}

// 监听对话框打开
watch(() => props.visible, (val) => {
  if (val) {
    loadCustomers()
    if (props.opportunityId) {
      loadOpportunityDetail(props.opportunityId)
    } else {
      resetForm()
    }
  }
})

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
          name: form.name,
          amount: form.amount,
          stage: form.stage,
          status: form.status
        }
        if (form.probability !== null) submitData.probability = form.probability
        if (form.expected_close_date) submitData.expected_close_date = form.expected_close_date
        if (form.close_date) submitData.close_date = form.close_date
        if (form.priority) submitData.priority = form.priority
        if (form.product) submitData.product = form.product
        if (form.actual_amount !== null) submitData.actual_amount = form.actual_amount
        if (form.win_reason) submitData.win_reason = form.win_reason
        if (form.lose_reason) submitData.lose_reason = form.lose_reason
        if (form.description) submitData.description = form.description

        if (props.opportunityId) {
          await updateOpportunity(props.opportunityId, submitData)
          ElMessage.success('更新成功')
        } else {
          await createOpportunity(submitData)
          ElMessage.success('创建成功')
        }
        emit('success')
        handleClose()
      } catch (error) {
        console.error('提交失败:', error)
        ElMessage.error(props.opportunityId ? '更新失败' : '创建失败')
      } finally {
        loading.value = false
      }
    }
  })
}
</script>

<style scoped>
.el-form {
  padding: 20px 20px 0 0;
}
</style>