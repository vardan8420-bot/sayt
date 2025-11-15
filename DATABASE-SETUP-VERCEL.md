# Настройка базы данных на Vercel

## Проблема

Если вы видите ошибки в логах Vercel:
```
Error [PrismaClientInitializationError]: Can't reach database server at `host:5432`
```

Это означает, что `DATABASE_URL` не настроен или настроен неправильно на Vercel.

## Решение

### Вариант 1: Использование Vercel Storage (Neon)

1. **Создайте базу данных через Vercel Dashboard:**
   - Откройте проект в Vercel Dashboard
   - Перейдите в раздел **Storage**
   - Нажмите **Create Database**
   - Выберите **Neon** (PostgreSQL)
   - Создайте базу данных

2. **Примените миграции:**
   ```bash
   # Локально
   npx prisma migrate deploy
   
   # Или через Vercel CLI
   vercel env pull
   npx prisma migrate deploy
   ```

3. **Проверьте переменные окружения:**
   - `DATABASE_URL` должен автоматически добавиться в переменные окружения
   - Убедитесь что он выглядит примерно так:
     ```
     postgresql://user:password@host.neon.tech/dbname?sslmode=require
     ```

### Вариант 2: Использование внешней базы данных (Supabase, Railway, etc.)

1. **Создайте базу данных** на выбранном провайдере
2. **Скопируйте connection string** (DATABASE_URL)
3. **Добавьте в Vercel Environment Variables:**
   - Откройте проект в Vercel Dashboard
   - Перейдите в **Settings** → **Environment Variables**
   - Добавьте:
     - **Name:** `DATABASE_URL`
     - **Value:** `postgresql://user:password@host:5432/dbname?sslmode=require`
     - **Environment:** `Production`, `Preview`, `Development` (все три)

4. **Примените миграции:**
   ```bash
   vercel env pull
   npx prisma migrate deploy
   ```

### Вариант 3: Временное решение (без БД)

Приложение может работать без базы данных, но с ограниченным функционалом:
- Главная страница будет работать
- Товары будут недоступны
- Авторизация будет работать только с OAuth (если настроены)

## Проверка настройки

После настройки `DATABASE_URL`, проверьте:

1. **Health Check:**
   ```bash
   curl https://your-app.vercel.app/api/health
   ```
   
   Ожидаемый ответ:
   ```json
   {
     "status": "healthy",
     "checks": {
       "database": "ok",
       "databaseConfig": "ok",
       "api": "ok"
     }
   }
   ```

2. **Проверка продуктов:**
   ```bash
   curl https://your-app.vercel.app/api/products
   ```
   
   Должен вернуть пустой массив (если нет товаров) или массив товаров.

## Важные моменты

1. **Формат DATABASE_URL:**
   - Должен начинаться с `postgresql://` или `postgres://`
   - В продакшене не должен содержать `localhost` или `127.0.0.1`
   - Должен включать SSL параметры: `?sslmode=require`

2. **Миграции:**
   - Примените миграции после первого деплоя:
     ```bash
     npx prisma migrate deploy
     ```
   - Или добавьте в `package.json`:
     ```json
     {
       "scripts": {
         "postbuild": "prisma migrate deploy"
       }
     }
     ```

3. **Connection Pooling:**
   - Для Neon используйте connection pooling URL (если предоставляется)
   - Формат: `postgresql://...?pgbouncer=true&sslmode=require`

4. **Проверка переменных окружения:**
   - Убедитесь что `DATABASE_URL` добавлен для всех окружений:
     - Production
     - Preview
     - Development

## Ошибки и решения

### Ошибка: "Can't reach database server at `host:5432`"

**Причина:** `DATABASE_URL` не настроен или содержит неправильное значение.

**Решение:**
1. Проверьте что `DATABASE_URL` добавлен в Vercel Environment Variables
2. Убедитесь что значение правильное (скопировано полностью)
3. Проверьте что база данных запущена и доступна
4. Убедитесь что используется правильный URL (не localhost)

### Ошибка: "SSL connection required"

**Причина:** База данных требует SSL, но в URL не указан параметр.

**Решение:** Добавьте `?sslmode=require` в конец `DATABASE_URL`

### Ошибка: "Connection timeout"

**Причина:** База данных недоступна или неправильный хост.

**Решение:**
1. Проверьте что база данных запущена
2. Проверьте что хост правильный
3. Проверьте firewall/security groups

## После настройки

После правильной настройки `DATABASE_URL`:

1. ✅ Ошибки подключения к БД исчезнут из логов
2. ✅ Health check будет возвращать `"database": "ok"`
3. ✅ API endpoints будут работать корректно
4. ✅ Приложение будет полностью функционально

## Мониторинг

Следите за логами в Vercel Dashboard:
- Если видите `P1001` ошибки - БД недоступна
- Если видите `P1012` ошибки - проблема с подключением
- Если health check возвращает `"database": "error"` - проверьте `DATABASE_URL`

