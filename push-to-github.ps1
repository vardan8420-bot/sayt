# Автоматический push в GitHub
# Этот скрипт поможет вам отправить код в GitHub

Write-Host "=== Push в GitHub ===" -ForegroundColor Cyan
Write-Host ""

# Проверяем, что мы в git репозитории
if (-not (Test-Path .git)) {
    Write-Host "Ошибка: Не найдена папка .git" -ForegroundColor Red
    Write-Host "Убедитесь, что вы находитесь в корне проекта" -ForegroundColor Yellow
    exit 1
}

# Проверяем статус
Write-Host "Проверяю статус репозитория..." -ForegroundColor Yellow
git status --short | Out-Null
if ($LASTEXITCODE -ne 0) {
    Write-Host "Ошибка при проверке статуса git" -ForegroundColor Red
    exit 1
}

Write-Host "✓ Git репозиторий настроен" -ForegroundColor Green
Write-Host ""

# Проверяем remote
$remote = git remote get-url origin 2>&1
if ($LASTEXITCODE -ne 0) {
    Write-Host "Ошибка: Remote 'origin' не настроен" -ForegroundColor Red
    Write-Host "Настраиваю remote..." -ForegroundColor Yellow
    git remote add origin https://github.com/vardan8420-bot/sayt.git
}

Write-Host "Remote: $remote" -ForegroundColor Cyan
Write-Host ""

# Запрашиваем PAT
Write-Host "Для приватного репозитория нужен Personal Access Token (PAT)" -ForegroundColor Yellow
Write-Host ""
Write-Host "Если у вас еще нет токена:" -ForegroundColor Cyan
Write-Host "  1. Откройте: https://github.com/settings/tokens" -ForegroundColor White
Write-Host "  2. Нажмите 'Generate new token (classic)'" -ForegroundColor White
Write-Host "  3. Выберите права: repo (полный доступ)" -ForegroundColor White
Write-Host "  4. Скопируйте токен" -ForegroundColor White
Write-Host ""
$token = Read-Host "Введите ваш GitHub PAT (или нажмите Enter для пропуска)"

if (-not $token -or $token.Length -eq 0) {
    Write-Host ""
    Write-Host "⚠ Токен не введен. Push не выполнен." -ForegroundColor Yellow
    Write-Host ""
    Write-Host "Ручная команда:" -ForegroundColor Cyan
    Write-Host "  git remote set-url origin https://YOUR_TOKEN@github.com/vardan8420-bot/sayt.git" -ForegroundColor White
    Write-Host "  git push -u origin main" -ForegroundColor White
    Write-Host ""
    Write-Host "Или используйте инструкцию: PUSH-TO-GITHUB-SIMPLE.md" -ForegroundColor Cyan
    exit 0
}

# Настраиваем remote с токеном
Write-Host ""
Write-Host "Настраиваю remote с токеном..." -ForegroundColor Yellow
git remote set-url origin "https://$token@github.com/vardan8420-bot/sayt.git"
if ($LASTEXITCODE -ne 0) {
    Write-Host "Ошибка при настройке remote" -ForegroundColor Red
    exit 1
}

# Выполняем push
Write-Host "Выполняю push..." -ForegroundColor Yellow
Write-Host ""
git push -u origin main

if ($LASTEXITCODE -eq 0) {
    Write-Host ""
    Write-Host "Success! Code pushed to GitHub!" -ForegroundColor Green
    Write-Host ""
    Write-Host "Для безопасности удаляю токен из remote URL..." -ForegroundColor Yellow
    git remote set-url origin https://github.com/vardan8420-bot/sayt.git
    
    Write-Host ""
    Write-Host "Для будущих push Git запросит токен автоматически" -ForegroundColor Cyan
    Write-Host "Или используйте команду:" -ForegroundColor Cyan
    Write-Host "  git config --global credential.helper store" -ForegroundColor White
    Write-Host ""
    Write-Host "Repository: https://github.com/vardan8420-bot/sayt" -ForegroundColor Green
} else {
    Write-Host ""
    Write-Host "✗ Ошибка при push" -ForegroundColor Red
    Write-Host ""
    Write-Host "Возможные причины:" -ForegroundColor Yellow
    Write-Host "  1. Репозиторий не существует - создайте его на https://github.com/new" -ForegroundColor White
    Write-Host "  2. Неправильный токен - проверьте права токена (нужен 'repo')" -ForegroundColor White
    Write-Host "  3. Неправильное имя пользователя или репозитория" -ForegroundColor White
    Write-Host ""
    Write-Host "Check repository: https://github.com/vardan8420-bot/sayt" -ForegroundColor Cyan
}

