# 🚀 Быстрый старт: Загрузка на GitHub

## Вариант 1: Автоматическая настройка (рекомендуется)

### Windows (PowerShell):

```powershell
# Если у вас есть GitHub токен (опционально)
$env:GITHUB_TOKEN = "your_token_here"
.\scripts\setup-github.ps1 -GitHubUsername YOUR_USERNAME -RepoName sayt

# Или без токена (создадите репозиторий вручную)
.\scripts\setup-github.ps1 -GitHubUsername YOUR_USERNAME -RepoName sayt
```

### Linux/Mac (Bash):

```bash
# С правами на выполнение
chmod +x scripts/setup-github.sh
./scripts/setup-github.sh YOUR_USERNAME sayt

# Или с токеном
export GITHUB_TOKEN=your_token_here
./scripts/setup-github.sh YOUR_USERNAME sayt
```

---

## Вариант 2: Ручная настройка

### Шаг 1: Создайте репозиторий на GitHub

1. Зайдите на [https://github.com/new](https://github.com/new)
2. **Repository name:** `sayt` (или любое другое имя)
3. **Description:** "Modern Marketplace Platform"
4. Выберите **Public** или **Private**
5. **НЕ** ставьте галочку "Initialize with README" (у нас уже есть код)
6. Нажмите **Create repository**

### Шаг 2: Подключите репозиторий

После создания репозитория GitHub покажет инструкции. Используйте эти команды:

```bash
# Убедитесь, что вы в корне проекта
cd C:\Users\MSI\Desktop\sayt

# Настройте remote (замените YOUR_USERNAME на ваш username)
git remote add origin https://github.com/YOUR_USERNAME/sayt.git

# Или через SSH (если настроен)
git remote add origin git@github.com:YOUR_USERNAME/sayt.git
```

### Шаг 3: Загрузите код

```bash
# Переименуйте ветку в main (если нужно)
git branch -M main

# Загрузите код на GitHub
git push -u origin main
```

---

## После загрузки кода

### 1. Настройте GitHub Secrets

1. Зайдите в ваш репозиторий на GitHub
2. Перейдите в **Settings** → **Secrets and variables** → **Actions**
3. Нажмите **New repository secret** и добавьте:

**Обязательные:**
- `DATABASE_URL` - URL базы данных PostgreSQL
- `NEXTAUTH_SECRET` - Секретный ключ (сгенерируйте: `openssl rand -base64 32`)
- `NEXTAUTH_URL` - URL вашего сайта (например: `https://yourdomain.com`)

**Опциональные:**
- `MEILISEARCH_HOST` - URL Meilisearch
- `MEILISEARCH_MASTER_KEY` - Ключ Meilisearch
- `STRIPE_SECRET_KEY` - Stripe секретный ключ
- `STRIPE_PUBLISHABLE_KEY` - Stripe публичный ключ
- `VERCEL_TOKEN` - Токен Vercel (для деплоя)
- `VERCEL_ORG_ID` - ID организации Vercel
- `VERCEL_PROJECT_ID` - ID проекта Vercel

### 2. Проверьте GitHub Actions

1. Зайдите в раздел **Actions** вашего репозитория
2. Должен запуститься workflow **CI**
3. Дождитесь завершения всех проверок (✅ зелёная галочка)

### 3. Настройте Branch Protection (опционально)

1. Зайдите в **Settings** → **Branches**
2. Нажмите **Add rule**
3. В поле **Branch name pattern** введите: `main`
4. Включите:
   - ✅ Require a pull request before merging
   - ✅ Require status checks to pass before merging
     - Выберите: `lint`, `test`, `build`
   - ✅ Require branches to be up to date before merging
5. Нажмите **Create**

---

## Проверка работоспособности

После настройки:

1. **Проверьте Actions:**
   - Зайдите в **Actions** → **CI**
   - Все проверки должны пройти успешно (✅)

2. **Проверьте код:**
   ```bash
   git pull origin main
   git status
   ```

3. **Создайте тестовый коммит:**
   ```bash
   git commit --allow-empty -m "test: verify GitHub Actions"
   git push origin main
   ```
   
   - Проверьте, что workflow запустился в **Actions**

---

## Решение проблем

### Ошибка: "remote origin already exists"

```bash
# Удалите существующий remote
git remote remove origin

# Добавьте снова
git remote add origin https://github.com/YOUR_USERNAME/sayt.git
```

### Ошибка: "failed to push some refs"

```bash
# Получите изменения с GitHub (если репозиторий не пустой)
git pull origin main --allow-unrelated-histories

# Затем попробуйте снова
git push -u origin main
```

### Ошибка аутентификации

Если используете HTTPS, может потребоваться токен доступа:

1. Создайте токен: GitHub → Settings → Developer settings → Personal access tokens → Tokens (classic)
2. Используйте токен вместо пароля при push

Или настройте SSH:
```bash
# Генерируйте SSH ключ (если нет)
ssh-keygen -t ed25519 -C "your_email@example.com"

# Добавьте ключ в GitHub: Settings → SSH and GPG keys → New SSH key
```

---

## Дополнительная информация

- 📖 [GITHUB-SETUP.md](./GITHUB-SETUP.md) - Полная инструкция по настройке
- 📖 [DEPLOY.md](./DEPLOY.md) - Инструкция по деплою
- 📖 [README.md](./README.md) - Общая информация о проекте

---

**Готово! 🎉 Ваш проект теперь на GitHub!**

