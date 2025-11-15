'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import styles from './FavoriteButton.module.css'

type FavoriteButtonProps = {
	productId: string
}

export function FavoriteButton({ productId }: FavoriteButtonProps) {
	const { data: session } = useSession()
	const router = useRouter()
	const [isFavorite, setIsFavorite] = useState(false)
	const [loading, setLoading] = useState(false)
	const [checking, setChecking] = useState(true)

	useEffect(() => {
		if (session) {
			checkFavorite()
		} else {
			setChecking(false)
		}
	}, [session, productId])

	const checkFavorite = async () => {
		try {
			const res = await fetch(`/api/favorites?productId=${productId}`)
			if (res.ok) {
				const data = await res.json()
				setIsFavorite(data.favorites && data.favorites.length > 0)
			}
		} catch (error) {
			console.error('Error checking favorite:', error)
		} finally {
			setChecking(false)
		}
	}

	const toggleFavorite = async () => {
		if (!session) {
			router.push('/auth/signin')
			return
		}

		setLoading(true)

		try {
			if (isFavorite) {
				// Удаляем из избранного
				const res = await fetch(`/api/favorites/product/${productId}`, {
					method: 'DELETE',
				})

				if (res.ok) {
					setIsFavorite(false)
				} else {
					const data = await res.json()
					console.error('Error removing favorite:', data.error)
				}
			} else {
				// Добавляем в избранное
				const res = await fetch('/api/favorites', {
					method: 'POST',
					headers: { 'Content-Type': 'application/json' },
					body: JSON.stringify({ productId }),
				})

				if (res.ok) {
					setIsFavorite(true)
				} else {
					const data = await res.json()
					console.error('Error adding favorite:', data.error)
				}
			}
		} catch (error) {
			console.error('Error toggling favorite:', error)
		} finally {
			setLoading(false)
		}
	}

	if (checking) {
		return null
	}

	return (
		<button
			className={`${styles.button} ${isFavorite ? styles.active : ''}`}
			onClick={toggleFavorite}
			disabled={loading}
			aria-label={isFavorite ? 'Удалить из избранного' : 'Добавить в избранное'}
			title={isFavorite ? 'Удалить из избранного' : 'Добавить в избранное'}
		>
			<svg
				className={styles.icon}
				width="24"
				height="24"
				viewBox="0 0 24 24"
				fill={isFavorite ? 'currentColor' : 'none'}
				stroke="currentColor"
				strokeWidth="2"
				strokeLinecap="round"
				strokeLinejoin="round"
			>
				<path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
			</svg>
		</button>
	)
}

