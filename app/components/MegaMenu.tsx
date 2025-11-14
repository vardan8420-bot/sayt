'use client'

import React, { useState } from 'react'
import { useApp } from '../context/AppContext'
import styles from './MegaMenu.module.css'

interface Category {
  id: string
  name: {
    ru: string
    en: string
    hy: string
    ka: string
  }
  icon: string
  subcategories?: Category[]
}

const categories: Category[] = [
  {
    id: 'electronics',
    name: { ru: 'Электроника', en: 'Electronics', hy: 'Էլեկտրոնիկա', ka: 'ელექტრონიკა' },
    icon: '📱',
    subcategories: [
      { id: 'phones', name: { ru: 'Смартфоны', en: 'Smartphones', hy: 'Սմարթֆոններ', ka: 'სმარტფონები' }, icon: '📱' },
      { id: 'laptops', name: { ru: 'Ноутбуки', en: 'Laptops', hy: 'Դյուրակիրներ', ka: 'ლეპტოპები' }, icon: '💻' },
      { id: 'tablets', name: { ru: 'Планшеты', en: 'Tablets', hy: 'Պլանշետներ', ka: 'პლანშეტები' }, icon: '📱' },
      { id: 'accessories', name: { ru: 'Аксессуары', en: 'Accessories', hy: 'Աքսեսուարներ', ka: 'აქსესუარები' }, icon: '🎧' },
    ],
  },
  {
    id: 'fashion',
    name: { ru: 'Мода', en: 'Fashion', hy: 'Նորաձևություն', ka: 'მოდა' },
    icon: '👕',
    subcategories: [
      { id: 'men', name: { ru: 'Мужское', en: "Men's", hy: 'Տղամարդկանց', ka: 'კაცების' }, icon: '👔' },
      { id: 'women', name: { ru: 'Женское', en: "Women's", hy: 'Կանանց', ka: 'ქალების' }, icon: '👗' },
      { id: 'shoes', name: { ru: 'Обувь', en: 'Shoes', hy: 'Կոշիկներ', ka: 'ფეხსაცმელი' }, icon: '👠' },
      { id: 'bags', name: { ru: 'Сумки', en: 'Bags', hy: 'Պայուսակներ', ka: 'ჩანთები' }, icon: '👜' },
    ],
  },
  {
    id: 'home',
    name: { ru: 'Дом и сад', en: 'Home & Garden', hy: 'Տուն և այգի', ka: 'სახლი და ეზო' },
    icon: '🏠',
    subcategories: [
      { id: 'furniture', name: { ru: 'Мебель', en: 'Furniture', hy: 'Կահույք', ka: 'ავეჯი' }, icon: '🛋️' },
      { id: 'decor', name: { ru: 'Декор', en: 'Decor', hy: 'Դեկոր', ka: 'დეკორი' }, icon: '🖼️' },
      { id: 'kitchen', name: { ru: 'Кухня', en: 'Kitchen', hy: 'Խոհանոց', ka: 'სამზარეულო' }, icon: '🍳' },
      { id: 'garden', name: { ru: 'Сад', en: 'Garden', hy: 'Այգի', ka: 'ბაღი' }, icon: '🌳' },
    ],
  },
  {
    id: 'sports',
    name: { ru: 'Спорт', en: 'Sports', hy: 'Սպորտ', ka: 'სპორტი' },
    icon: '⚽',
    subcategories: [
      { id: 'fitness', name: { ru: 'Фитнес', en: 'Fitness', hy: 'Ֆիթնես', ka: 'ფიტნესი' }, icon: '💪' },
      { id: 'outdoor', name: { ru: 'На открытом воздухе', en: 'Outdoor', hy: 'Բացօթյա', ka: 'გარე' }, icon: '🏕️' },
      { id: 'water', name: { ru: 'Водные виды', en: 'Water Sports', hy: 'Ջրային', ka: 'წყლის სახეობები' }, icon: '🏊' },
      { id: 'winter', name: { ru: 'Зимние виды', en: 'Winter Sports', hy: 'Ձմեռային', ka: 'ზამთრის სპორტი' }, icon: '⛷️' },
    ],
  },
  {
    id: 'books',
    name: { ru: 'Книги', en: 'Books', hy: 'Գրքեր', ka: 'წიგნები' },
    icon: '📚',
    subcategories: [
      { id: 'fiction', name: { ru: 'Художественная', en: 'Fiction', hy: 'Գեղարվեստական', ka: 'მხატვრული' }, icon: '📖' },
      { id: 'non-fiction', name: { ru: 'Нехудожественная', en: 'Non-Fiction', hy: 'Գիտական/փաստագրական', ka: 'არამხატვრული' }, icon: '📕' },
      { id: 'children', name: { ru: 'Детские', en: 'Children', hy: 'Մանկական', ka: 'საბავშვო' }, icon: '📗' },
      { id: 'education', name: { ru: 'Образование', en: 'Education', hy: 'Կրթություն', ka: 'განათლება' }, icon: '📘' },
    ],
  },
  {
    id: 'toys',
    name: { ru: 'Игрушки', en: 'Toys', hy: 'Խաղալիքներ', ka: 'სათამაშოები' },
    icon: '🧸',
    subcategories: [
      { id: 'action', name: { ru: 'Фигурки', en: 'Action Figures', hy: 'Ֆիգուրներ', ka: 'ფიგურები' }, icon: '🤖' },
      { id: 'board', name: { ru: 'Настольные игры', en: 'Board Games', hy: 'Սեղանի խաղեր', ka: 'საგიდე თამაშები' }, icon: '🎲' },
      { id: 'outdoor', name: { ru: 'Уличные', en: 'Outdoor', hy: 'Արտաքին', ka: 'გარე' }, icon: '🛴' },
      { id: 'educational', name: { ru: 'Обучающие', en: 'Educational', hy: 'Կրթական', ka: 'საგანმანათლებლო' }, icon: '🧩' },
    ],
  },
]

export function MegaMenu() {
  const { language } = useApp()
  const [activeCategory, setActiveCategory] = useState<string | null>(null)
  const [isOpen, setIsOpen] = useState(false)

  const getCategoryName = (category: Category) => {
    return category.name[language]
  }

  const t = (ru: string, en: string, hy: string, ka: string) => {
    switch (language) {
      case 'ru': return ru
      case 'en': return en
      case 'hy': return hy
      case 'ka': return ka
    }
  }

  return (
    <nav className={styles.megaMenu}>
      <button
        className={styles.menuToggle}
        onClick={() => setIsOpen(!isOpen)}
        aria-expanded={isOpen}
        aria-label={t('Меню категорий', 'Categories menu', 'Կատեգորիաների ցանկ', 'კატეგორიების მენიუ')}
      >
        <span>☰</span>
        <span>{t('Категории', 'Categories', 'Կատեգորիաներ', 'კატეგორიები')}</span>
      </button>

      {isOpen && (
        <div className={styles.menuContainer}>
          <div className={styles.categoriesList}>
            {categories.map((category) => (
              <div
                key={category.id}
                className={styles.categoryItem}
                onMouseEnter={() => setActiveCategory(category.id)}
                onMouseLeave={() => setActiveCategory(null)}
              >
                <div className={styles.categoryHeader}>
                  <span className={styles.categoryIcon}>{category.icon}</span>
                  <span className={styles.categoryName}>
                    {getCategoryName(category)}
                  </span>
                  {category.subcategories && (
                    <span className={styles.arrow}>›</span>
                  )}
                </div>
              </div>
            ))}
          </div>

          {activeCategory && (
            <div className={styles.subcategoriesPanel}>
              {categories
                .find((cat) => cat.id === activeCategory)
                ?.subcategories?.map((subcategory) => (
                  <a
                    key={subcategory.id}
                    href={`/category/${subcategory.id}`}
                    className={styles.subcategoryItem}
                    onClick={() => setIsOpen(false)}
                  >
                    <span className={styles.subcategoryIcon}>
                      {subcategory.icon}
                    </span>
                    <span className={styles.subcategoryName}>
                      {getCategoryName(subcategory)}
                    </span>
                  </a>
                ))}
            </div>
          )}
        </div>
      )}
    </nav>
  )
}

