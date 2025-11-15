// Утилиты для продакшена

/**
 * Получить базовый URL приложения
 */
export function getBaseUrl(): string {
  // NEXTAUTH_URL имеет приоритет
  if (process.env.NEXTAUTH_URL) {
    return process.env.NEXTAUTH_URL
  }
  
  // VERCEL_URL автоматически устанавливается Vercel
  if (process.env.VERCEL_URL) {
    return `https://${process.env.VERCEL_URL}`
  }
  
  // Fallback для продакшена
  if (process.env.NODE_ENV === 'production') {
    return 'https://sayt.vercel.app'
  }
  
  // Development fallback
  return 'http://localhost:3000'
}

/**
 * Проверить, является ли окружение продакшеном
 */
export function isProduction(): boolean {
  return process.env.NODE_ENV === 'production'
}

/**
 * Проверить, является ли окружение разработкой
 */
export function isDevelopment(): boolean {
  return process.env.NODE_ENV === 'development'
}

/**
 * Безопасно получить переменную окружения с fallback
 */
export function getEnv(key: string, fallback?: string): string {
  const value = process.env[key]
  if (!value && fallback === undefined) {
    if (isProduction()) {
      throw new Error(`Required environment variable ${key} is not set`)
    }
    return ''
  }
  return value || fallback || ''
}

/**
 * Генерация slug из строки
 */
export function generateSlug(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // Удаляем диакритические знаки
    .replace(/[^\w\s-]/g, '') // Удаляем спецсимволы
    .replace(/[\s_]+/g, '-') // Заменяем пробелы и подчеркивания на дефисы
    .replace(/--+/g, '-') // Удаляем множественные дефисы
    .replace(/^-+/, '') // Удаляем дефисы в начале
    .replace(/-+$/, '') // Удаляем дефисы в конце
}
