# ⚡ Быстрый деплой за 5 минут

## 🎯 Самый простой способ (Vercel + Neon)

### 1. Подготовьте проект на GitHub (если еще не готово)

```bash
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin https://github.com/yourusername/sayt.git
git push -u origin main
```

### 2. Создайте базу данных на Neon (2 минуты)

1. Откройте https://neon.tech
2. Войдите через GitHub
3. Нажмите "Create Project"
4. Скопируйте connection string (DATABASE_URL)
5. Сохраните пароль!

### 3. Задеплойте на Vercel (3 минуты)

1. Откройте https://vercel.com
2. Войдите через GitHub
3. "Add New Project" → выберите репозиторий
4. Добавьте переменные окружения:
   ```
   DATABASE_URL=ваш-connection-string-из-neon
   NEXTAUTH_URL=https://your-project.vercel.app
   NEXTAUTH_SECRET=сгенерируйте-ниже
   ```
5. Нажмите "Deploy"

### 4. Сгенерируйте NEXTAUTH_SECRET

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
```

### 5. Примените миграции

После деплоя выполните локально:

```bash
# Установите DATABASE_URL от Neon
set DATABASE_URL=ваш-connection-string
npx prisma db push
```

### Готово! 🎉

Ваш сайт: `https://your-project.vercel.app`

---

## 💡 Советы

- Vercel автоматически деплоит каждый коммит
- Neon дает бесплатную базу данных навсегда
- Все бесплатно для личных проектов
- Нет ограничений по времени





