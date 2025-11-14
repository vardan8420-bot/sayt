'use client'

import { Suspense } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { useApp } from '../context/AppContext'
import { CurrencyButton } from './CurrencyButton'
import { LanguageButton } from './LanguageButton'
import { MegaMenu } from './MegaMenu'
import { AuthButtons } from './AuthButtons'
import { ProductGrid } from './ProductGrid'
import { SearchBar } from './SearchBar'
import { FiltersBar } from './FiltersBar'
import { RecommendationsRail } from './RecommendationsRail'
import styles from './Landing.module.css'

type LandingCopy = {
	heroEyebrow: string
	heroTitle: string
	heroSubtitle: string
	highlights: Array<{ title: string; description: string }>
	stats: Array<{ label: string; value: string }>
	discoveryTitle: string
	discoverySubtitle: string
	catalogTitle: string
	catalogSubtitle: string
	recoTitle: string
	recoSubtitle: string
}

const landingCopy: Record<string, LandingCopy> = {
	en: {
		heroEyebrow: 'SAYT Marketplace',
		heroTitle: 'Connected commerce for buyers and sellers',
		heroSubtitle: 'Search, negotiate, and complete secure deals with escrow, instant payouts, and multilingual support.',
		highlights: [
			{ title: 'AI Discovery', description: 'Smart search, filters, and recommendations' },
			{ title: 'Escrow & Stripe', description: 'Protected payments with automated release' },
			{ title: 'Global Languages', description: 'RU · EN · HY · KA with instant switch' },
		],
		stats: [
			{ label: 'Active listings', value: '12K+' },
			{ label: 'Verified sellers', value: '3.4K' },
			{ label: 'Avg. escrow release', value: '18 hrs' },
		],
		discoveryTitle: 'Find the right product faster',
		discoverySubtitle: 'Combine semantic search with precise filters to narrow results in seconds.',
		catalogTitle: 'Live marketplace',
		catalogSubtitle: 'Fresh inventory with unified cards for services, goods, and digital assets.',
		recoTitle: 'Personal recommendations',
		recoSubtitle: 'Stay inspired with AI-driven suggestions tailored to your activity.',
	},
	ru: {
		heroEyebrow: 'Маркетплейс SAYT',
		heroTitle: 'Единое пространство для продавцов и покупателей',
		heroSubtitle: 'Находите товары, ведите сделки и завершайте безопасные платежи с эскроу и мгновенными выплатами.',
		highlights: [
			{ title: 'Умный поиск', description: 'Живые подсказки, фильтры и рекомендации' },
			{ title: 'Эскроу + Stripe', description: 'Полная защита оплаты и автоматический релиз' },
			{ title: '4 языка', description: 'Русский, Английский, Армянский, Грузинский' },
		],
		stats: [
			{ label: 'Активных товаров', value: '12 000+' },
			{ label: 'Проверенных продавцов', value: '3 400' },
			{ label: 'Средний релиз', value: '18 ч' },
		],
		discoveryTitle: 'Находите быстрее',
		discoverySubtitle: 'Комбинируйте подсказки, поиск и фильтры — результаты обновляются мгновенно.',
		catalogTitle: 'Живой каталог',
		catalogSubtitle: 'Карточки товаров и услуг оформлены единообразно и готовы к публикации.',
		recoTitle: 'Рекомендации',
		recoSubtitle: 'Получайте умные подборки по вашим действиям и интересам.',
	},
	hy: {
		heroEyebrow: 'SAYT շուկա',
		heroTitle: 'Միավորված հարթակ վաճառողների և գնորդների համար',
		heroSubtitle: 'Գտեք ապրանքներ, վարեք գործարքներ և ապահովեք վճարումները Stripe/էսկրո համակարգով.',
		highlights: [
			{ title: 'Խելացի որոնում', description: 'Արագ հուշումներ, ֆիլտրեր և առաջարկություններ' },
			{ title: 'Ապահով գործարքներ', description: 'Էսկրո + Stripe վճարումներ առանց ռիսկի' },
			{ title: '4 լեզու', description: 'RU · EN · HY · KA' },
		],
		stats: [
			{ label: 'Ակտիվ հայտարարություններ', value: '12K+' },
			{ label: 'Ստուգված վաճառողներ', value: '3.4K' },
			{ label: 'Միջ. թողարկում', value: '18 ժ' },
		],
		discoveryTitle: 'Գտեք ավելի արագ',
		discoverySubtitle: 'Միացրեք որոնումը և ֆիլտրերը՝ ստանալով ճշգրիտ արդյունքներ վայրկյանների ընթացքում.',
		catalogTitle: 'Կատալոգ',
		catalogSubtitle: 'Թարմ առաջարկներ մեկական քարտերով և արագ բեռնումով.',
		recoTitle: 'Անձնական առաջարկներ',
		recoSubtitle: 'AI-ը առաջարկում է ձեր նախասիրություններին համապատասխան ապրանքներ.',
	},
	ka: {
		heroEyebrow: 'SAYT ბაზარი',
		heroTitle: 'ერთიანი პლატფორმა მყიდველებისა და გამყიდველებისთვის',
		heroSubtitle: 'იპოვეთ საჭირო პროდუქტები, იმუშავეთ უსაფრთხო ესკროუთი და მიიღეთ სწრაფი გადახდები.',
		highlights: [
			{ title: 'ჭკვიანი ძიება', description: 'ცოცხალი მინიშნებები, ფილტრები და რეკო' },
			{ title: 'უსაფრთხოობა Stripe', description: 'ესკრო + Stripe სრული დაცვა' },
			{ title: '4 ენა', description: 'რუსული, ინგლისური, სომხური, ქართული' },
		],
		stats: [
			{ label: 'აქტიური პროდუქცია', value: '12K+' },
			{ label: 'დამოწმებული გამყიდველები', value: '3.4K' },
			{ label: 'საშ. გამოშვება', value: '18 სთ' },
		],
		discoveryTitle: 'იპოვეთ სწრაფად',
		discoverySubtitle: 'დააკავშირეთ ძიება და ფილტრები — შედეგები ახლდება წამებში.',
		catalogTitle: 'კატალოგი',
		catalogSubtitle: 'განახლებული შეთავაზებები ერთიანი ბარათებით.',
		recoTitle: 'რეკომენდაციები',
		recoSubtitle: 'AI ქმნის პერსონალურ იდეებს თქვენი ქცევიდან.',
	},
}

function Hero() {
	const { language } = useApp()
	const content = landingCopy[language] ?? landingCopy.en

	return (
		<section className={styles.hero}>
			<div className={styles.heroContent}>
				<p className={styles.eyebrow}>{content.heroEyebrow}</p>
				<h1 className={styles.heroTitle}>{content.heroTitle}</h1>
				<p className={styles.heroSubtitle}>{content.heroSubtitle}</p>
				<ul className={styles.highlights}>
					{content.highlights.map((item) => (
						<li key={item.title} className={styles.highlight}>
							<span className={styles.highlightTitle}>{item.title}</span>
							<span className={styles.highlightDescription}>{item.description}</span>
						</li>
					))}
				</ul>
			</div>
			<div className={styles.heroPanel}>
				<div className={styles.statsGrid}>
					{content.stats.map((stat) => (
						<div key={stat.label} className={styles.statCard}>
							<span className={styles.statValue}>{stat.value}</span>
							<span className={styles.statLabel}>{stat.label}</span>
						</div>
					))}
				</div>
				<div className={styles.quickActions}>
					<AuthButtons />
					<MegaMenu />
				</div>
			</div>
		</section>
	)
}

export function Landing() {
	const { language } = useApp()
	const content = landingCopy[language] ?? landingCopy.en

	return (
		<div className={styles.container}>
			<header className={styles.header}>
				<div className={styles.headerLeft}>
					<Link href="/" className={styles.logoLink}>
						<Image
							src="/logo.png"
							alt="SAYT Logo"
							width={240}
							height={240}
							className={styles.logo}
							priority
						/>
					</Link>
					<div className={styles.headerSearch}>
						<Suspense fallback={null}>
							<SearchBar />
						</Suspense>
					</div>
				</div>
				<div className={styles.headerCenter}>
					<div className={styles.headerControls}>
						<LanguageButton className="header" />
						<CurrencyButton className="header" />
					</div>
				</div>
				<div className={styles.headerRight}>
					<div className={styles.headerAuth}>
						<AuthButtons compact />
					</div>
					<Link href="/cart" className={styles.cartLink} aria-label="Cart">
						<svg className={styles.cartIcon} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
							<circle cx="9" cy="21" r="1"></circle>
							<circle cx="20" cy="21" r="1"></circle>
							<path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path>
						</svg>
					</Link>
				</div>
			</header>
			<Hero />

			<section className={styles.discovery}>
				<div className={styles.sectionHeading}>
					<h2 className={styles.sectionTitle}>{content.discoveryTitle}</h2>
					<p className={styles.sectionSubtitle}>{content.discoverySubtitle}</p>
				</div>
				<div className={styles.searchStack}>
					<Suspense fallback={null}>
						<FiltersBar />
					</Suspense>
				</div>
			</section>

			<section className={styles.productsSection}>
				<div className={styles.sectionHeading}>
					<h2 className={styles.sectionTitle}>{content.catalogTitle}</h2>
					<p className={styles.sectionSubtitle}>{content.catalogSubtitle}</p>
				</div>
				<ProductGrid />
			</section>

			<section className={styles.railSection}>
				<div className={styles.sectionHeading}>
					<h2 className={styles.sectionTitle}>{content.recoTitle}</h2>
					<p className={styles.sectionSubtitle}>{content.recoSubtitle}</p>
				</div>
				<div className={styles.surface}>
					<RecommendationsRail />
				</div>
			</section>
		</div>
	)
}



