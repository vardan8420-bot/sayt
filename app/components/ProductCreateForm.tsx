'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import styles from './ProductCreateForm.module.css'

export function ProductCreateForm() {
	const router = useRouter()
	const [title, setTitle] = useState('')
	const [description, setDescription] = useState('')
	const [price, setPrice] = useState('')
	const [stock, setStock] = useState('1')
	const [published, setPublished] = useState(true)
	const [loading, setLoading] = useState(false)
	const [message, setMessage] = useState<string | null>(null)
	const [error, setError] = useState<string | null>(null)

	const submit = async (e: React.FormEvent) => {
		e.preventDefault()
		setLoading(true)
		setMessage(null)
		setError(null)
		try {
			const payload = {
				title,
				description,
				price: Number(price),
				images: [],
				categoryId: null,
				location: null,
				stock: Number(stock) || 1,
				published,
				metaTitle: null,
				metaDesc: null,
				tags: [],
			}
			const res = await fetch('/api/products', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify(payload),
			})
			const data = await res.json()
			if (!res.ok) {
				throw new Error(data?.error || 'Ошибка создания товара')
			}
			setMessage('Товар создан')
			setTitle('')
			setDescription('')
			setPrice('')
			setStock('1')
			setPublished(true)
			router.refresh()
		} catch (err: any) {
			setError(err.message || 'Ошибка')
		} finally {
			setLoading(false)
		}
	}

	return (
		<form onSubmit={submit} className={styles.form}>
			<input
				value={title}
				onChange={(e) => setTitle(e.target.value)}
				placeholder="Название"
				required
				className={styles.input}
			/>
			<textarea
				value={description}
				onChange={(e) => setDescription(e.target.value)}
				placeholder="Описание"
				required
				className={styles.textarea}
			/>
			<div className={styles.row}>
				<input
					type="number"
					step="0.01"
					min="0"
					value={price}
					onChange={(e) => setPrice(e.target.value)}
					placeholder="Цена"
					required
					className={styles.priceInput}
				/>
				<input
					type="number"
					min="1"
					value={stock}
					onChange={(e) => setStock(e.target.value)}
					placeholder="Кол-во"
					className={styles.stockInput}
				/>
			</div>
			<label className={styles.checkboxLabel}>
				<input
					type="checkbox"
					checked={published}
					onChange={(e) => setPublished(e.target.checked)}
				/>
				Опубликовать сразу
			</label>
			<button type="submit" disabled={loading} className={styles.submitButton}>
				{loading ? 'Сохраняю...' : 'Создать товар'}
			</button>
			{message && <div className={styles.successMessage}>{message}</div>}
			{error && <div className={styles.errorMessage}>{error}</div>}
		</form>
	)
}


