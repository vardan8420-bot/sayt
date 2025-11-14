# Генерация иконок и изображений

## Автоматическая генерация

Для автоматической генерации всех иконок и изображений:

```bash
# Установите sharp (если еще не установлен)
npm install sharp --save-dev

# Запустите скрипт генерации
node scripts/generate-icons.js
```

Скрипт создаст:
- `favicon.png` (32x32)
- `apple-touch-icon.png` (180x180)
- `icon-16x16.png` до `icon-512x512.png` (все размеры)
- `og-image.jpg` (1200x630 для Open Graph)

## Ручная генерация

Если вы хотите создать иконки вручную, используйте следующие размеры:

### Favicon
- `favicon.ico` или `favicon.png` - 32x32px

### Apple Touch Icon
- `apple-touch-icon.png` - 180x180px

### PWA Icons
- `icon-192x192.png` - 192x192px
- `icon-512x512.png` - 512x512px

### Open Graph Image
- `og-image.jpg` - 1200x630px (рекомендуемый формат для соцсетей)

## Проверка

После генерации проверьте, что все файлы находятся в папке `public/`:
- favicon.png
- apple-touch-icon.png
- icon-*.png (различные размеры)
- og-image.jpg

