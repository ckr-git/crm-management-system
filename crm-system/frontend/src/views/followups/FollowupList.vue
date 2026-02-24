<template>
  <div class="followup-list">
    <PageHeader title="跟进记录" description="管理客户跟进记录" :show-back="false">
      <template #extra>
        <el-button @click="handleDownloadTemplate">
          <el-icon><Download /></el-icon>
          下载模板
        </el-button>
        <el-button @click="showImportDialog = true">
          <el-icon><Upload /></el-icon>
          导入
        </el-button>
        <el-button @click="handleExport">
          <el-icon><Download /></el-icon>
          导出
        </el-button>
        <el-button type="primary" @click="handleAdd">
          <el-icon><Plus /></el-icon>
          新增跟进记录
        </el-button>
      </template>
    </PageHeader>

    <!-- 搜索表单 -->
    <el-card shadow="hover" style="margin-bottom: 20px;">
      <el-form :model="searchForm" inline>
        <el-form-item label="跟进类型">
          <el-select v-model="searchForm.type" placeholder="请选择类型" clearable>
            <el-option label="电话" value="phone" />
            <el-option label="拜访" value="visit" />
            <el-option label="邮件" value="email" />
            <el-option label="微信" value="wechat" />
          </el-select>
        </el-form-item>
        <el-form-item label="跟进时间">
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

    <!-- 跟进记录表格 -->
    <el-card shadow="hover">
      <el-table
        :data="followups"
        v-loading="loading"
        style="width: 100%"
      >
        <el-table-column label="客户名称" width="150">
          <template #default="{ row }">
            {{ row.customer?.name || row.customer_name || '-' }}
          </template>
        </el-table-column>
        <el-table-column label="跟进类型" width="100">
          <template #default="{ row }">
            <el-tag :type="getTypeTagType(row.type || row.followup_type)">
              {{ getTypeText(row.type || row.followup_type) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="content" label="跟进内容" min-width="200" show-overflow-tooltip />
        <el-table-column label="跟进时间" width="150">
          <template #default="{ row }">
            {{ formatDateTime(row.followup_time || row.created_at) }}
          </template>
        </el-table-column>
        <el-table-column label="下次跟进" width="150">
          <template #default="{ row }">
            <span v-if="row.next_followup_time" :class="getNextFollowupClass(row.next_followup_time)">
              {{ formatDateTime(row.next_followup_time) }}
            </span>
            <span v-else>-</span>
          </template>
        </el-table-column>
        <el-table-column label="跟进人" width="100">
          <template #default="{ row }">
            {{ row.creator?.name || row.creator_name || '-' }}
          </template>
        </el-table-column>
        <el-table-column label="操作" width="180" fixed="right">
          <template #default="{ row }">
            <el-button type="primary" size="small" @click="handleView(row)">
              查看
            </el-button>
            <el-button type="primary" size="small" plain @click="handleEdit(row)">
              编辑
            </el-button>
            <el-button type="danger" size="small" plain @click="handleDelete(row)">
              删除
            </el-button>
          </template>
        </el-table-column>
      </el-table>

      <!-- 分页 -->
      <el-pagination
        v-model:current-page="pagination.page"
        v-model:page-size="pagination.pageSize"
        :total="pagination.total"
        :page-sizes="[10, 20, 50, 100]"
        layout="total, sizes, prev, pager, next, jumper"
        @size-change="getFollowups"
        @current-change="getFollowups"
        style="margin-top: 20px; justify-content: flex-end;"
      />
    </el-card>

    <!-- 跟进表单对话框 -->
    <FollowupForm
      :visible="formVisible"
      :followup-id="currentFollowupId"
      @close="formVisible = false"
      @success="handleFormSuccess"
    />

    <!-- 导入对话框 -->
    <el-dialog v-model="showImportDialog" title="导入跟进记录" width="500px">
      <el-upload
        :auto-upload="false"
        :limit="1"
        accept=".xlsx,.xls"
        v-model:file-list="fileList"
        @change="handleFileChange"
      >
        <el-button type="primary">选择文件</el-button>
        <template #tip>
          <div class="el-upload__tip">
            请上传 Excel 文件，文件大小不超过 5MB
          </div>
        </template>
      </el-upload>
      <template #footer>
        <el-button @click="showImportDialog = false">取消</el-button>
        <el-button type="primary" :loading="importLoading" @click="handleImport">
          开始导入
        </el-button>
      </template>
    </el-dialog>

    <!-- 导入结果对话框 -->
    <el-dialog v-model="showImportResult" title="导入结果" width="600px">
      <el-result
        :icon="importResult.fail > 0 ? 'warning' : 'success'"
        :title="`导入完成：成功 ${importResult.success} 条，失败 ${importResult.fail} 条`"
      >
        <template #extra>
          <el-button type="primary" @click="showImportResult = false">关闭</el-button>
        </template>
      </el-result>

      <el-tabs v-if="importResult.fail > 0">
        <el-tab-pane label="错误详情">
          <el-table :data="importResult.errorList" max-height="300">
            <el-table-column prop="row" label="行号" width="80" />
            <el-table-column prop="reason" label="错误原因" />
          </el-table>
        </el-tab-pane>
      </el-tabs>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import PageHeader from '@/components/common/PageHeader.vue'
import FollowupForm from './FollowupForm.vue'
import {
  getFollowupList,
  deleteFollowup,
  exportFollowups,
  downloadFollowupTemplate,
  importFollowups
} from '@/api/followup'

// 搜索表单
const searchForm = reactive({
  customer_name: '',
  type: '',
  user_id: ''
})

// 日期范围
const dateRange = ref<[Date, Date] | null>(null)

// 跟进记录列表
const followups = ref<any[]>([])
const loading = ref(false)

// 表单对话框
const formVisible = ref(false)
const currentFollowupId = ref<number | undefined>(undefined)

// 分页
const pagination = reactive({
  page: 1,
  pageSize: 10,
  total: 0
})

// 导入导出
const showImportDialog = ref(false)
const showImportResult = ref(false)
const importLoading = ref(false)
const fileList = ref<any[]>([])
const uploadFile = ref<File | null>(null)
const importResult = reactive({
  total: 0,
  success: 0,
  fail: 0,
  successList: [],
  errorList: []
})

// 获取跟进记录列表
const getFollowups = async () => {
  loading.value = true
  try {
    const params: any = {
      page: pagination.page,
      pageSize: pagination.pageSize
    }

    if (searchForm.type) {
      params.type = searchForm.type
    }

    if (searchForm.user_id) {
      params.user_id = searchForm.user_id
    }

    if (dateRange.value && dateRange.value.length === 2) {
      params.start_date = dateRange.value[0]
      params.end_date = dateRange.value[1]
    }

    const res = await getFollowupList(params)
    followups.value = res.data.list
    pagination.total = res.data.total
  } catch (error) {
    console.error('获取跟进记录列表失败:', error)
    ElMessage.error('获取跟进记录列表失败')
  } finally {
    loading.value = false
  }
}

// 搜索
const handleSearch = () => {
  pagination.page = 1
  getFollowups()
}

// 重置
const handleReset = () => {
  searchForm.customer_name = ''
  searchForm.type = ''
  searchForm.user_id = ''
  dateRange.value = null
  pagination.page = 1
  getFollowups()
}

// 新增
const handleAdd = () => {
  currentFollowupId.value = undefined
  formVisible.value = true
}

// 查看
const handleView = (row: any) => {
  ElMessage.info(`查看跟进记录 ${row.id}（详情页面开发中...）`)
}

// 编辑
const handleEdit = (row: any) => {
  currentFollowupId.value = row.id
  formVisible.value = true
}

// 表单提交成功
const handleFormSuccess = () => {
  getFollowups()
}

// 删除
const handleDelete = (row: any) => {
  ElMessageBox.confirm(`确定要删除这条跟进记录吗？`, '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(async () => {
    try {
      await deleteFollowup(row.id)
      ElMessage.success('删除成功')
      getFollowups()
    } catch (error) {
      console.error('删除失败:', error)
      ElMessage.error('删除失败')
    }
  }).catch(() => {
    // 取消删除
  })
}

// 下载导入模板
const handleDownloadTemplate = async () => {
  try {
    const response = await downloadFollowupTemplate()
    const blob = new Blob([response as any], {
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    })
    const url = window.URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `followup_import_template_${Date.now()}.xlsx`
    link.click()
    window.URL.revokeObjectURL(url)
    ElMessage.success('模板下载成功')
  } catch (error) {
    console.error('下载模板失败:', error)
    ElMessage.error('下载模板失败')
  }
}

// 导出跟进记录
const handleExport = async () => {
  try {
    const params: any = {}
    if (searchForm.type) params.type = searchForm.type
    if (dateRange.value) {
      params.start_date = dateRange.value[0]
      params.end_date = dateRange.value[1]
    }

    const response = await exportFollowups(params)
    const blob = new Blob([response as any], {
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    })
    const url = window.URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `followups_${Date.now()}.xlsx`
    link.click()
    window.URL.revokeObjectURL(url)
    ElMessage.success('导出成功')
  } catch (error) {
    console.error('导出失败:', error)
    ElMessage.error('导出失败')
  }
}

// 文件选择
const handleFileChange = (file: any) => {
  uploadFile.value = file.raw
}

// 导入跟进记录
const handleImport = async () => {
  if (!uploadFile.value) {
    ElMessage.warning('请选择要导入的文件')
    return
  }

  importLoading.value = true
  try {
    const response = await importFollowups(uploadFile.value)
    
    // 更新导入结果
    importResult.total = response.data.total
    importResult.success = response.data.success
    importResult.fail = response.data.fail
    importResult.successList = response.data.successList || []
    importResult.errorList = response.data.errorList || []

    // 关闭导入对话
    showImportDialog.value = false
    
    // 显示导入结果
    showImportResult.value = true
    
    // 清空文件列表
    fileList.value = []
    uploadFile.value = null
    
    // 刷新列表
    getFollowups()
    
    if (response.data.fail === 0) {
      ElMessage.success(`导入成功 ${response.data.success} 条`)
    } else {
      ElMessage.warning(`导入完成：成功 ${response.data.success} 条，失败 ${response.data.fail} 条`)
    }
  } catch (error) {
    console.error('导入失败:', error)
    ElMessage.error('导入失败')
  } finally {
    importLoading.value = false
  }
}

// 获取跟进方式标签类型
const getTypeTagType = (type: string) => {
  const map: Record<string, any> = {
    phone: 'primary',
    visit: 'success',
    email: 'info',
    wechat: 'warning'
  }
  return map[type] || 'info'
}

// 获取跟进方式文本
const getTypeText = (type: string) => {
  const map: Record<string, string> = {
    phone: '电话',
    visit: '拜访',
    email: '邮件',
    wechat: '微信'
  }
  return map[type] || type
}

// 格式化日期时间
const formatDateTime = (dateTime: string) => {
  if (!dateTime) return '-'
  const date = new Date(dateTime)
  return date.toLocaleString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  })
}

// 获取下次跟进时间样式
const getNextFollowupClass = (dateTime: string) => {
  const now = new Date().getTime()
  const followupTime = new Date(dateTime).getTime()
  
  if (followupTime < now) {
    return 'text-danger' // 已逾期
  } else if (followupTime - now < 24 * 60 * 60 * 1000) {
    return 'text-warning' // 24小时内
  }
  return 'text-success'
}

// 初始化
onMounted(() => {
  getFollowups()
})
</script>
<style lang="scss" scoped>
.followup-list {
  padding: 0;
}

.text-danger {
  color: #f56c6c;
}

.text-warning {
  color: #e6a23c;
}

.text-success {
  color: #67c23a;
}
</style>
