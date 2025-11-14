'use client'

import { useState } from 'react'
import { signIn } from 'next-auth/react'
import Link from 'next/link'
import { AppProvider, useApp } from '../../context/AppContext'
import styles from '../AuthPage.module.css'

const translations = {
	signIn: { ru: 'Войти', en: 'Sign In', hy: 'Մուտք', ka: 'შესვლა' },
	signInTitle: { ru: 'Вход', en: 'Sign In', hy: 'Մուտք', ka: 'შესვლა' },
	signInSubtitle: { ru: 'Войдите с помощью email/пароля или через провайдеров.', en: 'Sign in with email/password or using providers.', hy: 'Մուտք գործեք email/գաղտնաբառով կամ օգտագործելով մատակարարներ:', ka: 'შედით email/პაროლით ან მომწოდებლების გამოყენებით.' },
	email: { ru: 'Email', en: 'Email', hy: 'Email', ka: 'Email' },
	password: { ru: 'Пароль', en: 'Password', hy: 'Գաղտնաբառ', ka: 'პაროლი' },
	signingIn: { ru: 'Входим...', en: 'Signing in...', hy: 'Մուտք գործելու համար...', ka: 'შესვლა...' },
	signInError: { ru: 'Неверный email или пароль', en: 'Invalid email or password', hy: 'Սխալ email կամ գաղտնաբառ', ka: 'არასწორი email ან პაროლი' },
	signInWithGitHub: { ru: 'Войти через GitHub', en: 'Sign in with GitHub', hy: 'Մուտք GitHub-ով', ka: 'შესვლა GitHub-ით' },
	signInWithGoogle: { ru: 'Войти через Google', en: 'Sign in with Google', hy: 'Մուտք Google-ով', ka: 'შესვლა Google-ით' },
	noAccount: { ru: 'Нет аккаунта?', en: 'No account?', hy: 'Չունեք հաշիվ?', ka: 'არ გაქვთ ანგარიში?' },
	registerLink: { ru: 'Зарегистрироваться', en: 'Register', hy: 'Գրանցվել', ka: 'რეგისტრაცია' }
}

function SignInForm() {
	const { language } = useApp()
	const [email, setEmail] = useState('')
	const [password, setPassword] = useState('')
	const [loading, setLoading] = useState(false)
	const [error, setError] = useState<string | null>(null)

	const t = (key: keyof typeof translations) => {
		return translations[key]?.[language] || translations[key]?.en || ''
	}

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
			setError(t('signInError'))
			setLoading(false)
		}
	}

	return (
		<div className={styles.container}>
			<h1 className={styles.title}>{t('signInTitle')}</h1>
			<p className={styles.subtitle}>{t('signInSubtitle')}</p>
			<form onSubmit={onSubmit} className={styles.form}>
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
					className={styles.input}
				/>
				<button type="submit" disabled={loading} className={styles.submitButton}>
					{loading ? t('signingIn') : t('signIn')}
				</button>
			</form>

			{error && <div className={styles.errorMessage}>{error}</div>}

			<div className={styles.socialButtons}>
				<button
					onClick={() => signIn('github', { callbackUrl: '/dashboard' })}
					className={styles.socialButton}
				>
					{t('signInWithGitHub')}
				</button>
				<button
					onClick={() => signIn('google', { callbackUrl: '/dashboard' })}
					className={styles.socialButton}
				>
					{t('signInWithGoogle')}
				</button>
			</div>

			<div className={styles.footer}>
				{t('noAccount')} <Link href="/auth/register" className={styles.footerLink}>{t('registerLink')}</Link>
			</div>
		</div>
	)
}

export default function SignInPage() {
	return (
		<AppProvider>
			<SignInForm />
		</AppProvider>
	)
}
