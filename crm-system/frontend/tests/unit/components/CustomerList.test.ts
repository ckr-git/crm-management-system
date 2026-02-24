import { describe, test, expect, beforeEach, vi } from 'vitest'
import { mount, flushPromises } from '@vue/test-utils'
import { createRouter, createWebHistory } from 'vue-router'
import { createPinia, setActivePinia } from 'pinia'
import { ElMessage, ElMessageBox } from 'element-plus'
import CustomerList from '@/views/customers/CustomerList.vue'
import * as customerAPI from '@/api/customer'

// Mock Element Plus
vi.mock('element-plus', () => ({
  ElMessage: {
    success: vi.fn(),
    error: vi.fn(),
    warning: vi.fn(),
    info: vi.fn()
  },
  ElMessageBox: {
    confirm: vi.fn()
  }
}))

// Mock customer API
vi.mock('@/api/customer', () => ({
  getCustomerList: vi.fn(),
  deleteCustomer: vi.fn(),
  batchDeleteCustomers: vi.fn(),
  exportCustomers: vi.fn(),
  downloadTemplate: vi.fn(),
  importCustomers: vi.fn()
}))

// Mock子组件
vi.mock('@/components/common/PageHeader.vue', () => ({
  default: {
    name: 'PageHeader',
    template: '<div><slot name="extra"></slot></div>',
    props: ['title', 'description']
  }
}))

vi.mock('@/views/customers/CustomerForm.vue', () => ({
  default: {
    name: 'CustomerForm',
    template: '<div></div>',
    props: ['visible', 'customerId'],
    emits: ['close', 'success']
  }
}))

vi.mock('@/components/QuickFollowupDialog.vue', () => ({
  default: {
    name: 'QuickFollowupDialog',
    template: '<div></div>',
    props: ['visible', 'customerId', 'customerName'],
    emits: ['close', 'success']
  }
}))

vi.mock('@/components/ReleaseToPoolDialog.vue', () => ({
  default: {
    name: 'ReleaseToPoolDialog',
    template: '<div></div>',
    props: ['visible', 'customerId', 'customerName'],
    emits: ['close', 'success']
  }
}))

vi.mock('@/components/customer/TransferDialog.vue', () => ({
  default: {
    name: 'TransferDialog',
    template: '<div></div>',
    props: ['visible', 'customerId', 'customerName', 'customerIds'],
    emits: ['update:visible', 'success']
  }
}))

// Element Plus 组件 stubs
const ElTableStub = {
  name: 'ElTable',
  template: '<div class="el-table"><slot></slot></div>',
  props: ['data', 'loading'],
  emits: ['selection-change']
}

const ElTableColumnStub = {
  name: 'ElTableColumn',
  template: '<div class="el-table-column"></div>',
  props: ['prop', 'label', 'type', 'width', 'fixed']
}

const ElPaginationStub = {
  name: 'ElPagination',
  template: '<div class="el-pagination"></div>',
  props: ['currentPage', 'pageSize', 'total', 'pageSizes', 'layout']
}

const ElUploadStub = {
  name: 'ElUpload',
  template: '<div class="el-upload"><slot></slot><slot name="tip"></slot></div>',
  props: ['autoUpload', 'limit', 'accept'],
  emits: ['change', 'remove']
}

// 通用 stubs 配置
const defaultStubs = {
  'el-table': ElTableStub,
  'el-table-column': ElTableColumnStub,
  'el-pagination': ElPaginationStub,
  'el-upload': ElUploadStub,
  'el-dialog': true,
  'el-result': true,
  'el-tabs': true,
  'el-tab-pane': true
}

describe('CustomerList Component - 客户列表组件测试', () => {
  let router: any
  let wrapper: any

  // 辅助函数：创建组件实例
  const mountComponent = () => {
    return mount(CustomerList, {
      global: {
        plugins: [router],
        stubs: defaultStubs
      }
    })
  }

  const mockCustomers = [
    {
      id: 1,
      name: '测试公司A',
      contact: '张三',
      phone: '13800138000',
      industry: '互联网',
      source: 'website',
      stage: 'potential',
      level: 'normal',
      created_at: '2025-01-01 10:00:00'
    },
    {
      id: 2,
      name: '测试公司B',
      contact: '李四',
      phone: '13800138001',
      industry: '制造业',
      source: 'referral',
      stage: 'deal',
      level: 'vip',
      created_at: '2025-01-02 11:00:00'
    }
  ]

  beforeEach(() => {
    // 创建pinia实例
    setActivePinia(createPinia())

    // 创建路由实例
    router = createRouter({
      history: createWebHistory(),
      routes: [
        { path: '/customers', component: CustomerList },
        { path: '/customers/:id', component: { template: '<div>Customer Detail</div>' } }
      ]
    })

    // 清理mock
    vi.clearAllMocks()

    // Mock默认的客户列表响应
    vi.mocked(customerAPI.getCustomerList).mockResolvedValue({
      data: {
        list: mockCustomers,
        total: 2
      }
    } as any)
  })

  afterEach(() => {
    if (wrapper) {
      wrapper.unmount()
    }
  })

  test('应该正确加载并显示客户列表', async () => {
    wrapper = mountComponent()
    await flushPromises()

    // 验证API被调用
    expect(customerAPI.getCustomerList).toHaveBeenCalledWith({
      name: '',
      contact: '',
      stage: '',
      onlyMine: 'true',
      page: 1,
      pageSize: 10
    })
  })

  test('应该处理搜索功能', async () => {
    wrapper = mountComponent()
    await flushPromises()

    const component = wrapper.vm

    // 设置搜索条件
    component.searchForm.name = '测试公司'
    component.searchForm.contact = '张三'
    component.searchForm.stage = 'potential'

    // 执行搜索
    await component.handleSearch()

    await flushPromises()

    // 验证搜索参数
    expect(customerAPI.getCustomerList).toHaveBeenCalledWith({
      name: '测试公司',
      contact: '张三',
      stage: 'potential',
      onlyMine: 'true',
      page: 1,
      pageSize: 10
    })
  })

  test('应该处理重置搜索', async () => {
    wrapper = mountComponent()
    await flushPromises()

    const component = wrapper.vm

    // 设置搜索条件
    component.searchForm.name = '测试'
    component.searchForm.contact = '张三'
    component.searchForm.stage = 'potential'

    // 执行重置
    await component.handleReset()

    // 验证搜索条件被清空
    expect(component.searchForm.name).toBe('')
    expect(component.searchForm.contact).toBe('')
    expect(component.searchForm.stage).toBe('')
    expect(component.searchForm.onlyMine).toBe('true')
  })

  test('应该打开新增客户表单', async () => {
    wrapper = mountComponent()
    await flushPromises()

    const component = wrapper.vm

    // 触发新增
    await component.handleAdd()

    // 验证表单状态
    expect(component.formVisible).toBe(true)
    expect(component.currentCustomerId).toBeUndefined()
  })

  test('应该打开编辑客户表单', async () => {
    wrapper = mountComponent()
    await flushPromises()

    const component = wrapper.vm

    // 触发编辑
    await component.handleEdit(mockCustomers[0])

    // 验证表单状态
    expect(component.formVisible).toBe(true)
    expect(component.currentCustomerId).toBe(1)
  })

  test('应该处理删除客户', async () => {
    // Mock确认对话框
    vi.mocked(ElMessageBox.confirm).mockResolvedValue('confirm' as any)

    // Mock删除API
    vi.mocked(customerAPI.deleteCustomer).mockResolvedValue({} as any)

    wrapper = mountComponent()
    await flushPromises()

    const component = wrapper.vm

    // 触发删除
    await component.handleDelete(mockCustomers[0])

    await flushPromises()

    // 验证确认对话框
    expect(ElMessageBox.confirm).toHaveBeenCalledWith(
      '确定要删除客户"测试公司A"吗？',
      '提示',
      expect.objectContaining({
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      })
    )

    // 验证删除API被调用
    expect(customerAPI.deleteCustomer).toHaveBeenCalledWith(1)

    // 验证成功消息
    expect(ElMessage.success).toHaveBeenCalledWith('删除成功')

    // 验证列表刷新
    expect(customerAPI.getCustomerList).toHaveBeenCalled()
  })

  test('应该处理批量删除', async () => {
    // Mock确认对话框
    vi.mocked(ElMessageBox.confirm).mockResolvedValue('confirm' as any)

    // Mock批量删除API
    vi.mocked(customerAPI.batchDeleteCustomers).mockResolvedValue({} as any)

    wrapper = mountComponent()
    await flushPromises()

    const component = wrapper.vm

    // 设置选中的行
    component.selectedRows = mockCustomers

    // 触发批量删除
    await component.handleBatchDelete()

    await flushPromises()

    // 验证确认对话框
    expect(ElMessageBox.confirm).toHaveBeenCalledWith(
      '确定要删除选中的 2 个客户吗？',
      '批量删除',
      expect.objectContaining({
        type: 'warning'
      })
    )

    // 验证批量删除API被调用
    expect(customerAPI.batchDeleteCustomers).toHaveBeenCalledWith([1, 2])

    // 验证成功消息
    expect(ElMessage.success).toHaveBeenCalledWith('成功删除 2 个客户')
  })

  test('应该处理查看客户详情', async () => {
    wrapper = mountComponent()
    await router.push('/customers')
    await router.isReady()
    await flushPromises()

    const component = wrapper.vm

    // 触发查看
    await component.handleView(mockCustomers[0])

    await flushPromises()

    // 验证路由跳转
    expect(router.currentRoute.value.path).toBe('/customers/1')
  })

  test('应该打开快速跟进对话框', async () => {
    wrapper = mountComponent()
    await flushPromises()

    const component = wrapper.vm

    // 触发快速跟进
    await component.handleQuickFollowup(mockCustomers[0])

    // 验证对话框状态
    expect(component.quickFollowupVisible).toBe(true)
    expect(component.currentCustomerId).toBe(1)
    expect(component.currentCustomerName).toBe('测试公司A')
  })

  test('应该处理客户转移', async () => {
    wrapper = mountComponent()
    await flushPromises()

    const component = wrapper.vm

    // 触发转移
    await component.handleTransfer(mockCustomers[0])

    // 验证对话框状态
    expect(component.transferDialogVisible).toBe(true)
    expect(component.currentCustomerId).toBe(1)
    expect(component.currentCustomerName).toBe('测试公司A')
  })

  test('应该处理释放到公海', async () => {
    wrapper = mountComponent()
    await flushPromises()

    const component = wrapper.vm

    // 触发释放到公海
    await component.handleReleaseToPool(mockCustomers[0])

    // 验证对话框状态
    expect(component.releaseToPoolVisible).toBe(true)
    expect(component.currentCustomerId).toBe(1)
    expect(component.currentCustomerName).toBe('测试公司A')
  })

  test('应该处理表格选择变化', async () => {
    wrapper = mountComponent()
    await flushPromises()

    const component = wrapper.vm

    // 模拟选择变化
    await component.handleSelectionChange([mockCustomers[0]])

    // 验证选中状态
    expect(component.selectedRows).toEqual([mockCustomers[0]])
  })

  test('应该正确获取阶段标签', async () => {
    wrapper = mountComponent()
    const component = wrapper.vm

    expect(component.getStageLabel('potential')).toBe('潜在客户')
    expect(component.getStageLabel('intention')).toBe('意向客户')
    expect(component.getStageLabel('quotation')).toBe('报价中')
    expect(component.getStageLabel('negotiation')).toBe('谈判中')
    expect(component.getStageLabel('deal')).toBe('成交客户')
  })

  test('应该正确获取等级标签', async () => {
    wrapper = mountComponent()
    const component = wrapper.vm

    expect(component.getLevelLabel('normal')).toBe('普通')
    expect(component.getLevelLabel('important')).toBe('重要')
    expect(component.getLevelLabel('vip')).toBe('VIP')
  })

  test('应该在未选择客户时提示批量删除', async () => {
    wrapper = mountComponent()
    await flushPromises()

    const component = wrapper.vm

    // 清空选择
    component.selectedRows = []

    // 尝试批量删除
    await component.handleBatchDelete()

    // 验证警告消息
    expect(ElMessage.warning).toHaveBeenCalledWith('请先选择要删除的客户')
  })

  test('应该处理API错误', async () => {
    // Mock API错误
    vi.mocked(customerAPI.getCustomerList).mockRejectedValue(new Error('网络错误'))

    wrapper = mountComponent()
    await flushPromises()

    // 验证错误消息
    expect(ElMessage.error).toHaveBeenCalledWith('获取客户列表失败')
  })

  test('应该处理表单提交成功', async () => {
    wrapper = mountComponent()
    await flushPromises()

    // 重置mock计数
    vi.clearAllMocks()

    const component = wrapper.vm

    // 触发表单成功回调
    await component.handleFormSuccess()

    // 验证列表被刷新
    expect(customerAPI.getCustomerList).toHaveBeenCalled()
  })
})
