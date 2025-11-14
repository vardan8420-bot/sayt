'use client'

import React, { useState, useRef, useCallback } from 'react'
import { useApp } from '../context/AppContext'
import styles from './ImageEditor.module.css'

export function ImageEditor() {
  const { language } = useApp()
  const [selectedImage, setSelectedImage] = useState<string | null>(null)
  const [brightness, setBrightness] = useState(100)
  const [contrast, setContrast] = useState(100)
  const [saturation, setSaturation] = useState(100)
  const [rotation, setRotation] = useState(0)
  const [scale, setScale] = useState(100)
  const [filter, setFilter] = useState<'none' | 'grayscale' | 'sepia' | 'blur' | 'invert'>('none')
  const fileInputRef = useRef<HTMLInputElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)

  const handleImageUpload = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file && file.type.startsWith('image/')) {
      const reader = new FileReader()
      reader.onload = (event) => {
        setSelectedImage(event.target?.result as string)
      }
      reader.readAsDataURL(file)
    }
  }, [])

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    const file = e.dataTransfer.files[0]
    if (file && file.type.startsWith('image/')) {
      const reader = new FileReader()
      reader.onload = (event) => {
        setSelectedImage(event.target?.result as string)
      }
      reader.readAsDataURL(file)
    }
  }, [])

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
  }, [])

  const applyFilters = React.useCallback(() => {
    if (!selectedImage || !canvasRef.current) return

    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const img = new Image()
    img.onload = () => {
      canvas.width = img.width
      canvas.height = img.height

      ctx.save()
      ctx.translate(canvas.width / 2, canvas.height / 2)
      ctx.rotate((rotation * Math.PI) / 180)
      ctx.scale(scale / 100, scale / 100)
      ctx.translate(-canvas.width / 2, -canvas.height / 2)

      ctx.filter = `
        brightness(${brightness}%)
        contrast(${contrast}%)
        saturate(${saturation}%)
        ${filter === 'grayscale' ? 'grayscale(100%)' : ''}
        ${filter === 'sepia' ? 'sepia(100%)' : ''}
        ${filter === 'blur' ? 'blur(5px)' : ''}
        ${filter === 'invert' ? 'invert(100%)' : ''}
      `
      ctx.drawImage(img, 0, 0)
      ctx.restore()
    }
    img.src = selectedImage
  }, [selectedImage, brightness, contrast, saturation, rotation, scale, filter])

  React.useEffect(() => {
    if (selectedImage) {
      applyFilters()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedImage, brightness, contrast, saturation, rotation, scale, filter])

  const handleDownload = () => {
    if (!canvasRef.current) return
    const link = document.createElement('a')
    link.download = 'edited-image.png'
    link.href = canvasRef.current.toDataURL()
    link.click()
  }

  const handleReset = () => {
    setBrightness(100)
    setContrast(100)
    setSaturation(100)
    setRotation(0)
    setScale(100)
    setFilter('none')
  }

  const handleRotate = (angle: number) => {
    setRotation((prev) => (prev + angle) % 360)
  }

  const t = (ru: string, en: string, hy: string, ka: string) => {
    switch (language) {
      case 'ru': return ru
      case 'en': return en
      case 'hy': return hy
      case 'ka': return ka
    }
  }

  return (
    <div className={styles.container}>
      <h3 className={styles.title}>
        {t('🖼️ Редактор Изображений', '🖼️ Image Editor', '🖼️ Պատկերների խմբագիր', '🖼️ გამოსახულებების რედაქტორი')}
      </h3>
      <p className={styles.description}>
        {t(
          'Загрузите изображение и отредактируйте его с помощью различных инструментов',
          'Upload an image and edit it with various tools',
          'Ներբեռնեք պատկերն ու խմբագրեք տարբեր գործիքներով',
          'ატვირთეთ სურათი და დაარედაქტირეთ სხვადასხვა ინსტრუმენტებით'
        )}
      </p>

      {!selectedImage ? (
        <div
          className={styles.uploadArea}
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onClick={() => fileInputRef.current?.click()}
        >
          <div className={styles.uploadContent}>
            <div className={styles.uploadIcon}>📷</div>
            <p className={styles.uploadText}>
              {language === 'ru'
                ? 'Перетащите изображение сюда или нажмите для выбора'
                : language === 'en'
                ? 'Drag image here or click to select'
                : 'Rasmni bu yerga sudrab o\'tkazing yoki tanlash uchun bosing'}
            </p>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleImageUpload}
              className={styles.fileInput}
            />
          </div>
        </div>
      ) : (
        <div className={styles.editorContainer}>
          <div className={styles.imagePreview}>
            <canvas ref={canvasRef} className={styles.canvas} />
          </div>

          <div className={styles.controls}>
            <div className={styles.controlGroup}>
              <label className={styles.controlLabel}>
                {t('Яркость', 'Brightness', 'Պայծառություն', 'სიბრწყინვე')}
                <span>{brightness}%</span>
              </label>
              <input
                type="range"
                min="0"
                max="200"
                value={brightness}
                onChange={(e) => setBrightness(Number(e.target.value))}
                className={styles.slider}
              />
            </div>

            <div className={styles.controlGroup}>
              <label className={styles.controlLabel}>
                {t('Контраст', 'Contrast', 'Կոնտրաստ', 'კონტრასტი')}
                <span>{contrast}%</span>
              </label>
              <input
                type="range"
                min="0"
                max="200"
                value={contrast}
                onChange={(e) => setContrast(Number(e.target.value))}
                className={styles.slider}
              />
            </div>

            <div className={styles.controlGroup}>
              <label className={styles.controlLabel}>
                {t('Насыщенность', 'Saturation', 'Հագեցվածություն', 'გაჯერებულობა')}
                <span>{saturation}%</span>
              </label>
              <input
                type="range"
                min="0"
                max="200"
                value={saturation}
                onChange={(e) => setSaturation(Number(e.target.value))}
                className={styles.slider}
              />
            </div>

            <div className={styles.controlGroup}>
              <label className={styles.controlLabel}>
                {t('Поворот', 'Rotation', 'Պտտում', 'მობრუნება')}
                <span>{rotation}°</span>
              </label>
              <div className={styles.rotationControls}>
                <button
                  className={styles.rotateButton}
                  onClick={() => handleRotate(-90)}
                  title={t('Повернуть влево', 'Rotate left', 'Պտտել ձախ', 'შებრუნება მარცხნივ')}
                >
                  ↶
                </button>
                <input
                  type="range"
                  min="0"
                  max="360"
                  value={rotation}
                  onChange={(e) => setRotation(Number(e.target.value))}
                  className={styles.slider}
                />
                <button
                  className={styles.rotateButton}
                  onClick={() => handleRotate(90)}
                  title={t('Повернуть вправо', 'Rotate right', 'Պտտել աջ', 'შებრუნება მარჯვნივ')}
                >
                  ↷
                </button>
              </div>
            </div>

            <div className={styles.controlGroup}>
              <label className={styles.controlLabel}>
                {t('Масштаб', 'Scale', 'Չափ', 'მასშტაბი')}
                <span>{scale}%</span>
              </label>
              <input
                type="range"
                min="50"
                max="200"
                value={scale}
                onChange={(e) => setScale(Number(e.target.value))}
                className={styles.slider}
              />
            </div>

            <div className={styles.controlGroup}>
              <label className={styles.controlLabel}>
                {t('Фильтры', 'Filters', 'Ֆիլտրեր', 'ფილტრები')}
              </label>
              <div className={styles.filterButtons}>
                <button
                  className={`${styles.filterButton} ${filter === 'none' ? styles.active : ''}`}
                  onClick={() => setFilter('none')}
                >
                  {t('Нет', 'None', 'Չկա', 'არაფერი')}
                </button>
                <button
                  className={`${styles.filterButton} ${filter === 'grayscale' ? styles.active : ''}`}
                  onClick={() => setFilter('grayscale')}
                >
                  {t('Ч/Б', 'B&W', 'Սև/Սպիտակ', 'შავ-თეთრი')}
                </button>
                <button
                  className={`${styles.filterButton} ${filter === 'sepia' ? styles.active : ''}`}
                  onClick={() => setFilter('sepia')}
                >
                  {t('Сепия', 'Sepia', 'Սեպիա', 'სეპია')}
                </button>
                <button
                  className={`${styles.filterButton} ${filter === 'blur' ? styles.active : ''}`}
                  onClick={() => setFilter('blur')}
                >
                  {t('Размытие', 'Blur', 'Ամպակում', 'ბლერი')}
                </button>
                <button
                  className={`${styles.filterButton} ${filter === 'invert' ? styles.active : ''}`}
                  onClick={() => setFilter('invert')}
                >
                  {t('Инверсия', 'Invert', 'Ինվերսիա', 'ინვერსია')}
                </button>
              </div>
            </div>

            <div className={styles.actionButtons}>
              <button className={styles.resetButton} onClick={handleReset}>
                {t('🔄 Сбросить', '🔄 Reset', '🔄 Վերակայել', '🔄 განულება')}
              </button>
              <button className={styles.downloadButton} onClick={handleDownload}>
                {t('💾 Скачать', '💾 Download', '💾 Ներբեռնել', '💾 ჩამოტვირთვა')}
              </button>
              <button
                className={styles.changeButton}
                onClick={() => {
                  setSelectedImage(null)
                  handleReset()
                }}
              >
                {t('📁 Другое изображение', '📁 Another Image', '📁 Այլ պատկեր', '📁 სხვა სურათი')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

