// Скрипт для генерации иконок
// Требует установки: npm install sharp
// Запуск: node scripts/generate-icons.js

const sharp = require('sharp')
const fs = require('fs')
const path = require('path')

const sizes = [16, 32, 48, 64, 96, 128, 192, 256, 384, 512]
const publicDir = path.join(__dirname, '..', 'public')

// Создаем простую иконку программно
async function generateIcon(size) {
  const svg = `
    <svg width="${size}" height="${size}" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style="stop-color:#667eea;stop-opacity:1" />
          <stop offset="100%" style="stop-color:#764ba2;stop-opacity:1" />
        </linearGradient>
      </defs>
      <rect width="${size}" height="${size}" rx="${size * 0.2}" fill="url(#grad)"/>
      <text x="${size/2}" y="${size/2 + size*0.1}" font-family="Arial, sans-serif" font-size="${size*0.4}" font-weight="bold" fill="white" text-anchor="middle" dominant-baseline="middle">S</text>
    </svg>
  `

  const buffer = Buffer.from(svg)
  const outputPath = path.join(publicDir, `icon-${size}x${size}.png`)
  
  await sharp(buffer)
    .resize(size, size)
    .png()
    .toFile(outputPath)
  
  console.log(`Generated: icon-${size}x${size}.png`)
}

async function generateFavicon() {
  const svg = `
    <svg width="32" height="32" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style="stop-color:#667eea;stop-opacity:1" />
          <stop offset="100%" style="stop-color:#764ba2;stop-opacity:1" />
        </linearGradient>
      </defs>
      <rect width="32" height="32" rx="6" fill="url(#grad)"/>
      <text x="16" y="22" font-family="Arial, sans-serif" font-size="20" font-weight="bold" fill="white" text-anchor="middle">S</text>
    </svg>
  `

  const buffer = Buffer.from(svg)
  const faviconPath = path.join(publicDir, 'favicon.ico')
  const appleTouchPath = path.join(publicDir, 'apple-touch-icon.png')
  
  // Генерируем favicon.ico (32x32)
  await sharp(buffer)
    .resize(32, 32)
    .png()
    .toFile(faviconPath.replace('.ico', '.png'))
  
  // Генерируем apple-touch-icon (180x180)
  await sharp(buffer)
    .resize(180, 180)
    .png()
    .toFile(appleTouchPath)
  
  console.log('Generated: favicon.png and apple-touch-icon.png')
}

async function generateOGImage() {
  const svg = `
    <svg width="1200" height="630" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style="stop-color:#667eea;stop-opacity:1" />
          <stop offset="100%" style="stop-color:#764ba2;stop-opacity:1" />
        </linearGradient>
      </defs>
      <rect width="1200" height="630" fill="url(#grad)"/>
      <text x="600" y="280" font-family="Arial, sans-serif" font-size="72" font-weight="bold" fill="white" text-anchor="middle">Sayt</text>
      <text x="600" y="350" font-family="Arial, sans-serif" font-size="36" fill="white" text-anchor="middle">Modern Web Tools</text>
      <text x="600" y="400" font-family="Arial, sans-serif" font-size="24" fill="rgba(255,255,255,0.9)" text-anchor="middle">Website Builder • AI Content • Image Editor</text>
    </svg>
  `

  const buffer = Buffer.from(svg)
  const ogImagePath = path.join(publicDir, 'og-image.jpg')
  
  await sharp(buffer)
    .resize(1200, 630)
    .jpeg({ quality: 90 })
    .toFile(ogImagePath)
  
  console.log('Generated: og-image.jpg')
}

async function main() {
  console.log('Generating icons...')
  
  // Генерируем все размеры иконок
  for (const size of sizes) {
    await generateIcon(size)
  }
  
  // Генерируем favicon и apple-touch-icon
  await generateFavicon()
  
  // Генерируем OG изображение
  await generateOGImage()
  
  console.log('All icons generated successfully!')
}

main().catch(console.error)

