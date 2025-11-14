'use client'

import { useState } from 'react'
import { signIn } from 'next-auth/react'
import Link from 'next/link'
import styles from './AuthPage.module.css'

export default function SignInPage() {
	const [email, setEmail] = useState('')
	const [password, setPassword] = useState('')
	const [loading, setLoading] = useState(false)
	const [error, setError] = useState<string | null>(null)

	const onSubmit = async (e: React.FormEvent) => {
		e.preventDefault()
		setLoading(true)
		setError(null)
		const res = await signIn('credentials', {
			email,
			password,
			redirect: true,
			callbackUrl: '/dashboard',
		})
		if (res?.error) {
			setError('Неверный email или пароль')
			setLoading(false)
		}
	}

	return (
		<div className={styles.container}>
			<h1 className={styles.title}>Вход</h1>
			<p className={styles.subtitle}>Войдите с помощью email/пароля или через провайдеров.</p>
			<form onSubmit={onSubmit} className={styles.form}>
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
					className={styles.input}
				/>
				<button type="submit" disabled={loading} className={styles.submitButton}>
					{loading ? 'Входим...' : 'Войти'}
				</button>
			</form>

			{error && <div className={styles.errorMessage}>{error}</div>}

			<div className={styles.socialButtons}>
				<button
					onClick={() => signIn('github', { callbackUrl: '/dashboard' })}
					className={styles.socialButton}
				>
					Войти через GitHub
				</button>
				<button
					onClick={() => signIn('google', { callbackUrl: '/dashboard' })}
					className={styles.socialButton}
				>
					Войти через Google
				</button>
			</div>

			<div className={styles.footer}>
				Нет аккаунта? <Link href="/auth/register" className={styles.footerLink}>Зарегистрироваться</Link>
			</div>
		</div>
	)
}


