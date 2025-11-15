'use client'

import { useEffect } from 'react'
import Link from 'next/link'
import styles from './error.module.css'

export default function Error({
	error,
	reset,
}: {
	error: Error & { digest?: string }
	reset: () => void
}) {
	useEffect(() => {
		// Log error to monitoring service
		console.error('Application error:', error)
	}, [error])

	return (
		<div className={styles.container}>
			<div className={styles.content}>
				<h1 className={styles.title}>Что-то пошло не так</h1>
				<p className={styles.message}>
					Произошла непредвиденная ошибка. Мы уже работаем над её устранением.
				</p>
				{error.digest && (
					<p className={styles.digest}>ID ошибки: {error.digest}</p>
				)}
				<div className={styles.actions}>
					<button onClick={reset} className={styles.button}>
						Попробовать снова
					</button>
					<Link href="/" className={styles.link}>
						Вернуться на главную
					</Link>
				</div>
			</div>
		</div>
	)
}

