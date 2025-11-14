'use client'

import React, { createContext, useContext, useState, ReactNode } from 'react'

type Currency = 'USD' | 'EUR' | 'RUB' | 'AMD'
type Language = 'ru' | 'en' | 'hy' | 'ka'

interface AppContextType {
  currency: Currency
  language: Language
  setCurrency: (currency: Currency) => void
  setLanguage: (language: Language) => void
  translations: {
    [key: string]: any
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
  },
  signIn: {
    ru: 'Войти',
    en: 'Sign In',
    hy: 'Մուտք',
    ka: 'შესვლა'
  },
  register: {
    ru: 'Регистрация',
    en: 'Register',
    hy: 'Գրանցում',
    ka: 'რეგისტრაცია'
  },
  signOut: {
    ru: 'Выйти',
    en: 'Sign Out',
    hy: 'Ելք',
    ka: 'გასვლა'
  },
  signInTitle: {
    ru: 'Вход',
    en: 'Sign In',
    hy: 'Մուտք',
    ka: 'შესვლა'
  },
  signInSubtitle: {
    ru: 'Войдите с помощью email/пароля или через провайдеров.',
    en: 'Sign in with email/password or using providers.',
    hy: 'Մուտք գործեք email/գաղտնաբառով կամ օգտագործելով մատակարարներ:',
    ka: 'შედით email/პაროლით ან მომწოდებლების გამოყენებით.'
  },
  email: {
    ru: 'Email',
    en: 'Email',
    hy: 'Email',
    ka: 'Email'
  },
  password: {
    ru: 'Пароль',
    en: 'Password',
    hy: 'Գաղտնաբառ',
    ka: 'პაროლი'
  },
  signingIn: {
    ru: 'Входим...',
    en: 'Signing in...',
    hy: 'Մուտք գործելու համար...',
    ka: 'შესვლა...'
  },
  signInError: {
    ru: 'Неверный email или пароль',
    en: 'Invalid email or password',
    hy: 'Սխալ email կամ գաղտնաբառ',
    ka: 'არასწორი email ან პაროლი'
  },
  signInWithGitHub: {
    ru: 'Войти через GitHub',
    en: 'Sign in with GitHub',
    hy: 'Մուտք GitHub-ով',
    ka: 'შესვლა GitHub-ით'
  },
  signInWithGoogle: {
    ru: 'Войти через Google',
    en: 'Sign in with Google',
    hy: 'Մուտք Google-ով',
    ka: 'შესვლა Google-ით'
  },
  noAccount: {
    ru: 'Нет аккаунта?',
    en: 'No account?',
    hy: 'Չունեք հաշիվ?',
    ka: 'არ გაქვთ ანგარიში?'
  },
  registerLink: {
    ru: 'Зарегистрироваться',
    en: 'Register',
    hy: 'Գրանցվել',
    ka: 'რეგისტრაცია'
  },
  registerTitle: {
    ru: 'Регистрация',
    en: 'Register',
    hy: 'Գրանցում',
    ka: 'რეგისტრაცია'
  },
  name: {
    ru: 'Имя (необязательно)',
    en: 'Name (optional)',
    hy: 'Անուն (ընտրովի)',
    ka: 'სახელი (არასავალდებულო)'
  },
  registering: {
    ru: 'Отправка...',
    en: 'Registering...',
    hy: 'Գրանցվում է...',
    ka: 'რეგისტრაცია...'
  },
  registerSuccess: {
    ru: 'Успешно! Теперь вы можете войти.',
    en: 'Success! You can now sign in.',
    hy: 'Հաջողված! Այժմ կարող եք մուտք գործել:',
    ka: 'წარმატება! ახლა შეგიძლიათ შეხვიდეთ.'
  },
  registerError: {
    ru: 'Ошибка регистрации',
    en: 'Registration error',
    hy: 'Գրանցման սխալ',
    ka: 'რეგისტრაციის შეცდომა'
  },
  alreadyHaveAccount: {
    ru: 'Уже есть аккаунт?',
    en: 'Already have an account?',
    hy: 'Արդեն ունեք հաշիվ?',
    ka: 'უკვე გაქვთ ანგარიში?'
  },
  currencyNames: {
    USD: {
      ru: 'Доллар США',
      en: 'US Dollar',
      hy: 'ԱՄՆ դոլար',
      ka: 'აშშ დოლარი'
    },
    EUR: {
      ru: 'Евро',
      en: 'Euro',
      hy: 'Եվրո',
      ka: 'ევრო'
    },
    RUB: {
      ru: 'Российский рубль',
      en: 'Russian Ruble',
      hy: 'Ռուսական ռուբլի',
      ka: 'რუსული რუბლი'
    },
    AMD: {
      ru: 'Армянский драм',
      en: 'Armenian Dram',
      hy: 'Հայկական դրամ',
      ka: 'სომხური დრამი'
    }
  }
}

const AppContext = createContext<AppContextType | undefined>(undefined)

// Функции для работы с localStorage
const getStoredCurrency = (): Currency => {
  if (typeof window === 'undefined') return 'USD'
  const stored = localStorage.getItem('currency')
  return (stored === 'USD' || stored === 'EUR' || stored === 'RUB' || stored === 'AMD') ? stored : 'USD'
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

