'use client'

import { useState } from 'react'
import Link from 'next/link'
import { AppProvider, useApp } from '../../context/AppContext'
import styles from '../AuthPage.module.css'

const translations = {
	registerTitle: { ru: 'Регистрация', en: 'Register', hy: 'Գրանցում', ka: 'რეგისტრაცია' },
	name: { ru: 'Имя (необязательно)', en: 'Name (optional)', hy: 'Անուն (ընտրովի)', ka: 'სახელი (არასავალდებულო)' },
	email: { ru: 'Email', en: 'Email', hy: 'Email', ka: 'Email' },
	password: { ru: 'Пароль', en: 'Password', hy: 'Գաղտնաբառ', ka: 'პაროლი' },
	registering: { ru: 'Отправка...', en: 'Registering...', hy: 'Գրանցվում է...', ka: 'რეგისტრაცია...' },
	register: { ru: 'Зарегистрироваться', en: 'Register', hy: 'Գրանցվել', ka: 'რეგისტრაცია' },
	registerSuccess: { ru: 'Успешно! Теперь вы можете войти.', en: 'Success! You can now sign in.', hy: 'Հաջողված! Այժմ կարող եք մուտք գործել:', ka: 'წარმატება! ახლა შეგიძლიათ შეხვიდეთ.' },
	registerError: { ru: 'Ошибка регистрации', en: 'Registration error', hy: 'Գրանցման սխալ', ka: 'რეგისტრაციის შეცდომა' },
	alreadyHaveAccount: { ru: 'Уже есть аккаунт?', en: 'Already have an account?', hy: 'Արդեն ունեք հաշիվ?', ka: 'უკვე გაქვთ ანგარიში?' },
	signIn: { ru: 'Войти', en: 'Sign In', hy: 'Մուտք', ka: 'შესვლა' }
}

function RegisterForm() {
	const { language } = useApp()
	const [email, setEmail] = useState('')
	const [password, setPassword] = useState('')
	const [name, setName] = useState('')
	const [loading, setLoading] = useState(false)
	const [message, setMessage] = useState<string | null>(null)
	const [error, setError] = useState<string | null>(null)

	const t = (key: keyof typeof translations) => {
		return translations[key]?.[language] || translations[key]?.en || ''
	}

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
				throw new Error(data?.error || t('registerError'))
			}
			setMessage(t('registerSuccess'))
		} catch (err: any) {
			setError(err.message)
		} finally {
			setLoading(false)
		}
	}

	return (
		<div className={styles.container}>
			<h1 className={styles.title}>{t('registerTitle')}</h1>
			<form onSubmit={onSubmit} className={styles.form}>
				<input
					type="text"
					placeholder={t('name')}
					value={name}
					onChange={(e) => setName(e.target.value)}
					className={styles.input}
				/>
				<input
					type="email"
					placeholder={t('email')}
					value={email}
					onChange={(e) => setEmail(e.target.value)}
					required
					className={styles.input}
				/>
				<input
					type="password"
					placeholder={t('password')}
					value={password}
					onChange={(e) => setPassword(e.target.value)}
					required
					minLength={6}
					className={styles.input}
				/>
				<button type="submit" disabled={loading} className={styles.submitButton}>
					{loading ? t('registering') : t('register')}
				</button>
			</form>
			{message && <div className={styles.successMessage}>{message}</div>}
			{error && <div className={styles.errorMessage}>{error}</div>}
			<div className={styles.footer}>
				{t('alreadyHaveAccount')} <Link href="/auth/signin" className={styles.footerLink}>{t('signIn')}</Link>
			</div>
		</div>
	)
}

export default function RegisterPage() {
	return (
		<AppProvider>
			<RegisterForm />
		</AppProvider>
	)
}
