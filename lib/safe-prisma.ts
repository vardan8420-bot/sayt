// Безопасная обертка для Prisma клиента
// Предотвращает ошибки подключения при невалидном DATABASE_URL

import prisma from './prisma'
import { validateDatabaseUrl } from './db-utils'

/**
 * Безопасное выполнение Prisma запроса
 * Возвращает fallback значение если DATABASE_URL не валиден или БД недоступна
 */
export async function safePrismaQuery<T>(
	query: (prisma: typeof prisma) => Promise<T>,
	fallback: T
): Promise<{ data: T; error: boolean; errorMessage?: string }> {
	// Проверяем валидность DATABASE_URL перед выполнением
	const validation = validateDatabaseUrl()
	if (!validation.valid) {
		return {
			data: fallback,
			error: true,
			errorMessage: validation.error || 'Database URL is not valid',
		}
	}

	try {
		const data = await query(prisma)
		return { data, error: false }
	} catch (error: any) {
		// Проверяем ошибки подключения Prisma
		if (error.code === 'P1001' || error.code === 'P1012' || error.code === 'P1000') {
			// Ошибка подключения к БД - возвращаем fallback
			return {
				data: fallback,
				error: true,
				errorMessage: 'Database connection failed',
			}
		}

		// Другие ошибки - пробрасываем дальше
		throw error
	}
}

