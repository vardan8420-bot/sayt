import { PrismaClient } from '@prisma/client'
import { withAccelerate } from '@prisma/extension-accelerate'

type PrismaClientWithAccelerate = ReturnType<typeof withAccelerate>
type ExtendedPrismaClient = ReturnType<typeof withAccelerate> extends PrismaClient
  ? ReturnType<typeof withAccelerate>
  : PrismaClient

// Валидация DATABASE_URL перед инициализацией
function validateDatabaseUrlBeforeInit(): { valid: boolean; error?: string } {
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
    return { valid: false, error: 'DATABASE_URL has invalid format (host:5432 without @)' }
  }

  // В продакшене не должно быть localhost
  if (process.env.NODE_ENV === 'production') {
    if (dbUrl.includes('@localhost:') || dbUrl.includes('@127.0.0.1:')) {
      return { valid: false, error: 'DATABASE_URL should not point to localhost in production' }
    }
  }

  return { valid: true }
}

const prismaClientSingleton = (): ExtendedPrismaClient => {
  // Проверяем валидность DATABASE_URL перед созданием клиента
  const validation = validateDatabaseUrlBeforeInit()
  
  // Создаем клиент с отложенным подключением, чтобы избежать ошибок при невалидном DATABASE_URL
  const client = new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
    errorFormat: 'minimal',
    // Отключаем автоматическое подключение при инициализации
    // Подключение будет происходить только при первом запросе
    datasources: {
      db: {
        url: validation.valid ? process.env.DATABASE_URL : undefined,
      },
    },
  })
  
  // Используем Accelerate только если настроен DIRECT_URL или PRISMA_ACCELERATE_URL
  if (process.env.PRISMA_ACCELERATE_URL || process.env.DIRECT_URL) {
    return client.$extends(withAccelerate()) as ExtendedPrismaClient
  }
  
  return client as ExtendedPrismaClient
}

declare global {
  var prisma: undefined | ExtendedPrismaClient
}

const prisma = globalThis.prisma ?? prismaClientSingleton()

export { prisma }
export default prisma

if (process.env.NODE_ENV !== 'production') globalThis.prisma = prisma

