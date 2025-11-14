# Простая инструкция: Push в GitHub

## Шаг 1: Создайте Personal Access Token

1. Откройте в браузере: **https://github.com/settings/tokens**
2. Нажмите **"Generate new token (classic)"**
3. Введите название токена: `Sayt Project`
4. Выберите срок: **90 days** (или другой)
5. Установите права: **repo** ✓ (все пункты в разделе repo)
6. Нажмите **"Generate token"** внизу
7. **СКОПИРУЙТЕ ТОКЕН** (он показывается только один раз!)

## Шаг 2: Выполните push

```powershell
git push -u origin main
```

Когда Git запросит:
- **Username**: `vardan84`
- **Password**: вставьте **токен** (не пароль!)

## Альтернатива: Использовать токен напрямую

```powershell
git remote set-url origin https://YOUR_TOKEN@github.com/vardan84/sayt.git
git push -u origin main
```

(Замените `YOUR_TOKEN` на ваш токен)

## Проверка репозитория

Убедитесь, что репозиторий существует:
- Откройте: https://github.com/vardan84?tab=repositories
- Если репозитория `sayt` нет, создайте его:
  - https://github.com/new
  - Repository name: `sayt`
  - Private ✓
  - **НЕ** ставьте галочку "Add a README file"
  - Нажмите "Create repository"

---

**Готово!** После успешного push код будет на GitHub.

