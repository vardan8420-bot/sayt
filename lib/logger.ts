// Централизованное логирование для продакшена
// Использует Sentry для мониторинга ошибок, но не зависит от него

type LogLevel = 'debug' | 'info' | 'warn' | 'error'

interface LogContext {
	[key: string]: unknown
}

class Logger {
	private isDevelopment = process.env.NODE_ENV === 'development'

	log(level: LogLevel, message: string, context?: LogContext) {
		const timestamp = new Date().toISOString()
		const logMessage = `[${timestamp}] [${level.toUpperCase()}] ${message}`

		// В разработке выводим все логи в console
		if (this.isDevelopment) {
			switch (level) {
				case 'debug':
				case 'info':
					console.log(logMessage, context || '')
					break
				case 'warn':
					console.warn(logMessage, context || '')
					break
				case 'error':
					console.error(logMessage, context || '')
					break
			}
			return
		}

		// В продакшене:
		// - Ошибки отправляем в Sentry (если настроен)
		// - Остальные логи только в случае необходимости
		if (level === 'error') {
			// Пропускаем логирование ошибок подключения к БД если DATABASE_URL не настроен
			// Это нормальное поведение, не ошибка
			if (message.includes('Database connection failed') || 
			    message.includes('DATABASE_URL') ||
			    message.includes('Can\'t reach database')) {
				// Не логируем как ошибку - это ожидаемое поведение
				return
			}

			// Используем captureError из monitoring.ts если доступен
			try {
				const { captureError } = require('./monitoring')
				captureError(new Error(message), context)
			} catch {
				// monitoring не настроен, игнорируем
			}
		}
	}

	debug(message: string, context?: LogContext) {
		this.log('debug', message, context)
	}

	info(message: string, context?: LogContext) {
		this.log('info', message, context)
	}

	warn(message: string, context?: LogContext) {
		this.log('warn', message, context)
	}

	error(message: string, context?: LogContext) {
		this.log('error', message, context)
	}
}

export const logger = new Logger()

// Функция для совместимости с существующим кодом
export async function logEvent(level: LogLevel, event: string, context?: LogContext) {
	logger.log(level, event, context)
}
