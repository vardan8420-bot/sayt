// Простой скрипт для создания базовых PNG иконок
// Использует встроенные возможности Node.js
// Запуск: node scripts/create-icons-simple.js

const fs = require('fs')
const path = require('path')

// Создаем простые PNG файлы используя base64
// Это базовые 1x1 пиксельные PNG файлы, которые будут заменены на реальные

const createPlaceholderPNG = (size, filename) => {
  // Минимальный валидный PNG (1x1 пиксель, прозрачный)
  // В реальности нужно использовать библиотеку типа sharp или canvas
  const pngHeader = Buffer.from([
    0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A, // PNG signature
    0x00, 0x00, 0x00, 0x0D, // IHDR chunk length
    0x49, 0x48, 0x44, 0x52, // IHDR
    0x00, 0x00, 0x00, 0x01, // width (1 pixel)
    0x00, 0x00, 0x00, 0x01, // height (1 pixel)
    0x08, 0x06, 0x00, 0x00, 0x00, // bit depth, color type, compression, filter, interlace
    0x1F, 0x15, 0xC4, 0x89, // CRC
    0x00, 0x00, 0x00, 0x0A, // IDAT chunk length
    0x49, 0x44, 0x41, 0x54, // IDAT
    0x78, 0x9C, 0x63, 0x00, 0x01, 0x00, 0x00, 0x05, 0x00, 0x01, // compressed data
    0x0D, 0x0A, 0x2D, 0xB4, // CRC
    0x00, 0x00, 0x00, 0x00, // IEND chunk length
    0x49, 0x45, 0x4E, 0x44, // IEND
    0xAE, 0x42, 0x60, 0x82  // CRC
  ])
  
  const publicDir = path.join(__dirname, '..', 'public')
  const filePath = path.join(publicDir, filename)
  
  fs.writeFileSync(filePath, pngHeader)
  console.log(`Created placeholder: ${filename} (${size}x${size} - needs real image)`)
}

// Создаем инструкцию вместо реальных PNG
const createConversionInstructions = () => {
  const instructions = `
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

\`\`\`bash
npm install sharp --save-dev
node scripts/generate-icons.js
\`\`\`

## Способ 3: Использование ImageMagick

\`\`\`bash
# Установите ImageMagick
# Затем:
convert public/favicon.svg -resize 32x32 public/favicon.ico
convert public/apple-touch-icon.svg -resize 180x180 public/apple-touch-icon.png
convert public/icon-192x192.svg -resize 192x192 public/icon-192x192.png
convert public/icon-512x512.svg -resize 512x512 public/icon-512x512.png
convert public/og-image.svg -resize 1200x630 public/og-image.jpg
\`\`\`

## Способ 4: Ручное создание

Используйте любой графический редактор (Photoshop, GIMP, Figma) для экспорта PNG из SVG.
`
  
  fs.writeFileSync(
    path.join(__dirname, '..', 'ICON-CONVERSION.md'),
    instructions
  )
  console.log('Created ICON-CONVERSION.md with instructions')
}

// Создаем HTML файл для конвертации в браузере
const createBrowserConverter = () => {
  const html = `<!DOCTYPE html>
<html>
<head>
  <title>SVG to PNG Converter</title>
  <style>
    body {
      font-family: Arial, sans-serif;
      max-width: 800px;
      margin: 50px auto;
      padding: 20px;
    }
    .converter {
      margin: 20px 0;
      padding: 20px;
      border: 1px solid #ddd;
      border-radius: 8px;
    }
    button {
      background: #667eea;
      color: white;
      border: none;
      padding: 10px 20px;
      border-radius: 6px;
      cursor: pointer;
      margin: 5px;
    }
    button:hover {
      background: #5568d3;
    }
    canvas {
      border: 1px solid #ddd;
      margin: 10px 0;
    }
  </style>
</head>
<body>
  <h1>SVG to PNG/ICO Converter</h1>
  <p>Откройте этот файл в браузере для конвертации SVG в PNG</p>
  
  <div class="converter">
    <h3>Favicon (32x32)</h3>
    <img id="favicon" src="../public/favicon.svg" style="display:none">
    <canvas id="favicon-canvas" width="32" height="32"></canvas>
    <br>
    <button onclick="convertToPNG('favicon', 32, 'favicon.png')">Скачать PNG</button>
    <button onclick="convertToICO('favicon', 32, 'favicon.ico')">Скачать ICO</button>
  </div>
  
  <div class="converter">
    <h3>Apple Touch Icon (180x180)</h3>
    <img id="apple" src="../public/apple-touch-icon.svg" style="display:none">
    <canvas id="apple-canvas" width="180" height="180"></canvas>
    <br>
    <button onclick="convertToPNG('apple', 180, 'apple-touch-icon.png')">Скачать PNG</button>
  </div>
  
  <div class="converter">
    <h3>Icon 192x192</h3>
    <img id="icon192" src="../public/icon-192x192.svg" style="display:none">
    <canvas id="icon192-canvas" width="192" height="192"></canvas>
    <br>
    <button onclick="convertToPNG('icon192', 192, 'icon-192x192.png')">Скачать PNG</button>
  </div>
  
  <div class="converter">
    <h3>Icon 512x512</h3>
    <img id="icon512" src="../public/icon-512x512.svg" style="display:none">
    <canvas id="icon512-canvas" width="512" height="512"></canvas>
    <br>
    <button onclick="convertToPNG('icon512', 512, 'icon-512x512.png')">Скачать PNG</button>
  </div>
  
  <div class="converter">
    <h3>OG Image (1200x630)</h3>
    <img id="og" src="../public/og-image.svg" style="display:none">
    <canvas id="og-canvas" width="1200" height="630"></canvas>
    <br>
    <button onclick="convertToPNG('og', 630, 'og-image.jpg')">Скачать JPG</button>
  </div>

  <script>
    function drawImage(imgId, canvasId, size) {
      const img = document.getElementById(imgId);
      const canvas = document.getElementById(canvasId);
      const ctx = canvas.getContext('2d');
      
      img.onload = function() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      };
    }
    
    function convertToPNG(imgId, size, filename) {
      const img = document.getElementById(imgId);
      const canvasId = imgId === 'favicon' ? 'favicon-canvas' : 
                      imgId === 'apple' ? 'apple-canvas' :
                      imgId === 'icon192' ? 'icon192-canvas' :
                      imgId === 'icon512' ? 'icon512-canvas' : 'og-canvas';
      const canvas = document.getElementById(canvasId);
      
      canvas.toBlob(function(blob) {
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        a.click();
        URL.revokeObjectURL(url);
      }, 'image/png');
    }
    
    function convertToICO(imgId, size, filename) {
      // ICO конвертация сложнее, используем PNG как fallback
      convertToPNG(imgId, size, filename.replace('.ico', '.png'));
      alert('Скачан PNG файл. Для ICO используйте онлайн конвертер или специальный инструмент.');
    }
    
    // Инициализация
    window.onload = function() {
      drawImage('favicon', 'favicon-canvas', 32);
      drawImage('apple', 'apple-canvas', 180);
      drawImage('icon192', 'icon192-canvas', 192);
      drawImage('icon512', 'icon512-canvas', 512);
      drawImage('og', 'og-canvas', 630);
    };
  </script>
</body>
</html>`
  
  fs.writeFileSync(
    path.join(__dirname, '..', 'public', 'icon-converter.html'),
    html
  )
  console.log('Created icon-converter.html - open in browser to convert SVG to PNG')
}

// Выполняем
console.log('Creating icon conversion tools...')
createConversionInstructions()
createBrowserConverter()
console.log('\n✅ Готово!')
console.log('📝 Откройте public/icon-converter.html в браузере для конвертации')
console.log('📖 Или следуйте инструкциям в ICON-CONVERSION.md')

