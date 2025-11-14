# Настройка Маркетплейса - Полное Руководство

## ✅ Что уже настроено

### 1. ✅ Prisma - База данных
- Схема БД создана (`prisma/schema.prisma`)
- Модели: User, Product, Order, Category, Cart, Review, Message, Address
- Prisma Client настроен с Accelerate
- Файл: `lib/prisma.ts`

### 2. ✅ NextAuth - Аутентификация
- Конфигурация создана (`app/api/auth/[...nextauth]/route.ts`)
- Поддержка Credentials и Google OAuth
- Интеграция с Prisma
- Файлы: `lib/auth.ts`, `types/next-auth.d.ts`

### 3. ✅ Stripe - Платежи
- Конфигурация создана (`lib/stripe.ts`)
- Webhook для обработки платежей (`app/api/stripe/webhook/route.ts`)
- Функции для создания Payment Intent
- Обработка успешных и неудачных платежей

### 4. ✅ Meilisearch - Поиск
- Конфигурация создана (`lib/meilisearch.ts`)
- Функции для синхронизации товаров
- Функции для поиска
- Интеграция с индексом 'products'

### 5. ✅ UploadThing - Загрузка файлов
- Конфигурация создана (`app/api/uploadthing/core.ts`)
- Роутер для загрузки (`app/api/uploadthing/route.ts`)
- Типы для React компонентов (`lib/uploadthing.ts`)
- Поддержка: изображения товаров, аватары, документы

### 6. ✅ Escrow с AI-арбитражем
- Функции escrow созданы (`lib/escrow.ts`)
- AI-проверка условий освобождения платежей
- API роуты для управления escrow (`app/api/orders/[orderId]/escrow/route.ts`)
- Интеграция с Stripe для удержания платежей
- Fallback эвристика при отсутствии OpenAI API

### 7. ✅ AI-рекомендации товаров
- Функции рекомендаций созданы (`lib/recommendations.ts`)
- Векторные эмбеддинги для поиска похожих товаров
- API роут для получения рекомендаций (`app/api/recommendations/route.ts`)
- Поддержка Supabase для векторного поиска (опционально)
- Fallback на рекомендации по категориям
- Рекомендации похожих товаров

---

## 📋 Что нужно сделать

### Шаг 1: Настроить переменные окружения

Создайте файл `.env.local` на основе `.env.example.marketplace`:

```bash
cp .env.example.marketplace .env.local
```

Заполните все переменные:

#### База данных:
```env
DATABASE_URL="postgresql://user:password@localhost:5432/sayt?schema=public"
```

#### NextAuth:
```env
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="сгенерируйте-секретный-ключ"
GOOGLE_CLIENT_ID="ваш-google-client-id"
GOOGLE_CLIENT_SECRET="ваш-google-client-secret"
GITHUB_CLIENT_ID="ваш-github-client-id"
GITHUB_CLIENT_SECRET="ваш-github-client-secret"
```

#### Stripe:
```env
STRIPE_SECRET_KEY="sk_test_ваш-ключ"
STRIPE_PUBLISHABLE_KEY="pk_test_ваш-ключ"
STRIPE_WEBHOOK_SECRET="whsec_ваш-секрет"
```

#### Meilisearch:
```env
MEILISEARCH_HOST="http://localhost:7700"
MEILISEARCH_MASTER_KEY="ваш-мастер-ключ"
```

#### UploadThing:
```env
UPLOADTHING_SECRET="sk_live_ваш-секрет"
UPLOADTHING_APP_ID="ваш-app-id"
```

#### OpenAI (для AI-арбитража escrow и рекомендаций):
```env
OPENAI_API_KEY="sk-ваш-openai-api-key"
```

> **Примечание:** OpenAI API ключ нужен для:
> - AI-проверки условий освобождения escrow платежей
> - Генерации векторных эмбеддингов для рекомендаций товаров
> 
> Если ключ не указан, система будет использовать fallback методы.

#### Supabase (опционально, для векторного поиска):
```env
SUPABASE_URL="https://your-project.supabase.co"
SUPABASE_ANON_KEY="ваш-anon-key"
```

> **Примечание:** Supabase нужен для векторного поиска похожих товаров. Если не настроен, система будет использовать рекомендации на основе категорий.

---

### Шаг 2: Настроить базу данных

1. **Создайте PostgreSQL базу данных:**
   ```bash
   # Локально или используйте облачный сервис (Supabase, Neon, etc.)
   ```

2. **Запустите миграции:**
   ```bash
   npx prisma migrate dev --name init
   ```

3. **Сгенерируйте Prisma Client:**
   ```bash
   npx prisma generate
   ```

---

### Шаг 3: Настроить Meilisearch

1. **Установите Meilisearch локально:**
   ```bash
   # Docker
   docker run -d -p 7700:7700 getmeili/meilisearch:latest
   
   # Или используйте облачный сервер
   ```

2. **Создайте индекс:**
   ```typescript
   // В консоли или скрипте
   await meilisearch.createIndex('products', { primaryKey: 'id' })
   ```

---

### Шаг 4: Настроить Stripe

1. **Создайте аккаунт на https://stripe.com**
2. **Получите API ключи из Dashboard**
3. **Настройте Webhook:**
   - URL: `https://your-domain.com/api/stripe/webhook`
   - События: `payment_intent.succeeded`, `payment_intent.payment_failed`

---

### Шаг 5: Настроить UploadThing

1. **Создайте аккаунт на https://uploadthing.com**
2. **Создайте приложение**
3. **Получите API ключи**

---

## 🚀 Использование

### Prisma

```typescript
import { prisma } from '@/lib/prisma'

// Создать пользователя
const user = await prisma.user.create({
  data: {
    email: 'user@example.com',
    name: 'User Name',
  },
})

// Получить товары
const products = await prisma.product.findMany({
  include: { category: true, seller: true },
})
```

### NextAuth

```typescript
import { getCurrentUser } from '@/lib/auth'

// Получить текущего пользователя
const user = await getCurrentUser()

// Требовать аутентификации
const user = await requireAuth()

// Требовать роль
const admin = await requireRole('ADMIN')
```

### Stripe

```typescript
import { createPaymentIntent } from '@/lib/stripe'

// Создать платеж
const paymentIntent = await createPaymentIntent(100.00, 'usd')
```

### Meilisearch

```typescript
import { searchProducts, syncProductToSearch } from '@/lib/meilisearch'

// Поиск товаров
const results = await searchProducts('laptop', 20)

// Синхронизировать товар
await syncProductToSearch(product)
```

### UploadThing

```typescript
import { UploadButton, UploadDropzone } from '@/lib/uploadthing'

// В компоненте
<UploadButton
  endpoint="productImage"
  onClientUploadComplete={(res) => {
    console.log('Files: ', res)
  }}
/>
```

---

## 📁 Структура файлов

```
prisma/
└── schema.prisma          ✅ Схема БД

lib/
├── prisma.ts              ✅ Prisma Client
├── auth.ts                ✅ Функции аутентификации
├── stripe.ts              ✅ Stripe конфигурация
├── escrow.ts              ✅ Escrow с AI-арбитражем
├── recommendations.ts     ✅ AI-рекомендации товаров
├── meilisearch.ts         ✅ Meilisearch конфигурация
├── uploadthing.ts         ✅ UploadThing типы
├── schemas.ts             ✅ Zod схемы валидации
└── utils.ts               ✅ Утилиты (slug, форматирование)

app/api/
├── auth/
│   └── [...nextauth]/
│       └── route.ts       ✅ NextAuth роутер
├── products/
│   └── route.ts           ✅ CRUD товаров
├── orders/
│   └── [orderId]/
│       └── escrow/
│           ├── route.ts   ✅ Управление escrow
│           └── release/
│               └── route.ts ✅ Освобождение escrow
├── recommendations/
│   └── route.ts           ✅ AI-рекомендации
├── stripe/
│   └── webhook/
│       └── route.ts       ✅ Stripe webhook
└── uploadthing/
    ├── route.ts           ✅ UploadThing роутер
    └── core.ts             ✅ UploadThing конфигурация

types/
└── next-auth.d.ts         ✅ Типы NextAuth
```

---

## ✅ Проверка

После настройки проверьте:

1. **База данных:**
   ```bash
   npx prisma studio
   ```

2. **NextAuth:**
   - Откройте `/api/auth/signin`
   - Попробуйте войти

3. **Stripe:**
   - Создайте тестовый Payment Intent
   - Проверьте webhook

4. **Meilisearch:**
   - Проверьте подключение
   - Попробуйте поиск

5. **UploadThing:**
   - Попробуйте загрузить файл
   - Проверьте в Dashboard

---

## 🎉 Готово!

Все функции маркетплейса настроены и готовы к использованию!

### Что работает:
- ✅ База данных (Prisma + PostgreSQL)
- ✅ Аутентификация (NextAuth)
- ✅ Платежи (Stripe с escrow)
- ✅ Поиск (Meilisearch)
- ✅ Загрузка файлов (UploadThing)
- ✅ AI-рекомендации (OpenAI + Supabase)
- ✅ AI-арбитраж escrow (OpenAI)

### Следующие шаги:
1. Следуйте [SETUP-COMPLETE.md](./SETUP-COMPLETE.md) для полной настройки
2. Настройте переменные окружения из [ENV-EXAMPLE.md](./ENV-EXAMPLE.md)
3. Запустите `npm run dev` и начните разработку!

