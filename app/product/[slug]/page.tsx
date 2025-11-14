import prisma from '../../../lib/prisma'
import Image from 'next/image'
import Link from 'next/link'
import { RecommendationsRail } from '@/app/components/RecommendationsRail'
import styles from './ProductPage.module.css'

export const revalidate = 300

async function getProduct(slug: string) {
	const product = await prisma.product.findUnique({
		where: { slug },
		include: {
			seller: { select: { id: true, name: true } },
			category: { select: { id: true, name: true, slug: true } },
			reviews: { select: { id: true } },
		},
	})
	return product
}

export default async function ProductPage({ params }: { params: { slug: string } }) {
	const product = await getProduct(params.slug)
	if (!product) {
		return (
			<div style={{ padding: 24 }}>
				<h1 style={{ fontSize: 20, fontWeight: 700 }}>Товар не найден</h1>
				<Link href="/" style={{ color: '#2563eb' }}>На главную</Link>
			</div>
		)
	}
	const cover = product.images?.[0] || '/icon-512.png'
	const canonical = `${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/product/${product.slug}`
	const breadcrumbJsonLd = {
		'@context': 'https://schema.org',
		'@type': 'BreadcrumbList',
		itemListElement: [
			{
				'@type': 'ListItem',
				position: 1,
				name: 'Главная',
				item: process.env.NEXTAUTH_URL || 'http://localhost:3000',
			},
			{
				'@type': 'ListItem',
				position: 2,
				name: product.title,
				item: canonical,
			},
		],
	}
	const productJsonLd = {
		'@context': 'https://schema.org',
		'@type': 'Product',
		name: product.title,
		description: product.description,
		image: product.images,
		offers: {
			'@type': 'Offer',
			priceCurrency: 'USD',
			price: Number(product.price),
			availability: product.stock > 0 ? 'https://schema.org/InStock' : 'https://schema.org/OutOfStock',
			url: canonical,
		},
	}

	return (
		<div className={styles.container}>
			<div className={styles.grid}>
				<div className={styles.media}>
					<Image src={cover} alt={product.title} fill sizes="(max-width: 768px) 100vw, 50vw" style={{ objectFit: 'cover' }} />
				</div>
				<div className={styles.details}>
					<h1 className={styles.title}>{product.title}</h1>
					<div className={styles.category}>
						{product.category && (
							<>
								Категория:{' '}
								<Link href={`/category/${product.category.slug}`} className={styles.link}>
									{product.category.name}
								</Link>
							</>
						)}
					</div>
					<div className={styles.price}>${Number(product.price).toFixed(2)}</div>
					<p className={styles.description}>{product.description}</p>
					<div className={styles.actions}>
						<button className={styles.buttonPrimary}>Добавить в корзину</button>
						<button className={styles.buttonSecondary}>Купить сейчас</button>
					</div>
					<div className={styles.meta}>
						Продавец: {product.seller?.name || '—'} • Отзывов: {product.reviews.length}
					</div>
				</div>
			</div>
			<div className={styles.recommendations}>
				<RecommendationsRail variant="similar" productId={product.id} limit={6} />
			</div>
			<script
				type="application/ld+json"
				dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
			/>
			<script
				type="application/ld+json"
				dangerouslySetInnerHTML={{ __html: JSON.stringify(productJsonLd) }}
			/>
		</div>
	)
}


