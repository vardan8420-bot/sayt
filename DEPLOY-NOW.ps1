# Автоматический деплой на Vercel
# Этот скрипт поможет быстро задеплоить сайт

Write-Host "=== Автоматический деплой на Vercel ===" -ForegroundColor Cyan
Write-Host ""

# Проверяем, что проект собран
Write-Host "1. Проверяю, что проект готов к деплою..." -ForegroundColor Yellow
$buildTest = npm run build 2>&1
if ($LASTEXITCODE -ne 0) {
    Write-Host "✗ Ошибка сборки!" -ForegroundColor Red
    Write-Host $buildTest
    exit 1
}
Write-Host "✓ Проект успешно собран!" -ForegroundColor Green
Write-Host ""

# Проверяем Vercel CLI
Write-Host "2. Проверяю Vercel CLI..." -ForegroundColor Yellow
$vercelInstalled = Get-Command vercel -ErrorAction SilentlyContinue
if (-not $vercelInstalled) {
    Write-Host "Vercel CLI не установлен. Устанавливаю..." -ForegroundColor Yellow
    npm install -g vercel
    if ($LASTEXITCODE -ne 0) {
        Write-Host "✗ Ошибка установки Vercel CLI" -ForegroundColor Red
        Write-Host ""
        Write-Host "Установите вручную:" -ForegroundColor Yellow
        Write-Host "  npm install -g vercel" -ForegroundColor White
        exit 1
    }
}
Write-Host "✓ Vercel CLI готов!" -ForegroundColor Green
Write-Host ""

# Инструкция
Write-Host "3. Запустите деплой:" -ForegroundColor Yellow
Write-Host ""
Write-Host "   vercel --prod" -ForegroundColor Cyan
Write-Host ""
Write-Host "   Vercel откроет браузер для авторизации" -ForegroundColor White
Write-Host "   После авторизации проект будет задеплоен!" -ForegroundColor White
Write-Host ""

# Спрашиваем, запустить ли деплой
$deploy = Read-Host "Запустить деплой сейчас? (y/n)"

if ($deploy -eq "y" -or $deploy -eq "Y") {
    Write-Host ""
    Write-Host "Запускаю деплой..." -ForegroundColor Yellow
    vercel --prod
} else {
    Write-Host ""
    Write-Host "Для деплоя выполните вручную:" -ForegroundColor Cyan
    Write-Host "  vercel --prod" -ForegroundColor White
}

