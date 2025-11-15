// Утилиты для работы с базой данных

import prisma from './prisma'

/**
 * Проверка подключения к базе данных
 */
export async function checkDatabaseConnection(): Promise<{ connected: boolean; error?: string }> {
	// Сначала проверяем валидность DATABASE_URL
	const validation = validateDatabaseUrl()
	if (!validation.valid) {
		return {
			connected: false,
			error: validation.error || 'Database URL is not valid',
		}
	}

	try {
		await prisma.$queryRaw`SELECT 1`
		return { connected: true }
	} catch (error: any) {
		// Проверяем тип ошибки Prisma
		if (error.code === 'P1001' || error.code === 'P1012' || error.code === 'P1000') {
			return {
				connected: false,
				error: 'Database server is not reachable. Please check DATABASE_URL',
			}
		}
		return {
			connected: false,
			error: error.message || 'Database connection failed',
		}
	}
}

/**
 * Валидация DATABASE_URL
 */
export function validateDatabaseUrl(): { valid: boolean; error?: string } {
	const dbUrl = process.env.DATABASE_URL

	if (!dbUrl) {
		return { valid: false, error: 'DATABASE_URL is not set' }
	}

	if (dbUrl.includes('placeholder') || dbUrl.includes('example')) {
		return { valid: false, error: 'DATABASE_URL contains placeholder value' }
	}

	// Проверка формата PostgreSQL URL
	if (!dbUrl.startsWith('postgresql://') && !dbUrl.startsWith('postgres://')) {
		return { valid: false, error: 'DATABASE_URL must start with postgresql:// or postgres://' }
	}

	// Проверка на явно неправильные значения (host:5432 без @ означает неправильный формат)
	if (dbUrl.includes('host:5432') && !dbUrl.includes('@')) {
		return {
			valid: false,
			error: 'DATABASE_URL has invalid format (host:5432 without @). Please check your connection string.',
		}
	}

	// Проверка на localhost/127.0.0.1 в продакшене (не должно быть)
	if (process.env.NODE_ENV === 'production') {
		if (dbUrl.includes('@localhost:') || dbUrl.includes('@127.0.0.1:')) {
			return {
				valid: false,
				error: 'DATABASE_URL should not point to localhost in production',
			}
		}
	}

	return { valid: true }
}

/**
 * Безопасное выполнение запроса к БД с fallback
 */
export async function safeDbQuery<T>(
	query: () => Promise<T>,
	fallback: T
): Promise<{ data: T; error: boolean; errorMessage?: string }> {
	// Сначала проверяем валидность DATABASE_URL
	const validation = validateDatabaseUrl()
	if (!validation.valid) {
		// Не пытаемся выполнять запрос если DATABASE_URL не валиден
		return {
			data: fallback,
			error: true,
			errorMessage: validation.error || 'Database URL is not valid',
		}
	}

	try {
		const data = await query()
		return { data, error: false }
	} catch (error: any) {
		// Проверяем ошибки подключения Prisma
		const isConnectionError = 
			error.code === 'P1001' || // Can't reach database server
			error.code === 'P1012' || // Connection string is missing
			error.code === 'P1000' || // Authentication failed
			error.code === 'P1002' || // Database server closed the connection
			error.code === 'P1009' || // Database already exists (может быть при ошибке подключения)
			error.name === 'PrismaClientInitializationError' || // Общая ошибка инициализации
			(error.message && (
				error.message.includes("Can't reach database server") ||
				error.message.includes('host:5432') ||
				error.message.includes('database server is running')
			))
		
		if (isConnectionError) {
			// Ошибка подключения к БД - возвращаем fallback
			// Не логируем как ошибку в продакшене, это нормальное поведение при отсутствии БД
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

