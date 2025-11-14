# Скрипт для настройки push в GitHub
# Автоматически определяет лучший способ аутентификации

Write-Host "=== Настройка Push в GitHub ===" -ForegroundColor Cyan
Write-Host ""

# Проверяем текущий remote
$remote = git remote get-url origin
Write-Host "Текущий remote: $remote" -ForegroundColor Yellow

# Проверяем наличие SSH ключей
$sshKey = Get-ChildItem "$env:USERPROFILE\.ssh\id_*.pub" -ErrorAction SilentlyContinue | Select-Object -First 1

if ($sshKey) {
    Write-Host "`n✓ Найден SSH ключ: $($sshKey.Name)" -ForegroundColor Green
    Write-Host "Проверяю подключение к GitHub..." -ForegroundColor Yellow
    
    # Проверяем SSH подключение
    $sshTest = ssh -T git@github.com 2>&1
    if ($sshTest -match "successfully authenticated") {
        Write-Host "✓ SSH подключение работает!" -ForegroundColor Green
        Write-Host "Переключаю remote на SSH..." -ForegroundColor Yellow
        git remote set-url origin git@github.com:vardan84/sayt.git
        Write-Host "`nПопытка push..." -ForegroundColor Yellow
        git push -u origin main
        exit $LASTEXITCODE
    } else {
        Write-Host "⚠ SSH ключ найден, но подключение не работает" -ForegroundColor Yellow
        Write-Host "Возможно, ключ не добавлен в GitHub" -ForegroundColor Yellow
    }
}

# Если SSH не работает, предлагаем PAT
Write-Host "`n=== Необходим Personal Access Token (PAT) ===" -ForegroundColor Cyan
Write-Host ""
Write-Host "1. Создайте токен здесь: https://github.com/settings/tokens" -ForegroundColor Yellow
Write-Host "2. Нажмите 'Generate new token (classic)'" -ForegroundColor Yellow
Write-Host "3. Выберите права: repo (полный доступ)" -ForegroundColor Yellow
Write-Host "4. Скопируйте токен" -ForegroundColor Yellow
Write-Host ""
$token = Read-Host "Введите ваш PAT (или нажмите Enter для пропуска)"

if ($token -and $token.Length -gt 0) {
    Write-Host "Настраиваю remote с токеном..." -ForegroundColor Yellow
    git remote set-url origin "https://$token@github.com/vardan84/sayt.git"
    Write-Host "`nПопытка push..." -ForegroundColor Yellow
    git push -u origin main
    if ($LASTEXITCODE -eq 0) {
        Write-Host "`n✓ Успешно! Код отправлен в GitHub!" -ForegroundColor Green
        # Очищаем токен из remote URL для безопасности
        Write-Host "Обновляю remote для безопасности..." -ForegroundColor Yellow
        git remote set-url origin https://github.com/vardan84/sayt.git
        Write-Host "Для будущих push используйте: git config --global credential.helper manager" -ForegroundColor Cyan
    }
} else {
    Write-Host "`n⚠ Токен не введен. Push не выполнен." -ForegroundColor Yellow
    Write-Host "`nРучная настройка:" -ForegroundColor Cyan
    Write-Host "  git remote set-url origin https://YOUR_TOKEN@github.com/vardan84/sayt.git" -ForegroundColor White
    Write-Host "  git push -u origin main" -ForegroundColor White
    Write-Host "`nИли используйте SSH (см. GITHUB-PUSH-HELP.md)" -ForegroundColor Cyan
}

