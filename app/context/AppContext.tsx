'use client'

import React, { createContext, useContext, useState, ReactNode } from 'react'

type Currency = 'USD' | 'EUR' | 'RUB'
type Language = 'ru' | 'en' | 'hy' | 'ka'

interface AppContextType {
  currency: Currency
  language: Language
  setCurrency: (currency: Currency) => void
  setLanguage: (language: Language) => void
  translations: {
    [key: string]: {
      [key in Language]: string
    }
  }
}

const translations = {
  welcome: {
    ru: 'Добро пожаловать',
    en: 'Welcome',
    hy: 'Բարի գալուստ',
    ka: 'კეთილი იყოს თქვენი მობრძანება'
  },
  currency: {
    ru: 'Валюта',
    en: 'Currency',
    hy: 'Արժույթ',
    ka: 'ვალუტა'
  },
  language: {
    ru: 'Язык',
    en: 'Language',
    hy: 'Լեզու',
    ka: 'ენა'
  },
  price: {
    ru: 'Цена',
    en: 'Price',
    hy: 'Գին',
    ka: 'ფასი'
  },
  searchPlaceholder: {
    ru: 'Поиск товаров…',
    en: 'Search products…',
    hy: 'Փնտրել ապրանքներ…',
    ka: 'მოძებნე პროდუქტები…'
  },
  searchButton: {
    ru: 'Найти',
    en: 'Search',
    hy: 'Փնտրել',
    ka: 'ძებნა'
  },
  searchSuggestionsTitle: {
    ru: 'Подсказки',
    en: 'Suggestions',
    hy: 'Առաջարկներ',
    ka: 'შემოთავაზებები'
  },
  searchTrendingTitle: {
    ru: 'Популярное',
    en: 'Trending now',
    hy: 'Հայտնի հիմա',
    ka: 'პოპულარული'
  },
  searchNoResults: {
    ru: 'Ничего не найдено',
    en: 'Nothing found',
    hy: 'Չգտնվեց',
    ka: 'ვერ მოიძებნა'
  },
  minPrice: {
    ru: 'Мин. цена',
    en: 'Min price',
    hy: 'Մին. գին',
    ka: 'მინ. ფასი'
  },
  maxPrice: {
    ru: 'Макс. цена',
    en: 'Max price',
    hy: 'Մաքս. գին',
    ka: 'მაქს. ფასი'
  },
  applyFilters: {
    ru: 'Фильтры',
    en: 'Filters',
    hy: 'Զտումներ',
    ka: 'ფილტრები'
  },
  toolsTitle: {
    ru: 'Инструменты',
    en: 'Tools',
    hy: 'Գործիքներ',
    ka: 'ინსტრუმენტები'
  },
  loading: {
    ru: 'Загрузка…',
    en: 'Loading…',
    hy: 'Բեռնվում է…',
    ka: 'იტვირთება…'
  },
  noProducts: {
    ru: 'Пока нет опубликованных товаров',
    en: 'No products yet',
    hy: 'Ապրանքներ դեռ չկան',
    ka: 'პროდუქტები ჯერ არაა'
  },
  seller: {
    ru: 'Продавец',
    en: 'Seller',
    hy: 'Վաճառող',
    ka: 'გამყიდველი'
  },
  reviews: {
    ru: 'отзывов',
    en: 'reviews',
    hy: 'կարծիքներ',
    ka: 'შეფასებები'
  },
  recommendationsTitle: {
    ru: 'Рекомендации для вас',
    en: 'Recommended for you',
    hy: 'Առաջարկություններ ձեզ համար',
    ka: 'რეკომენდაციები თქვენთვის'
  },
  similarProductsTitle: {
    ru: 'Похожие товары',
    en: 'Similar products',
    hy: 'Նմանատիպ ապրանքներ',
    ka: 'მსგავსი პროდუქტები'
  },
  noRecommendations: {
    ru: 'Нет рекомендаций',
    en: 'No recommendations yet',
    hy: 'Առաջարկություններ դեռ չկան',
    ka: 'რეკომენდაციები ჯერ არაა'
  }
}

const AppContext = createContext<AppContextType | undefined>(undefined)

// Функции для работы с localStorage
const getStoredCurrency = (): Currency => {
  if (typeof window === 'undefined') return 'USD'
  const stored = localStorage.getItem('currency')
  return (stored === 'USD' || stored === 'EUR' || stored === 'RUB') ? stored : 'USD'
}

const getStoredLanguage = (): Language => {
  if (typeof window === 'undefined') return 'ru'
  const stored = localStorage.getItem('language')
  return (stored === 'ru' || stored === 'en' || stored === 'hy' || stored === 'ka') ? stored : 'ru'
}

export function AppProvider({ children }: { children: ReactNode }) {
  const [currency, setCurrencyState] = useState<Currency>(() => getStoredCurrency())
  const [language, setLanguageState] = useState<Language>(() => getStoredLanguage())

  const setCurrency = (newCurrency: Currency) => {
    setCurrencyState(newCurrency)
    if (typeof window !== 'undefined') {
      localStorage.setItem('currency', newCurrency)
    }
  }

  const setLanguage = (newLanguage: Language) => {
    setLanguageState(newLanguage)
    if (typeof window !== 'undefined') {
      localStorage.setItem('language', newLanguage)
    }
  }

  return (
    <AppContext.Provider
      value={{
        currency,
        language,
        setCurrency,
        setLanguage,
        translations
      }}
    >
      {children}
    </AppContext.Provider>
  )
}

export function useApp() {
  const context = useContext(AppContext)
  if (context === undefined) {
    throw new Error('useApp must be used within an AppProvider')
  }
  return context
}

