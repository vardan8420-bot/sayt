'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import Image from 'next/image'
import styles from './ReviewsSection.module.css'

type Review = {
	id: string
	rating: number
	comment: string | null
	images: string[]
	createdAt: string
	author: {
		id: string
		name: string | null
		image: string | null
	}
}

type ReviewsSectionProps = {
	productId: string
}

export function ReviewsSection({ productId }: ReviewsSectionProps) {
	const { data: session } = useSession()
	const [reviews, setReviews] = useState<Review[]>([])
	const [avgRating, setAvgRating] = useState(0)
	const [loading, setLoading] = useState(true)
	const [submitting, setSubmitting] = useState(false)
	const [showForm, setShowForm] = useState(false)
	const [rating, setRating] = useState(0)
	const [comment, setComment] = useState('')
	const [error, setError] = useState<string | null>(null)

	useEffect(() => {
		loadReviews()
	}, [productId])

	const loadReviews = async () => {
		try {
			const res = await fetch(`/api/reviews?productId=${productId}`)
			if (!res.ok) throw new Error('Failed to load reviews')
			const data = await res.json()
			setReviews(data.reviews || [])
			setAvgRating(data.avgRating || 0)
		} catch (err: any) {
			console.error('Error loading reviews:', err)
		} finally {
			setLoading(false)
		}
	}

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault()
		if (!session) {
			setError('Войдите, чтобы оставить отзыв')
			return
		}

		if (rating < 1 || rating > 5) {
			setError('Выберите оценку от 1 до 5')
			return
		}

		setSubmitting(true)
		setError(null)

		try {
			const res = await fetch('/api/reviews', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({
					productId,
					rating,
					comment: comment.trim() || null,
				}),
			})

			const data = await res.json()

			if (!res.ok) {
				throw new Error(data.error || 'Failed to submit review')
			}

			// Обновляем список отзывов
			await loadReviews()

			// Сбрасываем форму
			setRating(0)
			setComment('')
			setShowForm(false)
		} catch (err: any) {
			setError(err.message || 'Ошибка при отправке отзыва')
		} finally {
			setSubmitting(false)
		}
	}

	const renderStars = (value: number, interactive = false, onChange?: (value: number) => void) => {
		return (
			<div className={styles.stars}>
				{[1, 2, 3, 4, 5].map((star) => (
					<button
						key={star}
						type="button"
						className={`${styles.star} ${star <= value ? styles.starFilled : ''}`}
						onClick={() => interactive && onChange?.(star)}
						disabled={!interactive || submitting}
					>
						★
					</button>
				))}
			</div>
		)
	}

	if (loading) {
		return <div className={styles.container}>Загрузка отзывов...</div>
	}

	return (
		<div className={styles.container}>
			<div className={styles.header}>
				<h2 className={styles.title}>Отзывы</h2>
				{avgRating > 0 && (
					<div className={styles.ratingSummary}>
						<span className={styles.avgRating}>{avgRating.toFixed(1)}</span>
						{renderStars(Math.round(avgRating))}
						<span className={styles.reviewCount}>({reviews.length})</span>
					</div>
				)}
			</div>

			{session && !reviews.some((r) => r.author.id === session.user?.id) && (
				<div className={styles.addReview}>
					{!showForm ? (
						<button
							className={styles.addButton}
							onClick={() => setShowForm(true)}
						>
							Оставить отзыв
						</button>
					) : (
						<form onSubmit={handleSubmit} className={styles.form}>
							{error && <div className={styles.error}>{error}</div>}
							<div className={styles.formGroup}>
								<label>Оценка:</label>
								{renderStars(rating, true, setRating)}
							</div>
							<div className={styles.formGroup}>
								<label htmlFor="comment">Комментарий:</label>
								<textarea
									id="comment"
									value={comment}
									onChange={(e) => setComment(e.target.value)}
									className={styles.textarea}
									rows={4}
									placeholder="Опишите ваш опыт покупки..."
								/>
							</div>
							<div className={styles.formActions}>
								<button type="submit" className={styles.submitButton} disabled={submitting || rating === 0}>
									{submitting ? 'Отправка...' : 'Отправить'}
								</button>
								<button
									type="button"
									className={styles.cancelButton}
									onClick={() => {
										setShowForm(false)
										setRating(0)
										setComment('')
										setError(null)
									}}
									disabled={submitting}
								>
									Отмена
								</button>
							</div>
						</form>
					)}
				</div>
			)}

			<div className={styles.reviews}>
				{reviews.length === 0 ? (
					<div className={styles.empty}>Пока нет отзывов. Будьте первым!</div>
				) : (
					reviews.map((review) => (
						<div key={review.id} className={styles.review}>
							<div className={styles.reviewHeader}>
								<div className={styles.reviewAuthor}>
									{review.author.image && (
										<Image
											src={review.author.image}
											alt={review.author.name || 'User'}
											width={40}
											height={40}
											className={styles.authorImage}
										/>
									)}
									<div>
										<div className={styles.authorName}>{review.author.name || 'Аноним'}</div>
										<div className={styles.reviewDate}>
											{new Date(review.createdAt).toLocaleDateString('ru-RU')}
										</div>
									</div>
								</div>
								{renderStars(review.rating)}
							</div>
							{review.comment && <div className={styles.reviewComment}>{review.comment}</div>}
							{review.images && review.images.length > 0 && (
								<div className={styles.reviewImages}>
									{review.images.map((img, idx) => (
										<Image
											key={idx}
											src={img}
											alt={`Review image ${idx + 1}`}
											width={100}
											height={100}
											className={styles.reviewImage}
										/>
									))}
								</div>
							)}
						</div>
					))
				)}
			</div>
		</div>
	)
}

