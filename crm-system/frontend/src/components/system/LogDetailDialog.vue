<template>
  <el-dialog
    v-model="dialogVisible"
    title="日志详情"
    width="800px"
    @close="handleClose"
  >
    <div v-loading="loading">
      <el-descriptions :column="2" border v-if="log">
        <el-descriptions-item label="操作时间">
          {{ log.created_at }}
        </el-descriptions-item>
        <el-descriptions-item label="操作人">
          {{ log.user?.name || '-' }}
        </el-descriptions-item>
        <el-descriptions-item label="模块">
          {{ log.module }}
        </el-descriptions-item>
        <el-descriptions-item label="操作">
          {{ log.action }}
        </el-descriptions-item>
        <el-descriptions-item label="描述" :span="2">
          {{ log.description || '-' }}
        </el-descriptions-item>
        <el-descriptions-item label="IP地址">
          {{ log.ip || '-' }}
        </el-descriptions-item>
        <el-descriptions-item label="状态">
          <el-tag :type="log.status === 'success' ? 'success' : 'danger'">
            {{ log.status === 'success' ? '成功' : '失败' }}
          </el-tag>
        </el-descriptions-item>
        <el-descriptions-item label="User Agent" :span="2">
          <div class="text-ellipsis" :title="log.user_agent">
            {{ log.user_agent || '-' }}
          </div>
        </el-descriptions-item>
      </el-descriptions>

      <el-divider />

      <el-tabs type="border-card">
        <el-tab-pane label="请求数据">
          <pre class="json-display">{{ formatJson(log?.request_data) }}</pre>
        </el-tab-pane>
        <el-tab-pane label="响应数据">
          <pre class="json-display">{{ formatJson(log?.response_data) }}</pre>
        </el-tab-pane>
        <el-tab-pane label="错误信息" v-if="log?.error_message">
          <el-alert type="error" :closable="false">
            {{ log.error_message }}
          </el-alert>
        </el-tab-pane>
      </el-tabs>
    </div>

    <template #footer>
      <el-button type="primary" @click="handleClose">关闭</el-button>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import { ElMessage } from 'element-plus'
import { getLogDetail } from '@/api/system'

const props = defineProps<{
  visible: boolean
  logId?: number
}>()

const emit = defineEmits(['close'])

const dialogVisible = ref(false)
const loading = ref(false)
const log = ref<any>(null)

watch(() => props.visible, (val) => {
  dialogVisible.value = val
  if (val && props.logId) {
    loadLogDetail()
  }
})

const loadLogDetail = async () => {
  loading.value = true
  try {
    const res = await getLogDetail(props.logId!)
    log.value = res.data
  } catch (error) {
    console.error('加载日志详情失败:', error)
    ElMessage.error('加载日志详情失败')
  } finally {
    loading.value = false
  }
}

const formatJson = (data: any) => {
  if (!data) return '-'
  return JSON.stringify(data, null, 2)
}

const handleClose = () => {
  log.value = null
  emit('close')
}
</script>

<style scoped>
.text-ellipsis {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  max-width: 500px;
}

.json-display {
  background: #f5f5f5;
  padding: 15px;
  border-radius: 4px;
  font-size: 12px;
  font-family: 'Courier New', monospace;
  max-height: 400px;
  overflow-y: auto;
}
</style>