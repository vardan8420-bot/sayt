import type { Metadata, Viewport } from 'next'
import './globals.css'
import { generateMetadata as genMeta, defaultSEO } from '../lib/seo'
import { WebVitals } from './components/WebVitals'
import { Providers } from './providers'
import { ErrorBoundary } from './components/ErrorBoundary'

export const metadata: Metadata = {
  ...genMeta(defaultSEO),
  icons: {
    icon: [
      { url: '/favicon.ico', sizes: '32x32', type: 'image/x-icon' },
      { url: '/favicon.svg', type: 'image/svg+xml' },
      { url: '/icon-192x192.png', sizes: '192x192', type: 'image/png' },
      { url: '/icon-512x512.png', sizes: '512x512', type: 'image/png' },
    ],
    apple: [
      { url: '/apple-touch-icon.png', sizes: '180x180', type: 'image/png' },
      { url: '/apple-touch-icon.svg', type: 'image/svg+xml' },
    ],
  },
  manifest: '/manifest.json',
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  themeColor: '#000000',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const structuredData = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: 'Sayt',
    description: defaultSEO.description,
    url: defaultSEO.url,
    potentialAction: {
      '@type': 'SearchAction',
      target: {
        '@type': 'EntryPoint',
        urlTemplate: `${defaultSEO.url}/search?q={search_term_string}`,
      },
      'query-input': 'required name=search_term_string',
    },
  }

  return (
    <html lang="en" itemScope itemType="https://schema.org/WebSite">
      <head>
        {/* Google Search Console */}
        {process.env.NEXT_PUBLIC_GOOGLE_VERIFICATION && (
          <meta
            name="google-site-verification"
            content={process.env.NEXT_PUBLIC_GOOGLE_VERIFICATION}
          />
        )}
        {/* Yandex Webmaster */}
        {process.env.NEXT_PUBLIC_YANDEX_VERIFICATION && (
          <meta
            name="yandex-verification"
            content={process.env.NEXT_PUBLIC_YANDEX_VERIFICATION}
          />
        )}
        {/* Bing Webmaster */}
        {process.env.NEXT_PUBLIC_BING_VERIFICATION && (
          <meta
            name="msvalidate.01"
            content={process.env.NEXT_PUBLIC_BING_VERIFICATION}
          />
        )}
        {/* Yahoo Site Explorer */}
        {process.env.NEXT_PUBLIC_YAHOO_VERIFICATION && (
          <meta
            name="y_key"
            content={process.env.NEXT_PUBLIC_YAHOO_VERIFICATION}
          />
        )}
        {/* Baidu Webmaster */}
        {process.env.NEXT_PUBLIC_BAIDU_VERIFICATION && (
          <meta
            name="baidu-site-verification"
            content={process.env.NEXT_PUBLIC_BAIDU_VERIFICATION}
          />
        )}
        {/* Facebook Domain Verification */}
        {process.env.NEXT_PUBLIC_FACEBOOK_VERIFICATION && (
          <meta
            name="facebook-domain-verification"
            content={process.env.NEXT_PUBLIC_FACEBOOK_VERIFICATION}
          />
        )}
        {/* Pinterest Site Verification */}
        {process.env.NEXT_PUBLIC_PINTEREST_VERIFICATION && (
          <meta
            name="p:domain_verify"
            content={process.env.NEXT_PUBLIC_PINTEREST_VERIFICATION}
          />
        )}
        {/* LinkedIn */}
        {process.env.NEXT_PUBLIC_LINKEDIN_VERIFICATION && (
          <meta
            name="linkedin-verification"
            content={process.env.NEXT_PUBLIC_LINKEDIN_VERIFICATION}
          />
        )}
        {/* Twitter */}
        {process.env.NEXT_PUBLIC_TWITTER_VERIFICATION && (
          <meta
            name="twitter:site"
            content={process.env.NEXT_PUBLIC_TWITTER_VERIFICATION}
          />
        )}
        {/* Naver (Корея) */}
        {process.env.NEXT_PUBLIC_NAVER_VERIFICATION && (
          <meta
            name="naver-site-verification"
            content={process.env.NEXT_PUBLIC_NAVER_VERIFICATION}
          />
        )}
        {/* Alexa */}
        {process.env.NEXT_PUBLIC_ALEXA_VERIFICATION && (
          <meta
            name="alexaVerifyID"
            content={process.env.NEXT_PUBLIC_ALEXA_VERIFICATION}
          />
        )}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(structuredData),
          }}
        />
      </head>
      <body>
        <Providers>
          <ErrorBoundary>
            {children}
          </ErrorBoundary>
          <WebVitals />
        </Providers>
      </body>
    </html>
  )
}

