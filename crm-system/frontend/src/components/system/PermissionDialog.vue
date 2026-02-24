<template>
  <el-dialog
    v-model="dialogVisible"
    :title="`配置权限 - ${roleName}`"
    width="700px"
    @close="handleClose"
  >
    <div v-loading="loading">
      <el-alert
        type="info"
        :closable="false"
        style="margin-bottom: 20px"
      >
        <template #title>
          为角色"{{ roleName }}"配置系统权限，勾选后用户将拥有相应的操作权限
        </template>
      </el-alert>

      <div class="tree-actions">
        <el-button size="small" @click="handleCheckAll">全选</el-button>
        <el-button size="small" @click="handleUncheckAll">取消全选</el-button>
        <el-button size="small" @click="handleExpandAll">展开全部</el-button>
        <el-button size="small" @click="handleCollapseAll">折叠全部</el-button>
      </div>

      <el-tree
        ref="treeRef"
        :data="permissions"
        show-checkbox
        node-key="id"
        :default-checked-keys="checkedKeys"
        :default-expand-all="true"
        :props="{ children: 'children', label: 'name' }"
        class="permission-tree"
      >
        <template #default="{ data }">
          <span class="tree-node">
            <span>{{ data.name }}</span>
            <span class="tree-node-code">{{ data.code }}</span>
          </span>
        </template>
      </el-tree>
    </div>

    <template #footer>
      <el-button @click="handleClose">取消</el-button>
      <el-button type="primary" :loading="saving" @click="handleSave">
        {{ saving ? '保存中...' : '保存' }}
      </el-button>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import { ElMessage } from 'element-plus'
import type { ElTree } from 'element-plus'
import { getPermissionList, getRolePermissions, updateRolePermissions } from '@/api/system'

const props = defineProps<{
  visible: boolean
  roleId?: number
  roleName: string
}>()

const emit = defineEmits(['close', 'success'])

const dialogVisible = ref(false)
const loading = ref(false)
const saving = ref(false)
const treeRef = ref<InstanceType<typeof ElTree>>()
const permissions = ref<any[]>([])
const checkedKeys = ref<number[]>([])

// 监听visible变化
watch(() => props.visible, (val) => {
  dialogVisible.value = val
  if (val && props.roleId) {
    loadData()
  }
})

// 加载权限数据
const loadData = async () => {
  loading.value = true
  try {
    const [permsRes, rolePermsRes] = await Promise.all([
      getPermissionList(),
      getRolePermissions(props.roleId!)
    ])
    
    permissions.value = permsRes.data
    checkedKeys.value = rolePermsRes.data
  } catch (error) {
    console.error('加载权限数据失败:', error)
    ElMessage.error('加载权限数据失败')
  } finally {
    loading.value = false
  }
}

// 全选
const handleCheckAll = () => {
  const allKeys: number[] = []
  const collectKeys = (nodes: any[]) => {
    nodes.forEach(node => {
      allKeys.push(node.id)
      if (node.children && node.children.length > 0) {
        collectKeys(node.children)
      }
    })
  }
  collectKeys(permissions.value)
  treeRef.value?.setCheckedKeys(allKeys)
}

// 取消全选
const handleUncheckAll = () => {
  treeRef.value?.setCheckedKeys([])
}

// 展开全部
const handleExpandAll = () => {
  const allKeys: number[] = []
  const collectParentKeys = (nodes: any[]) => {
    nodes.forEach(node => {
      if (node.children && node.children.length > 0) {
        allKeys.push(node.id)
        collectParentKeys(node.children)
      }
    })
  }
  collectParentKeys(permissions.value)
  allKeys.forEach(key => {
    const node = treeRef.value?.getNode(key)
    if (node) node.expanded = true
  })
}

// 折叠全部
const handleCollapseAll = () => {
  const allKeys: number[] = []
  const collectParentKeys = (nodes: any[]) => {
    nodes.forEach(node => {
      if (node.children && node.children.length > 0) {
        allKeys.push(node.id)
        collectParentKeys(node.children)
      }
    })
  }
  collectParentKeys(permissions.value)
  allKeys.forEach(key => {
    const node = treeRef.value?.getNode(key)
    if (node) node.expanded = false
  })
}

// 保存权限配置
const handleSave = async () => {
  if (!treeRef.value) return

  const checkedNodes = treeRef.value.getCheckedKeys() as number[]
  const halfCheckedNodes = treeRef.value.getHalfCheckedKeys() as number[]
  
  // 合并全选和半选的节点（父节点）
  const allCheckedKeys = [...checkedNodes, ...halfCheckedNodes]

  saving.value = true
  try {
    await updateRolePermissions(props.roleId!, allCheckedKeys)
    ElMessage.success('权限配置成功')
    emit('success')
    handleClose()
  } catch (error: any) {
    console.error('保存失败:', error)
    ElMessage.error(error.response?.data?.message || '保存失败')
  } finally {
    saving.value = false
  }
}

// 关闭对话框
const handleClose = () => {
  emit('close')
}
</script>

<style scoped>
.tree-actions {
  margin-bottom: 15px;
  padding: 10px;
  background: #f5f5f5;
  border-radius: 4px;
}

.permission-tree {
  max-height: 500px;
  overflow-y: auto;
  border: 1px solid #dcdfe6;
  border-radius: 4px;
  padding: 10px;
}

.tree-node {
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex: 1;
  padding-right: 20px;
}

.tree-node-code {
  font-size: 12px;
  color: #909399;
  font-family: 'Courier New', monospace;
}
</style>