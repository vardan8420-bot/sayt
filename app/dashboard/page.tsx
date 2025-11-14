import { getServerSession } from 'next-auth'
import Link from 'next/link'
import { authOptions } from '@/lib/auth-options'
import prisma from '../../lib/prisma'
import { ProductCreateForm } from '../components/ProductCreateForm'
import styles from './Dashboard.module.css'

export const dynamic = 'force-dynamic'

async function getData(userId: string) {
	const [buyerOrders, sellerOrders, myProducts] = await Promise.all([
		prisma.order.findMany({
			where: { buyerId: userId },
			orderBy: { createdAt: 'desc' },
			include: {
				items: {
					include: { product: { select: { title: true } }, service: { select: { title: true } } },
				},
			},
			take: 20,
		}),
		prisma.order.findMany({
			where: { sellerId: userId },
			orderBy: { createdAt: 'desc' },
			include: {
				items: {
					include: { product: { select: { title: true } }, service: { select: { title: true } } },
				},
			},
			take: 20,
		}),
		prisma.product.findMany({
			where: { sellerId: userId },
			orderBy: { createdAt: 'desc' },
			select: {
				id: true,
				title: true,
				price: true,
				published: true,
				stock: true,
				slug: true,
				images: true,
			},
			take: 50,
		}),
	])
	return { buyerOrders, sellerOrders, myProducts }
}

const cx = (...classes: Array<string | false | undefined>) => classes.filter(Boolean).join(' ')

export default async function DashboardPage() {
	const session = await getServerSession(authOptions)
	if (!session?.user?.id) {
		return (
			<div className={styles.container}>
				<section className={styles.sectionCard}>
					<div className={styles.sectionHeading}>
						<h1 className={styles.pageTitle}>Личный кабинет</h1>
						<p className={styles.sectionSubtitle}>Авторизуйтесь, чтобы управлять покупками, продажами и товарами.</p>
					</div>
					<Link className={styles.primaryLink} href="/api/auth/signin">
						Перейти к входу
					</Link>
				</section>
			</div>
		)
	}

	const { buyerOrders, sellerOrders, myProducts } = await getData(session.user.id)
	const publishedCount = myProducts.filter((p) => p.published).length
	const overview = [
		{ label: 'Покупок', value: buyerOrders.length },
		{ label: 'Продаж', value: sellerOrders.length },
		{ label: 'Товаров', value: myProducts.length },
		{ label: 'Опубликовано', value: publishedCount },
	]

	return (
		<div className={styles.container}>
			<div className={styles.sectionHeading}>
				<h1 className={styles.pageTitle}>Личный кабинет</h1>
				<p className={styles.sectionSubtitle}>Единая панель для покупателей и продавцов: escrow, товары, сделки.</p>
			</div>

			<div className={styles.overviewGrid}>
				{overview.map((stat) => (
					<div key={stat.label} className={styles.overviewCard}>
						<span className={styles.overviewValue}>{stat.value}</span>
						<span className={styles.overviewLabel}>{stat.label}</span>
					</div>
				))}
			</div>

			<section className={styles.sectionCard}>
				<div className={styles.sectionHeading}>
					<h2 className={styles.sectionTitle}>Добавить товар</h2>
					<p className={styles.sectionSubtitle}>Инструменты продавца: изображения, описание, цена, доступность.</p>
				</div>
				<ProductCreateForm />
			</section>

			<div className={styles.splitGrid}>
				<OrdersSection orders={buyerOrders} type="buyer" />
				<OrdersSection orders={sellerOrders} type="seller" />
			</div>

			<section className={styles.sectionCard}>
				<div className={styles.sectionHeading}>
					<h2 className={styles.sectionTitle}>Мои товары</h2>
					<p className={styles.sectionSubtitle}>Контролируйте публикацию, остатки и ссылки на карточки.</p>
				</div>
				<div className={styles.productsGrid}>
					{myProducts.length === 0 && <div className={styles.emptyState}>Товары не найдены.</div>}
					{myProducts.map((p) => (
						<div key={p.id} className={styles.productCard}>
							<div>
								<div className={styles.productTitle}>{p.title}</div>
								<div className={styles.productMeta}>
									Цена: {p.price.toString()} · Остаток: {p.stock}
								</div>
							</div>
							<span className={cx(styles.statusBadge, p.published ? styles.badgePublished : styles.badgeDraft)}>
								{p.published ? 'Опубликован' : 'Черновик'}
							</span>
							<Link href={`/product/${p.slug}`} className={styles.linkButton}>
								Открыть
							</Link>
						</div>
					))}
				</div>
			</section>
		</div>
	)
}

type Order = Awaited<ReturnType<typeof getData>>['buyerOrders'][number]

function OrdersSection({ orders, type }: { orders: Order[]; type: 'buyer' | 'seller' }) {
	const isBuyer = type === 'buyer'
	const title = isBuyer ? 'Мои покупки' : 'Мои продажи'
	const subtitle = isBuyer ? 'История заказов и управление escrow как покупатель.' : 'Последние сделки и выплаты продавца.'
	const emptyText = isBuyer ? 'Заказов пока нет.' : 'Продаж пока нет.'

	return (
		<section className={styles.sectionCard}>
			<div className={styles.sectionHeading}>
				<h2 className={styles.sectionTitle}>{title}</h2>
				<p className={styles.sectionSubtitle}>{subtitle}</p>
			</div>
			<div className={styles.ordersList}>
				{orders.length === 0 && <div className={styles.emptyState}>{emptyText}</div>}
				{orders.map((order) => (
					<OrderCard key={order.id} order={order} type={type} />
				))}
			</div>
		</section>
	)
}

function OrderCard({ order, type }: { order: Order; type: 'buyer' | 'seller' }) {
	const itemsSummary =
		(order.items || []).map((it) => it.product?.title || it.service?.title || 'Позиция').join(', ') || 'Без позиций'
	const isBuyer = type === 'buyer'

	return (
		<div className={styles.orderCard}>
			<div className={styles.orderHeader}>
				<div>
					<strong>Заказ #{order.id.slice(0, 8)}</strong>
					<p className={styles.orderMeta}>{isBuyer ? `Статус заказа: ${order.status}` : `Эскроу: ${order.escrowStatus}`}</p>
				</div>
				<span className={styles.orderMeta}>Всего: {order.amount?.toString() ?? '—'}</span>
			</div>
			<p className={styles.orderDescription}>{itemsSummary}</p>
			<div className={styles.orderActions}>
				<Link href={`/orders/${order.id}`} className={styles.linkButton}>
					Подробнее
				</Link>
				{order.escrowStatus === 'HELD' && isBuyer && (
					<form action={`/api/orders/${order.id}/escrow`} method="POST" className={styles.inlineForm}>
						<input type="hidden" name="amount" value={String(order.amount)} />
						<button type="submit" className={styles.secondaryButton}>
							Создать escrow
						</button>
					</form>
				)}
				{order.escrowStatus === 'HELD' && !isBuyer && (
					<form action={`/api/orders/${order.id}/escrow/release`} method="POST" className={styles.inlineForm}>
						<button type="submit" className={styles.secondaryButton}>
							Освободить escrow
						</button>
					</form>
				)}
			</div>
		</div>
	)
}


