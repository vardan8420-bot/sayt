# 🌐 Быстрый деплой сайта онлайн

## ✅ Всё готово для деплоя!

Ваш сайт готов к деплою. Используйте один из способов ниже:

---

## 🚀 Способ 1: Vercel (Рекомендуется - самый простой!)

Vercel - лучший выбор для Next.js приложений. **Бесплатный хостинг** с автоматическим деплоем!

### Шаг 1: Подключите GitHub к Vercel

1. **Откройте:** https://vercel.com/new
2. **Нажмите:** "Continue with GitHub" (или войдите через GitHub)
3. **Нажмите:** "Import Git Repository"
4. **Найдите и выберите:** `vardan84/sayt`
5. **Нажмите:** "Import"

### Шаг 2: Настройте проект

Vercel автоматически определит Next.js:
- ✅ Framework: Next.js
- ✅ Build Command: `npm run build`
- ✅ Output Directory: `.next`
- ✅ Install Command: `npm install`

**Нажмите:** "Deploy" (или "Continue" → "Deploy")

### Шаг 3: Настройте переменные окружения

После первого деплоя (он может упасть без переменных):

1. **Откройте проект на Vercel**
2. **Settings** → **Environment Variables**
3. **Добавьте переменные:**

**Минимальные для работы:**
```
DATABASE_URL=postgresql://user:password@host:5432/sayt
NEXTAUTH_SECRET=сгенерируйте_ключ_openssl_rand_base64_32
NEXTAUTH_URL=https://ваш-проект.vercel.app
NODE_ENV=production
```

**Для полного функционала добавьте:**
```
MEILISEARCH_HOST=https://your-meilisearch.com
MEILISEARCH_MASTER_KEY=your_key
STRIPE_SECRET_KEY=sk_live_...
STRIPE_PUBLISHABLE_KEY=pk_live_...
GOOGLE_CLIENT_ID=...
GOOGLE_CLIENT_SECRET=...
GITHUB_CLIENT_ID=...
GITHUB_CLIENT_SECRET=...
OPENAI_API_KEY=...
```

4. **Перезапустите деплой:** Deployments → ⋯ → Redeploy

### Шаг 4: Готово! 🎉

Ваш сайт будет доступен по адресу:
- `https://ваш-проект.vercel.app`
- Vercel автоматически настроит HTTPS

---

## 🐳 Способ 2: Docker + VPS

Если у вас есть VPS сервер:

### Шаг 1: Подключите сервер по SSH

```bash
ssh user@your-server.com
```

### Шаг 2: Клонируйте репозиторий

```bash
git clone https://github.com/vardan84/sayt.git
cd sayt
```

### Шаг 3: Настройте переменные окружения

```bash
cp .env.example .env.production
nano .env.production  # Заполните все переменные
```

### Шаг 4: Запустите Docker Compose

```bash
docker-compose -f docker-compose.prod.yml up -d
```

Или используйте `docker-compose.prod.yml` из проекта.

---

## 📦 Способ 3: Ручной деплой на VPS

### Шаг 1: Установите зависимости на сервере

```bash
# Установите Node.js 20+
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs

# Установите PostgreSQL
sudo apt-get install postgresql postgresql-contrib

# Установите зависимости проекта
npm install
```

### Шаг 2: Настройте базу данных

```bash
# Создайте базу данных
sudo -u postgres createdb sayt

# Настройте .env.production
cp .env.example .env.production
nano .env.production
```

### Шаг 3: Запустите миграции

```bash
npx prisma migrate deploy
npx prisma generate
```

### Шаг 4: Соберите и запустите

```bash
npm run build
npm start
```

Или используйте PM2 для постоянной работы:

```bash
npm install -g pm2
pm2 start npm --name "sayt" -- start
pm2 save
pm2 startup
```

---

## ✅ Чеклист после деплоя:

- [ ] Сайт доступен по URL
- [ ] HTTPS работает (автоматически на Vercel)
- [ ] Переменные окружения настроены
- [ ] База данных подключена
- [ ] API работают
- [ ] GitHub Actions настроены (CI/CD)
- [ ] Домен подключён (опционально)

---

## 🔗 Полезные ссылки:

- **Vercel:** https://vercel.com
- **Vercel Dashboard:** https://vercel.com/dashboard
- **Документация Vercel:** https://vercel.com/docs
- **Документация Next.js:** https://nextjs.org/docs

---

**Выберите способ выше и ваш сайт будет онлайн через 5-10 минут! 🚀**

