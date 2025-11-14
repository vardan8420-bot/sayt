'use client'

import Image from 'next/image'
import styles from './ProductCard.module.css'
import { useApp } from '../context/AppContext'

type ApiProduct = {
  id: string
  title: string
  description: string
  price: number
  images: string[]
  slug: string
  seller: { id: string; name: string | null }
  _count?: { reviews?: number; favorites?: number }
}

export function ProductCard({ product }: { product: ApiProduct }) {
  const cover = product.images?.[0] || '/icon-512.png'
  const { translations, language } = useApp()
  return (
    <a className={styles.card} href={`/product/${product.slug}`}>
      <div className={styles.cover}>
        <Image
          src={cover}
          alt={product.title}
          fill
          sizes="(max-width: 768px) 50vw, 240px"
          className={styles.coverImage}
          priority={false}
        />
      </div>
      <div className={styles.body}>
        <div className={styles.title} title={product.title}>{product.title}</div>
        <div className={styles.price}>${Number(product.price).toFixed(2)}</div>
        <div className={styles.meta}>
          <span className={styles.seller}>{product.seller?.name || translations.seller[language]}</span>
          {product._count?.reviews !== undefined && (
            <>
              <span className={styles.dot}>•</span>
              <span className={styles.reviews}>
                {product._count.reviews} {translations.reviews[language]}
              </span>
            </>
          )}
        </div>
      </div>
    </a>
  )
}


