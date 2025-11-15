# Production Improvements Checklist

Список улучшений для продакшена, которые были сделаны и проверены.

## ✅ Исправлено для продакшена

### 1. **Hardcoded URLs**
- ✅ `lib/seo.ts` - использует `NEXTAUTH_URL` или `VERCEL_URL`
- ✅ `app/metadata.ts` - использует динамический baseUrl
- ✅ `app/robots.ts` - использует переменные окружения
- ✅ `app/sitemap.ts` - использует переменные окружения
- ✅ `app/product/[slug]/page.tsx` - убраны fallback на localhost
- ✅ `app/search/page.tsx` - убраны fallback на localhost

### 2. **Console.log в продакшене**
- ✅ `next.config.js` - `removeConsole: true` для продакшена
- ✅ `app/components/WebVitals.tsx` - console.log только в development
- ✅ Централизованный logger в `lib/logger.ts`

### 3. **CORS для продакшена**
- ✅ `next.config.js` - CORS настроен правильно:
  - Development: `*` (для удобства)
  - Production: `ALLOWED_ORIGINS` или `NEXTAUTH_URL` (безопасно)
  - Добавлен `Access-Control-Allow-Credentials`

### 4. **Prisma Accelerate**
- ✅ `lib/prisma.ts` - Accelerate используется только если настроен `PRISMA_ACCELERATE_URL` или `DIRECT_URL`
- ✅ Fallback на обычный Prisma Client если Accelerate не настроен

### 5. **Обработка ошибок БД**
- ✅ `app/api/products/route.ts` - graceful fallback при ошибках БД
- ✅ `app/api/recommendations/route.ts` - graceful fallback при ошибках БД
- ✅ Все API routes имеют try-catch блоки

### 6. **Валидация входных данных**
- ✅ Zod валидация для всех критичных API:
  - `/api/cart` - POST
  - `/api/cart/[itemId]` - PATCH
  - `/api/orders` - POST
  - `/api/reviews` - POST
  - `/api/favorites` - POST
  - `/api/notifications` - PATCH

### 7. **Мониторинг и логирование**
- ✅ Health check endpoint: `/api/health`
- ✅ Sentry интеграция: `lib/monitoring.ts`
- ✅ Централизованный logger: `lib/logger.ts`

### 8. **Безопасность**
- ✅ Security headers в `next.config.js`:
  - X-Frame-Options: SAMEORIGIN
  - X-Content-Type-Options: nosniff
  - Referrer-Policy
  - Permissions-Policy
  - Strict-Transport-Security (HSTS)
- ✅ Rate limiting для всех API endpoints
- ✅ Валидация всех входных данных (Zod)

### 9. **Error Handling**
- ✅ Error page: `app/error.tsx`
- ✅ 404 page: `app/not-found.tsx`
- ✅ Error Boundary: `app/components/ErrorBoundary.tsx`
- ✅ Error Boundary интегрирован в `app/layout.tsx`

### 10. **SEO**
- ✅ `app/sitemap.ts` - динамический URL
- ✅ `app/robots.ts` - динамический URL
- ✅ Metadata использует правильные URLs

## ⚠️ Что нужно настроить вручную

### 1. Environment Variables на Vercel

**Обязательные:**
```bash
DATABASE_URL=postgresql://...
NEXTAUTH_SECRET=<сгенерируйте: openssl rand -base64 32>
NEXTAUTH_URL=https://your-domain.vercel.app
```

**Рекомендуемые:**
```bash
STRIPE_SECRET_KEY=sk_live_...
STRIPE_WEBHOOK_SECRET=whsec_...
UPLOADTHING_SECRET=sk_live_...
UPSTASH_REDIS_REST_URL=https://...
UPSTASH_REDIS_REST_TOKEN=...
SENTRY_DSN=https://...
ALLOWED_ORIGINS=https://your-domain.vercel.app
```

### 2. Prisma Migrations

Применить миграции перед первым деплоем:
```bash
npx prisma migrate deploy
```

Или через Vercel:
```bash
# Добавить в build command:
npm run db:push
```

### 3. Database Connection

Убедитесь что:
- База данных создана и доступна
- `DATABASE_URL` настроен правильно
- Миграции применены
- Health check работает: `GET /api/health`

### 4. CORS (если нужны внешние запросы)

Настроить `ALLOWED_ORIGINS` в переменных окружения:
```bash
ALLOWED_ORIGINS=https://your-frontend.com,https://your-mobile-app.com
```

### 5. Rate Limiting (рекомендуется)

Для продакшена настроить Upstash Redis:
1. Создать аккаунт на upstash.com
2. Создать Redis базу данных
3. Добавить в `.env`:
   ```
   UPSTASH_REDIS_REST_URL=https://...
   UPSTASH_REDIS_REST_TOKEN=...
   ```

### 6. Error Monitoring (рекомендуется)

Настроить Sentry:
1. Создать проект на sentry.io
2. Добавить DSN в `.env`:
   ```
   SENTRY_DSN=https://...
   ```

## 🔍 Финальная проверка перед деплоем

1. ✅ Build успешно: `npm run build`
2. ✅ Тесты проходят: `npm run test:unit` (если есть)
3. ✅ Линтер проходит: `npm run lint`
4. ✅ Health check работает: `GET /api/health`
5. ✅ Все переменные окружения настроены
6. ✅ Миграции применены
7. ✅ CORS настроен правильно
8. ✅ Rate limiting работает
9. ✅ Error monitoring настроен (если используется)
10. ✅ SSL сертификат активен (автоматически на Vercel)

## 📝 Важные замечания

1. **Console.log** - автоматически удаляются в продакшене благодаря `removeConsole: true` в `next.config.js`

2. **Prisma Accelerate** - опционален. Если не настроен `PRISMA_ACCELERATE_URL`, используется обычный Prisma Client.

3. **CORS** - в продакшене по умолчанию разрешены только запросы с `NEXTAUTH_URL`. Если нужны внешние домены, настройте `ALLOWED_ORIGINS`.

4. **Rate Limiting** - работает даже без Upstash (in-memory), но для продакшена рекомендуется Upstash Redis.

5. **Error Monitoring** - опционален, но настоятельно рекомендуется для продакшена.

6. **Database** - убедитесь что база данных имеет автоматические бэкапы.

## 🚀 Готово к деплою

Все критичные проблемы для продакшена исправлены. Проект готов к развертыванию на Vercel.

После деплоя проверьте:
- ✅ Health check: `/api/health`
- ✅ Главная страница открывается
- ✅ Все страницы работают без ошибок
- ✅ API endpoints работают
- ✅ Нет ошибок в консоли браузера
- ✅ Логи в Vercel Dashboard чистые

