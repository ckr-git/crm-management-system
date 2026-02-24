<template>
  <div class="log-list">
    <PageHeader title="操作日志" description="系统操作记录，用于审计和追踪" :show-back="false">
      <template #extra>
        <el-button plain @click="handleExport">
          <el-icon><Download /></el-icon>
          导出日志
        </el-button>
      </template>
    </PageHeader>

    <el-card shadow="hover" style="margin-bottom: 20px;">
      <el-form :model="searchForm" inline>
        <el-form-item label="操作人">
          <el-select v-model="searchForm.user_id" placeholder="请选择操作人" clearable>
            <el-option v-for="user in users" :key="user.id" :label="user.name" :value="user.id" />
          </el-select>
        </el-form-item>
        <el-form-item label="操作模块">
          <el-input v-model="searchForm.module" placeholder="请输入模块" clearable />
        </el-form-item>
        <el-form-item label="操作类型">
          <el-input v-model="searchForm.action" placeholder="请输入操作" clearable />
        </el-form-item>
        <el-form-item label="状态">
          <el-select v-model="searchForm.status" placeholder="请选择状态" clearable>
            <el-option label="成功" value="success" />
            <el-option label="失败" value="fail" />
          </el-select>
        </el-form-item>
        <el-form-item label="操作时间">
          <el-date-picker
            v-model="dateRange"
            type="daterange"
            range-separator="至"
            start-placeholder="开始日期"
            end-placeholder="结束日期"
          />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="handleSearch">
            <el-icon><Search /></el-icon>
            搜索
          </el-button>
          <el-button @click="handleReset">
            <el-icon><RefreshRight /></el-icon>
            重置
          </el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <el-card shadow="hover">
      <el-table :data="logs" v-loading="loading" style="width: 100%">
        <el-table-column label="操作人" width="100">
          <template #default="{ row }">
            {{ row.user?.name || row.user_name || '-' }}
          </template>
        </el-table-column>
        <el-table-column prop="module" label="模块" width="120" />
        <el-table-column prop="action" label="操作" width="120" />
        <el-table-column prop="description" label="描述" min-width="200" show-overflow-tooltip />
        <el-table-column label="状态" width="80">
          <template #default="{ row }">
            <el-tag :type="row.status === 'success' ? 'success' : 'danger'">
              {{ row.status === 'success' ? '成功' : '失败' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="ip" label="IP地址" width="120" />
        <el-table-column label="操作时间" width="160">
          <template #default="{ row }">
            {{ new Date(row.created_at).toLocaleString('zh-CN') }}
          </template>
        </el-table-column>
        <el-table-column label="操作" width="100" fixed="right">
          <template #default="{ row }">
            <el-button type="primary" size="small" @click="handleViewDetail(row)">
              详情
            </el-button>
          </template>
        </el-table-column>
      </el-table>

      <el-pagination
        v-model:current-page="pagination.page"
        v-model:page-size="pagination.pageSize"
        :total="pagination.total"
        :page-sizes="[20, 50, 100, 200]"
        layout="total, sizes, prev, pager, next, jumper"
        @size-change="getLogs"
        @current-change="getLogs"
        style="margin-top: 20px; justify-content: flex-end;"
      />
    </el-card>

    <LogDetailDialog
      :visible="detailVisible"
      :log-id="currentLogId"
      @close="detailVisible = false"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import PageHeader from '@/components/common/PageHeader.vue'
import LogDetailDialog from '@/components/system/LogDetailDialog.vue'
import { getOperationLogs, exportLogs, getAvailableUsers } from '@/api/system'

const searchForm = reactive({
  user_id: '',
  module: '',
  action: '',
  status: ''
})

const dateRange = ref<string[]>([])
const logs = ref<any[]>([])
const users = ref<any[]>([])
const loading = ref(false)
const detailVisible = ref(false)
const currentLogId = ref<number | undefined>(undefined)

const pagination = reactive({
  page: 1,
  pageSize: 20,
  total: 0
})

// 获取用户列表
const getUsers = async () => {
  try {
    const res = await getAvailableUsers()
    users.value = res.data
  } catch (error) {
    console.error('获取用户列表失败:', error)
  }
}

// 获取日志列表
const getLogs = async () => {
  loading.value = true
  try {
    const params: any = {
      ...searchForm,
      page: pagination.page,
      pageSize: pagination.pageSize
    }
    
    if (dateRange.value && dateRange.value.length === 2) {
      params.start_date = dateRange.value[0]
      params.end_date = dateRange.value[1]
    }

    const res = await getOperationLogs(params)
    logs.value = res.data.list
    pagination.total = res.data.total
  } catch (error) {
    console.error('获取日志列表失败:', error)
    ElMessage.error('获取日志列表失败')
  } finally {
    loading.value = false
  }
}

// 搜索
const handleSearch = () => {
  pagination.page = 1
  getLogs()
}

// 重置
const handleReset = () => {
  searchForm.user_id = ''
  searchForm.module = ''
  searchForm.action = ''
  searchForm.status = ''
  dateRange.value = []
  handleSearch()
}

// 查看详情
const handleViewDetail = (row: any) => {
  currentLogId.value = row.id
  detailVisible.value = true
}

// 导出日志
const handleExport = async () => {
  try {
    ElMessage.info('正在导出，请稍候..')
    
    const params: any = { ...searchForm }
    if (dateRange.value && dateRange.value.length === 2) {
      params.start_date = dateRange.value[0]
      params.end_date = dateRange.value[1]
    }

    const res = await exportLogs(params)
    const blob = new Blob([res], {
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    })
    const url = window.URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `operation_logs_${Date.now()}.xlsx`
    link.click()
    window.URL.revokeObjectURL(url)
    ElMessage.success('导出成功')
  } catch (error) {
    console.error('导出失败:', error)
    ElMessage.error('导出失败')
  }
}

onMounted(() => {
  getUsers()
  getLogs()
})
</script>
<style lang="scss" scoped>
.log-list {
  padding: 0;
}
</style>
