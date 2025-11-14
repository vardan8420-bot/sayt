'use client'

import * as DropdownMenu from '@radix-ui/react-dropdown-menu'
import { useApp } from '../context/AppContext'
import styles from './LanguageButton.module.css'

type LanguageButtonProps = {
	className?: string
}

export function LanguageButton({ className }: LanguageButtonProps = {}) {
  const { language, setLanguage } = useApp()
  
  const languages: Array<{ code: 'ru' | 'en' | 'hy' | 'ka'; codeShort: string; name: string }> = [
    { code: 'ru', codeShort: 'RU', name: 'Русский' },
    { code: 'en', codeShort: 'EN', name: 'English' },
    { code: 'hy', codeShort: 'HY', name: 'Հայերեն' },
    { code: 'ka', codeShort: 'KA', name: 'ქართული' }
  ]

  const currentLanguage = languages.find(lang => lang.code === language) || languages[0]
  const isHeader = className === 'header'

  return (
    <DropdownMenu.Root>
      <DropdownMenu.Trigger asChild>
        <button
          className={`${styles.trigger} ${isHeader ? styles.triggerHeader : ''}`}
          aria-label="Select language"
        >
          <svg
            className={styles.globeIcon}
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <circle cx="12" cy="12" r="10"></circle>
            <line x1="2" y1="12" x2="22" y2="12"></line>
            <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"></path>
          </svg>
          <span className={styles.codeShort}>{currentLanguage.codeShort}</span>
          <svg
            className={styles.chevronIcon}
            width="12"
            height="12"
            viewBox="0 0 12 12"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <polyline points="3 4 6 8 9 4"></polyline>
          </svg>
        </button>
      </DropdownMenu.Trigger>

      <DropdownMenu.Portal>
        <DropdownMenu.Content className={`${styles.content} ${isHeader ? styles.contentHeader : ''}`} sideOffset={5}>
          {languages.map((lang) => (
            <DropdownMenu.Item
              key={lang.code}
              className={`${styles.item} ${language === lang.code ? styles.itemActive : ''}`}
              onSelect={() => {
                if (language !== lang.code) {
                  setLanguage(lang.code)
                }
              }}
            >
              <span className={styles.itemCode}>{lang.codeShort}</span>
              <span className={styles.itemName}>{lang.name}</span>
              {language === lang.code && (
                <svg
                  className={styles.checkIcon}
                  width="16"
                  height="16"
                  viewBox="0 0 16 16"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <polyline points="4 8 7 11 12 5"></polyline>
                </svg>
              )}
            </DropdownMenu.Item>
          ))}
        </DropdownMenu.Content>
      </DropdownMenu.Portal>
    </DropdownMenu.Root>
  )
}
