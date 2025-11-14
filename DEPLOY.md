# 🚀 Инструкция по развёртыванию на хостинге

Полное руководство по развёртыванию платформы Sayt на продакшен-хостинге.

## 📋 Подготовка

### 1. Требования к серверу

- **Node.js** >= 18.0.0
- **npm** >= 9.0.0
- **PostgreSQL** 16+ или доступ к облачной БД
- **Docker** и **Docker Compose** (опционально, для локальных сервисов)
- Минимум **2GB RAM**, **2 CPU cores** (рекомендуется 4GB RAM, 4 cores)

### 2. Подготовка переменных окружения

Скопируйте `.env.example` в `.env.production`:

```bash
cp .env.example .env.production
```

Заполните все обязательные переменные:

#### Обязательные переменные:

```bash
# База данных
DATABASE_URL="postgresql://user:password@host:5432/sayt"

# NextAuth
NEXTAUTH_SECRET="your-secret-key-here"  # Сгенерируйте: openssl rand -base64 32
NEXTAUTH_URL="https://yourdomain.com"

# Stripe (для платежей)
STRIPE_SECRET_KEY="sk_live_..."
STRIPE_PUBLISHABLE_KEY="pk_live_..."
STRIPE_WEBHOOK_SECRET="whsec_..."

# Meilisearch
MEILISEARCH_HOST="https://your-meilisearch-instance.com"
MEILISEARCH_MASTER_KEY="your-production-master-key"

# Окружение
NODE_ENV="production"
```

#### Опциональные переменные (для расширенного функционала):

- `GOOGLE_CLIENT_ID` / `GOOGLE_CLIENT_SECRET` - Google OAuth
- `GITHUB_CLIENT_ID` / `GITHUB_CLIENT_SECRET` - GitHub OAuth
- `OPENAI_API_KEY` - AI рекомендации и арбитраж
- `UPLOADTHING_SECRET` / `UPLOADTHING_APP_ID` - Загрузка файлов
- `SUPABASE_URL` / `SUPABASE_ANON_KEY` - Векторный поиск
- `UPSTASH_REDIS_REST_URL` / `UPSTASH_REDIS_REST_TOKEN` - Rate limiting
- `SENTRY_DSN` - Мониторинг ошибок
- `LOGTAIL_SOURCE_TOKEN` - Логирование

---

## 🐳 Вариант 1: Docker Compose (Простой способ)

### Шаги развёртывания:

1. **Клонируйте репозиторий:**

```bash
git clone https://github.com/yourusername/sayt.git
cd sayt
```

2. **Настройте переменные окружения:**

```bash
cp .env.example .env.production
# Отредактируйте .env.production
```

3. **Запустите сервисы (PostgreSQL, Meilisearch):**

```bash
docker-compose -f docker-compose.prod.yml up -d
```

4. **Примените миграции базы данных:**

```bash
npm install
npx prisma generate
npx prisma migrate deploy
```

5. **Соберите и запустите приложение:**

```bash
npm run build
npm start
```

Приложение будет доступно на порту 3000.

### Управление сервисами:

```bash
# Остановить
docker-compose -f docker-compose.prod.yml stop

# Запустить
docker-compose -f docker-compose.prod.yml start

# Перезапустить
docker-compose -f docker-compose.prod.yml restart

# Посмотреть логи
docker-compose -f docker-compose.prod.yml logs -f
```

---

## ☁️ Вариант 2: Vercel (Рекомендуется для Next.js)

### Шаги развёртывания:

1. **Подключите репозиторий к Vercel:**

   - Зайдите на [vercel.com](https://vercel.com)
   - Импортируйте ваш Git репозиторий
   - Выберите проект `sayt`

2. **Настройте переменные окружения:**

   В панели Vercel → Settings → Environment Variables добавьте все переменные из `.env.example`

3. **Настройте базу данных:**

   - Используйте Vercel Postgres или внешний PostgreSQL (например, Neon, Supabase)
   - Обновите `DATABASE_URL` в переменных окружения

4. **Настройте Meilisearch:**

   - Используйте облачный Meilisearch (например, Meilisearch Cloud)
   - Или используйте Railway/Render для отдельного инстанса

5. **Деплой:**

   - Vercel автоматически задеплоит при каждом push в main ветку
   - Или используйте кнопку "Deploy" в панели

### Преимущества Vercel:

- ✅ Автоматический HTTPS
- ✅ CDN для статических файлов
- ✅ Автоматические деплои из Git
- ✅ Preview deployments для PR
- ✅ Бесплатный тариф для старта

---

## 🖥️ Вариант 3: VPS (Ubuntu/Debian)

### Шаги развёртывания:

1. **Обновите систему:**

```bash
sudo apt update && sudo apt upgrade -y
```

2. **Установите Node.js:**

```bash
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt install -y nodejs
```

3. **Установите PostgreSQL:**

```bash
sudo apt install postgresql postgresql-contrib -y
sudo systemctl start postgresql
sudo systemctl enable postgresql
```

4. **Создайте базу данных:**

```bash
sudo -u postgres psql
CREATE DATABASE sayt;
CREATE USER sayt_user WITH PASSWORD 'your_secure_password';
GRANT ALL PRIVILEGES ON DATABASE sayt TO sayt_user;
\q
```

5. **Установите PM2 (процесс-менеджер):**

```bash
sudo npm install -g pm2
```

6. **Клонируйте и настройте проект:**

```bash
cd /var/www
git clone https://github.com/yourusername/sayt.git
cd sayt
npm install
cp .env.example .env.production
# Отредактируйте .env.production
```

7. **Настройте базу данных:**

```bash
npx prisma generate
npx prisma migrate deploy
```

8. **Соберите приложение:**

```bash
npm run build
```

9. **Запустите с PM2:**

```bash
pm2 start npm --name "sayt" -- start
pm2 save
pm2 startup
```

10. **Настройте Nginx (реверс-прокси):**

```nginx
server {
    listen 80;
    server_name yourdomain.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

11. **Установите SSL (Let's Encrypt):**

```bash
sudo apt install certbot python3-certbot-nginx -y
sudo certbot --nginx -d yourdomain.com
```

---

## 🔧 Настройка сервисов

### PostgreSQL (облачный вариант)

Рекомендуемые провайдеры:
- **Neon** (serverless PostgreSQL) - [neon.tech](https://neon.tech)
- **Supabase** (PostgreSQL + дополнительные сервисы) - [supabase.com](https://supabase.com)
- **Railway** - [railway.app](https://railway.app)

### Meilisearch (облачный вариант)

Рекомендуемые провайдеры:
- **Meilisearch Cloud** - [meilisearch.com](https://meilisearch.com)
- **Railway** - [railway.app](https://railway.app)
- **Render** - [render.com](https://render.com)

После создания инстанса обновите:
- `MEILISEARCH_HOST`
- `MEILISEARCH_MASTER_KEY`

### Индексация товаров в Meilisearch

После деплоя выполните индексацию:

```bash
# Локально или на сервере
npm run db:setup
# или создайте отдельный скрипт для индексации
```

---

## ✅ Проверка после деплоя

1. **Проверьте работу сайта:**
   - Откройте `https://yourdomain.com`
   - Убедитесь, что страницы загружаются

2. **Проверьте базу данных:**
   ```bash
   npx prisma studio
   ```

3. **Проверьте поиск:**
   - Попробуйте поискать товары
   - Убедитесь, что Meilisearch работает

4. **Проверьте аутентификацию:**
   - Зарегистрируйте тестового пользователя
   - Войдите в систему

5. **Проверьте платежи (если настроены):**
   - Используйте тестовые карты Stripe
   - Проверьте webhooks

---

## 🔒 Безопасность

1. **Измените все пароли по умолчанию**
2. **Используйте сильные секретные ключи:**
   ```bash
   openssl rand -base64 32  # Для NEXTAUTH_SECRET
   ```
3. **Настройте firewall:**
   ```bash
   sudo ufw allow 22
   sudo ufw allow 80
   sudo ufw allow 443
   sudo ufw enable
   ```
4. **Регулярно обновляйте зависимости:**
   ```bash
   npm audit fix
   ```

---

## 📊 Мониторинг

### Рекомендуемые инструменты:

- **Sentry** - мониторинг ошибок (настройте `SENTRY_DSN`)
- **Logtail** - централизованное логирование (настройте `LOGTAIL_SOURCE_TOKEN`)
- **Uptime Robot** - мониторинг доступности сайта
- **PM2 Monitoring** - мониторинг процессов на VPS

---

## 🔄 Обновление

### Vercel:
- Просто сделайте `git push` - автоматический деплой

### VPS (PM2):
```bash
cd /var/www/sayt
git pull
npm install
npx prisma generate
npx prisma migrate deploy
npm run build
pm2 restart sayt
```

---

## 🆘 Решение проблем

### База данных не подключается:
- Проверьте `DATABASE_URL`
- Убедитесь, что БД доступна с вашего сервера
- Проверьте firewall

### Meilisearch не работает:
- Проверьте `MEILISEARCH_HOST` и `MEILISEARCH_MASTER_KEY`
- Убедитесь, что сервис запущен
- Проверьте логи: `docker-compose logs meilisearch`

### Ошибки сборки:
- Проверьте версию Node.js: `node --version`
- Очистите кеш: `rm -rf .next node_modules && npm install`
- Проверьте логи: `npm run build`

---

## 📞 Поддержка

Если возникли проблемы:
1. Проверьте логи приложения
2. Проверьте документацию Next.js 16
3. Проверьте статус внешних сервисов

---

**Удачного деплоя! 🚀**
