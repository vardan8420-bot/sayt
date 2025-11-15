import { Metadata } from 'next'

export interface SEOConfig {
  title: string
  description: string
  keywords?: string[]
  image?: string
  url?: string
  type?: 'website' | 'article'
  locale?: string
}

export function generateMetadata(config: SEOConfig): Metadata {
  // Получаем базовый URL из переменных окружения
  let baseUrl = 'https://sayt.vercel.app'
  if (process.env.NEXTAUTH_URL) {
    baseUrl = process.env.NEXTAUTH_URL
  } else if (process.env.VERCEL_URL) {
    baseUrl = `https://${process.env.VERCEL_URL}`
  }
  
  const {
    title,
    description,
    keywords = [],
    image = '/og-image.jpg',
    url = config.url || baseUrl,
    type = 'website',
    locale = 'en',
  } = config

  const fullTitle = `${title} | Sayt - Modern Web Tools`
  const keywordsString = keywords.join(', ')

  return {
    title: fullTitle,
    description,
    keywords: keywordsString || undefined,
    authors: [{ name: 'Sayt Team' }],
    creator: 'Sayt',
    publisher: 'Sayt',
    formatDetection: {
      email: false,
      address: false,
      telephone: false,
    },
    metadataBase: new URL(url),
    alternates: {
      canonical: url,
      languages: {
        'ru-RU': `${url}/ru`,
        'en-US': `${url}/en`,
        'uz-UZ': `${url}/uz`,
      },
    },
    openGraph: {
      title: fullTitle,
      description,
      url,
      siteName: 'Sayt',
      images: [
        {
          url: image,
          width: 1200,
          height: 630,
          alt: title,
        },
      ],
      locale,
      type,
    },
    twitter: {
      card: 'summary_large_image',
      title: fullTitle,
      description,
      images: [image],
      creator: '@sayt',
    },
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        'max-video-preview': -1,
        'max-image-preview': 'large',
        'max-snippet': -1,
      },
    },
    verification: {
      google: process.env.NEXT_PUBLIC_GOOGLE_VERIFICATION || undefined,
      yandex: process.env.NEXT_PUBLIC_YANDEX_VERIFICATION || undefined,
    },
    other: {
      ...(process.env.NEXT_PUBLIC_BING_VERIFICATION && {
        'msvalidate.01': process.env.NEXT_PUBLIC_BING_VERIFICATION,
      }),
      ...(process.env.NEXT_PUBLIC_YAHOO_VERIFICATION && {
        'y_key': process.env.NEXT_PUBLIC_YAHOO_VERIFICATION,
      }),
      ...(process.env.NEXT_PUBLIC_BAIDU_VERIFICATION && {
        'baidu-site-verification': process.env.NEXT_PUBLIC_BAIDU_VERIFICATION,
      }),
      ...(process.env.NEXT_PUBLIC_FACEBOOK_VERIFICATION && {
        'facebook-domain-verification': process.env.NEXT_PUBLIC_FACEBOOK_VERIFICATION,
      }),
      ...(process.env.NEXT_PUBLIC_PINTEREST_VERIFICATION && {
        'p:domain_verify': process.env.NEXT_PUBLIC_PINTEREST_VERIFICATION,
      }),
      ...(process.env.NEXT_PUBLIC_LINKEDIN_VERIFICATION && {
        'linkedin-verification': process.env.NEXT_PUBLIC_LINKEDIN_VERIFICATION,
      }),
      ...(process.env.NEXT_PUBLIC_TWITTER_VERIFICATION && {
        'twitter:site': process.env.NEXT_PUBLIC_TWITTER_VERIFICATION,
      }),
      ...(process.env.NEXT_PUBLIC_NAVER_VERIFICATION && {
        'naver-site-verification': process.env.NEXT_PUBLIC_NAVER_VERIFICATION,
      }),
      ...(process.env.NEXT_PUBLIC_ALEXA_VERIFICATION && {
        'alexaVerifyID': process.env.NEXT_PUBLIC_ALEXA_VERIFICATION,
      }),
      'format-detection': 'telephone=no',
    },
  }
}

export const defaultSEO: SEOConfig = {
  title: 'Sayt - Modern Web Tools',
  description:
    'Professional web tools with currency converter, language switcher, image editor, and file uploader. Create amazing websites with ease.',
  keywords: [
    'web tools',
    'image editor',
    'currency converter',
    'language switcher',
    'SEO optimizer',
    'file uploader',
  ],
  url: process.env.NEXTAUTH_URL || (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : 'https://sayt.vercel.app'),
  type: 'website',
}

