#!/usr/bin/env node

/**
 * Скрипт для помощи в настройке базы данных
 */

const fs = require('fs')
const path = require('path')
const { execSync } = require('child_process')

console.log('🚀 Настройка базы данных для Sayt\n')

// Проверка существования .env.local
const envLocalPath = path.join(process.cwd(), '.env.local')
const envExamplePath = path.join(process.cwd(), '.env.example')

if (!fs.existsSync(envLocalPath)) {
  console.log('📝 Создание .env.local...')
  if (fs.existsSync(envExamplePath)) {
    fs.copyFileSync(envExamplePath, envLocalPath)
    console.log('✅ Файл .env.local создан из .env.example\n')
  } else {
    // Создаем базовый .env.local если .env.example не существует
    const defaultEnv = `# База данных PostgreSQL
DATABASE_URL="postgresql://username:password@localhost:5432/sayt?schema=public"

# NextAuth
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="change-this-to-a-random-secret-key"

# GitHub OAuth
GITHUB_CLIENT_ID=""
GITHUB_CLIENT_SECRET=""

# Google OAuth (опционально)
GOOGLE_CLIENT_ID=""
GOOGLE_CLIENT_SECRET=""
`
    fs.writeFileSync(envLocalPath, defaultEnv)
    console.log('✅ Файл .env.local создан с базовыми настройками\n')
  }
  console.log('⚠️  ВАЖНО: Откройте .env.local и настройте DATABASE_URL!')
  console.log('   См. DATABASE-SETUP.md для инструкций\n')
} else {
  console.log('✅ Файл .env.local уже существует\n')
}

// Проверка DATABASE_URL
let dbUrlConfigured = false
try {
  require('dotenv').config({ path: envLocalPath })
  const dbUrl = process.env.DATABASE_URL
  
  if (dbUrl && !dbUrl.includes('username:password') && !dbUrl.includes('localhost:5432/sayt')) {
    dbUrlConfigured = true
    console.log('✅ DATABASE_URL настроен\n')
  } else {
    console.log('⚠️  DATABASE_URL не настроен или использует значения по умолчанию')
    console.log('   Пожалуйста, настройте DATABASE_URL в .env.local')
    console.log('   См. DATABASE-SETUP.md для инструкций\n')
  }
} catch (error) {
  console.log('⚠️  Не удалось проверить DATABASE_URL')
  console.log('   Убедитесь, что установлен dotenv: npm install dotenv\n')
}

// Проверка миграций
const migrationsPath = path.join(process.cwd(), 'prisma', 'migrations')
const hasMigrations = fs.existsSync(migrationsPath) && 
  fs.readdirSync(migrationsPath).length > 0

if (dbUrlConfigured) {
  if (!hasMigrations) {
    console.log('📦 Выполнение первой миграции...')
    try {
      execSync('npx prisma migrate dev --name init', { stdio: 'inherit' })
      console.log('\n✅ Миграция выполнена успешно!\n')
    } catch (error) {
      console.log('\n⚠️  Ошибка при выполнении миграции, пробую db:push...')
      try {
        execSync('npx prisma db push', { stdio: 'inherit' })
        console.log('\n✅ Изменения применены через db:push!\n')
      } catch (pushError) {
        console.log('\n❌ Не удалось применить изменения')
        console.log('   Проверьте DATABASE_URL и убедитесь, что база данных доступна\n')
      }
    }
  } else {
    console.log('📦 Проверка изменений схемы и применение миграций...')
    try {
      execSync('npx prisma migrate dev', { stdio: 'inherit' })
      console.log('\n✅ Миграции применены!\n')
    } catch (error) {
      console.log('\n⚠️  Ошибка при миграции, пробую db:push...')
      try {
        execSync('npx prisma db push', { stdio: 'inherit' })
        console.log('\n✅ Изменения применены через db:push!\n')
      } catch (pushError) {
        console.log('\n⚠️  Не удалось применить изменения автоматически\n')
      }
    }
  }
} else {
  console.log('⏭️  Пропуск миграции (DATABASE_URL не настроен)\n')
}

// Генерация Prisma Client
console.log('🔧 Генерация Prisma Client...')
try {
  execSync('npx prisma generate', { stdio: 'inherit' })
  console.log('\n✅ Prisma Client сгенерирован!\n')
} catch (error) {
  console.log('\n❌ Ошибка при генерации Prisma Client\n')
  process.exit(1)
}

console.log('🎉 Настройка завершена!')
console.log('\nСледующие шаги:')
console.log('1. Убедитесь, что DATABASE_URL правильно настроен в .env.local')
console.log('2. Запустите: npm run dev')
console.log('3. Откройте Prisma Studio: npm run db:studio')

