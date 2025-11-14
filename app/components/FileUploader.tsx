'use client'

import React, { useState, useCallback } from 'react'
import { useApp } from '../context/AppContext'
import styles from './FileUploader.module.css'

export function FileUploader() {
  const { language } = useApp()
  const [isDragging, setIsDragging] = useState(false)
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([])

  const handleDragEnter = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(true)
  }, [])

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(false)
  }, [])

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
  }, [])

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(false)

    const files = Array.from(e.dataTransfer.files)
    setUploadedFiles((prev) => [...prev, ...files])
  }, [])

  const handleFileInput = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const files = Array.from(e.target.files)
      setUploadedFiles((prev) => [...prev, ...files])
    }
  }, [])

  const handleRemoveFile = useCallback((index: number) => {
    setUploadedFiles((prev) => prev.filter((_, i) => i !== index))
  }, [])

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i]
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
        {t('Загрузка файлов', 'File Upload', 'Ֆայլերի ներբեռնում', 'ფაილების ატვირთვა')}
      </h3>
      <p className={styles.description}>
        {t(
          'Перетащите файлы сюда или нажмите для выбора',
          'Drag files here or click to select',
          'Քաշեք ֆայլերը այստեղ կամ սեղմեք ընտրելու համար',
          'გადმოიტანეთ ფაილები აქ ან დააწკაპუნეთ ასარჩევად'
        )}
      </p>

      <div
        className={`${styles.dropZone} ${isDragging ? styles.dragging : ''}`}
        onDragEnter={handleDragEnter}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => document.getElementById('file-input')?.click()}
      >
        <div className={styles.dropZoneContent}>
          <div className={styles.icon}>📁</div>
          <p className={styles.dropZoneText}>
            {isDragging
              ? t('Отпустите для загрузки', 'Drop to upload', 'Թողեք՝ ներբեռնվի', 'გაათავისუფლეთ ატვირთვისთვის')
              : t(
                  'Перетащите файлы сюда или нажмите',
                  'Drag files here or click',
                  'Քաշեք ֆայլերը այստեղ կամ սեղմեք',
                  'გადმოიტანეთ ფაილები აქ ან დააწკაპუნეთ'
                )}
          </p>
          <input
            id="file-input"
            type="file"
            multiple
            className={styles.fileInput}
            onChange={handleFileInput}
          />
        </div>
      </div>

      {uploadedFiles.length > 0 && (
        <div className={styles.fileList}>
          <h4 className={styles.fileListTitle}>
            {t('Загруженные файлы:', 'Uploaded files:', 'Ներբեռնված ֆայլեր՝', 'ატვირთული ფაილები:')}
          </h4>
          {uploadedFiles.map((file, index) => (
            <div key={index} className={styles.fileItem}>
              <div className={styles.fileInfo}>
                <span className={styles.fileName}>{file.name}</span>
                <span className={styles.fileSize}>{formatFileSize(file.size)}</span>
              </div>
              <button
                className={styles.removeButton}
                onClick={() => handleRemoveFile(index)}
              >
                ✕
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

