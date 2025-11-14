# 🚀 Быстрый старт

## 1. Настройка базы данных

### Автоматическая настройка (рекомендуется):

```bash
npm run db:setup
```

Этот скрипт:
- Создаст `.env.local` из `.env.example`
- Проверит настройки
- Выполнит миграции
- Сгенерирует Prisma Client

### Ручная настройка:

1. **Создайте `.env.local`**:
   ```bash
   # Windows
   Copy-Item .env.example .env.local
   
   # Linux/Mac
   cp .env.example .env.local
   ```

2. **Настройте `DATABASE_URL`** в `.env.local`:
   - Используйте Supabase, Neon или локальный PostgreSQL
   - См. подробности в `DATABASE-SETUP.md`

3. **Выполните миграцию**:
   ```bash
   npm run db:migrate
   ```

## 2. Настройка аутентификации (опционально)

### GitHub OAuth:
1. Создайте OAuth App: https://github.com/settings/developers
2. Добавьте в `.env.local`:
   ```env
   GITHUB_CLIENT_ID="ваш-id"
   GITHUB_CLIENT_SECRET="ваш-secret"
   ```

### NextAuth Secret:
Сгенерируйте секретный ключ:
```bash
# Windows PowerShell
[Convert]::ToBase64String([System.Text.Encoding]::UTF8.GetBytes([System.Guid]::NewGuid().ToString()))

# Linux/Mac
openssl rand -base64 32
```

Добавьте в `.env.local`:
```env
NEXTAUTH_SECRET="сгенерированный-ключ"
```

## 3. Запуск проекта

```bash
npm run dev
```

Откройте http://localhost:3000

## 📚 Дополнительная документация

- `DATABASE-SETUP.md` - Подробная настройка базы данных
- `MARKETPLACE-SETUP.md` - Настройка всех сервисов
- `GITHUB-AUTH-SETUP.md` - Настройка GitHub OAuth

## ✅ Проверка

После настройки проверьте:

```bash
# Откройте Prisma Studio (визуальный редактор БД)
npm run db:studio

# Проверьте типы
npm run type-check

# Запустите проект
npm run dev
```

## 🆘 Проблемы?

См. раздел "Проблемы" в `DATABASE-SETUP.md`

