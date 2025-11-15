'use client'

import { Component, ReactNode } from 'react'
import Link from 'next/link'
import styles from './ErrorBoundary.module.css'

interface Props {
	children: ReactNode
	fallback?: ReactNode
}

interface State {
	hasError: boolean
	error: Error | null
}

export class ErrorBoundary extends Component<Props, State> {
	constructor(props: Props) {
		super(props)
		this.state = { hasError: false, error: null }
	}

	static getDerivedStateFromError(error: Error): State {
		return { hasError: true, error }
	}

	componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
		console.error('ErrorBoundary caught an error:', error, errorInfo)
		// Here you can log to your error monitoring service
		// Example: captureError(error, { errorInfo })
	}

	render() {
		if (this.state.hasError) {
			if (this.props.fallback) {
				return this.props.fallback
			}

			return (
				<div className={styles.container}>
					<div className={styles.content}>
						<h2 className={styles.title}>Что-то пошло не так</h2>
						<p className={styles.message}>
							Произошла ошибка при загрузке этого компонента. Пожалуйста, попробуйте обновить страницу.
						</p>
						{this.state.error && (
							<details className={styles.details}>
								<summary className={styles.summary}>Детали ошибки</summary>
								<pre className={styles.error}>{this.state.error.message}</pre>
							</details>
						)}
						<div className={styles.actions}>
							<button
								onClick={() => {
									this.setState({ hasError: false, error: null })
									window.location.reload()
								}}
								className={styles.button}
							>
								Обновить страницу
							</button>
							<Link href="/" className={styles.link}>
								На главную
							</Link>
						</div>
					</div>
				</div>
			)
		}

		return this.props.children
	}
}

