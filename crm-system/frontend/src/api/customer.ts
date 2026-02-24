import request from '@/utils/request'

/**
 * 获取客户列表
 */
export function getCustomerList(params: any) {
  return request({
    url: '/customers',
    method: 'get',
    params
  })
}

/**
 * 创建客户
 */
export function createCustomer(data: any) {
  return request({
    url: '/customers',
    method: 'post',
    data
  })
}

/**
 * 获取客户详情
 */
export function getCustomerDetail(id: number) {
  return request({
    url: `/customers/${id}`,
    method: 'get'
  })
}

/**
 * 更新客户
 */
export function updateCustomer(id: number, data: any) {
  return request({
    url: `/customers/${id}`,
    method: 'put',
    data
  })
}

/**
 * 删除客户
 */
export function deleteCustomer(id: number) {
  return request({
    url: `/customers/${id}`,
    method: 'delete'
  })
}

/**
 * 批量删除客户
 */
export function batchDeleteCustomers(ids: number[]) {
  return request({
    url: '/customers/batch-delete',
    method: 'post',
    data: { ids }
  })
}

/**
 * 导出客户到Excel
 */
export function exportCustomers(params: any) {
  return request({
    url: '/customers/export',
    method: 'get',
    params,
    responseType: 'blob'
  })
}

/**
 * 下载导入模板
 */
export function downloadTemplate() {
  return request({
    url: '/customers/template',
    method: 'get',
    responseType: 'blob'
  })
}

/**
 * 导入客户
 */
export function importCustomers(file: File) {
  const formData = new FormData()
  formData.append('file', file)
  
  return request({
    url: '/customers/import',
    method: 'post',
    data: formData,
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  })
}

/**
 * 转移客户
 */
export function transferCustomer(id: number, data: any) {
  return request({
    url: `/customers/${id}/transfer`,
    method: 'post',
    data
  })
}

/**
 * 批量转移客户
 */
export function batchTransferCustomers(data: any) {
  return request({
    url: '/customers/batch-transfer',
    method: 'post',
    data
  })
}

/**
 * 获取客户转移历史
 */
export function getTransferHistory(params: any) {
  return request({
    url: '/customers/transfer-history',
    method: 'get',
    params
  })
}
