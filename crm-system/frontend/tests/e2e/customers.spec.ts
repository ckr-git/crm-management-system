import { test, expect } from '@playwright/test'

const BASE_URL = process.env.BASE_URL || 'http://localhost:5174'

async function login(page: import('@playwright/test').Page) {
  await page.goto(`${BASE_URL}/login`)
  await page.getByRole('textbox', { name: '请输入用户名' }).fill('admin')
  await page.getByRole('textbox', { name: '请输入密码' }).fill('admin123')
  await page.getByRole('button', { name: '登录' }).click()
  await expect(page).toHaveURL(/\/dashboard$/)
}

test('客户页搜索命中结果 @smoke @critical', async ({ page }) => {
  await login(page)
  await page.goto(`${BASE_URL}/customers`)

  await expect(page.getByRole('heading', { name: '客户管理' })).toBeVisible()
  await page.getByRole('textbox', { name: '客户名称' }).fill('自动化测试公司')
  await page.getByRole('button', { name: '搜索' }).click()

  await expect(page.getByText('自动化测试公司')).toBeVisible()
  await expect(page.getByText('共 1 条')).toBeVisible()
})
