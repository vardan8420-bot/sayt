import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth-options'
import { getAIRecommendations, getSimilarProducts, getPopularProducts } from '@/lib/recommendations'
import { enforceRateLimit } from '@/lib/rate-limit'
import { captureError } from '@/lib/monitoring'
import { logEvent } from '@/lib/logger'

/**
 * GET /api/recommendations
 * Получение AI-рекомендаций или похожих товаров
 */
export async function GET(req: NextRequest) {
	const rate = await enforceRateLimit(req, { tag: 'recommendations:get', limit: 60 })
	if (!rate.ok) {
		return NextResponse.json({ error: 'Too many requests' }, { status: 429, headers: rate.headers })
	}

	// Валидация DATABASE_URL
	const { validateDatabaseUrl } = await import('../../../lib/db-utils')
	const dbValidation = validateDatabaseUrl()
	
	if (!dbValidation.valid) {
		// База данных не настроена - возвращаем пустой результат
		return NextResponse.json({ 
			products: [], 
			fallback: true, 
			error: dbValidation.error || 'Database not configured' 
		}, { 
			status: 200, 
			headers: rate.headers 
		})
	}

	try {
		const session = await getServerSession(authOptions)
		const { searchParams } = new URL(req.url)
		const limit = Math.min(parseInt(searchParams.get('limit') || '10', 10), 20)
		const productId = searchParams.get('productId')

		if (productId) {
			try {
				const products = await getSimilarProducts(productId, limit)
				await logEvent('info', 'recommendations.similar', { productId, count: products.length })
				return NextResponse.json({ products }, { headers: rate.headers })
			} catch (error) {
				// Если база данных недоступна, возвращаем пустой список
				return NextResponse.json({ products: [], fallback: true }, { headers: rate.headers })
			}
		}

		if (!session?.user) {
			try {
				const products = await getPopularProducts(limit)
				return NextResponse.json({ products, fallback: true }, { headers: rate.headers })
			} catch (error) {
				// Если база данных недоступна, возвращаем пустой список
				return NextResponse.json({ products: [], fallback: true }, { headers: rate.headers })
			}
		}

		try {
			const products = await getAIRecommendations(session.user.id, limit)
			await logEvent('info', 'recommendations.personal', { userId: session.user.id, count: products.length })
			return NextResponse.json({ products }, { headers: rate.headers })
		} catch (error) {
			// Если база данных недоступна, возвращаем пустой список
			return NextResponse.json({ products: [], fallback: true }, { headers: rate.headers })
		}
	} catch (error: any) {
		captureError(error, { route: '/api/recommendations', method: 'GET' })
		await logEvent('error', 'recommendations.failed', { error: error?.message })
		// Возвращаем пустой список вместо ошибки 500
		return NextResponse.json({ products: [], fallback: true }, { status: 200, headers: rate.headers })
	}
}

