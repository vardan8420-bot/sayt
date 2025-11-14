# Настройка Базы Данных

## 🚀 Быстрый старт

### Шаг 1: Создайте файл `.env.local`

Скопируйте `.env.example` в `.env.local`:

```bash
# Windows PowerShell
Copy-Item .env.example .env.local

# Linux/Mac
cp .env.example .env.local
```

### Шаг 2: Настройте DATABASE_URL

Выберите один из вариантов:

#### Вариант 1: Supabase (Рекомендуется - бесплатно)

1. Перейдите на https://supabase.com
2. Создайте аккаунт и новый проект
3. В настройках проекта найдите "Database" → "Connection string"
4. Скопируйте строку подключения (URI)
5. Вставьте в `.env.local`:
   ```env
   DATABASE_URL="postgresql://postgres:[YOUR-PASSWORD]@db.[YOUR-PROJECT].supabase.co:5432/postgres"
   ```

#### Вариант 2: Neon (Бесплатно)

1. Перейдите на https://neon.tech
2. Создайте аккаунт и новый проект
3. Скопируйте connection string
4. Вставьте в `.env.local`

#### Вариант 3: Локальный PostgreSQL

1. Установите PostgreSQL: https://www.postgresql.org/download/
2. Создайте базу данных:
   ```sql
   CREATE DATABASE sayt;
   ```
3. В `.env.local` укажите:
   ```env
   DATABASE_URL="postgresql://postgres:yourpassword@localhost:5432/sayt?schema=public"
   ```

#### Вариант 4: Docker Compose (PostgreSQL + Meilisearch)

Если не хотите ставить PostgreSQL и Meilisearch вручную, используйте готовый `docker-compose.yml` в корне проекта:

```bash
# Запуск обоих сервисов в фоне
docker compose up -d postgres meilisearch

# Просмотр логов конкретного сервиса
docker compose logs -f postgres
docker compose logs -f meilisearch
```

После старта:

- строка подключения к базе:

  ```env
  DATABASE_URL="postgresql://postgres:postgres123@localhost:5433/sayt?schema=public"
  ```

- доступ к Meilisearch:

  ```env
  MEILISEARCH_HOST="http://localhost:7700"
  MEILISEARCH_MASTER_KEY="masterKeyChangeMe"
  ```

> При необходимости замените пароли/ключи в `docker-compose.yml` и `.env.local`.

### Шаг 3: Сгенерируйте NEXTAUTH_SECRET

```bash
# Windows PowerShell
[Convert]::ToBase64String([System.Text.Encoding]::UTF8.GetBytes([System.Guid]::NewGuid().ToString()))

# Linux/Mac
openssl rand -base64 32
```

Вставьте результат в `.env.local` в поле `NEXTAUTH_SECRET`.

### Шаг 4: Выполните миграцию

```bash
npm run db:migrate
```

Эта команда:
- Создаст все таблицы в базе данных
- Применит схему из `prisma/schema.prisma`

### Шаг 5: Проверьте подключение

```bash
npm run db:studio
```

Откроется Prisma Studio - визуальный редактор базы данных.

## ✅ Проверка

После настройки проверьте:

1. **Файл `.env.local` существует** и содержит `DATABASE_URL`
2. **Миграции выполнены**: `prisma/migrations/` содержит файлы
3. **Prisma Client работает**: нет ошибок при запуске `npm run dev`

## 🔧 Полезные команды

```bash
# Создать новую миграцию
npm run db:migrate

# Применить изменения без миграции (только для разработки)
npm run db:push

# Сгенерировать Prisma Client
npm run db:generate

# Открыть Prisma Studio
npm run db:studio
```

## 🆘 Проблемы?

### Ошибка: "Can't reach database server"
- Проверьте, что база данных запущена
- Проверьте правильность `DATABASE_URL`
- Проверьте firewall/сетевые настройки

### Ошибка: "Database does not exist"
- Создайте базу данных вручную
- Или используйте облачный сервис (Supabase/Neon)

### Ошибка: "Migration failed"
- Удалите папку `prisma/migrations` (если пустая)
- Выполните `npm run db:migrate` заново

