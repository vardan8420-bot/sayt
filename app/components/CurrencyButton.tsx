'use client'

import { useApp } from '../context/AppContext'
import styles from './CurrencyButton.module.css'

type CurrencyButtonProps = {
	className?: string
}

export function CurrencyButton({ className }: CurrencyButtonProps = {}) {
	const { currency, setCurrency, translations, language } = useApp()
	
	const currencies: Array<{ code: 'USD' | 'EUR' | 'RUB'; symbol: string }> = [
		{ code: 'USD', symbol: '$' },
		{ code: 'EUR', symbol: '€' },
		{ code: 'RUB', symbol: '₽' }
	]

	const handleCurrencyChange = (e: React.MouseEvent<HTMLButtonElement>, newCurrency: 'USD' | 'EUR' | 'RUB') => {
		e.preventDefault()
		e.stopPropagation()
		if (currency !== newCurrency) {
			setCurrency(newCurrency)
		}
	}

	return (
		<div className={`${styles.container} ${className || ''}`}>
      <span className={styles.label}>{translations.currency[language]}:</span>
      <div className={styles.buttonGroup}>
        {currencies.map((curr) => (
          <button
            key={curr.code}
            className={`${styles.button} ${currency === curr.code ? styles.active : ''}`}
            onClick={(e) => handleCurrencyChange(e, curr.code)}
            type="button"
            aria-label={`Switch to ${curr.code}`}
            aria-pressed={currency === curr.code}
          >
            {curr.symbol} {curr.code}
          </button>
        ))}
      </div>
    </div>
  )
}

