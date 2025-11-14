// import { generateEmbedding } from 'ai' // TODO: Fix when ai package is updated
import prisma from './prisma'

// Опциональный Supabase клиент (если настроен)
let supabase: any = null
try {
  if (process.env.SUPABASE_URL && process.env.SUPABASE_ANON_KEY) {
    const { createClient } = require('@supabase/supabase-js')
    supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_ANON_KEY)
  }
} catch {
  // Supabase не установлен или не настроен
  console.warn('Supabase not configured, using fallback recommendations')
}

/**
 * Получение AI-рекомендаций товаров для пользователя
 * Использует векторные эмбеддинги для поиска похожих товаров
 */
export async function getAIRecommendations(userId: string, limit: number = 10) {
  try {
    // 1. Получаем историю покупок пользователя
    const orders = await prisma.order.findMany({
      where: {
        buyerId: userId,
        status: {
          in: ['DELIVERED', 'SHIPPED', 'PAID'],
        },
      },
      include: {
        items: {
          include: {
            product: {
              select: {
                id: true,
                title: true,
                categoryId: true,
                category: {
                  select: {
                    id: true,
                    name: true,
                    slug: true,
                  },
                },
              },
            },
            service: {
              select: {
                id: true,
                title: true,
                category: true,
              },
            },
          },
        },
      },
      take: 50, // Берем последние 50 заказов для анализа
      orderBy: {
        createdAt: 'desc',
      },
    })

    // Если нет истории покупок, возвращаем популярные товары
    if (orders.length === 0) {
      return await getPopularProducts(limit)
    }

    // 2. Собираем категории и интересы пользователя
    const categories: string[] = []
    const productTitles: string[] = []

    orders.forEach((order: any) => {
      if (order.items && Array.isArray(order.items)) {
        order.items.forEach((item: any) => {
          if (item.product) {
            const category = item.product.category?.name || 'Other'
            categories.push(category)
            productTitles.push(item.product.title)
          }
          if (item.service) {
            categories.push(item.service.category || 'Services')
            productTitles.push(item.service.title)
          }
        })
      }
    })

    // Уникальные категории
    const uniqueCategories = [...new Set(categories)]
    const interestsText = `User likes: ${uniqueCategories.join(', ')}. Recent purchases: ${productTitles.slice(0, 10).join(', ')}`

    // 3. Генерируем вектор интересов
    let embedding: number[] | null = null
    
    try {
      if (process.env.OPENAI_API_KEY) {
        // TODO: Fix when ai package is updated
        // const embeddingResult = await generateEmbedding({
        //   model: openai.embedding('text-embedding-3-small'),
        //   value: interestsText,
        // })
        // embedding = embeddingResult.embedding
        console.warn('Embedding generation temporarily disabled')
      }
    } catch (error) {
      console.warn('Failed to generate embedding, using fallback:', error)
    }

    // 4. Если есть Supabase и эмбеддинг, используем векторный поиск
    if (supabase && embedding) {
      try {
        const { data, error } = await supabase.rpc('recommend_products', {
          user_embedding: embedding,
          match_count: limit,
        })

        if (!error && data && data.length > 0) {
          // Получаем полные данные товаров из Prisma
          const productIds = data.map((item: any) => item.id)
          const products = await prisma.product.findMany({
            where: {
              id: { in: productIds },
              published: true,
            },
            include: {
              seller: {
                select: {
                  id: true,
                  name: true,
                  reputationScore: true,
                },
              },
              category: {
                select: {
                  id: true,
                  name: true,
                  slug: true,
                },
              },
              _count: {
                select: {
                  reviews: true,
                  favorites: true,
                },
              },
            },
          })

          // Сохраняем порядок из векторного поиска
          const orderedProducts = productIds
            .map((id: string) => products.find((p) => p.id === id))
            .filter(Boolean)

          return orderedProducts
        }
      } catch (error) {
        console.warn('Supabase vector search failed, using fallback:', error)
      }
    }

    // 5. Fallback: рекомендации на основе категорий
    return await getCategoryBasedRecommendations(uniqueCategories, limit)
  } catch (error: any) {
    console.error('Error getting AI recommendations:', error)
    // В случае ошибки возвращаем популярные товары
    return await getPopularProducts(limit)
  }
}

/**
 * Рекомендации на основе категорий (fallback)
 */
async function getCategoryBasedRecommendations(
  categories: string[],
  limit: number,
  excludeSellerId?: string
) {
  if (categories.length === 0) {
    return await getPopularProducts(limit)
  }

  // Ищем товары в тех же категориях
  const where: any = {
    category: {
      name: { in: categories },
    },
    published: true,
  }

  // Исключаем товары конкретного продавца, если указано
  if (excludeSellerId) {
    where.sellerId = { not: excludeSellerId }
  }

  const products = await prisma.product.findMany({
    where,
    include: {
      seller: {
        select: {
          id: true,
          name: true,
          reputationScore: true,
        },
      },
      category: {
        select: {
          id: true,
          name: true,
          slug: true,
        },
      },
      _count: {
        select: {
          reviews: true,
          favorites: true,
        },
      },
    },
    orderBy: {
      createdAt: 'desc', // Новые товары
    },
    take: limit,
  })

  return products
}

/**
 * Популярные товары (fallback для новых пользователей)
 */
export async function getPopularProducts(limit: number) {
  const products = await prisma.product.findMany({
    where: {
      published: true,
    },
    include: {
      seller: {
        select: {
          id: true,
          name: true,
          reputationScore: true,
        },
      },
      category: {
        select: {
          id: true,
          name: true,
          slug: true,
        },
      },
      _count: {
        select: {
          reviews: true,
          favorites: true,
        },
      },
    },
    orderBy: {
      createdAt: 'desc', // Новые товары
    },
    take: limit,
  })

  return products
}

/**
 * Рекомендации на основе конкретного товара
 */
export async function getSimilarProducts(productId: string, limit: number = 10) {
  try {
    const product = await prisma.product.findUnique({
      where: { id: productId },
      select: {
        title: true,
        description: true,
        categoryId: true,
        category: {
          select: {
            name: true,
          },
        },
      },
    })

    if (!product) {
      return await getPopularProducts(limit)
    }

    // Генерируем эмбеддинг для товара
    const productText = `${product.title}. ${product.description?.substring(0, 200) || ''}`
    let embedding: number[] | null = null

    try {
      if (process.env.OPENAI_API_KEY) {
        // TODO: Fix when ai package is updated
        // const embeddingResult = await generateEmbedding({
        //   model: openai.embedding('text-embedding-3-small'),
        //   value: productText,
        // })
        // embedding = embeddingResult.embedding
        console.warn('Embedding generation temporarily disabled')
      }
    } catch (error) {
      console.warn('Failed to generate embedding for product:', error)
    }

    // Если есть Supabase и эмбеддинг, используем векторный поиск
    if (supabase && embedding) {
      try {
        const { data, error } = await supabase.rpc('find_similar_products', {
          product_embedding: embedding,
          product_id: productId,
          match_count: limit,
        })

        if (!error && data && data.length > 0) {
          const productIds = data.map((item: any) => item.id)
          const products = await prisma.product.findMany({
            where: {
              AND: [
                { id: { in: productIds } },
                { id: { not: productId } }, // Исключаем сам товар
              ],
              published: true,
            },
            include: {
              seller: {
                select: {
                  id: true,
                  name: true,
                  reputationScore: true,
                },
              },
              category: {
                select: {
                  id: true,
                  name: true,
                  slug: true,
                },
              },
              _count: {
                select: {
                  reviews: true,
                  favorites: true,
                },
              },
            },
          })

          const orderedProducts = productIds
            .map((id: string) => products.find((p) => p.id === id))
            .filter(Boolean)

          return orderedProducts
        }
      } catch (error) {
        console.warn('Supabase vector search failed, using fallback:', error)
      }
    }

    // Fallback: товары из той же категории
    const categoryName = product.category?.name
    if (categoryName) {
      return await getCategoryBasedRecommendations([categoryName], limit, '')
    }

    return await getPopularProducts(limit)
  } catch (error: any) {
    console.error('Error getting similar products:', error)
    return await getPopularProducts(limit)
  }
}

