
# Инструкция по созданию PNG иконок

## Способ 1: Онлайн конвертация (Рекомендуется)

1. Откройте SVG файлы в браузере или редакторе
2. Используйте онлайн конвертер:
   - https://convertio.co/svg-png/
   - https://cloudconvert.com/svg-to-png
   - https://svgtopng.com/

3. Конвертируйте следующие файлы:
   - favicon.svg → favicon.ico (32x32)
   - apple-touch-icon.svg → apple-touch-icon.png (180x180)
   - icon-192x192.svg → icon-192x192.png (192x192)
   - icon-512x512.svg → icon-512x512.png (512x512)
   - og-image.svg → og-image.jpg (1200x630)

## Способ 2: Использование Sharp (если установлен)

```bash
npm install sharp --save-dev
node scripts/generate-icons.js
```

## Способ 3: Использование ImageMagick

```bash
# Установите ImageMagick
# Затем:
convert public/favicon.svg -resize 32x32 public/favicon.ico
convert public/apple-touch-icon.svg -resize 180x180 public/apple-touch-icon.png
convert public/icon-192x192.svg -resize 192x192 public/icon-192x192.png
convert public/icon-512x512.svg -resize 512x512 public/icon-512x512.png
convert public/og-image.svg -resize 1200x630 public/og-image.jpg
```

## Способ 4: Ручное создание

Используйте любой графический редактор (Photoshop, GIMP, Figma) для экспорта PNG из SVG.
