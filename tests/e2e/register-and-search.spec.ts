import { test, expect } from '@playwright/test'

test('user can register and search', async ({ page }) => {
	const random = Math.random().toString(36).slice(2, 8)
	const email = `test_${random}@example.com`

	await page.goto('http://localhost:3000/auth/register')
	await page.getByPlaceholder('Имя (необязательно)').fill('Test User')
	await page.getByPlaceholder('Email').fill(email)
	await page.getByPlaceholder('Пароль').fill('Test123$')
	await page.getByRole('button', { name: /Зарегистрироваться|Register/i }).click()
	await expect(page.getByText(/Успешно|Теперь вы можете войти/i)).toBeVisible()

	await page.goto('http://localhost:3000/search?q=test')
	await expect(page.getByRole('heading', { name: /Поиск/i })).toBeVisible()
})


