import Link from 'next/link'
import styles from '../AuthPage.module.css'

const messages: Record<string, string> = {
	Configuration: 'Ошибка конфигурации провайдера.',
	AccessDenied: 'Доступ запрещён.',
	Verification: 'Ошибка верификации.',
	CredentialsSignin: 'Неверный email или пароль.',
	Default: 'Произошла ошибка входа.',
}

export default function AuthErrorPage({ searchParams }: { searchParams: { error?: string } }) {
	const code = searchParams?.error || 'Default'
	const message = messages[code] || messages.Default

	return (
		<div className={styles.errorContainer}>
			<h1 className={styles.errorTitle}>Ошибка входа</h1>
			<p className={styles.errorText}>{message}</p>
			<Link href="/auth/signin" className={styles.errorLink}>Вернуться на страницу входа</Link>
		</div>
	)
}


