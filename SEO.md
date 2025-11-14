# SEO Оптимизация

## Реализованные функции SEO

### ✅ Метаданные
- Полные Open Graph теги для социальных сетей
- Twitter Card метаданные
- Структурированные данные (JSON-LD Schema.org)
- Метаданные для каждой страницы
- Многоязычная поддержка (hreflang)

### ✅ Оптимизация изображений
- Автоматическое сжатие изображений
- Поддержка современных форматов (AVIF, WebP)
- Адаптивные размеры изображений
- Lazy loading для изображений
- Оптимизация через Next.js Image компонент

### ✅ Минификация кода
- SWC минификация включена
- Удаление console.log в production
- Сжатие Gzip/Brotli
- Оптимизация бандлов

### ✅ Lazy Loading
- Динамический импорт компонентов
- Suspense для тяжелых компонентов
- Улучшенная производительность загрузки

### ✅ Sitemap и Robots.txt
- Автоматическая генерация sitemap.xml
- Настроенный robots.txt
- Поддержка многоязычности в sitemap

### ✅ Безопасность и производительность
- Security headers
- DNS prefetch
- Оптимизированные заголовки ответов

## Использование

### Добавление метаданных для новой страницы

```typescript
import { getPageMetadata } from '../app/metadata'

export const metadata = getPageMetadata('your-page-name')
```

### Настройка SEO для страницы

```typescript
import { generateMetadata } from '../lib/seo'

export const metadata = generateMetadata({
  title: 'Your Page Title',
  description: 'Page description',
  keywords: ['keyword1', 'keyword2'],
  url: 'https://sayt.example.com/your-page',
})
```

## Проверка SEO

1. **Google Search Console**: Добавьте сайт и проверьте индексацию
2. **Google PageSpeed Insights**: Проверьте производительность
3. **Schema.org Validator**: Проверьте структурированные данные
4. **Open Graph Debugger**: Проверьте OG теги

## Рекомендации

1. Обновите `defaultSEO.url` в `lib/seo.ts` на реальный домен
2. Добавьте реальные verification коды для Google и Yandex
3. Создайте favicon.ico и apple-touch-icon.png
4. Настройте реальные изображения для Open Graph

