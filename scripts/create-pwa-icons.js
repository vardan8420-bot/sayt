// Скрипт для создания PWA иконок из SVG
// Требует установки: npm install sharp
// Запуск: node scripts/create-pwa-icons.js

const sharp = require('sharp')
const fs = require('fs')
const path = require('path')

const publicDir = path.join(__dirname, '..', 'public')

async function createPWAIcon(size, outputName) {
  // Создаем новый черный SVG для Marketplace AI
  const svg = Buffer.from(`
    <svg width="${size}" height="${size}" xmlns="http://www.w3.org/2000/svg">
      <rect width="${size}" height="${size}" fill="#000000"/>
      <text x="${size/2}" y="${size/2 + size*0.1}" font-family="Arial, sans-serif" font-size="${size*0.35}" font-weight="bold" fill="white" text-anchor="middle" dominant-baseline="middle">M</text>
    </svg>
  `)
  
  const outputPath = path.join(publicDir, outputName)
  
  await sharp(svg)
    .resize(size, size)
    .png()
    .toFile(outputPath)
  
  console.log(`Created: ${outputName}`)
}

async function main() {
  console.log('Creating PWA icons...')
  
  try {
    await createPWAIcon(192, 'icon-192.png')
    await createPWAIcon(512, 'icon-512.png')
    
    console.log('PWA icons created successfully!')
  } catch (error) {
    console.error('Error creating icons:', error)
    process.exit(1)
  }
}

main()

