import { Metadata } from 'next'
import prisma from '../../lib/prisma'
import { AppProvider } from '../context/AppContext'
import { ProductList } from '../components/ProductList'
import styles from './SearchPage.module.css'

export const dynamic = 'force-dynamic'

const PAGE_SIZE = 20

type SearchParams = { q?: string; page?: string }

export async function generateMetadata({ searchParams }: { searchParams: SearchParams }): Promise<Metadata> {
	const q = searchParams.q?.trim()
	const title = q ? `Поиск: ${q} | Sayt` : 'Поиск товаров | Sayt'
	const description = q
		? `Результаты поиска по запросу "${q}"`
		: 'Найдите товары по категориям, цене и ключевым словам'
	return { title, description }
}

async function getProducts(searchParams: SearchParams) {
	const page = Math.max(parseInt(searchParams.page || '1', 10), 1)
	const q = searchParams.q?.trim()

	const where: any = { published: true }
	if (q) {
		where.OR = [
			{ title: { contains: q, mode: 'insensitive' } },
			{ description: { contains: q, mode: 'insensitive' } },
			{ tags: { has: q.toLowerCase() } },
		]
	}

	const [products, total] = await Promise.all([
		prisma.product.findMany({
			where,
			orderBy: { createdAt: 'desc' },
			include: { seller: { select: { id: true, name: true } }, _count: { select: { reviews: true } } },
			skip: (page - 1) * PAGE_SIZE,
			take: PAGE_SIZE,
		}),
		prisma.product.count({ where }),
	])

	return {
		products: products.map((p) => ({
			...p,
			price: Number(p.price),
		})),
		page,
		total,
		totalPages: Math.ceil(total / PAGE_SIZE),
		query: q || '',
	}
}

export default async function SearchPage({ searchParams }: { searchParams: SearchParams }) {
	const data = await getProducts(searchParams)
	const jsonLd = {
		'@context': 'https://schema.org',
		'@type': 'ItemList',
		itemListElement: data.products.map((product, index) => ({
			'@type': 'ListItem',
			position: (data.page - 1) * PAGE_SIZE + index + 1,
			item: {
				'@type': 'Product',
				name: product.title,
				description: product.description,
				image: product.images?.[0] || `${process.env.NEXTAUTH_URL || (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : 'https://sayt.vercel.app')}/icon-512.png`,
				offers: {
					'@type': 'Offer',
					priceCurrency: 'USD',
					price: product.price,
					url: `${process.env.NEXTAUTH_URL || (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : 'https://sayt.vercel.app')}/product/${product.slug}`,
					availability: product.stock > 0 ? 'https://schema.org/InStock' : 'https://schema.org/OutOfStock',
				},
			},
		})),
	}

	return (
		<AppProvider>
			<div className={styles.container}>
				<header className={styles.header}>
					<h1 className={styles.title}>Поиск</h1>
					<p className={styles.subtitle}>
						{data.total} результатов {data.query ? `по запросу "${data.query}"` : ''}
					</p>
				</header>
				<ProductList products={data.products} />
				{data.totalPages > 1 && (
					<nav className={styles.pagination} aria-label="Пагинация поиска">
						{Array.from({ length: data.totalPages }).map((_, i) => {
							const pageNumber = i + 1
							const params = new URLSearchParams(searchParams as Record<string, string>)
							params.set('page', pageNumber.toString())
							return (
								<a key={pageNumber} href={`/search?${params.toString()}`} className={pageNumber === data.page ? styles.pageButtonActive : styles.pageButton}>
									{pageNumber}
								</a>
							)
						})}
					</nav>
				)}
				<script
					type="application/ld+json"
					dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
				/>
			</div>
		</AppProvider>
	)
}


