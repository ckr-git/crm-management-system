<template>
  <div class="user-list">
    <PageHeader title="用户管理" description="管理系统用户账号和权限" :show-back="false">
      <template #actions>
        <el-button type="primary" @click="handleAdd">
          <el-icon><Plus /></el-icon>
          新增用户
        </el-button>
      </template>
    </PageHeader>

    <!-- 搜索表单 -->
    <el-card shadow="hover" style="margin-bottom: 20px;">
      <el-form :model="searchForm" inline>
        <el-form-item label="姓名">
          <el-input v-model="searchForm.name" placeholder="请输入姓名" clearable />
        </el-form-item>
        <el-form-item label="用户名">
          <el-input v-model="searchForm.username" placeholder="请输入用户名" clearable />
        </el-form-item>
        <el-form-item label="角色">
          <el-select v-model="searchForm.role_id" placeholder="请选择角色" clearable>
            <el-option v-for="role in roles" :key="role.id" :label="role.name" :value="role.id" />
          </el-select>
        </el-form-item>
        <el-form-item label="状态">
          <el-select v-model="searchForm.status" placeholder="请选择状态" clearable>
            <el-option label="正常" value="1" />
            <el-option label="禁用" value="0" />
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

    <!-- 用户表格 -->
    <el-card shadow="hover">
      <el-table :data="users" v-loading="loading" style="width: 100%">
        <el-table-column prop="name" label="姓名" width="120" />
        <el-table-column prop="username" label="用户名" width="120" />
        <el-table-column prop="email" label="邮箱" width="180" />
        <el-table-column prop="phone" label="电话" width="120" />
        <el-table-column label="角色" width="150">
          <template #default="{ row }">
            <template v-if="row.roles && row.roles.length > 0">
              <el-tag v-for="role in row.roles" :key="role.id" type="info" size="small" style="margin-right: 5px;">
                {{ role.name }}
              </el-tag>
            </template>
            <span v-else-if="row.role">
              <el-tag type="info" size="small">{{ row.role.name }}</el-tag>
            </span>
            <span v-else>-</span>
          </template>
        </el-table-column>
        <el-table-column label="状态" width="80">
          <template #default="{ row }">
            <el-tag :type="row.status === 1 ? 'success' : 'danger'">
              {{ row.status === 1 ? '正常' : '禁用' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="创建时间" width="160">
          <template #default="{ row }">
            {{ new Date(row.created_at).toLocaleString('zh-CN') }}
          </template>
        </el-table-column>
        <el-table-column label="操作" width="280" fixed="right">
          <template #default="{ row }">
            <el-button type="primary" size="small" plain @click="handleEdit(row)">
              编辑
            </el-button>
            <el-button 
              :type="row.status === 1 ? 'warning' : 'success'"
              size="small" 
              plain 
              @click="handleToggleStatus(row)"
            >
              {{ row.status === 1 ? '禁用' : '启用' }}
            </el-button>
            <el-button type="info" size="small" plain @click="handleResetPassword(row)">
              重置密码
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
        @size-change="getUsers"
        @current-change="getUsers"
        style="margin-top: 20px; justify-content: flex-end;"
      />
    </el-card>

    <!-- 用户表单对话框 -->
    <UserForm
      :visible="formVisible"
      @update:visible="formVisible = $event"
      :user-id="currentUserId"
      :roles="roles"
      @success="handleFormSuccess"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import PageHeader from '@/components/common/PageHeader.vue'
import UserForm from '@/components/system/UserForm.vue'
import { getUserList, deleteUser, updateUserStatus, resetPassword, getRoleList } from '@/api/system'

// 搜索表单
const searchForm = reactive({
  name: '',
  username: '',
  role_id: '',
  status: ''
})

// 用户列表
const users = ref<any[]>([])
const loading = ref(false)

// 角色列表
const roles = ref<any[]>([])

// 表单对话框
const formVisible = ref(false)
const currentUserId = ref<number | undefined>(undefined)

// 分页
const pagination = reactive({
  page: 1,
  pageSize: 10,
  total: 0
})

// 获取角色列表
const getRoles = async () => {
  try {
    const res = await getRoleList()
    roles.value = res.data
  } catch (error) {
    console.error('获取角色列表失败:', error)
  }
}

// 获取用户列表
const getUsers = async () => {
  loading.value = true
  try {
    const res = await getUserList({
      ...searchForm,
      page: pagination.page,
      pageSize: pagination.pageSize
    })
    
    users.value = res.data.list
    pagination.total = res.data.total
  } catch (error) {
    console.error('获取用户列表失败:', error)
    ElMessage.error('获取用户列表失败')
  } finally {
    loading.value = false
  }
}

// 搜索
const handleSearch = () => {
  pagination.page = 1
  getUsers()
}

// 重置
const handleReset = () => {
  searchForm.name = ''
  searchForm.username = ''
  searchForm.role_id = ''
  searchForm.status = ''
  handleSearch()
}

// 新增
const handleAdd = () => {
  currentUserId.value = undefined
  formVisible.value = true
}

// 编辑
const handleEdit = (row: any) => {
  currentUserId.value = row.id
  formVisible.value = true
}

// 启用/禁用
const handleToggleStatus = (row: any) => {
  const newStatus = row.status === 1 ? 0 : 1
  const action = newStatus === 1 ? '启用' : '禁用'
  
  ElMessageBox.confirm(`确定${action}用户"${row.name}"吗？`, '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(async () => {
    try {
      await updateUserStatus(row.id, newStatus)
      ElMessage.success(`${action}成功`)
      getUsers()
    } catch (error: any) {
      console.error('更新用户状态失败', error)
      ElMessage.error(error.response?.data?.message || `${action}失败`)
    }
  }).catch(() => {})
}

// 重置密码
const handleResetPassword = (row: any) => {
  ElMessageBox.prompt(`请输入用户"${row.name}"的新密码`, '重置密码', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    inputPattern: /.{6,}/,
      inputErrorMessage: '密码至少6位'
  }).then(async ({ value }) => {
    try {
      await resetPassword(row.id, value)
      ElMessage.success('密码重置成功')
    } catch (error: any) {
      console.error('重置密码失败:', error)
      ElMessage.error(error.response?.data?.message || '重置密码失败')
    }
  }).catch(() => {})
}

// 删除
const handleDelete = (row: any) => {
  ElMessageBox.confirm(`确定要删除用户"${row.name}"吗？`, '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(async () => {
    try {
      await deleteUser(row.id)
      ElMessage.success('删除成功')
      getUsers()
    } catch (error: any) {
      console.error('删除失败:', error)
      ElMessage.error(error.response?.data?.message || '删除失败')
    }
  }).catch(() => {})
}

// 表单提交成功
const handleFormSuccess = () => {
  getUsers()
}

// 页面加载
onMounted(() => {
  getRoles()
  getUsers()
})
</script>
<style lang="scss" scoped>
.user-list {
  padding: 0;
}
</style>
