'use client'

import styles from './ProductGrid.module.css'
import { ProductCard } from './ProductCard'
import { useApp } from '../context/AppContext'

type ApiProduct = {
	id: string
	title: string
	description: string
	price: number
	images: string[]
	slug: string
	seller: { id: string; name: string | null }
	_count?: { reviews?: number; favorites?: number }
}

export function ProductList({ products }: { products: ApiProduct[] }) {
	const { translations, language } = useApp()

	if (!products.length) {
		return <div className={styles.empty}>{translations.noProducts[language]}</div>
	}

	return (
		<div className={styles.grid}>
			{products.map((product) => (
				<ProductCard key={product.id} product={product} />
			))}
		</div>
	)
}


