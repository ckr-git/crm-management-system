import { expect, type Page } from '@playwright/test'

export const BASE_URL = process.env.BASE_URL || 'http://localhost:5174'

export async function login(page: Page) {
  await page.goto(`${BASE_URL}/login`)
  await page.getByRole('textbox', { name: '请输入用户名' }).fill('admin')
  await page.getByRole('textbox', { name: '请输入密码' }).fill('admin123')
  await page.getByRole('button', { name: '登录' }).click()
  await expect(page).toHaveURL(/\/dashboard$/)
  await expect(page.getByRole('heading', { name: '工作台' })).toBeVisible()
}
