import { test, expect } from '@playwright/test'
import { login } from './helpers/auth'

test('工作台卡片与快捷入口可导航到关键模块 @smoke', async ({ page }) => {
  await login(page)

  await expect(page.locator('.stat-card').filter({ hasText: '我的客户' })).toBeVisible()
  await expect(page.locator('.stat-card').filter({ hasText: '进行中机会' })).toBeVisible()
  await expect(page.locator('.stat-card').filter({ hasText: '跟进记录' })).toBeVisible()
  await expect(page.locator('.stat-card').filter({ hasText: '今日待跟进' })).toBeVisible()

  await page.locator('.stat-card').filter({ hasText: '我的客户' }).click()
  await expect(page).toHaveURL(/\/customers$/)
  await expect(page.getByRole('heading', { name: '客户管理' })).toBeVisible()

  await page.getByRole('menuitem', { name: '数据概览' }).click()
  await expect(page).toHaveURL(/\/dashboard$/)

  await page.getByRole('button', { name: '客户池' }).click()
  await expect(page).toHaveURL(/\/customer-pool$/)
  await expect(page.getByRole('heading', { name: '客户公海' })).toBeVisible()

  await page.getByRole('menuitem', { name: '数据概览' }).click()
  await expect(page).toHaveURL(/\/dashboard$/)

  await page.getByRole('button', { name: '创建机会' }).click()
  await expect(page).toHaveURL(/\/opportunities(\?action=add)?$/)
  await expect(page.getByRole('heading', { name: '销售机会' })).toBeVisible()
  await page.getByRole('button', { name: '新增机会' }).click()
  await expect(page.getByRole('dialog', { name: '新增销售机会' })).toBeVisible()
  await page.getByRole('button', { name: '取消' }).click()
  await expect(page.getByRole('dialog', { name: '新增销售机会' })).toBeHidden()

  await page.getByRole('menuitem', { name: '数据概览' }).click()
  await expect(page).toHaveURL(/\/dashboard$/)

  await page.getByRole('button', { name: '添加跟进' }).click()
  await expect(page).toHaveURL(/\/followups(\?action=add)?$/)
  await expect(page.getByRole('heading', { name: '跟进记录' })).toBeVisible()
  await page.getByRole('button', { name: '新增跟进' }).click()
  await expect(page.getByRole('dialog', { name: '新增跟进记录' })).toBeVisible()
  await page.getByRole('button', { name: '取消' }).click()
  await expect(page.getByRole('dialog', { name: '新增跟进记录' })).toBeHidden()
})
