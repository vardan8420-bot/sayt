# Настройка переменных окружения на Vercel

## Проблема

Если вы видите ошибки в логах Vercel:
```
Error [PrismaClientInitializationError]: Can't reach database server at `host:5432`
```

Это означает, что `DATABASE_URL` не настроен правильно на Vercel.

## Решение

### Шаг 1: Добавить DATABASE_URL в Vercel

1. Откройте проект в **Vercel Dashboard**
2. Перейдите в **Settings** → **Environment Variables**
3. Нажмите **Add New**
4. Добавьте переменную:
   - **Key:** `DATABASE_URL`
   - **Value:** Ваш connection string (см. ниже)
   - **Environment:** Выберите все три: `Production`, `Preview`, `Development`

### Шаг 2: Получить правильный DATABASE_URL

#### Вариант A: Vercel Storage (Neon) - Рекомендуется

1. В Vercel Dashboard откройте проект
2. Перейдите в **Storage**
3. Нажмите **Create Database**
4. Выберите **Neon** (PostgreSQL)
5. Создайте базу данных
6. **DATABASE_URL будет автоматически добавлен** в Environment Variables

#### Вариант B: Внешняя база данных

**Supabase:**
1. Создайте проект на [supabase.com](https://supabase.com)
2. Перейдите в **Settings** → **Database**
3. Скопируйте **Connection String** (URI)
4. Добавьте в Vercel как `DATABASE_URL`

**Railway:**
1. Создайте PostgreSQL базу на [railway.app](https://railway.app)
2. Скопируйте **DATABASE_URL** из переменных окружения
3. Добавьте в Vercel

**Другой провайдер:**
- Формат должен быть: `postgresql://user:password@host:port/database?sslmode=require`
- Убедитесь что включает `?sslmode=require` для продакшена

### Шаг 3: Применить миграции

После добавления `DATABASE_URL`:

```bash
# Локально (если у вас есть доступ)
vercel env pull
npx prisma migrate deploy

# Или через Vercel Dashboard:
# Settings → Environment Variables → Redeploy
```

### Шаг 4: Проверить

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
       "databaseConfig": "ok"
     }
   }
   ```

2. **Проверить логи:**
   - Откройте **Vercel Dashboard** → **Deployments** → выберите последний деплой → **Functions Logs**
   - Не должно быть ошибок `P1001` или `PrismaClientInitializationError`

## Важные моменты

### Формат DATABASE_URL

✅ **Правильный формат:**
```
postgresql://user:password@host.neon.tech/dbname?sslmode=require
postgresql://user:password@db.supabase.co:5432/postgres?sslmode=require
```

❌ **Неправильный формат:**
```
host:5432  // Нет префикса postgresql://
postgresql://host:5432  // Нет пользователя/пароля
postgresql://user@localhost:5432  // localhost в продакшене
```

### Проверка переменных окружения

Убедитесь что переменные добавлены для всех окружений:
- ✅ **Production** - основной деплой
- ✅ **Preview** - preview deployments
- ✅ **Development** - локальная разработка

### Перезапуск после изменений

После добавления/изменения `DATABASE_URL`:
1. Перейдите в **Deployments**
2. Найдите последний деплой
3. Нажмите **...** → **Redeploy**
4. Или сделайте новый коммит/пуш в репозиторий

## Другие переменные окружения

Помимо `DATABASE_URL`, убедитесь что настроены:

### Обязательные:
- `NEXTAUTH_SECRET` - сгенерируйте: `openssl rand -base64 32`
- `NEXTAUTH_URL` - URL вашего приложения: `https://your-app.vercel.app`

### Рекомендуемые (опционально):
- `STRIPE_SECRET_KEY` - для платежей
- `UPSTASH_REDIS_REST_URL` - для rate limiting
- `SENTRY_DSN` - для мониторинга ошибок
- `ALLOWED_ORIGINS` - для CORS (если нужны внешние запросы)

### OAuth провайдеры (если используются):
- `GOOGLE_CLIENT_ID` / `GOOGLE_CLIENT_SECRET`
- `GITHUB_CLIENT_ID` / `GITHUB_CLIENT_SECRET`

**Примечание:** Ошибки `client_id is required` для OAuth означают что OAuth провайдеры не настроены, но это не критично - приложение может работать без них.

## Troubleshooting

### Ошибка: "Can't reach database server at `host:5432`"

**Причина:** `DATABASE_URL` содержит неправильный формат или не настроен.

**Решение:**
1. Проверьте что `DATABASE_URL` добавлен в Vercel Environment Variables
2. Убедитесь что формат правильный: `postgresql://user:password@host/dbname`
3. Проверьте что база данных доступна извне (не localhost)
4. Убедитесь что используется правильный URL (скопирован полностью)

### Ошибка: "SSL connection required"

**Причина:** База данных требует SSL.

**Решение:** Добавьте `?sslmode=require` в конец `DATABASE_URL`

### Ошибка: "Connection timeout"

**Причина:** База данных недоступна или firewall блокирует.

**Решение:**
1. Проверьте что база данных запущена
2. Проверьте firewall/security groups на провайдере БД
3. Убедитесь что база данных позволяет подключения из Vercel IPs

## После настройки

После правильной настройки `DATABASE_URL`:
- ✅ Ошибки `P1001` исчезнут из логов
- ✅ Health check вернет `"database": "ok"`
- ✅ API endpoints будут работать корректно
- ✅ Приложение будет полностью функционально

