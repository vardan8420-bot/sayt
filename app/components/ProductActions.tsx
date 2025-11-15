'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'
import styles from './ProductActions.module.css'

type ProductActionsProps = {
	productId: string
	stock: number
	published: boolean
}

export function ProductActions({ productId, stock, published }: ProductActionsProps) {
	const router = useRouter()
	const { data: session } = useSession()
	const [loading, setLoading] = useState(false)
	const [message, setMessage] = useState<string | null>(null)

	const handleAddToCart = async () => {
		if (!session) {
			router.push('/auth/signin')
			return
		}

		setLoading(true)
		setMessage(null)

		try {
			const res = await fetch('/api/cart', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ productId, quantity: 1 }),
			})

			const data = await res.json()

			if (!res.ok) {
				setMessage(data.error || 'Ошибка при добавлении в корзину')
				return
			}

			setMessage('Товар добавлен в корзину!')
			setTimeout(() => {
				setMessage(null)
				router.refresh()
			}, 2000)
		} catch (error) {
			setMessage('Ошибка при добавлении в корзину')
			console.error('Error adding to cart:', error)
		} finally {
			setLoading(false)
		}
	}

	const handleBuyNow = async () => {
		if (!session) {
			router.push('/auth/signin')
			return
		}

		setLoading(true)
		setMessage(null)

		try {
			// Сначала добавляем в корзину
			const res = await fetch('/api/cart', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ productId, quantity: 1 }),
			})

			if (!res.ok) {
				const data = await res.json()
				setMessage(data.error || 'Ошибка при добавлении в корзину')
				return
			}

			// Перенаправляем на checkout
			router.push(`/checkout?productId=${productId}`)
		} catch (error) {
			setMessage('Ошибка при оформлении заказа')
			console.error('Error buying now:', error)
		} finally {
			setLoading(false)
		}
	}

	const isDisabled = !published || stock === 0 || loading

	return (
		<div className={styles.container}>
			{message && <div className={styles.message}>{message}</div>}
			<div className={styles.actions}>
				<button
					className={styles.buttonPrimary}
					onClick={handleAddToCart}
					disabled={isDisabled}
				>
					{loading ? 'Загрузка...' : 'Добавить в корзину'}
				</button>
				<button
					className={styles.buttonSecondary}
					onClick={handleBuyNow}
					disabled={isDisabled}
				>
					{loading ? 'Загрузка...' : 'Купить сейчас'}
				</button>
			</div>
		</div>
	)
}

