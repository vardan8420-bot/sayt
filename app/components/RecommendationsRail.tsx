'use client'

import { useEffect, useState } from 'react'
import { ProductCard } from './ProductCard'
import { useApp } from '../context/AppContext'
import styles from './RecommendationsRail.module.css'

type Recommendation = {
	id: string
	title: string
	slug: string
	price: number
	images: string[]
	seller: { id: string; name: string | null }
	_count?: { reviews?: number }
}

type RecommendationsRailProps = {
	productId?: string
	variant?: 'general' | 'similar'
	limit?: number
}

export function RecommendationsRail({ productId, variant = 'general', limit = 8 }: RecommendationsRailProps) {
	const { translations, language } = useApp()
	const [items, setItems] = useState<Recommendation[]>([])
	const [loading, setLoading] = useState(true)
	const [error, setError] = useState<string | null>(null)

	useEffect(() => {
		let active = true
		async function load() {
			setLoading(true)
			setError(null)
			try {
				const params = new URLSearchParams({ limit: String(limit) })
				if (productId) params.set('productId', productId)
				const res = await fetch(`/api/recommendations?${params.toString()}`, { cache: 'no-store' })
				if (!res.ok) {
					throw new Error('Failed to load recommendations')
				}
				const data = await res.json()
				if (!active) return
				setItems(data.products || [])
			} catch (err: any) {
				if (!active) return
				setError(err?.message || 'Не удалось загрузить рекомендации')
			} finally {
				if (active) {
					setLoading(false)
				}
			}
		}
		load()
		return () => {
			active = false
		}
	}, [productId, limit])

	const title =
		variant === 'similar' ? translations.similarProductsTitle[language] : translations.recommendationsTitle[language]

	if (!loading && !error && items.length === 0) {
		return (
			<section className={styles.section}>
				<h2 className={styles.title}>{title}</h2>
				<p className={styles.emptyText}>{translations.noRecommendations[language]}</p>
			</section>
		)
	}

	return (
		<section className={styles.section}>
			<div className={styles.header}>
				<h2 className={styles.title}>{title}</h2>
				{loading && <span className={styles.loading}>{translations.loading[language]}</span>}
			</div>
			{error ? (
				<div className={styles.error}>{error}</div>
			) : (
				<div className={styles.grid}>
					{items.map((product) => (
						<ProductCard key={product.id} product={product as any} />
					))}
				</div>
			)}
		</section>
	)
}


