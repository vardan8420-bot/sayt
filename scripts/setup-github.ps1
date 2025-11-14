# PowerShell скрипт для настройки GitHub репозитория
# Использование: .\scripts\setup-github.ps1 -GitHubUsername YOUR_USERNAME -RepoName sayt

param(
    [Parameter(Mandatory=$true)]
    [string]$GitHubUsername,
    
    [Parameter(Mandatory=$false)]
    [string]$RepoName = "sayt",
    
    [Parameter(Mandatory=$false)]
    [string]$GitHubToken,
    
    [Parameter(Mandatory=$false)]
    [switch]$Private
)

Write-Host "🚀 Настройка GitHub репозитория..." -ForegroundColor Green

# Проверка наличия git
if (-not (Get-Command git -ErrorAction SilentlyContinue)) {
    Write-Host "❌ Git не установлен!" -ForegroundColor Red
    exit 1
}

# Если токен не указан, пробуем из переменной окружения
if (-not $GitHubToken) {
    $GitHubToken = $env:GITHUB_TOKEN
}

# Проверка наличия remote
$remote = git remote get-url origin 2>$null
if ($remote) {
    Write-Host "⚠️  Remote уже настроен: $remote" -ForegroundColor Yellow
    $continue = Read-Host "Продолжить? (y/n)"
    if ($continue -ne "y") {
        exit 0
    }
}

# Создание репозитория через API (если токен есть)
if ($GitHubToken) {
    Write-Host "📦 Создание репозитория через GitHub API..." -ForegroundColor Cyan
    
    $body = @{
        name = $RepoName
        description = "Modern Marketplace Platform with Next.js 16, React 19, TypeScript"
        private = $Private.IsPresent
        auto_init = $false
    } | ConvertTo-Json
    
    $headers = @{
        "Authorization" = "token $GitHubToken"
        "Accept" = "application/vnd.github.v3+json"
    }
    
    try {
        $response = Invoke-RestMethod -Uri "https://api.github.com/user/repos" -Method Post -Headers $headers -Body $body -ContentType "application/json"
        Write-Host "✅ Репозиторий создан: $($response.html_url)" -ForegroundColor Green
        $repoUrl = $response.clone_url
    }
    catch {
        Write-Host "⚠️  Не удалось создать репозиторий через API: $_" -ForegroundColor Yellow
        Write-Host "📝 Создайте репозиторий вручную на GitHub.com" -ForegroundColor Yellow
        $repoUrl = Read-Host "Введите URL репозитория (например: https://github.com/$GitHubUsername/$RepoName.git)"
    }
}
else {
    Write-Host "📝 GitHub токен не найден. Создайте репозиторий вручную:" -ForegroundColor Yellow
    Write-Host "   1. Зайдите на https://github.com/new" -ForegroundColor Cyan
    Write-Host "   2. Имя репозитория: $RepoName" -ForegroundColor Cyan
    Write-Host "   3. Выберите Public или Private" -ForegroundColor Cyan
    Write-Host "   4. НЕ ставьте галочку 'Initialize with README'" -ForegroundColor Cyan
    Write-Host "   5. Нажмите 'Create repository'" -ForegroundColor Cyan
    Write-Host ""
    $repoUrl = Read-Host "Введите URL репозитория (например: https://github.com/$GitHubUsername/$RepoName.git)"
}

# Настройка remote
Write-Host "🔗 Настройка remote..." -ForegroundColor Cyan
git remote remove origin 2>$null
git remote add origin $repoUrl
Write-Host "✅ Remote настроен: $repoUrl" -ForegroundColor Green

# Проверка текущей ветки
$branch = git branch --show-current
if ($branch -ne "main") {
    Write-Host "🔄 Переименование ветки в main..." -ForegroundColor Cyan
    git branch -M main
}

# Push в GitHub
Write-Host "📤 Загрузка кода на GitHub..." -ForegroundColor Cyan
try {
    git push -u origin main
    Write-Host "✅ Код успешно загружен на GitHub!" -ForegroundColor Green
    Write-Host "🌐 Откройте репозиторий: $repoUrl" -ForegroundColor Cyan
}
catch {
    Write-Host "❌ Ошибка при загрузке кода: $_" -ForegroundColor Red
    Write-Host "💡 Попробуйте запушить вручную: git push -u origin main" -ForegroundColor Yellow
    exit 1
}

Write-Host ""
Write-Host "🎉 Готово! Репозиторий настроен и код загружен!" -ForegroundColor Green
Write-Host ""
Write-Host "📚 Следующие шаги:" -ForegroundColor Cyan
Write-Host "   1. Настройте Secrets в GitHub: Settings → Secrets and variables → Actions" -ForegroundColor White
Write-Host "   2. Добавьте: DATABASE_URL, NEXTAUTH_SECRET, NEXTAUTH_URL и др." -ForegroundColor White
Write-Host "   3. Проверьте, что workflows запустились: Actions → CI" -ForegroundColor White
Write-Host "   4. Настройте Branch Protection: Settings → Branches" -ForegroundColor White
Write-Host ""
Write-Host "📖 Подробнее см. GITHUB-SETUP.md" -ForegroundColor Cyan

