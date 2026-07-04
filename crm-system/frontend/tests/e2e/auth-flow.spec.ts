import { test, expect } from '@playwright/test'
import { BASE_URL, login } from './helpers/auth'

test('登录并进入工作台 @smoke @critical', async ({ page }) => {
  await login(page)
  await expect(page.getByText('欢迎回来，这里是您的数据概览')).toBeVisible()
})

test('未登录访问受保护路由跳转登录页 @smoke', async ({ page }) => {
  await page.goto(`${BASE_URL}/dashboard`)
  await expect(page).toHaveURL(/\/login$/)
  await expect(page.getByRole('button', { name: '登录' })).toBeVisible()
})
