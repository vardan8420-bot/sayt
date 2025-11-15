import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth-options'
import prisma from '../../../lib/prisma'
import Link from 'next/link'
import { notFound, redirect } from 'next/navigation'
import styles from './OrderPage.module.css'

export const dynamic = 'force-dynamic'

async function getOrder(orderId: string, userId: string) {
	const order = await prisma.order.findUnique({
		where: { id: orderId },
		include: {
			buyer: {
				select: {
					id: true,
					name: true,
					email: true,
				},
			},
			seller: {
				select: {
					id: true,
					name: true,
					email: true,
				},
			},
			items: {
				include: {
					product: {
						select: {
							id: true,
							title: true,
							price: true,
							images: true,
							slug: true,
						},
					},
					service: {
						select: {
							id: true,
							title: true,
							price: true,
							slug: true,
						},
					},
				},
			},
			shippingAddress: true,
			coupon: {
				select: {
					code: true,
					discount: true,
					discountType: true,
				},
			},
			statusHistory: {
				orderBy: { createdAt: 'desc' },
				take: 10,
			},
		},
	})

	if (!order) {
		return null
	}

	// Проверяем доступ
	if (order.buyerId !== userId && order.sellerId !== userId) {
		return null
	}

	return order
}

export default async function OrderPage({ params }: { params: { orderId: string } }) {
	const session = await getServerSession(authOptions)
	if (!session?.user?.id) {
		redirect('/auth/signin')
	}

	const order = await getOrder(params.orderId, session.user.id)

	if (!order) {
		notFound()
	}

	const isBuyer = order.buyerId === session.user.id
	const isSeller = order.sellerId === session.user.id

	const statusLabels: Record<string, string> = {
		PENDING: 'Ожидается',
		PROCESSING: 'Обрабатывается',
		PAID: 'Оплачен',
		SHIPPED: 'Отправлен',
		DELIVERED: 'Доставлен',
		CANCELLED: 'Отменен',
		REFUNDED: 'Возвращен',
	}

	const escrowLabels: Record<string, string> = {
		PENDING: 'Ожидается',
		HELD: 'Заблокирован',
		RELEASED: 'Освобожден',
		REFUNDED: 'Возвращен',
	}

	return (
		<div className={styles.container}>
			<div className={styles.header}>
				<h1 className={styles.title}>Заказ #{order.id.slice(0, 8)}</h1>
				<Link href="/dashboard" className={styles.backLink}>
					← Назад к заказам
				</Link>
			</div>

			<div className={styles.grid}>
				<div className={styles.left}>
					<section className={styles.section}>
						<h2 className={styles.sectionTitle}>Статус заказа</h2>
						<div className={styles.statusGrid}>
							<div className={styles.statusItem}>
								<span className={styles.statusLabel}>Статус:</span>
								<span className={styles.statusValue}>{statusLabels[order.status] || order.status}</span>
							</div>
							<div className={styles.statusItem}>
								<span className={styles.statusLabel}>Эскроу:</span>
								<span className={styles.statusValue}>
									{escrowLabels[order.escrowStatus] || order.escrowStatus}
								</span>
							</div>
						</div>
					</section>

					<section className={styles.section}>
						<h2 className={styles.sectionTitle}>Товары</h2>
						<div className={styles.items}>
							{order.items.map((item) => {
								const product = item.product || item.service
								if (!product) return null

								return (
									<div key={item.id} className={styles.item}>
										<div className={styles.itemInfo}>
											<Link
												href={`/product/${product.slug}`}
												className={styles.itemTitle}
											>
												{product.title}
											</Link>
											<div className={styles.itemMeta}>
												Количество: {item.quantity} × ${Number(item.price).toFixed(2)}
											</div>
										</div>
										<div className={styles.itemTotal}>
											${(Number(item.price) * item.quantity).toFixed(2)}
										</div>
									</div>
								)
							})}
						</div>
					</section>

					{order.shippingAddress && (
						<section className={styles.section}>
							<h2 className={styles.sectionTitle}>Адрес доставки</h2>
							<div className={styles.address}>
								<div className={styles.addressName}>
									{order.shippingAddress.firstName} {order.shippingAddress.lastName}
								</div>
								<div className={styles.addressText}>
									{order.shippingAddress.address1}
									{order.shippingAddress.address2 && `, ${order.shippingAddress.address2}`}
									<br />
									{order.shippingAddress.city}, {order.shippingAddress.state}{' '}
									{order.shippingAddress.postalCode}
									<br />
									{order.shippingAddress.country}
									{order.shippingAddress.phone && (
										<>
											<br />
											{order.shippingAddress.phone}
										</>
									)}
								</div>
							</div>
						</section>
					)}

					{order.statusHistory && order.statusHistory.length > 0 && (
						<section className={styles.section}>
							<h2 className={styles.sectionTitle}>История изменений</h2>
							<div className={styles.history}>
								{order.statusHistory.map((history) => (
									<div key={history.id} className={styles.historyItem}>
										<div className={styles.historyStatus}>
											{statusLabels[history.status] || history.status}
										</div>
										<div className={styles.historyDate}>
											{new Date(history.createdAt).toLocaleString('ru-RU')}
										</div>
										{history.comment && (
											<div className={styles.historyComment}>{history.comment}</div>
										)}
									</div>
								))}
							</div>
						</section>
					)}
				</div>

				<div className={styles.right}>
					<section className={styles.summary}>
						<h2 className={styles.sectionTitle}>Детали заказа</h2>
						<div className={styles.summaryRow}>
							<span>Покупатель:</span>
							<span>{order.buyer.name || order.buyer.email}</span>
						</div>
						<div className={styles.summaryRow}>
							<span>Продавец:</span>
							<span>{order.seller.name || order.seller.email}</span>
						</div>
						<div className={styles.summaryRow}>
							<span>Дата:</span>
							<span>{new Date(order.createdAt).toLocaleDateString('ru-RU')}</span>
						</div>
						{order.coupon && (
							<div className={styles.summaryRow}>
								<span>Промокод:</span>
								<span>{order.coupon.code}</span>
							</div>
						)}
						<div className={styles.divider} />
						<div className={styles.summaryRow}>
							<span>Подитог:</span>
							<span>${Number(order.subtotal || 0).toFixed(2)}</span>
						</div>
						{order.coupon && (
							<div className={styles.summaryRow}>
								<span>Скидка:</span>
								<span className={styles.discount}>
									-$
									{order.coupon.discountType === 'PERCENT'
										? ((Number(order.subtotal || 0) * Number(order.coupon.discount)) / 100).toFixed(2)
										: Number(order.coupon.discount).toFixed(2)}
								</span>
							</div>
						)}
						<div className={styles.summaryRow}>
							<span>Комиссия платформы:</span>
							<span>${Number(order.platformFee || 0).toFixed(2)}</span>
						</div>
						<div className={styles.totalRow}>
							<span>Итого:</span>
							<span className={styles.totalAmount}>${Number(order.amount).toFixed(2)}</span>
						</div>
					</section>

					{order.escrowStatus === 'HELD' && (
						<div className={styles.actions}>
							{isBuyer && (
								<form action={`/api/orders/${order.id}/escrow`} method="POST">
									<button type="submit" className={styles.actionButton}>
										Создать escrow
									</button>
								</form>
							)}
							{isSeller && (
								<form action={`/api/orders/${order.id}/escrow/release`} method="POST">
									<button type="submit" className={styles.actionButton}>
										Освободить escrow
									</button>
								</form>
							)}
						</div>
					)}
				</div>
			</div>
		</div>
	)
}

