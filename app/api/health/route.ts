import { NextRequest, NextResponse } from 'next/server'
import { checkDatabaseConnection, validateDatabaseUrl } from '../../../lib/db-utils'

// Health check endpoint for monitoring
export async function GET(req: NextRequest) {
	try {
		const checks = {
			status: 'healthy' as 'healthy' | 'unhealthy' | 'degraded',
			timestamp: new Date().toISOString(),
			checks: {
				database: 'unknown' as 'ok' | 'error' | 'unknown',
				databaseConfig: 'unknown' as 'ok' | 'error' | 'unknown',
				api: 'ok' as 'ok' | 'error',
			},
			errors: [] as string[],
		}

		// Проверка валидности DATABASE_URL
		const dbConfigValidation = validateDatabaseUrl()
		if (!dbConfigValidation.valid) {
			checks.checks.databaseConfig = 'error'
			checks.status = 'unhealthy'
			checks.errors.push(`Database config: ${dbConfigValidation.error}`)
		} else {
			checks.checks.databaseConfig = 'ok'
		}

		// Проверка подключения к базе данных
		if (dbConfigValidation.valid) {
			const dbConnection = await checkDatabaseConnection()
			if (dbConnection.connected) {
				checks.checks.database = 'ok'
			} else {
				checks.checks.database = 'error'
				checks.status = checks.status === 'healthy' ? 'degraded' : 'unhealthy'
				checks.errors.push(`Database connection: ${dbConnection.error}`)
			}
		} else {
			checks.checks.database = 'error'
		}

		// Проверка обязательных переменных окружения
		const requiredEnvVars = ['NEXTAUTH_SECRET', 'NEXTAUTH_URL']
		const missingEnvVars = requiredEnvVars.filter((key) => !process.env[key])

		if (missingEnvVars.length > 0) {
			checks.status = 'unhealthy'
			checks.errors.push(`Missing environment variables: ${missingEnvVars.join(', ')}`)
		}

		// DATABASE_URL рекомендуется, но не обязателен для базовой работы
		if (!process.env.DATABASE_URL) {
			checks.status = checks.status === 'healthy' ? 'degraded' : checks.status
			checks.errors.push('DATABASE_URL is not set - database features will be unavailable')
		}

		const statusCode = checks.status === 'healthy' ? 200 : checks.status === 'degraded' ? 200 : 503

		return NextResponse.json(checks, {
			status: statusCode,
			headers: {
				'Cache-Control': 'no-cache, no-store, must-revalidate',
			},
		})
	} catch (error: any) {
		return NextResponse.json(
			{
				status: 'unhealthy',
				timestamp: new Date().toISOString(),
				error: error.message || 'Unknown error',
			},
			{ status: 503 }
		)
	}
}

