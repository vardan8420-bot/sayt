'use client'

import { useState } from 'react'
import Link from 'next/link'
import styles from '../AuthPage.module.css'

export default function RegisterPage() {
	const [email, setEmail] = useState('')
	const [password, setPassword] = useState('')
	const [name, setName] = useState('')
	const [loading, setLoading] = useState(false)
	const [message, setMessage] = useState<string | null>(null)
	const [error, setError] = useState<string | null>(null)

	const onSubmit = async (e: React.FormEvent) => {
		e.preventDefault()
		setLoading(true)
		setError(null)
		setMessage(null)
		try {
			const res = await fetch('/api/auth/register', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ email, password, name }),
			})
			const data = await res.json()
			if (!res.ok) {
				throw new Error(data?.error || 'Ошибка регистрации')
			}
			setMessage('Успешно! Теперь вы можете войти.')
		} catch (err: any) {
			setError(err.message)
		} finally {
			setLoading(false)
		}
	}

	return (
		<div className={styles.container}>
			<h1 className={styles.title}>Регистрация</h1>
			<form onSubmit={onSubmit} className={styles.form}>
				<input
					type="text"
					placeholder="Имя (необязательно)"
					value={name}
					onChange={(e) => setName(e.target.value)}
					className={styles.input}
				/>
				<input
					type="email"
					placeholder="Email"
					value={email}
					onChange={(e) => setEmail(e.target.value)}
					required
					className={styles.input}
				/>
				<input
					type="password"
					placeholder="Пароль"
					value={password}
					onChange={(e) => setPassword(e.target.value)}
					required
					minLength={6}
					className={styles.input}
				/>
				<button type="submit" disabled={loading} className={styles.submitButton}>
					{loading ? 'Отправка...' : 'Зарегистрироваться'}
				</button>
			</form>
			{message && <div className={styles.successMessage}>{message}</div>}
			{error && <div className={styles.errorMessage}>{error}</div>}
			<div className={styles.footer}>
				Уже есть аккаунт? <Link href="/auth/signin" className={styles.footerLink}>Войти</Link>
			</div>
		</div>
	)
}


