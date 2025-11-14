# Автоматический скрипт для настройки и загрузки на GitHub
# Использование: .\scripts\auto-push-to-github.ps1 -GitHubUsername vardan84 -RepoName sayt

param(
    [Parameter(Mandatory=$true)]
    [string]$GitHubUsername,
    
    [Parameter(Mandatory=$false)]
    [string]$RepoName = "sayt"
)

Write-Host "🚀 Автоматическая настройка GitHub..." -ForegroundColor Green
Write-Host ""

# Проверка git
if (-not (Get-Command git -ErrorAction SilentlyContinue)) {
    Write-Host "❌ Git не установлен!" -ForegroundColor Red
    exit 1
}

Write-Host "✅ Git найден" -ForegroundColor Green

# Проверка, что мы в git репозитории
if (-not (Test-Path .git)) {
    Write-Host "❌ Это не git репозиторий!" -ForegroundColor Red
    exit 1
}

Write-Host "✅ Git репозиторий найден" -ForegroundColor Green

# Проверка коммитов
$commits = git log --oneline 2>$null
if (-not $commits) {
    Write-Host "❌ Нет коммитов в репозитории!" -ForegroundColor Red
    exit 1
}

Write-Host "✅ Коммиты найдены: $(($commits -split "`n").Count) коммитов" -ForegroundColor Green

# Настройка remote
$repoUrl = "https://github.com/$GitHubUsername/$RepoName.git"
$currentRemote = git remote get-url origin 2>$null

if ($currentRemote) {
    Write-Host "⚠️  Remote уже настроен: $currentRemote" -ForegroundColor Yellow
    $continue = Read-Host "Заменить на $repoUrl? (y/n)"
    if ($continue -eq "y") {
        git remote remove origin
        git remote add origin $repoUrl
        Write-Host "✅ Remote обновлён: $repoUrl" -ForegroundColor Green
    } else {
        Write-Host "ℹ️  Используем существующий remote: $currentRemote" -ForegroundColor Cyan
        $repoUrl = $currentRemote
    }
} else {
    Write-Host "🔗 Настройка remote: $repoUrl" -ForegroundColor Cyan
    git remote add origin $repoUrl
    Write-Host "✅ Remote настроен" -ForegroundColor Green
}

# Проверка текущей ветки
$currentBranch = git branch --show-current
if ($currentBranch -ne "main") {
    Write-Host "🔄 Переименование ветки в main..." -ForegroundColor Cyan
    git branch -M main
    Write-Host "✅ Ветка переименована в main" -ForegroundColor Green
}

# Проверка подключения к GitHub
Write-Host ""
Write-Host "🔍 Проверка подключения к GitHub..." -ForegroundColor Cyan
$repoExists = $false

try {
    $response = Invoke-WebRequest -Uri "https://api.github.com/repos/$GitHubUsername/$RepoName" -Method Get -ErrorAction Stop
    $repoExists = $true
    Write-Host "✅ Репозиторий уже существует на GitHub" -ForegroundColor Green
} catch {
    if ($_.Exception.Response.StatusCode -eq 404) {
        Write-Host "⚠️  Репозиторий не найден на GitHub" -ForegroundColor Yellow
        Write-Host ""
        Write-Host "📝 Создайте репозиторий вручную:" -ForegroundColor Cyan
        Write-Host "   1. Откройте: https://github.com/new" -ForegroundColor White
        Write-Host "   2. Repository name: $RepoName" -ForegroundColor White
        Write-Host "   3. Выберите Public или Private" -ForegroundColor White
        Write-Host "   4. НЕ ставьте галочку 'Add a README file'" -ForegroundColor White
        Write-Host "   5. Нажмите 'Create repository'" -ForegroundColor White
        Write-Host ""
        $continue = Read-Host "Нажмите Enter после создания репозитория"
        
        # Проверка снова
        try {
            $response = Invoke-WebRequest -Uri "https://api.github.com/repos/$GitHubUsername/$RepoName" -Method Get -ErrorAction Stop
            $repoExists = $true
            Write-Host "✅ Репозиторий найден!" -ForegroundColor Green
        } catch {
            Write-Host "⚠️  Репозиторий всё ещё не найден. Продолжаем попытку push..." -ForegroundColor Yellow
        }
    } else {
        Write-Host "⚠️  Не удалось проверить репозиторий. Продолжаем..." -ForegroundColor Yellow
    }
}

# Push в GitHub
Write-Host ""
Write-Host "📤 Загрузка кода на GitHub..." -ForegroundColor Cyan
Write-Host "   Repository: $repoUrl" -ForegroundColor White
Write-Host "   Branch: main" -ForegroundColor White
Write-Host ""

try {
    git push -u origin main
    Write-Host ""
    Write-Host "✅ Код успешно загружен на GitHub!" -ForegroundColor Green
    Write-Host ""
    Write-Host "🌐 Откройте репозиторий: https://github.com/$GitHubUsername/$RepoName" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "📚 Следующие шаги:" -ForegroundColor Yellow
    Write-Host "   1. Настройте Secrets: Settings → Secrets and variables → Actions" -ForegroundColor White
    Write-Host "   2. Проверьте Actions: Actions → CI (должен запуститься автоматически)" -ForegroundColor White
    Write-Host "   3. Настройте Branch Protection: Settings → Branches" -ForegroundColor White
} catch {
    Write-Host ""
    Write-Host "❌ Ошибка при загрузке кода: $_" -ForegroundColor Red
    Write-Host ""
    Write-Host "💡 Возможные причины:" -ForegroundColor Yellow
    Write-Host "   - Репозиторий ещё не создан на GitHub" -ForegroundColor White
    Write-Host "   - Проблемы с аутентификацией (нужен Personal Access Token)" -ForegroundColor White
    Write-Host "   - Репозиторий не пустой (был создан с README)" -ForegroundColor White
    Write-Host ""
    Write-Host "🔧 Решение:" -ForegroundColor Cyan
    Write-Host "   1. Убедитесь, что репозиторий создан на GitHub" -ForegroundColor White
    Write-Host "   2. Если репозиторий не пустой, выполните:" -ForegroundColor White
    Write-Host "      git pull origin main --allow-unrelated-histories" -ForegroundColor Gray
    Write-Host "      git push -u origin main" -ForegroundColor Gray
    Write-Host "   3. Если нужна аутентификация, создайте токен:" -ForegroundColor White
    Write-Host "      https://github.com/settings/tokens" -ForegroundColor Gray
    exit 1
}

Write-Host ""
Write-Host "🎉 Готово! Проект загружен на GitHub!" -ForegroundColor Green

