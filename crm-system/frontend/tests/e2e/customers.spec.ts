import { test, expect } from '@playwright/test'
import { BASE_URL, login } from './helpers/auth'

test('客户页搜索命中结果 @smoke @critical', async ({ page }) => {
  await login(page)
  await page.goto(`${BASE_URL}/customers`)

  await expect(page.getByRole('heading', { name: '客户管理' })).toBeVisible()
  await page.getByRole('combobox', { name: '显示范围' }).click({ force: true })
  await page.getByRole('option', { name: '全部客户' }).click()
  await page.getByRole('textbox', { name: '客户名称' }).fill('北京云智科技有限公司')
  await page.getByRole('button', { name: '搜索' }).click()

  await expect(page.getByText('北京云智科技有限公司')).toBeVisible()
  await expect(page.getByText('共 1 条')).toBeVisible()
})
