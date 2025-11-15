'use client'

import { useEffect, useState } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import styles from './CartPage.module.css'

type CartItem = {
	id: string
	quantity: number
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
	}
}

export default function CartPage() {
	const { data: session, status } = useSession()
	const router = useRouter()
	const [items, setItems] = useState<CartItem[]>([])
	const [loading, setLoading] = useState(true)
	const [error, setError] = useState<string | null>(null)
	const [updating, setUpdating] = useState<string | null>(null)

	useEffect(() => {
		if (status === 'loading') return
		if (status === 'unauthenticated') {
			router.push('/auth/signin')
			return
		}
		fetchCart()
	}, [status, router])

	const fetchCart = async () => {
		try {
			const res = await fetch('/api/cart')
			if (!res.ok) {
				throw new Error('Failed to fetch cart')
			}
			const data = await res.json()
			setItems(data.items || [])
		} catch (err: any) {
			setError(err.message || 'Ошибка при загрузке корзины')
		} finally {
			setLoading(false)
		}
	}

	const updateQuantity = async (itemId: string, quantity: number) => {
		if (quantity < 1) {
			deleteItem(itemId)
			return
		}

		setUpdating(itemId)
		try {
			const res = await fetch(`/api/cart/${itemId}`, {
				method: 'PATCH',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ quantity }),
			})

			if (!res.ok) {
				throw new Error('Failed to update quantity')
			}

			await fetchCart()
		} catch (err: any) {
			setError(err.message || 'Ошибка при обновлении количества')
		} finally {
			setUpdating(null)
		}
	}

	const deleteItem = async (itemId: string) => {
		setUpdating(itemId)
		try {
			const res = await fetch(`/api/cart/${itemId}`, {
				method: 'DELETE',
			})

			if (!res.ok) {
				throw new Error('Failed to delete item')
			}

			setItems(items.filter((item) => item.id !== itemId))
		} catch (err: any) {
			setError(err.message || 'Ошибка при удалении товара')
		} finally {
			setUpdating(null)
		}
	}

	const total = items.reduce((sum, item) => {
		return sum + Number(item.product.price) * item.quantity
	}, 0)

	if (status === 'loading' || loading) {
		return (
			<div className={styles.container}>
				<div className={styles.loading}>Загрузка корзины...</div>
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
			<h1 className={styles.title}>Корзина</h1>

			{items.length === 0 ? (
				<div className={styles.empty}>
					<p>Корзина пуста</p>
					<Link href="/" className={styles.linkButton}>
						Перейти к покупкам
					</Link>
				</div>
			) : (
				<div className={styles.grid}>
					<div className={styles.items}>
						{items.map((item) => (
							<div key={item.id} className={styles.item}>
								<Link href={`/product/${item.product.slug}`} className={styles.itemImage}>
									<Image
										src={item.product.images[0] || '/icon-512.png'}
										alt={item.product.title}
										width={120}
										height={120}
										style={{ objectFit: 'cover' }}
									/>
								</Link>
								<div className={styles.itemDetails}>
									<Link href={`/product/${item.product.slug}`} className={styles.itemTitle}>
										{item.product.title}
									</Link>
									<div className={styles.itemMeta}>
										Продавец: {item.product.seller.name || '—'} • В наличии: {item.product.stock}
									</div>
									<div className={styles.itemPrice}>${Number(item.product.price).toFixed(2)}</div>
								</div>
								<div className={styles.itemControls}>
									<div className={styles.quantity}>
										<button
											className={styles.quantityButton}
											onClick={() => updateQuantity(item.id, item.quantity - 1)}
											disabled={updating === item.id || item.quantity <= 1}
										>
											−
										</button>
										<span className={styles.quantityValue}>{item.quantity}</span>
										<button
											className={styles.quantityButton}
											onClick={() => updateQuantity(item.id, item.quantity + 1)}
											disabled={updating === item.id || item.quantity >= item.product.stock}
										>
											+
										</button>
									</div>
									<button
										className={styles.deleteButton}
										onClick={() => deleteItem(item.id)}
										disabled={updating === item.id}
									>
										Удалить
									</button>
								</div>
								<div className={styles.itemTotal}>
									${(Number(item.product.price) * item.quantity).toFixed(2)}
								</div>
							</div>
						))}
					</div>
					<div className={styles.summary}>
						<h2 className={styles.summaryTitle}>Итого</h2>
						<div className={styles.summaryRow}>
							<span>Товаров: {items.length}</span>
							<span>{items.reduce((sum, item) => sum + item.quantity, 0)} шт.</span>
						</div>
						<div className={styles.summaryRow}>
							<span>Сумма:</span>
							<span className={styles.totalAmount}>${total.toFixed(2)}</span>
						</div>
						<button
							className={styles.checkoutButton}
							onClick={() => router.push('/checkout')}
						>
							Оформить заказ
						</button>
						<Link href="/" className={styles.continueButton}>
							Продолжить покупки
						</Link>
					</div>
				</div>
			)}
		</div>
	)
}

