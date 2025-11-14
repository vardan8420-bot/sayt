# 🚀 Загрузка на GitHub - Простая инструкция

## ✅ Что уже готово:

1. ✅ Git репозиторий инициализирован
2. ✅ Первый коммит создан (159 файлов, 26860 строк кода)
3. ✅ GitHub Actions workflows настроены
4. ✅ Шаблоны Issues и PR созданы
5. ✅ Dependabot настроен
6. ✅ Вся документация готова

## 📋 Что нужно сделать (3 простых шага):

### Шаг 1: Создайте репозиторий на GitHub

**Вариант A: Через веб-интерфейс (2 минуты)**

1. Откройте: [https://github.com/new](https://github.com/new)
2. **Repository name:** `sayt` (или любое имя на ваш выбор)
3. **Description:** "Modern Marketplace Platform with Next.js 16, React 19"
4. Выберите **Public** или **Private**
5. **НЕ** ставьте галочку "Add a README file" (у нас уже есть)
6. **НЕ** выбирайте лицензию или .gitignore (у нас уже есть)
7. Нажмите **Create repository**

**Вариант B: Через скрипт (если у вас есть GitHub токен)**

```powershell
# В PowerShell (Windows)
$env:GITHUB_TOKEN = "your_token_here"  # Получите на https://github.com/settings/tokens
.\scripts\setup-github.ps1 -GitHubUsername YOUR_USERNAME -RepoName sayt
```

---

### Шаг 2: Подключите remote

После создания репозитория, выполните в PowerShell (замените `YOUR_USERNAME` на ваш GitHub username):

```powershell
# Перейдите в папку проекта (если ещё не там)
cd C:\Users\MSI\Desktop\sayt

# Подключите GitHub репозиторий (замените YOUR_USERNAME)
git remote add origin https://github.com/YOUR_USERNAME/sayt.git

# Или через SSH (если настроен)
git remote add origin git@github.com:YOUR_USERNAME/sayt.git
```

**Примечание:** Если репозиторий уже существует, сначала удалите старый remote:
```powershell
git remote remove origin
git remote add origin https://github.com/YOUR_USERNAME/sayt.git
```

---

### Шаг 3: Загрузите код на GitHub

```powershell
# Убедитесь, что ветка называется 'main'
git branch -M main

# Загрузите код на GitHub
git push -u origin main
```

**Всё! Код загружен на GitHub! 🎉**

---

## 🔍 Проверка после загрузки:

1. **Откройте репозиторий** на GitHub: `https://github.com/YOUR_USERNAME/sayt`
2. **Проверьте Actions:** Зайдите в раздел **Actions** → должен запуститься workflow **CI**
3. **Проверьте файлы:** Все файлы должны быть видны в репозитории

---

## 🔧 Если что-то пошло не так:

### Ошибка: "remote origin already exists"

```powershell
git remote remove origin
git remote add origin https://github.com/YOUR_USERNAME/sayt.git
git push -u origin main
```

### Ошибка: "failed to push some refs"

Если GitHub репозиторий не пустой (например, был создан с README):

```powershell
git pull origin main --allow-unrelated-histories
git push -u origin main
```

### Ошибка аутентификации

**Для HTTPS (нужен Personal Access Token):**

1. Создайте токен: [https://github.com/settings/tokens](https://github.com/settings/tokens)
2. Нажмите "Generate new token (classic)"
3. Выберите права: `repo` (все)
4. Скопируйте токен
5. При push используйте токен вместо пароля

**Или настройте SSH:**

```powershell
# Генерируйте SSH ключ (если нет)
ssh-keygen -t ed25519 -C "your_email@example.com"

# Добавьте ключ в GitHub: Settings → SSH and GPG keys → New SSH key
# Затем используйте SSH URL:
git remote set-url origin git@github.com:YOUR_USERNAME/sayt.git
git push -u origin main
```

---

## 📚 После загрузки кода:

### 1. Настройте GitHub Secrets (обязательно)

1. Зайдите в репозиторий на GitHub
2. **Settings** → **Secrets and variables** → **Actions**
3. Нажмите **New repository secret** и добавьте:

**Минимальные (для работы CI):**
- `DATABASE_URL` - `postgresql://user:password@host:5432/sayt`
- `NEXTAUTH_SECRET` - Сгенерируйте: `openssl rand -base64 32`
- `NEXTAUTH_URL` - `http://localhost:3000` (для тестов) или ваш домен

**Для полного функционала:**
- `MEILISEARCH_HOST` - URL вашего Meilisearch
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

1. **Settings** → **Branches**
2. Нажмите **Add rule**
3. **Branch name pattern:** `main`
4. Включите:
   - ✅ Require a pull request before merging
   - ✅ Require status checks to pass before merging
     - Выберите: `lint`, `test`, `build`
   - ✅ Require branches to be up to date before merging
5. Нажмите **Create**

---

## 📖 Дополнительная документация:

- 📖 [GITHUB-SETUP.md](./GITHUB-SETUP.md) - Полная инструкция по настройке GitHub
- 📖 [GITHUB-QUICK-START.md](./GITHUB-QUICK-START.md) - Быстрый старт
- 📖 [DEPLOY.md](./DEPLOY.md) - Инструкция по деплою на хостинг
- 📖 [README.md](./README.md) - Общая информация о проекте

---

## ✅ Чеклист:

- [ ] Репозиторий создан на GitHub
- [ ] Remote подключен: `git remote add origin ...`
- [ ] Код загружен: `git push -u origin main`
- [ ] GitHub Secrets настроены
- [ ] GitHub Actions workflows запустились (проверьте в разделе Actions)
- [ ] Всё работает! 🎉

---

**Готово! Если возникнут вопросы, смотрите [GITHUB-SETUP.md](./GITHUB-SETUP.md) для подробной инструкции.**

