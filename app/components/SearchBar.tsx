'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { useState, useEffect, useCallback, useRef } from 'react'
import { useApp } from '../context/AppContext'
import styles from './SearchBar.module.css'

type Suggestion = {
	id: string
	title: string
	slug: string
	price: number
	image: string | null
	category: string | null
	type: 'product' | 'trending'
}

type SearchBarProps = {
	onCategoriesClick?: () => void
}

export function SearchBar({ onCategoriesClick }: SearchBarProps = {}) {
	const router = useRouter()
	const params = useSearchParams()
	const { translations, language } = useApp()
	
	const categoriesText = translations.categories?.[language] || translations.applyFilters[language]
	const [q, setQ] = useState(params.get('q') || '')
	const [suggestions, setSuggestions] = useState<Suggestion[]>([])
	const [trending, setTrending] = useState<Suggestion[]>([])
	const [open, setOpen] = useState(false)
	const [loading, setLoading] = useState(false)
	const [error, setError] = useState<string | null>(null)
	const abortRef = useRef<AbortController | null>(null)
	const blurTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

	useEffect(() => {
		setQ(params.get('q') || '')
	}, [params])

	useEffect(() => {
		return () => {
			abortRef.current?.abort()
			if (blurTimer.current) {
				clearTimeout(blurTimer.current)
			}
		}
	}, [])

	const fetchSuggestions = useCallback(
		async (query: string) => {
			abortRef.current?.abort()
			const controller = new AbortController()
			abortRef.current = controller
			setLoading(true)
			setError(null)
			try {
				const searchParams = new URLSearchParams()
				if (query) {
					searchParams.set('q', query)
				}
				const res = await fetch(`/api/search/suggestions?${searchParams.toString()}`, {
					signal: controller.signal,
					cache: 'no-store',
				})
				if (!res.ok) {
					throw new Error('Failed to fetch suggestions')
				}
				const data = await res.json()
				setSuggestions(data.suggestions || [])
				setTrending(data.trending || [])
			} catch (err: any) {
				if (err.name !== 'AbortError') {
					setError(err?.message || 'Ошибка поиска')
				}
			} finally {
				if (!controller.signal.aborted) {
					setLoading(false)
				}
			}
		},
		[],
	)

	useEffect(() => {
		if (!open) return
		const handler = setTimeout(() => {
			fetchSuggestions(q.trim())
		}, 250)
		return () => clearTimeout(handler)
	}, [q, open, fetchSuggestions])

	const handleSubmit = (e: React.FormEvent) => {
		e.preventDefault()
		const sp = new URLSearchParams(params.toString())
		if (q) sp.set('q', q)
		else sp.delete('q')
		const queryString = sp.toString()
		router.push(queryString ? `/search?${queryString}` : '/search')
		setOpen(false)
	}

	const handleFocus = () => {
		if (blurTimer.current) {
			clearTimeout(blurTimer.current)
		}
		setOpen(true)
		if (suggestions.length === 0 && trending.length === 0) {
			fetchSuggestions(q.trim())
		}
	}

	const handleBlur = () => {
		blurTimer.current = setTimeout(() => setOpen(false), 150)
	}

	const handleSuggestionClick = (suggestion: Suggestion) => {
		setOpen(false)
		if (suggestion.slug) {
			router.push(`/product/${suggestion.slug}`)
		} else if (suggestion.title) {
			router.push(`/search?q=${encodeURIComponent(suggestion.title)}`)
		}
	}

	const renderSuggestion = (suggestion: Suggestion) => {
		return (
			<button
				type="button"
				key={suggestion.id}
				onMouseDown={(e) => e.preventDefault()}
				onClick={() => handleSuggestionClick(suggestion)}
				className={styles.suggestion}
			>
				<div className={styles.suggestionDetails}>
					<span className={styles.suggestionTitle}>{suggestion.title}</span>
					{suggestion.category && <span className={styles.suggestionCategory}>{suggestion.category}</span>}
				</div>
				<span className={styles.suggestionPrice}>${suggestion.price.toFixed(2)}</span>
			</button>
		)
	}

	return (
		<div className={styles.container}>
			<div className={styles.categoriesSection}>
				<button
					type="button"
					className={styles.categoriesButton}
					aria-label={categoriesText}
					title={categoriesText}
					onClick={onCategoriesClick}
				>
					<span>{categoriesText}</span>
					<svg
						className={styles.categoriesIcon}
						width="14"
						height="14"
						viewBox="0 0 16 16"
						fill="none"
						stroke="currentColor"
						strokeWidth="2"
						strokeLinecap="round"
						strokeLinejoin="round"
					>
						<line x1="2" y1="4" x2="14" y2="4"></line>
						<line x1="2" y1="8" x2="14" y2="8"></line>
						<line x1="2" y1="12" x2="14" y2="12"></line>
					</svg>
				</button>
			</div>
			<div className={styles.searchSection}>
				<form onSubmit={handleSubmit} className={styles.form}>
					<input
						value={q}
						onChange={(e) => setQ(e.target.value)}
						onFocus={handleFocus}
						onBlur={handleBlur}
						placeholder={translations.searchPlaceholder[language]}
						className={styles.input}
					/>
					<button
						type="submit"
						className={styles.button}
					>
						{translations.searchButton[language]}
					</button>
				</form>
				{open && (
					<div onMouseDown={(e) => e.preventDefault()} className={styles.panel}>
						<div className={styles.panelHeading}>
							<strong>{translations.searchSuggestionsTitle[language]}</strong>
						</div>
						{loading && (
							<div className={styles.message}>{translations.loading[language]}</div>
						)}
						{error && !loading && (
							<div className={styles.error}>{error}</div>
						)}
						{!loading && !error && (
							<>
								{q.trim().length >= 2 ? (
									suggestions.length > 0 ? (
										suggestions.map(renderSuggestion)
									) : (
										<div className={styles.message}>{translations.searchNoResults[language]}</div>
									)
								) : null}
								<div className={`${styles.panelHeading} ${styles.panelHeadingMuted}`}>
									<strong>{translations.searchTrendingTitle[language]}</strong>
								</div>
								{trending.length > 0 ? (
									trending.map(renderSuggestion)
								) : (
									<div className={styles.message}>{translations.searchNoResults[language]}</div>
								)}
							</>
						)}
					</div>
				)}
			</div>
		</div>
	)
}
