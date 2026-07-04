import { test, expect } from '@playwright/test'

const BASE_URL = process.env.BASE_URL || 'http://localhost:5174'

test('登录并进入工作台 @smoke @critical', async ({ page }) => {
  await page.goto(`${BASE_URL}/login`)
  await page.getByRole('textbox', { name: '请输入用户名' }).fill('admin')
  await page.getByRole('textbox', { name: '请输入密码' }).fill('admin123')
  await page.getByRole('button', { name: '登录' }).click()

  await expect(page).toHaveURL(/\/dashboard$/)
  await expect(page.getByRole('heading', { name: '工作台' })).toBeVisible()
  await expect(page.getByText('欢迎回来，这里是您的数据概览')).toBeVisible()
})

test('未登录访问受保护路由跳转登录页 @smoke', async ({ page }) => {
  await page.goto(`${BASE_URL}/dashboard`)
  await expect(page).toHaveURL(/\/login$/)
  await expect(page.getByRole('button', { name: '登录' })).toBeVisible()
})
