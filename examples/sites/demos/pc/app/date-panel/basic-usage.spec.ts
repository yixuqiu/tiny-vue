import { test, expect } from '@playwright/test'

test('[DatePanel] 测试月份/年份/日期选择', async ({ page }) => {
  page.on('pageerror', (exception) => expect(exception).toBeNull())
  await page.goto('date-panel#basic-usage')

  // 点击展示年份面板
  await page.getByRole('button', { name: '2025 年' }).first().click()
  await expect(page.getByRole('cell', { name: '2025' }).first()).toBeVisible()

  // 选择年份展示月份面板
  await page.getByRole('cell', { name: '2025' }).first().click()
  await expect(page.getByRole('cell', { name: '一月', exact: true }).first()).toBeVisible()

  // 选择月份展示日期面板
  await page.getByRole('cell', { name: '一月', exact: true }).first().click()
  await expect(page.getByRole('cell', { name: '15' }).locator('div').first()).toBeVisible()

  // 选择日期
  await page.getByText('16').first().click()
  await expect(page.getByText('-01-16')).toBeVisible()

  // dateRange
  await page.locator('.tiny-date-range-picker__header > button:nth-child(2)').first().click()
  await page.locator('div').filter({ hasText: /^19$/ }).nth(1).click()
  await page.getByRole('cell', { name: '28' }).nth(3).click()
  await expect(page.getByText('[ "2024-12-19", "2025-01-28" ]')).toBeVisible()

  // monthRange
  await page.getByText('七月').first().click()
  await page.getByText('六月').nth(1).click()
  await expect(page.getByText('[ "2024-07", "2025-06" ]')).toBeVisible()

  // yearRange
  await page.locator('#basic-usage').getByText('2021', { exact: true }).click()
  await page.locator('#basic-usage').getByText('2042').click()
  await expect(page.getByText('[ "2021", "2042" ]')).toBeVisible()
})
