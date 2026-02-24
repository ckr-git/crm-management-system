<template>
  <div class="customer-list">
    <PageHeader title="客户管理" description="管理您的客户信息" :show-back="false">
      <template #extra>
        <el-button plain @click="handleDownloadTemplate">
          <el-icon><Download /></el-icon>
          下载模板
        </el-button>
        <el-button plain @click="showImportDialog = true">
          <el-icon><Upload /></el-icon>
          导入客户
        </el-button>
        <el-button plain @click="handleExport">
          <el-icon><Download /></el-icon>
          导出客户
        </el-button>
        <el-button 
          type="warning"
          plain
          :disabled="selectedRows.length === 0"
          @click="handleBatchTransfer"
        >
          <el-icon><Switch /></el-icon>
          批量转移 ({{ selectedRows.length }})
        </el-button>
        <el-button 
          type="danger" 
          plain
          :disabled="selectedRows.length === 0"
          @click="handleBatchDelete"
        >
          <el-icon><Delete /></el-icon>
          批量删除 ({{ selectedRows.length }})
        </el-button>
        <el-button type="primary" @click="handleAdd">
          <el-icon><Plus /></el-icon>
          新增客户
        </el-button>
      </template>
    </PageHeader>

    <!-- 搜索表单 -->
    <el-card shadow="hover" style="margin-bottom: 20px;">
      <el-form :model="searchForm" inline>
        <el-form-item label="客户名称">
          <el-input v-model="searchForm.name" placeholder="请输入客户名称" clearable />
        </el-form-item>
        <el-form-item label="联系人">
          <el-input v-model="searchForm.contact" placeholder="请输入联系人" clearable />
        </el-form-item>
        <el-form-item label="客户阶段">
          <el-select v-model="searchForm.stage" placeholder="请选择客户阶段" clearable>
            <el-option label="潜在客户" value="potential" />
            <el-option label="意向客户" value="intention" />
            <el-option label="报价中" value="quotation" />
            <el-option label="谈判中" value="negotiation" />
            <el-option label="成交客户" value="deal" />
          </el-select>
        </el-form-item>
        <el-form-item label="显示范围">
          <el-select v-model="searchForm.onlyMine" placeholder="请选择">
            <el-option label="我的客户" value="true" />
            <el-option label="全部客户" value="false" />
          </el-select>
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

    <!-- 客户表格 -->
    <el-card shadow="hover">
      <el-table
        :data="customers"
        v-loading="loading"
        @selection-change="handleSelectionChange"
        style="width: 100%"
      >
        <el-table-column type="selection" width="55" />
        <el-table-column prop="name" label="客户名称" />
        <el-table-column prop="contact" label="联系人" />
        <el-table-column prop="phone" label="电话" />
        <el-table-column label="客户阶段">
          <template #default="{ row }">
            <el-tag :type="getStageType(row.stage)">
              {{ getStageLabel(row.stage) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="客户等级">
          <template #default="{ row }">
            <el-tag :type="getLevelType(row.level)">
              {{ getLevelLabel(row.level) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="来源">
          <template #default="{ row }">
            {{ mapLabel(customerSourceMap, row.source) }}
          </template>
        </el-table-column>
        <el-table-column label="负责人" width="100">
          <template #default="{ row }">
            {{ row.owner?.name || row.owner_name || '-' }}
          </template>
        </el-table-column>
        <el-table-column label="操作" width="320" fixed="right">
          <template #default="{ row }">
            <el-button type="primary" size="small" @click="handleView(row)">
              查看
            </el-button>
            <el-button type="primary" size="small" plain @click="handleEdit(row)">
              编辑
            </el-button>
            <el-button type="success" size="small" plain @click="handleQuickFollowup(row)">
              跟进
            </el-button>
            <el-button type="warning" size="small" plain @click="handleTransfer(row)">
              转移
            </el-button>
            <el-button type="info" size="small" plain @click="handleReleaseToPool(row)">
              释放
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
        @size-change="getCustomers"
        @current-change="getCustomers"
        style="margin-top: 20px; justify-content: flex-end;"
      />
    </el-card>

    <!-- 客户表单对话框 -->
    <CustomerForm
      :visible="formVisible"
      :customer-id="currentCustomerId"
      @close="formVisible = false"
      @success="handleFormSuccess"
    />

    <!-- 快速跟进对话框 -->
    <QuickFollowupDialog
      :visible="quickFollowupVisible"
      :customer-id="currentCustomerId"
      :customer-name="currentCustomerName"
      @close="quickFollowupVisible = false"
      @success="handleQuickFollowupSuccess"
    />

    <!-- 释放到公海对话框 -->
    <ReleaseToPoolDialog
      :visible="releaseToPoolVisible"
      :customer-id="currentCustomerId"
      :customer-name="currentCustomerName"
      @close="releaseToPoolVisible = false"
      @success="handleReleaseSuccess"
    />

    <!-- 转移客户对话框 -->
    <TransferDialog
      :visible="transferDialogVisible"
      :customer-id="currentCustomerId"
      :customer-ids="selectedRows.map(r => r.id)"
      @close="transferDialogVisible = false"
      @success="handleTransferSuccess"
    />

    <!-- 导入对话框 -->
    <el-dialog v-model="showImportDialog" title="导入客户" width="500px">
      <el-upload
        ref="uploadRef"
        :auto-upload="false"
        :limit="1"
        accept=".xlsx,.xls"
        @change="handleFileChange"
        @remove="handleFileRemove"
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
        <el-button type="primary" :loading="importing" @click="handleImport">
          开始导入
        </el-button>
      </template>
    </el-dialog>

    <!-- 导入结果对话框 -->
    <el-dialog
      v-model="showImportResult"
      title="导入结果"
      width="600px"
      @close="handleImportResultClose"
    >
      <el-result
        :icon="importResult.errorCount > 0 ? 'warning' : 'success'"
        :title="`导入完成：成功 ${importResult.successCount} 条，失败 ${importResult.errorCount} 条`"
      >
        <template #extra>
          <el-button type="primary" @click="showImportResult = false">关闭</el-button>
        </template>
      </el-result>

      <el-tabs v-if="importResult.errorCount > 0">
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
import { ref, reactive, onMounted, onActivated, watch } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import type { UploadInstance } from 'element-plus'
import PageHeader from '@/components/common/PageHeader.vue'
import CustomerForm from './CustomerForm.vue'
import QuickFollowupDialog from '@/components/QuickFollowupDialog.vue'
import ReleaseToPoolDialog from '@/components/ReleaseToPoolDialog.vue'
import TransferDialog from '@/components/customer/TransferDialog.vue'
import { getCustomerList, deleteCustomer, batchDeleteCustomers, exportCustomers, downloadTemplate, importCustomers } from '@/api/customer'
import { customerSourceMap, customerStageMap, customerLevelMap, mapLabel } from '@/utils/dict'

const router = useRouter()
const route = useRoute()

// 搜索表单
const searchForm = reactive({
  name: '',
  contact: '',
  stage: '',
  onlyMine: 'true'  // 默认只显示我的客户
})
// 客户列表
const customers = ref<any[]>([])
const loading = ref(false)

// 表单对话框
const formVisible = ref(false)
const currentCustomerId = ref<number | undefined>(undefined)

// 快速跟进对话框
const quickFollowupVisible = ref(false)
const currentCustomerName = ref<string>('')

// 释放到公海对话框
const releaseToPoolVisible = ref(false)

// 转移客户对话框
const transferDialogVisible = ref(false)
// 批量选择
const selectedRows = ref<any[]>([])

// 分页
const pagination = reactive({
  page: 1,
  pageSize: 10,
  total: 0
})

// 导入导出相关
const showImportDialog = ref(false)
const importing = ref(false)
const uploadRef = ref<UploadInstance>()
const uploadFile = ref<File | null>(null)
const showImportResult = ref(false)
const importResult = reactive({
  total: 0,
  successCount: 0,
  errorCount: 0,
  successList: [],
  errorList: []
})

// 获取客户列表
const getCustomers = async () => {
  loading.value = true
  try {
    const res = await getCustomerList({
      ...searchForm,
      page: pagination.page,
      pageSize: pagination.pageSize
    })
    
    customers.value = res.data.list
    pagination.total = res.data.total
  } catch (error) {
    console.error('获取客户列表失败:', error)
    ElMessage.error('获取客户列表失败')
  } finally {
    loading.value = false
  }
}

// 搜索
const handleSearch = () => {
  pagination.page = 1
  getCustomers()
}

// 重置
const handleReset = () => {
  searchForm.name = ''
  searchForm.contact = ''
  searchForm.stage = ''
  searchForm.onlyMine = 'true'  // 重置为默认值
  handleSearch()
}

// 新增
const handleAdd = () => {
  currentCustomerId.value = undefined
  formVisible.value = true
}

// 查看
const handleView = (row: any) => {
  router.push(`/customers/${row.id}`)
}

// 编辑
const handleEdit = (row: any) => {
  currentCustomerId.value = row.id
  formVisible.value = true
}

// 快速跟进
const handleQuickFollowup = (row: any) => {
  currentCustomerId.value = row.id
  currentCustomerName.value = row.name
  quickFollowupVisible.value = true
}

// 表单提交成功
const handleFormSuccess = () => {
  getCustomers()
}

// 快速跟进成功
const handleQuickFollowupSuccess = () => {
  ElMessage.success('跟进记录已创建')
  // 可以选择刷新列表或者不刷新
}

// 释放到公海
const handleReleaseToPool = (row: any) => {
  currentCustomerId.value = row.id
  currentCustomerName.value = row.name
  releaseToPoolVisible.value = true
}

// 释放成功
const handleReleaseSuccess = () => {
  getCustomers()
}

// 删除
const handleDelete = (row: any) => {
  ElMessageBox.confirm(`确定要删除客户"${row.name}"吗？`, '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(async () => {
    try {
      await deleteCustomer(row.id)
      ElMessage.success('删除成功')
      getCustomers()
    } catch (error) {
      console.error('删除失败:', error)
      ElMessage.error('删除失败')
    }
  }).catch(() => {
    // 取消删除
  })
}

// 转移客户
const handleTransfer = (row: any) => {
  currentCustomerId.value = row.id
  currentCustomerName.value = row.name
  transferDialogVisible.value = true
}

// 批量转移
const handleBatchTransfer = () => {
  if (selectedRows.value.length === 0) {
    ElMessage.warning('请先选择要转移的客户')
    return
  }
  transferDialogVisible.value = true
}

// 转移成功回调
const handleTransferSuccess = () => {
  selectedRows.value = []
  getCustomers()
}

// 批量删除
const handleBatchDelete = () => {
  if (selectedRows.value.length === 0) {
    ElMessage.warning('请先选择要删除的客户')
    return
  }

  ElMessageBox.confirm(
    `确定要删除选中的 ${selectedRows.value.length} 个客户吗？`,
    '批量删除',
    {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    }
  ).then(async () => {
    try {
      const ids = selectedRows.value.map(row => row.id)
      await batchDeleteCustomers(ids)
      ElMessage.success(`成功删除 ${ids.length} 个客户`)
      selectedRows.value = []
      getCustomers()
    } catch (error) {
      console.error('批量删除失败:', error)
      ElMessage.error('批量删除失败')
    }
  }).catch(() => {
    // 取消删除
  })
}

// 表格选择变化
const handleSelectionChange = (selection: any[]) => {
  selectedRows.value = selection
}

// 获取阶段类型
const getStageType = (stage: string) => {
  const map: Record<string, any> = {
    potential: 'info',
    intention: 'primary',
    quotation: 'warning',
    negotiation: 'warning',
    deal: 'success'
  }
  return map[stage] || 'info'
}

// 获取阶段标签
const getStageLabel = (stage: string) => mapLabel(customerStageMap, stage)

// 获取等级类型
const getLevelType = (level: string) => {
  const map: Record<string, any> = {
    normal: 'info',
    important: 'warning',
    vip: 'danger'
  }
  return map[level] || 'info'
}

// 获取等级标签
const getLevelLabel = (level: string) => mapLabel(customerLevelMap, level)

// 下载导入模板
const handleDownloadTemplate = async () => {
  try {
    const res = await downloadTemplate()
    const blob = new Blob([res], {
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    })
    const url = window.URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = 'customer_import_template.xlsx'
    link.click()
    window.URL.revokeObjectURL(url)
    ElMessage.success('模板下载成功')
  } catch (error) {
    console.error('下载模板失败:', error)
    ElMessage.error('下载模板失败')
  }
}

// 导出客户
const handleExport = async () => {
  try {
    ElMessage.info('正在导出，请稍候..')
    const res = await exportCustomers(searchForm)
    const blob = new Blob([res], {
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    })
    const url = window.URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `customers_${Date.now()}.xlsx`
    link.click()
    window.URL.revokeObjectURL(url)
    ElMessage.success('导出成功')
  } catch (error) {
    console.error('导出失败:', error)
    ElMessage.error('导出失败')
  }
}

// 文件选择变化
const handleFileChange = (file: any) => {
  uploadFile.value = file.raw
}

// 文件移除
const handleFileRemove = () => {
  uploadFile.value = null
}

// 开始导入
const handleImport = async () => {
  if (!uploadFile.value) {
    ElMessage.warning('请先选择要导入的文件')
    return
  }

  importing.value = true
  try {
    const res = await importCustomers(uploadFile.value)
    
    // 保存导入结果
    importResult.total = res.data.total
    importResult.successCount = res.data.successCount
    importResult.errorCount = res.data.errorCount
    importResult.successList = res.data.successList
    importResult.errorList = res.data.errorList
    
    // 关闭导入对话框
    showImportDialog.value = false
    
    // 显示结果对话框
    showImportResult.value = true
    
    // 刷新列表
    if (res.data.successCount > 0) {
      getCustomers()
    }
  } catch (error: any) {
    console.error('导入失败:', error)
    ElMessage.error(error.message || '导入失败')
  } finally {
    importing.value = false
  }
}

// 导入结果对话框关闭
const handleImportResultClose = () => {
  showImportResult.value = false
  uploadFile.value = null
  uploadRef.value?.clearFiles()
}

// 页面加载
const initialized = ref(false)
onMounted(() => {
  initialized.value = true
  getCustomers()
})

// keep-alive 场景下重新激活时刷新数据（跳过首次激活避免重复请求）
onActivated(() => {
  if (initialized.value) getCustomers()
})
</script>
<style scoped lang="scss">
.customer-list {
  padding: 0;

  @include mobile {
    .el-card {
      border-radius: 0;
      box-shadow: none;
      border: none;
      border-bottom: 1px solid $color-border-lighter;
    }

    .el-table {
      font-size: $font-size-xs;

      :deep(.el-table__cell) {
        padding: 8px 4px;
      }

      :deep(.el-button) {
        padding: 4px 8px;
        font-size: $font-size-xs;
      }
    }
  }
}
</style>
