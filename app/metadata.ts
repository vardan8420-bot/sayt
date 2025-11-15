import { Metadata } from 'next'
import { generateMetadata } from '../lib/seo'

const getBaseUrl = (): string => {
  if (process.env.NEXTAUTH_URL) return process.env.NEXTAUTH_URL
  if (process.env.VERCEL_URL) return `https://${process.env.VERCEL_URL}`
  return 'https://sayt.vercel.app'
}

export function getPageMetadata(page: string): Metadata {
  const baseUrl = getBaseUrl()
  
  const metadataMap: Record<string, ReturnType<typeof generateMetadata>> = {
    home: generateMetadata({
      title: 'Sayt - Modern Web Tools & Website Builder',
      description:
        'Create professional websites with our drag & drop editor, AI content generator, image editor, and more. Multi-language support and currency converter included.',
      keywords: [
        'website builder',
        'drag and drop editor',
        'AI content generator',
        'image editor',
        'web tools',
        'SEO optimizer',
      ],
      url: baseUrl,
    }),
    editor: generateMetadata({
      title: 'Visual Editor - Drag & Drop Website Builder',
      description:
        'Build your website visually with our intuitive drag & drop editor. No coding required. Create beautiful pages in minutes.',
      keywords: ['visual editor', 'drag and drop', 'website builder', 'page builder'],
      url: `${baseUrl}/editor`,
    }),
    ai: generateMetadata({
      title: 'AI Content Generator - SEO Optimized Content',
      description:
        'Generate SEO-optimized content with AI. Create articles, blog posts, and web content in seconds. Multiple languages supported.',
      keywords: ['AI content', 'content generator', 'SEO content', 'AI writing'],
      url: `${baseUrl}/ai`,
    }),
    image: generateMetadata({
      title: 'Image Editor - Edit Photos Online',
      description:
        'Professional image editor with filters, brightness, contrast, rotation, and more. Edit photos online for free.',
      keywords: ['image editor', 'photo editor', 'online editor', 'image filters'],
      url: `${baseUrl}/image-editor`,
    }),
  }

  return metadataMap[page] || metadataMap.home
}

