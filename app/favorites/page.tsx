'use client'

import { useEffect, useState } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import { FavoriteButton } from '../components/FavoriteButton'
import styles from './FavoritesPage.module.css'

type Favorite = {
	id: string
	createdAt: string
	product: {
		id: string
		title: string
		price: string
		images: string[]
		slug: string
		stock: number
		published: boolean
		seller: {
			id: string
			name: string | null
		}
	} | null
	service: {
		id: string
		title: string
		price: string | null
		slug: string
		published: boolean
	} | null
}

export default function FavoritesPage() {
	const { data: session, status } = useSession()
	const router = useRouter()
	const [favorites, setFavorites] = useState<Favorite[]>([])
	const [loading, setLoading] = useState(true)
	const [error, setError] = useState<string | null>(null)

	useEffect(() => {
		if (status === 'loading') return
		if (status === 'unauthenticated') {
			router.push('/auth/signin')
			return
		}
		loadFavorites()
	}, [status, router])

	const loadFavorites = async () => {
		try {
			const res = await fetch('/api/favorites')
			if (!res.ok) {
				throw new Error('Failed to fetch favorites')
			}
			const data = await res.json()
			setFavorites(data.favorites || [])
		} catch (err: any) {
			setError(err.message || 'Ошибка при загрузке избранного')
		} finally {
			setLoading(false)
		}
	}

	const handleRemove = async (itemId: string, productId?: string) => {
		try {
			if (productId) {
				const res = await fetch(`/api/favorites/product/${productId}`, {
					method: 'DELETE',
				})
				if (res.ok) {
					setFavorites(favorites.filter((f) => f.id !== itemId))
				}
			}
		} catch (err: any) {
			console.error('Error removing favorite:', err)
		}
	}

	if (status === 'loading' || loading) {
		return (
			<div className={styles.container}>
				<div className={styles.loading}>Загрузка избранного...</div>
			</div>
		)
	}

	if (error) {
		return (
			<div className={styles.container}>
				<div className={styles.error}>{error}</div>
			</div>
		)
	}

	return (
		<div className={styles.container}>
			<h1 className={styles.title}>Избранное</h1>

			{favorites.length === 0 ? (
				<div className={styles.empty}>
					<p>У вас пока нет избранных товаров</p>
					<Link href="/" className={styles.linkButton}>
						Перейти к покупкам
					</Link>
				</div>
			) : (
				<div className={styles.grid}>
					{favorites.map((favorite) => {
						const item = favorite.product || favorite.service
						if (!item || !item.published) return null

						return (
							<div key={favorite.id} className={styles.item}>
								<Link href={`/product/${item.slug}`} className={styles.itemLink}>
									<div className={styles.itemImage}>
										<Image
											src={favorite.product?.images?.[0] || '/icon-512.png'}
											alt={item.title}
											width={200}
											height={200}
											style={{ objectFit: 'cover' }}
										/>
									</div>
									<div className={styles.itemDetails}>
										<h3 className={styles.itemTitle}>{item.title}</h3>
										{favorite.product && (
											<div className={styles.itemMeta}>
												Продавец: {favorite.product.seller.name || '—'}
											</div>
										)}
										<div className={styles.itemPrice}>
											{item.price ? `$${Number(item.price).toFixed(2)}` : 'Договорная цена'}
										</div>
									</div>
								</Link>
								<div className={styles.itemActions}>
									{favorite.product && (
										<FavoriteButton productId={favorite.product.id} />
									)}
									<button
										className={styles.removeButton}
										onClick={() => handleRemove(favorite.id, favorite.product?.id)}
									>
										Удалить
									</button>
								</div>
							</div>
						)
					})}
				</div>
			)}
		</div>
	)
}

