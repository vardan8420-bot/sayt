'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { useState, useEffect } from 'react'
import { useApp } from '../context/AppContext'
import styles from './FiltersBar.module.css'

export function FiltersBar() {
	const router = useRouter()
	const params = useSearchParams()
	const { translations, language } = useApp()

	const [minPrice, setMinPrice] = useState(params.get('minPrice') || '')
	const [maxPrice, setMaxPrice] = useState(params.get('maxPrice') || '')
	const [rentalType, setRentalType] = useState(params.get('rentalType') || '')
	const [rentalPeriod, setRentalPeriod] = useState(params.get('rentalPeriod') || '')
	const [sortBy, setSortBy] = useState(params.get('sortBy') || '')

	useEffect(() => {
		setMinPrice(params.get('minPrice') || '')
		setMaxPrice(params.get('maxPrice') || '')
		setRentalType(params.get('rentalType') || '')
		setRentalPeriod(params.get('rentalPeriod') || '')
		setSortBy(params.get('sortBy') || '')
	}, [params])

	const apply = () => {
		const sp = new URLSearchParams(params as any)
		if (minPrice) sp.set('minPrice', minPrice)
		else sp.delete('minPrice')
		if (maxPrice) sp.set('maxPrice', maxPrice)
		else sp.delete('maxPrice')
		if (rentalType) sp.set('rentalType', rentalType)
		else sp.delete('rentalType')
		if (rentalPeriod) sp.set('rentalPeriod', rentalPeriod)
		else sp.delete('rentalPeriod')
		if (sortBy) sp.set('sortBy', sortBy)
		else sp.delete('sortBy')
		router.push('/?' + sp.toString())
	}

	return (
		<div className={styles.container}>
			<input
				value={minPrice}
				onChange={(e) => setMinPrice(e.target.value)}
				placeholder={translations.minPrice[language]}
				type="number"
				min="0"
				className={styles.input}
			/>
			<input
				value={maxPrice}
				onChange={(e) => setMaxPrice(e.target.value)}
				placeholder={translations.maxPrice[language]}
				type="number"
				min="0"
				className={styles.input}
			/>
			<select
				value={rentalType}
				onChange={(e) => setRentalType(e.target.value)}
				className={styles.select}
			>
				<option value="">{translations.rentalType?.[language] || 'Тип аренды'}</option>
				<option value="all">{translations.rentalTypeAll?.[language] || 'Все типы'}</option>
				<option value="house">{translations.rentalTypeHouse?.[language] || 'Дом'}</option>
				<option value="apartment">{translations.rentalTypeApartment?.[language] || 'Квартира'}</option>
				<option value="villa">{translations.rentalTypeVilla?.[language] || 'Вилла'}</option>
				<option value="car">{translations.rentalTypeCar?.[language] || 'Машина'}</option>
				<option value="equipment">{translations.rentalTypeEquipment?.[language] || 'Оборудование'}</option>
			</select>
			<select
				value={rentalPeriod}
				onChange={(e) => setRentalPeriod(e.target.value)}
				className={styles.select}
			>
				<option value="">{translations.rentalPeriod?.[language] || 'Период аренды'}</option>
				<option value="hourly">{translations.rentalPeriodHourly?.[language] || 'Почасовая'}</option>
				<option value="daily">{translations.rentalPeriodDaily?.[language] || 'Дневная'}</option>
				<option value="weekly">{translations.rentalPeriodWeekly?.[language] || 'Недельная'}</option>
				<option value="monthly">{translations.rentalPeriodMonthly?.[language] || 'Месячная'}</option>
				<option value="yearly">{translations.rentalPeriodYearly?.[language] || 'Годовая'}</option>
			</select>
			<select
				value={sortBy}
				onChange={(e) => setSortBy(e.target.value)}
				className={styles.select}
			>
				<option value="">{translations.sortBy?.[language] || 'Сортировка'}</option>
				<option value="price">{translations.sortByPrice?.[language] || 'По цене'}</option>
				<option value="date">{translations.sortByDate?.[language] || 'По дате'}</option>
				<option value="popularity">{translations.sortByPopularity?.[language] || 'По популярности'}</option>
			</select>
			<button onClick={apply} className={styles.button}>
				{translations.applyFilters[language]}
			</button>
		</div>
	)
}


