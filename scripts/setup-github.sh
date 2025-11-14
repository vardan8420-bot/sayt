#!/bin/bash
# Bash скрипт для настройки GitHub репозитория
# Использование: ./scripts/setup-github.sh YOUR_USERNAME sayt

set -e

GITHUB_USERNAME="${1:-yourusername}"
REPO_NAME="${2:-sayt}"
GITHUB_TOKEN="${GITHUB_TOKEN:-}"

echo "🚀 Настройка GitHub репозитория..."

# Проверка наличия git
if ! command -v git &> /dev/null; then
    echo "❌ Git не установлен!"
    exit 1
fi

# Проверка наличия remote
if git remote get-url origin &> /dev/null; then
    echo "⚠️  Remote уже настроен"
    read -p "Продолжить? (y/n) " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        exit 0
    fi
fi

# Создание репозитория через API (если токен есть)
if [ -n "$GITHUB_TOKEN" ]; then
    echo "📦 Создание репозитория через GitHub API..."
    
    RESPONSE=$(curl -s -X POST \
        -H "Authorization: token $GITHUB_TOKEN" \
        -H "Accept: application/vnd.github.v3+json" \
        https://api.github.com/user/repos \
        -d "{\"name\":\"$REPO_NAME\",\"description\":\"Modern Marketplace Platform with Next.js 16, React 19, TypeScript\",\"private\":false}")
    
    if echo "$RESPONSE" | grep -q '"html_url"'; then
        REPO_URL=$(echo "$RESPONSE" | grep -o '"clone_url":"[^"]*' | cut -d'"' -f4)
        echo "✅ Репозиторий создан!"
    else
        echo "⚠️  Не удалось создать репозиторий через API"
        echo "📝 Создайте репозиторий вручную на GitHub.com"
        read -p "Введите URL репозитория: " REPO_URL
    fi
else
    echo "📝 GitHub токен не найден. Создайте репозиторий вручную:"
    echo "   1. Зайдите на https://github.com/new"
    echo "   2. Имя репозитория: $REPO_NAME"
    echo "   3. Выберите Public или Private"
    echo "   4. НЕ ставьте галочку 'Initialize with README'"
    echo "   5. Нажмите 'Create repository'"
    echo ""
    read -p "Введите URL репозитория: " REPO_URL
fi

# Настройка remote
echo "🔗 Настройка remote..."
git remote remove origin 2>/dev/null || true
git remote add origin "$REPO_URL"
echo "✅ Remote настроен: $REPO_URL"

# Проверка текущей ветки
CURRENT_BRANCH=$(git branch --show-current)
if [ "$CURRENT_BRANCH" != "main" ]; then
    echo "🔄 Переименование ветки в main..."
    git branch -M main
fi

# Push в GitHub
echo "📤 Загрузка кода на GitHub..."
if git push -u origin main; then
    echo "✅ Код успешно загружен на GitHub!"
    echo "🌐 Откройте репозиторий: $REPO_URL"
else
    echo "❌ Ошибка при загрузке кода"
    echo "💡 Попробуйте запушить вручную: git push -u origin main"
    exit 1
fi

echo ""
echo "🎉 Готово! Репозиторий настроен и код загружен!"
echo ""
echo "📚 Следующие шаги:"
echo "   1. Настройте Secrets в GitHub: Settings → Secrets and variables → Actions"
echo "   2. Добавьте: DATABASE_URL, NEXTAUTH_SECRET, NEXTAUTH_URL и др."
echo "   3. Проверьте, что workflows запустились: Actions → CI"
echo "   4. Настройте Branch Protection: Settings → Branches"
echo ""
echo "📖 Подробнее см. GITHUB-SETUP.md"

