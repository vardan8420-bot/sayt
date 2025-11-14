import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { Prisma } from '@prisma/client'
import { authOptions } from '@/lib/auth-options'
import prisma from '../../../lib/prisma'
import { createProductSchema } from '../../../lib/schemas'
import { searchProducts, syncProductToSearch } from '../../../lib/meilisearch'
import { generateSlug } from '../../../lib/utils'
import { revalidateTag } from 'next/cache'
import { enforceRateLimit } from '../../../lib/rate-limit'
import { captureError } from '../../../lib/monitoring'
import { logEvent } from '../../../lib/logger'

export async function POST(req: NextRequest) {
  try {
    const rate = await enforceRateLimit(req, { tag: 'products:post', limit: 20 })
    if (!rate.ok) {
      return NextResponse.json({ error: 'Too many requests' }, { status: 429, headers: rate.headers })
    }
    // Проверка аутентификации
    const session = await getServerSession(authOptions)

    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Проверяем, что пользователь — продавец
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { isSeller: true },
    })

    if (!user?.isSeller) {
      return NextResponse.json(
        { error: 'Only sellers can create products' },
        { status: 403 }
      )
    }

    // Парсинг и валидация данных
    const body = await req.json()
    const parsed = createProductSchema.safeParse(body)

    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Validation failed', details: parsed.error.errors },
        { status: 400 }
      )
    }

    const { title, description, price, images, categoryId, location, stock, published, metaTitle, metaDesc, tags } = parsed.data

    // Генерация slug
    const slug = generateSlug(title) + '-' + Date.now().toString(36)

    // Создание товара
    const product = await prisma.product.create({
      data: {
        title,
        description,
        price: new Prisma.Decimal(price), // Prisma Decimal из number
        images,
        categoryId: categoryId || null,
        location: location || null,
        tags: tags || [],
        sellerId: session.user.id,
        stock: stock || 1,
        published: published || false,
        slug,
        metaTitle: metaTitle || null,
        metaDesc: metaDesc || null,
      },
      include: {
        seller: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        category: {
          select: {
            id: true,
            name: true,
            slug: true,
          },
        },
      },
    })

    // Синхронизация с Meilisearch
    try {
      await syncProductToSearch({
        id: product.id,
        title: product.title,
        description: product.description,
        price: Number(product.price),
        category: categoryId || '',
        slug: product.slug,
        images: product.images,
        sellerId: product.sellerId,
        published: product.published,
      })
    } catch (searchError) {
      // Логируем ошибку, но не прерываем создание товара
      console.error('Failed to sync product to Meilisearch:', searchError)
    }

    await revalidateTag('products', 'default')
    await revalidateTag('products', 'default')
    await logEvent('info', 'product.created', { productId: product.id, sellerId: session.user.id })
    return NextResponse.json(product, { status: 201, headers: rate.headers })
  } catch (error: any) {
    captureError(error, { route: '/api/products', method: 'POST' })
    await logEvent('error', 'product.create.failed', { error: error?.message })
    console.error('Error creating product:', error)
    return NextResponse.json(
      { error: 'Internal server error', message: error.message },
      { status: 500 }
    )
  }
}

// GET - получение списка товаров
export async function GET(req: NextRequest) {
  try {
    const rate = await enforceRateLimit(req, { tag: 'products:get' })
    if (!rate.ok) {
      return NextResponse.json({ error: 'Too many requests' }, { status: 429, headers: rate.headers })
    }
    
    // Проверка наличия DATABASE_URL
    if (!process.env.DATABASE_URL || process.env.DATABASE_URL.includes('placeholder')) {
      return NextResponse.json({
        products: [],
        pagination: {
          page: 1,
          limit: 20,
          total: 0,
          totalPages: 0,
        },
      }, {
        headers: {
          ...rate.headers,
          'Cache-Control': 's-maxage=60, stale-while-revalidate=300'
        }
      })
    }

    const { searchParams } = new URL(req.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')
    const categoryId = searchParams.get('categoryId')
    const sellerId = searchParams.get('sellerId')
    const publishedParam = searchParams.get('published')
    const q = searchParams.get('q') || undefined
    const minPrice = searchParams.get('minPrice')
    const maxPrice = searchParams.get('maxPrice')

    const where: any = {}
    
    if (categoryId) where.categoryId = categoryId
    if (sellerId) where.sellerId = sellerId
    // Если параметр не передан, показываем только опубликованные
    if (publishedParam === null || publishedParam === undefined) {
      where.published = true
    } else {
      where.published = publishedParam === 'true'
    }

    if (q && q.length > 64) {
      return NextResponse.json({ error: 'Query too long' }, { status: 400, headers: rate.headers })
    }

    const minPriceValue = minPrice ? Number(minPrice) : undefined
    const maxPriceValue = maxPrice ? Number(maxPrice) : undefined
    if (
      (minPriceValue !== undefined && (Number.isNaN(minPriceValue) || minPriceValue < 0)) ||
      (maxPriceValue !== undefined && (Number.isNaN(maxPriceValue) || maxPriceValue < 0))
    ) {
      return NextResponse.json({ error: 'Invalid price filters' }, { status: 400, headers: rate.headers })
    }
    if (minPriceValue !== undefined || maxPriceValue !== undefined) {
      where.price = {}
      if (minPriceValue !== undefined) (where.price as any).gte = new Prisma.Decimal(minPriceValue)
      if (maxPriceValue !== undefined) (where.price as any).lte = new Prisma.Decimal(maxPriceValue)
    }

    let products, total

    // Поиск через Meilisearch при наличии q
    if (q) {
      try {
        const results = await searchProducts(q, limit)
        const ids = (results.hits as any[]).map(h => h.id)
        if (ids.length > 0) {
          where.id = { in: ids }
        } else {
          where.OR = [
            { title: { contains: q, mode: 'insensitive' } },
            { description: { contains: q, mode: 'insensitive' } },
          ]
        }
      } catch (searchError) {
        // Если Meilisearch недоступен, используем обычный поиск
        where.OR = [
          { title: { contains: q, mode: 'insensitive' } },
          { description: { contains: q, mode: 'insensitive' } },
        ]
      }
    }

    try {
      [products, total] = await Promise.all([
        prisma.product.findMany({
          where,
          include: {
            seller: { select: { id: true, name: true, reputationScore: true } },
            category: { select: { id: true, name: true, slug: true } },
            _count: { select: { reviews: true, favorites: true } },
          },
          orderBy: { createdAt: 'desc' },
          skip: (page - 1) * limit,
          take: limit,
        }),
        prisma.product.count({ where }),
      ])
    } catch (dbError: any) {
      // Если база данных недоступна, возвращаем пустой список
      console.error('Database connection error:', dbError)
      return NextResponse.json({
        products: [],
        pagination: {
          page,
          limit,
          total: 0,
          totalPages: 0,
        },
      }, {
        headers: {
          ...rate.headers,
          'Cache-Control': 's-maxage=60, stale-while-revalidate=300'
        }
      })
    }

    await logEvent('info', 'products.list', { q, page, total })
    return NextResponse.json({
      products,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    }, {
      headers: {
        ...rate.headers,
        'Cache-Control': 's-maxage=60, stale-while-revalidate=300'
      }
    })
  } catch (error: any) {
    captureError(error, { route: '/api/products', method: 'GET' })
    await logEvent('error', 'products.list.failed', { error: error?.message })
    console.error('Error fetching products:', error)
    
    // Возвращаем пустой список вместо ошибки 500
    return NextResponse.json({
      products: [],
      pagination: {
        page: 1,
        limit: 20,
        total: 0,
        totalPages: 0,
      },
    }, {
      status: 200,
      headers: {
        'Cache-Control': 's-maxage=60, stale-while-revalidate=300'
      }
    })
  }
}

