'use client'

import { useEffect, useState } from 'react'
import styles from './ProductGrid.module.css'
import { ProductCard } from './ProductCard'
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

export function ProductGrid() {
  const [products, setProducts] = useState<ApiProduct[]>([])
  const [loading, setLoading] = useState(true)
  const { translations, language } = useApp()

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const res = await fetch('/api/products?limit=12')
        const data = await res.json()
        setProducts(data.products || [])
      } catch {
        setProducts([])
      } finally {
        setLoading(false)
      }
    }
    fetchProducts()
  }, [])

  return (
    <div className={styles.grid}>
      {loading
        ? Array.from({ length: 8 }).map((_, i) => <div key={i} className={styles.cardSkeleton} />)
        : products.length > 0
        ? products.map((p) => <ProductCard key={p.id} product={p} />)
        : <div className={styles.empty}>{translations.noProducts[language]}</div>}
    </div>
  )
}


