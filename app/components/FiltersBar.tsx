'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { useState, useEffect } from 'react'
import { useApp } from '../context/AppContext'
import styles from './FiltersBar.module.css'

export function FiltersBar() {
	const router = useRouter()
	const params = useSearchParams()
	const { translations, language } = useApp()

	const [minPrice, setMinPrice] = useState(params.get('minPrice') || '')
	const [maxPrice, setMaxPrice] = useState(params.get('maxPrice') || '')

	useEffect(() => {
		setMinPrice(params.get('minPrice') || '')
		setMaxPrice(params.get('maxPrice') || '')
	}, [params])

	const apply = () => {
		const sp = new URLSearchParams(params as any)
		if (minPrice) sp.set('minPrice', minPrice)
		else sp.delete('minPrice')
		if (maxPrice) sp.set('maxPrice', maxPrice)
		else sp.delete('maxPrice')
		router.push('/?' + sp.toString())
	}

	return (
		<div className={styles.container}>
			<input
				value={minPrice}
				onChange={(e) => setMinPrice(e.target.value)}
				placeholder={translations.minPrice[language]}
				type="number"
				min="0"
				className={styles.input}
			/>
			<input
				value={maxPrice}
				onChange={(e) => setMaxPrice(e.target.value)}
				placeholder={translations.maxPrice[language]}
				type="number"
				min="0"
				className={styles.input}
			/>
			<button onClick={apply} className={styles.button}>
				{translations.applyFilters[language]}
			</button>
		</div>
	)
}


