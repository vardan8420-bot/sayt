# Помощь с Push в GitHub

Репозиторий не найден или требуется аутентификация.

## Вариант 1: Использовать Personal Access Token (PAT)

1. **Создайте Personal Access Token:**
   - Откройте: https://github.com/settings/tokens
   - Нажмите "Generate new token (classic)"
   - Выберите срок действия (например, 90 дней)
   - Установите права: `repo` (полный доступ к репозиториям)
   - Скопируйте токен (он показывается только один раз!)

2. **Настройте git для использования токена:**
   ```bash
   git remote set-url origin https://YOUR_TOKEN@github.com/vardan84/sayt.git
   git push -u origin main
   ```
   
   ИЛИ используйте токен вместо пароля при push (Git запросит пароль - введите токен).

## Вариант 2: Использовать SSH

1. **Проверьте наличие SSH ключа:**
   ```bash
   ls ~/.ssh/id_*.pub
   ```

2. **Если ключа нет, создайте его:**
   ```bash
   ssh-keygen -t ed25519 -C "your_email@example.com"
   ```

3. **Добавьте публичный ключ в GitHub:**
   - Скопируйте содержимое: `cat ~/.ssh/id_ed25519.pub`
   - Откройте: https://github.com/settings/keys
   - Нажмите "New SSH key"
   - Вставьте ключ и сохраните

4. **Измените remote на SSH:**
   ```bash
   git remote set-url origin git@github.com:vardan84/sayt.git
   git push -u origin main
   ```

## Вариант 3: Проверить, существует ли репозиторий

1. Откройте: https://github.com/vardan84?tab=repositories
2. Убедитесь, что репозиторий `sayt` существует
3. Если его нет, создайте его:
   - https://github.com/new
   - Repository name: `sayt`
   - Выберите Private
   - **НЕ** ставьте галочку "Add a README file"
   - Нажмите "Create repository"

## Быстрая команда (если у вас есть PAT):

```bash
# Замените YOUR_TOKEN на ваш токен
git remote set-url origin https://YOUR_TOKEN@github.com/vardan84/sayt.git
git push -u origin main
```

