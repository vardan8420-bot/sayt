import { test, expect } from '@playwright/test'

test('home page renders and search works', async ({ page }) => {
	await page.goto('http://localhost:3000/')
	await expect(page.getByRole('heading', { name: /добро пожаловать/i })).toBeVisible()

	const searchInput = page.getByPlaceholder(/поиск|search/i)
	await searchInput.fill('test')
	await page.getByRole('button', { name: /найти|search/i }).click()
	await expect(searchInput).toHaveValue('test')
})


