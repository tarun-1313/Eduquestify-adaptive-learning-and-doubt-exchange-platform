import { expect, test } from '@playwright/test'




test('doubts page loads successfully', async ({ page }: { page: any }) => {
  await page.goto('http://localhost:3000/doubts')
  
  // Check if the page title is present
  await expect(page.locator('h1')).toContainText('Study Doubts')
  
  // Check if the create doubt button is present
  await expect(page.locator('button:has-text("Ask Doubt")')).toBeVisible()
  
  // Check if search input is present
  await expect(page.locator('input[placeholder="Search doubts..."]')).toBeVisible()
  
  // Check if subject filter is present
  await expect(page.locator('button:has-text("All Subjects")')).toBeVisible()
})

test('create doubt form opens', async ({ page }: { page: any }) => {
  await page.goto('http://localhost:3000/doubts')
  
  // Click the Ask Doubt button
  await page.locator('button:has-text("Ask Doubt")').click()
  
  // Check if the modal opens
  await expect(page.locator('h2:has-text("Ask a Doubt")')).toBeVisible()
  
  // Check if form fields are present
  await expect(page.locator('input[placeholder="Brief title of your doubt"]')).toBeVisible()
  await expect(page.locator('textarea[placeholder="Describe your doubt in detail..."]')).toBeVisible()
  
  // Check if subject dropdown is present
  await expect(page.locator('button:has-text("Select a subject")')).toBeVisible()
  
  // Check if buttons are present
  await expect(page.locator('button:has-text("Cancel")')).toBeVisible()
  await expect(page.locator('button:has-text("Post Doubt")')).toBeVisible()
})

test('stats cards are visible', async ({ page }: { page: any }) => {
  await page.goto('http://localhost:3000/doubts')
  
  // Check if stats cards are present
  await expect(page.locator('text="Total Doubts"')).toBeVisible()
  await expect(page.locator('text="Active Discussions"')).toBeVisible()
  await expect(page.locator('text="Your Subjects"')).toBeVisible()
})