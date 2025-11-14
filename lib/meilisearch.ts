import { MeiliSearch } from 'meilisearch'

if (!process.env.MEILISEARCH_HOST || !process.env.MEILISEARCH_MASTER_KEY) {
  console.warn('Meilisearch credentials not set. Search functionality will be limited.')
}

export const meilisearch = process.env.MEILISEARCH_HOST
  ? new MeiliSearch({
      host: process.env.MEILISEARCH_HOST,
      apiKey: process.env.MEILISEARCH_MASTER_KEY,
    })
  : null

export const productsIndex = meilisearch?.index('products')

// Функция для синхронизации товаров с Meilisearch
export async function syncProductToSearch(product: any) {
  if (!productsIndex) {
    console.warn('Meilisearch not configured, skipping sync')
    return
  }

  try {
    await productsIndex.addDocuments([{
      id: product.id,
      title: product.title,
      description: product.description,
      price: product.price,
      category: product.category || product.categoryString || '',
      slug: product.slug,
      images: product.images || [],
      sellerId: product.sellerId,
      published: product.published || false,
    }])
  } catch (error) {
    console.error('Error syncing product to Meilisearch:', error)
    throw error
  }
}

// Функция для поиска товаров
export async function searchProducts(query: string, limit: number = 20) {
  if (!productsIndex) {
    return { hits: [], estimatedTotalHits: 0 }
  }

  try {
    const results = await productsIndex.search(query, {
      limit,
      attributesToRetrieve: ['id', 'title', 'slug', 'price', 'images', 'category', 'sellerId'],
    })
    return results
  } catch (error) {
    console.error('Error searching products:', error)
    return { hits: [], estimatedTotalHits: 0 }
  }
}

