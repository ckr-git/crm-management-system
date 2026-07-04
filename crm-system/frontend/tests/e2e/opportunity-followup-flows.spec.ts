import { test, expect } from '@playwright/test'
import { BASE_URL, login } from './helpers/auth'

test('客户详情中的销售机会可跳转到商机详情 @critical', async ({ page }) => {
  await login(page)

  await page.goto(`${BASE_URL}/customers`)
  await page.getByRole('combobox', { name: '显示范围' }).click({ force: true })
  await page.getByRole('option', { name: '全部客户' }).click()
  await page.getByRole('textbox', { name: '客户名称' }).fill('北京云智科技有限公司')
  await page.getByRole('button', { name: '搜索' }).click()
  await expect(page.getByText('北京云智科技有限公司')).toBeVisible()

  await page.getByRole('button', { name: '查看' }).first().click()
  await expect(page).toHaveURL(/\/customers\/\d+$/)

  await page.getByRole('tab', { name: '销售机会' }).click()
  await expect(page.getByText('云智科技ERP系统采购')).toBeVisible()

  await page.getByRole('button', { name: '查看' }).first().click()
  await expect(page).toHaveURL(/\/opportunities\/\d+$/)
  await expect(page.getByText('基本信息')).toBeVisible()
  await expect(page.getByText('销售进度')).toBeVisible()
  await expect(page.getByText('客户信息')).toBeVisible()

  await page.getByRole('button', { name: '查看详情' }).click()
  await expect(page).toHaveURL(/\/customers\/\d+$/)
})

test('跟进列表支持类型筛选和新增跟进记录 @critical', async ({ page }) => {
  await login(page)

  await page.goto(`${BASE_URL}/followups`)
  await expect(page.getByRole('heading', { name: '跟进记录' })).toBeVisible()

  await page.getByRole('combobox', { name: '跟进类型' }).click({ force: true })
  await page.getByRole('option', { name: '电话' }).click()
  await page.getByRole('button', { name: '搜索' }).click()
  await expect(page.getByRole('cell', { name: '电话' }).first()).toBeVisible()

  await page.getByRole('button', { name: '新增跟进记录' }).click()
  await expect(page.getByRole('dialog', { name: '新增跟进记录' })).toBeVisible()

  await page.getByRole('button', { name: '确定' }).click()
  await expect(page.getByText('请选择客户')).toBeVisible()

  await expect(page.getByRole('radio', { name: '电话' })).toBeChecked()
  await page.getByRole('button', { name: '取消' }).click()
  await expect(page.getByRole('dialog', { name: '新增跟进记录' })).toBeHidden()
})

test('商机列表支持关键空状态与新增机会入口 @critical', async ({ page }) => {
  await login(page)

  await page.goto(`${BASE_URL}/opportunities`)
  await expect(page.getByRole('heading', { name: '销售机会' })).toBeVisible()

  await expect(page.getByText('总机会数')).toBeVisible()
  await expect(page.getByRole('main').getByText('进行中')).toBeVisible()
  await expect(page.getByRole('main').getByText('已赢单')).toBeVisible()
  await expect(page.getByRole('main').getByText('总金额')).toBeVisible()
  await expect(page.getByText(/暂无数据|产品演示/)).toBeVisible()

  await page.getByRole('textbox', { name: '机会名称' }).fill('云智科技ERP系统采购')
  await page.getByRole('button', { name: '搜索' }).click()
  await expect(page.getByText(/暂无数据|云智科技ERP系统采购/)).toBeVisible()

  await page.getByRole('button', { name: '新增机会' }).click()
  await expect(page.getByRole('dialog', { name: '新增销售机会' })).toBeVisible()
  await page.getByRole('button', { name: '取消' }).click()
  await expect(page.getByRole('dialog', { name: '新增销售机会' })).toBeHidden()
})
