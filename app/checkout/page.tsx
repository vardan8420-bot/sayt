'use client'

import { useEffect, useState } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import styles from './CheckoutPage.module.css'

type CartItem = {
	id: string
	quantity: number
	product: {
		id: string
		title: string
		price: string
		images: string[]
		slug: string
		stock: number
		seller: {
			id: string
			name: string | null
		}
	}
}

type Address = {
	id: string
	firstName: string
	lastName: string
	address1: string
	address2: string | null
	city: string
	state: string | null
	postalCode: string
	country: string
	phone: string | null
	isDefault: boolean
}

export default function CheckoutPage() {
	const { data: session, status } = useSession()
	const router = useRouter()
	const searchParams = useSearchParams()
	const productId = searchParams.get('productId')

	const [items, setItems] = useState<CartItem[]>([])
	const [addresses, setAddresses] = useState<Address[]>([])
	const [selectedAddressId, setSelectedAddressId] = useState<string>('')
	const [couponCode, setCouponCode] = useState('')
	const [loading, setLoading] = useState(true)
	const [submitting, setSubmitting] = useState(false)
	const [error, setError] = useState<string | null>(null)

	useEffect(() => {
		if (status === 'loading') return
		if (status === 'unauthenticated') {
			router.push('/auth/signin')
			return
		}
		loadData()
	}, [status, router])

	const loadData = async () => {
		try {
			// Загружаем товары
			if (productId) {
				// Один товар (buy now)
				const productRes = await fetch(`/api/products/${productId}`)
				if (!productRes.ok) {
					const data = await productRes.json()
					throw new Error(data.error || 'Failed to fetch product')
				}
				const product = await productRes.json()
				// Имитируем CartItem для одного товара
				setItems([
					{
						id: 'temp-' + product.id,
						quantity: 1,
						product: {
							id: product.id,
							title: product.title,
							price: product.price.toString(),
							images: product.images || [],
							slug: product.slug,
							stock: product.stock,
							seller: product.seller || { id: product.seller?.id || '', name: product.seller?.name || null },
						},
					},
				])
			} else {
				// Из корзины
				const cartRes = await fetch('/api/cart')
				if (!cartRes.ok) throw new Error('Failed to fetch cart')
				const cart = await cartRes.json()
				if (!cart.items || cart.items.length === 0) {
					router.push('/cart')
					return
				}
				setItems(cart.items)
			}

			// Загружаем адреса
			const addressesRes = await fetch('/api/addresses')
			if (addressesRes.ok) {
				const data = await addressesRes.json()
				setAddresses(data.addresses || [])
				const defaultAddress = data.addresses?.find((a: Address) => a.isDefault)
				if (defaultAddress) {
					setSelectedAddressId(defaultAddress.id)
				} else if (data.addresses && data.addresses.length > 0) {
					setSelectedAddressId(data.addresses[0].id)
				}
			}
		} catch (err: any) {
			setError(err.message || 'Ошибка при загрузке данных')
		} finally {
			setLoading(false)
		}
	}

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault()
		setSubmitting(true)
		setError(null)

		if (!selectedAddressId) {
			setError('Выберите адрес доставки')
			setSubmitting(false)
			return
		}

		try {
			const cartItemIds = productId ? undefined : items.map((item) => item.id).filter((id) => !id.startsWith('temp-'))

			const orderRes = await fetch('/api/orders', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({
					productId: productId || undefined,
					cartItemIds: cartItemIds && cartItemIds.length > 0 ? cartItemIds : undefined,
					shippingAddressId: selectedAddressId,
					couponCode: couponCode || undefined,
				}),
			})

			const order = await orderRes.json()

			if (!orderRes.ok) {
				throw new Error(order.error || 'Failed to create order')
			}

			// Перенаправляем на страницу заказа
			router.push(`/orders/${order.id}`)
		} catch (err: any) {
			setError(err.message || 'Ошибка при оформлении заказа')
		} finally {
			setSubmitting(false)
		}
	}

	const subtotal = items.reduce((sum, item) => sum + Number(item.product.price) * item.quantity, 0)
	const total = subtotal

	if (status === 'loading' || loading) {
		return (
			<div className={styles.container}>
				<div className={styles.loading}>Загрузка...</div>
			</div>
		)
	}

	if (error && !items.length) {
		return (
			<div className={styles.container}>
				<div className={styles.error}>{error}</div>
			</div>
		)
	}

	return (
		<div className={styles.container}>
			<h1 className={styles.title}>Оформление заказа</h1>

			<form onSubmit={handleSubmit} className={styles.form}>
				<div className={styles.grid}>
					<div className={styles.left}>
						<section className={styles.section}>
							<h2 className={styles.sectionTitle}>Адрес доставки</h2>
							{addresses.length > 0 ? (
								<div className={styles.addresses}>
									{addresses.map((address) => (
										<label key={address.id} className={styles.addressOption}>
											<input
												type="radio"
												name="address"
												value={address.id}
												checked={selectedAddressId === address.id}
												onChange={(e) => setSelectedAddressId(e.target.value)}
											/>
											<div className={styles.addressDetails}>
												<div className={styles.addressName}>
													{address.firstName} {address.lastName}
												</div>
												<div className={styles.addressText}>
													{address.address1}
													{address.address2 && `, ${address.address2}`}
													<br />
													{address.city}, {address.state} {address.postalCode}
													<br />
													{address.country}
													{address.phone && <br />}
													{address.phone}
												</div>
											</div>
										</label>
									))}
								</div>
							) : (
								<div className={styles.noAddress}>
									<p>Адрес доставки не найден. Создайте адрес в профиле.</p>
									<button
										type="button"
										className={styles.linkButton}
										onClick={() => router.push('/dashboard')}
									>
										Перейти в профиль
									</button>
								</div>
							)}
						</section>

						<section className={styles.section}>
							<h2 className={styles.sectionTitle}>Промокод</h2>
							<input
								type="text"
								placeholder="Введите промокод"
								value={couponCode}
								onChange={(e) => setCouponCode(e.target.value)}
								className={styles.input}
							/>
						</section>
					</div>

					<div className={styles.right}>
						<section className={styles.summary}>
							<h2 className={styles.sectionTitle}>Заказ</h2>
							<div className={styles.items}>
								{items.map((item) => (
									<div key={item.id} className={styles.item}>
										<div className={styles.itemTitle}>{item.product.title}</div>
										<div className={styles.itemMeta}>
											{item.quantity} × ${Number(item.product.price).toFixed(2)}
										</div>
										<div className={styles.itemTotal}>
											${(Number(item.product.price) * item.quantity).toFixed(2)}
										</div>
									</div>
								))}
							</div>
							<div className={styles.totalRow}>
								<span>Итого:</span>
								<span className={styles.totalAmount}>${total.toFixed(2)}</span>
							</div>
							{error && <div className={styles.errorMessage}>{error}</div>}
							<button
								type="submit"
								className={styles.submitButton}
								disabled={submitting || !selectedAddressId}
							>
								{submitting ? 'Оформление...' : 'Оформить заказ'}
							</button>
							<Link href="/cart" className={styles.backLink}>
								← Вернуться в корзину
							</Link>
						</section>
					</div>
				</div>
			</form>
		</div>
	)
}

