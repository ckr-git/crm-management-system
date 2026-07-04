import { test, expect } from '@playwright/test'
import { login } from './helpers/auth'

test('客户公海页面可打开并正确展示当前空状态 @critical', async ({ page }) => {
  await login(page)

  await page.goto('http://localhost:5174/customer-pool')
  await expect(page.getByRole('heading', { name: '客户公海' })).toBeVisible()
  await expect(page.getByText('公海总数')).toBeVisible()
  await expect(page.getByText('可领取客户')).toBeVisible()
  await expect(page.getByText('今日状态')).toBeVisible()

  await page.getByRole('textbox', { name: '客户名称' }).fill('北京云智科技有限公司')
  await page.getByRole('button', { name: '搜索' }).click()
  await expect(page.getByText('公海池暂无客户')).toBeVisible()
})
