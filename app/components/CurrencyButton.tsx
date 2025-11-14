'use client'

import * as DropdownMenu from '@radix-ui/react-dropdown-menu'
import { useApp } from '../context/AppContext'
import styles from './CurrencyButton.module.css'

type CurrencyButtonProps = {
	className?: string
}

export function CurrencyButton({ className }: CurrencyButtonProps = {}) {
	const { currency, setCurrency, translations, language } = useApp()
	
	const currencies: Array<{ code: 'USD' | 'RUB' | 'AMD' | 'GEL'; symbol: string }> = [
		{ code: 'USD', symbol: '$' },
		{ code: 'RUB', symbol: '₽' },
		{ code: 'AMD', symbol: '֏' },
		{ code: 'GEL', symbol: '₾' }
	]

	const currentCurrency = currencies.find(curr => curr.code === currency) || currencies[0]
	const isHeader = className === 'header'

	return (
		<DropdownMenu.Root>
			<DropdownMenu.Trigger asChild>
				<button
					className={`${styles.trigger} ${isHeader ? styles.triggerHeader : ''}`}
					aria-label="Select currency"
				>
					<span className={styles.symbol}>{currentCurrency.symbol}</span>
					<span className={styles.code}>{currentCurrency.code}</span>
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
					{currencies.map((curr) => (
						<DropdownMenu.Item
							key={curr.code}
							className={`${styles.item} ${currency === curr.code ? styles.itemActive : ''}`}
							onSelect={() => {
								if (currency !== curr.code) {
									setCurrency(curr.code)
								}
							}}
						>
							<span className={styles.itemSymbol}>{curr.symbol}</span>
							<span className={styles.itemCode}>{curr.code}</span>
							<span className={styles.itemName}>{(translations.currencyNames as any)[curr.code]?.[language] || curr.code}</span>
							{currency === curr.code && (
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
