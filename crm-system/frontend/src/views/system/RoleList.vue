<template>
  <div class="role-list">
    <PageHeader title="角色管理" description="管理系统角色和权限配置" :show-back="false">
      <template #extra>
        <el-button type="primary" @click="handleAdd">
          <el-icon><Plus /></el-icon>
          新增角色
        </el-button>
      </template>
    </PageHeader>

    <el-card shadow="hover">
      <el-table :data="roles" v-loading="loading" style="width: 100%">
        <el-table-column prop="name" label="角色名称" />
        <el-table-column prop="description" label="角色描述" />
        <el-table-column label="系统角色" width="100">
          <template #default="{ row }">
            <el-tag v-if="row.is_system" type="info">是</el-tag>
            <span v-else>否</span>
          </template>
        </el-table-column>
        <el-table-column label="创建时间" width="180">
          <template #default="{ row }">
            {{ new Date(row.created_at).toLocaleString('zh-CN') }}
          </template>
        </el-table-column>
        <el-table-column label="操作" width="200" fixed="right">
          <template #default="{ row }">
            <el-button type="primary" size="small" @click="handlePermission(row)">
              权限配置
            </el-button>
            <el-button type="primary" size="small" plain @click="handleEdit(row)">
              编辑
            </el-button>
            <el-button 
              type="danger" 
              size="small" 
              plain 
              :disabled="row.is_system"
              @click="handleDelete(row)"
            >
              删除
            </el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>

    <!-- 角色表单对话框 -->
    <RoleForm
      v-model="formVisible"
      :role-id="currentRoleId"
      @success="handleFormSuccess"
    />

    <!-- 权限配置对话框 -->
    <PermissionDialog
      v-model="permissionVisible"
      :role-id="currentRoleId"
      :role-name="currentRoleName"
      @success="handlePermissionSuccess"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import PageHeader from '@/components/common/PageHeader.vue'
import RoleForm from '@/components/system/RoleForm.vue'
import PermissionDialog from '@/components/system/PermissionDialog.vue'
import { getRoleList, deleteRole } from '@/api/system'

const roles = ref<any[]>([])
const loading = ref(false)
const formVisible = ref(false)
const permissionVisible = ref(false)
const currentRoleId = ref<number | undefined>(undefined)
const currentRoleName = ref('')

// 获取角色列表
const getRoles = async () => {
  loading.value = true
  try {
    const res = await getRoleList()
    roles.value = res.data
  } catch (error) {
    console.error('获取角色列表失败:', error)
    ElMessage.error('获取角色列表失败')
  } finally {
    loading.value = false
  }
}

// 新增
const handleAdd = () => {
  currentRoleId.value = undefined
  formVisible.value = true
}

// 编辑
const handleEdit = (row: any) => {
  currentRoleId.value = row.id
  formVisible.value = true
}

// 删除
const handleDelete = (row: any) => {
  if (row.is_system) {
    ElMessage.warning('系统角色不能删除')
    return
  }

  ElMessageBox.confirm(`确定要删除角色“${row.name}”吗？`, '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(async () => {
    try {
      await deleteRole(row.id)
      ElMessage.success('删除成功')
      getRoles()
    } catch (error: any) {
      console.error('删除失败:', error)
      ElMessage.error(error.response?.data?.message || '删除失败')
    }
  }).catch(() => {})
}

// 配置权限
const handlePermission = (row: any) => {
  currentRoleId.value = row.id
  currentRoleName.value = row.name
  permissionVisible.value = true
}

// 表单成功
const handleFormSuccess = () => {
  getRoles()
}

// 权限配置成功
const handlePermissionSuccess = () => {
  ElMessage.success('权限配置成功')
}

onMounted(() => {
  getRoles()
})
</script>
<style lang="scss" scoped>
.role-list {
  padding: 0;
}
</style>
