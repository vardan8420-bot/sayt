'use client'

import { useApp } from '../context/AppContext'
import styles from './LanguageButton.module.css'

type LanguageButtonProps = {
	className?: string
}

export function LanguageButton({ className }: LanguageButtonProps = {}) {
  const { language, setLanguage, translations } = useApp()
  
  const languages: Array<{ code: 'ru' | 'en' | 'hy' | 'ka'; name: string }> = [
    { code: 'ru', name: 'Русский' },
    { code: 'en', name: 'English' },
    { code: 'hy', name: 'Հայերեն' },
    { code: 'ka', name: 'ქართული' }
  ]

  const handleLanguageChange = (e: React.MouseEvent<HTMLButtonElement>, newLanguage: 'ru' | 'en' | 'hy' | 'ka') => {
    e.preventDefault()
    e.stopPropagation()
    if (language !== newLanguage) {
      setLanguage(newLanguage)
    }
  }

	return (
		<div className={`${styles.container} ${className || ''}`}>
      <span className={styles.label}>{translations.language[language]}:</span>
      <div className={styles.buttonGroup}>
        {languages.map((lang) => (
          <button
            key={lang.code}
            className={`${styles.button} ${language === lang.code ? styles.active : ''}`}
            onClick={(e) => handleLanguageChange(e, lang.code)}
            type="button"
            aria-label={`Switch to ${lang.name}`}
            aria-pressed={language === lang.code}
          >
            {lang.name}
          </button>
        ))}
      </div>
    </div>
  )
}

