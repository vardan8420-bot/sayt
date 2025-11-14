#!/usr/bin/env node

/**
 * Автоматическая миграция базы данных
 * Выполняется при каждом изменении схемы
 */

const { execSync } = require('child_process')
const fs = require('fs')
const path = require('path')
require('dotenv').config({ path: path.join(process.cwd(), '.env.local') })

const dbUrl = process.env.DATABASE_URL

if (!dbUrl || dbUrl.includes('username:password') || dbUrl.includes('localhost:5432/sayt')) {
  console.log('⚠️  DATABASE_URL не настроен, миграция пропущена')
  console.log('   Настройте DATABASE_URL в .env.local')
  process.exit(0)
}

// Устанавливаем DIRECT_URL если не задан (обычно равен DATABASE_URL)
if (!process.env.DIRECT_URL) {
  process.env.DIRECT_URL = dbUrl
}

console.log('🔄 Автоматическое применение изменений схемы...\n')

try {
  // Сначала пробуем migrate dev (создает миграции)
  execSync('npx prisma migrate dev --name auto_update', { stdio: 'inherit' })
  console.log('\n✅ Миграция выполнена успешно!')
} catch (error) {
  console.log('\n⚠️  Ошибка при migrate dev, пробую db:push...')
  try {
    // Если migrate не работает, используем db:push (для разработки)
    execSync('npx prisma db push', { stdio: 'inherit' })
    console.log('\n✅ Изменения применены через db:push!')
  } catch (pushError) {
    console.log('\n❌ Не удалось применить изменения')
    console.log('   Проверьте подключение к базе данных')
    process.exit(1)
  }
}

// Всегда генерируем Prisma Client
console.log('\n🔧 Генерация Prisma Client...')
try {
  execSync('npx prisma generate', { stdio: 'inherit' })
  console.log('\n✅ Prisma Client обновлен!')
} catch (error) {
  console.log('\n❌ Ошибка при генерации Prisma Client')
  process.exit(1)
}

