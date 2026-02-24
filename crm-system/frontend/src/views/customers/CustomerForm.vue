<template>
  <el-dialog
    :model-value="visible"
    :title="isEdit ? '编辑客户' : '新增客户'"
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
          <el-form-item label="公司名称" prop="name">
            <el-input v-model="form.name" placeholder="请输入公司名称" />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="公司简称" prop="short_name">
            <el-input v-model="form.short_name" placeholder="请输入公司简称" />
          </el-form-item>
        </el-col>
      </el-row>

      <el-row :gutter="20">
        <el-col :span="12">
          <el-form-item label="联系人" prop="contact">
            <el-input v-model="form.contact" placeholder="请输入联系人" />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="职位" prop="position">
            <el-input v-model="form.position" placeholder="请输入职位" />
          </el-form-item>
        </el-col>
      </el-row>

      <el-row :gutter="20">
        <el-col :span="12">
          <el-form-item label="联系电话" prop="phone">
            <el-input v-model="form.phone" placeholder="请输入联系电话" />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="手机" prop="mobile">
            <el-input v-model="form.mobile" placeholder="请输入手机号" />
          </el-form-item>
        </el-col>
      </el-row>

      <el-row :gutter="20">
        <el-col :span="12">
          <el-form-item label="邮箱" prop="email">
            <el-input v-model="form.email" placeholder="请输入邮箱" />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="微信" prop="wechat">
            <el-input v-model="form.wechat" placeholder="请输入微信号" />
          </el-form-item>
        </el-col>
      </el-row>

      <el-row :gutter="20">
        <el-col :span="12">
          <el-form-item label="所属行业" prop="industry">
            <el-select v-model="form.industry" placeholder="请选择行业" style="width: 100%">
              <el-option label="IT互联网" value="IT互联网" />
              <el-option label="制造业" value="制造业" />
              <el-option label="金融服务" value="金融服务" />
              <el-option label="教育培训" value="教育培训" />
              <el-option label="医疗健康" value="医疗健康" />
              <el-option label="房地产" value="房地产" />
              <el-option label="其他" value="其他" />
            </el-select>
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="公司规模" prop="company_size">
            <el-select v-model="form.company_size" placeholder="请选择公司规模" style="width: 100%">
              <el-option label="20人以下" value="20人以下" />
              <el-option label="20-50人" value="20-50人" />
              <el-option label="50-100人" value="50-100人" />
              <el-option label="100-500人" value="100-500人" />
              <el-option label="500人以上" value="500人以上" />
            </el-select>
          </el-form-item>
        </el-col>
      </el-row>

      <el-row :gutter="20">
        <el-col :span="12">
          <el-form-item label="客户来源" prop="source">
            <el-select v-model="form.source" placeholder="请选择客户来源" style="width: 100%">
              <el-option label="网站咨询" value="website" />
              <el-option label="电话咨询" value="phone" />
              <el-option label="展会活动" value="exhibition" />
              <el-option label="老客户转介绍" value="referral" />
              <el-option label="广告投放" value="advertisement" />
              <el-option label="其他" value="other" />
            </el-select>
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="客户等级" prop="level">
            <el-select v-model="form.level" placeholder="请选择客户等级" style="width: 100%">
              <el-option label="普通客户" value="normal" />
              <el-option label="重要客户" value="important" />
              <el-option label="VIP客户" value="vip" />
            </el-select>
          </el-form-item>
        </el-col>
      </el-row>

      <el-row :gutter="20">
        <el-col :span="12">
          <el-form-item label="客户阶段" prop="stage">
            <el-select v-model="form.stage" placeholder="请选择客户阶段" style="width: 100%">
              <el-option label="潜在客户" value="potential" />
              <el-option label="意向客户" value="intention" />
              <el-option label="报价中" value="quotation" />
              <el-option label="谈判中" value="negotiation" />
              <el-option label="成交客户" value="deal" />
            </el-select>
          </el-form-item>
        </el-col>
        <el-col :span="12">
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
        </el-col>
      </el-row>

      <el-form-item label="公司地址" prop="address">
        <el-input v-model="form.address" placeholder="请输入公司地址" />
      </el-form-item>

      <el-form-item label="公司网站" prop="website">
        <el-input v-model="form.website" placeholder="请输入公司网址" />
      </el-form-item>

      <el-form-item label="备注" prop="remark">
        <el-input
          v-model="form.remark"
          type="textarea"
          :rows="3"
          placeholder="请输入备注信息"
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
import { createCustomer, updateCustomer, getCustomerDetail } from '@/api/customer'

const props = defineProps<{
  visible: boolean
  customerId?: number
}>()

const emit = defineEmits<{
  (e: 'close'): void
  (e: 'success'): void
}>()

const formRef = ref<FormInstance>()
const loading = ref(false)
const isEdit = ref(false)

// 表单数据
const form = reactive({
  name: '',
  short_name: '',
  contact: '',
  position: '',
  phone: '',
  mobile: '',
  email: '',
  wechat: '',
  qq: '',
  address: '',
  website: '',
  industry: '',
  company_size: '',
  source: '',
  level: 'normal',
  stage: 'potential',
  remark: '',
  next_followup_at: ''
})

// 表单验证规则
const rules = {
  name: [
    { required: true, message: '请输入公司名称', trigger: 'blur' }
  ],
  contact: [
    { required: true, message: '请输入联系人', trigger: 'blur' }
  ],
  phone: [
    { required: true, message: '请输入联系电话', trigger: 'blur' },
    { pattern: /^1[3-9]\d{9}$/, message: '手机号格式不正确', trigger: 'blur' }
  ],
  email: [
    { type: 'email', message: '邮箱格式不正确', trigger: 'blur' }
  ],
  source: [
    { required: true, message: '请选择客户来源', trigger: 'change' }
  ]
}

// 重置表单
const resetForm = () => {
  Object.assign(form, {
    name: '',
    short_name: '',
    contact: '',
    position: '',
    phone: '',
    mobile: '',
    email: '',
    wechat: '',
    qq: '',
    address: '',
    website: '',
    industry: '',
    company_size: '',
    source: '',
    level: 'normal',
    stage: 'potential',
    remark: '',
    next_followup_at: ''
  })
  formRef.value?.clearValidate()
}

// 加载客户详情
const loadCustomer = async (id: number) => {
  try {
    const res = await getCustomerDetail(id)
    Object.assign(form, res.data)
  } catch (error) {
    console.error('加载客户详情失败:', error)
    ElMessage.error('加载客户详情失败')
  }
}

// 监听customerId变化
watch(() => props.customerId, (id) => {
  if (id) {
    isEdit.value = true
    loadCustomer(id)
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
        if (isEdit.value && props.customerId) {
          await updateCustomer(props.customerId, form)
          ElMessage.success('更新成功')
        } else {
          await createCustomer(form)
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

<style scoped>
.el-form {
  padding: 20px;
}
</style>