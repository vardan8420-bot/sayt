import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { searchProducts as searchIndex } from '@/lib/meilisearch'
import { enforceRateLimit } from '@/lib/rate-limit'
import { captureError } from '@/lib/monitoring'
import { logEvent } from '@/lib/logger'

type Suggestion = {
	id: string
	title: string
	slug: string
	price: number
	image: string | null
	category: string | null
	type: 'product' | 'trending'
}

const productSelect = {
	id: true,
	title: true,
	slug: true,
	price: true,
	images: true,
	category: {
		select: {
			name: true,
		},
	},
}

function mapProducts(products: Array<any>, type: Suggestion['type']): Suggestion[] {
	return products.map((product) => ({
		id: product.id,
		title: product.title,
		slug: product.slug,
		price: Number(product.price),
		image: product.images?.[0] || null,
		category: product.category?.name || null,
		type,
	}))
}

export async function GET(req: NextRequest) {
	const rate = await enforceRateLimit(req, { tag: 'search:suggestions', limit: 120 })
	if (!rate.ok) {
		return NextResponse.json({ error: 'Too many requests' }, { status: 429, headers: rate.headers })
	}

	try {
		const { searchParams } = new URL(req.url)
		const rawQuery = searchParams.get('q')?.trim() || ''
		const limit = Math.min(parseInt(searchParams.get('limit') || '5', 10), 10)

		let suggestions: Suggestion[] = []

		if (rawQuery.length >= 2) {
			const meiliResults = await searchIndex(rawQuery, limit)
			const meiliIds = (meiliResults.hits || []).map((hit: any) => hit.id)

			if (meiliIds.length > 0) {
				const meiliProducts = await prisma.product.findMany({
					where: {
						id: { in: meiliIds },
						published: true,
					},
					select: productSelect,
				})

				const ordered = meiliIds
					.map((id: string) => meiliProducts.find((product) => product.id === id))
					.filter(Boolean) as any[]

				suggestions = mapProducts(ordered, 'product')
			}

			if (suggestions.length === 0) {
				const prismaFallback = await prisma.product.findMany({
					where: {
						published: true,
						OR: [
							{ title: { contains: rawQuery, mode: 'insensitive' } },
							{ description: { contains: rawQuery, mode: 'insensitive' } },
						],
					},
					orderBy: { createdAt: 'desc' },
					take: limit,
					select: productSelect,
				})

				suggestions = mapProducts(prismaFallback, 'product')
			}
		}

		const trendingProducts = await prisma.product.findMany({
			where: { published: true },
			orderBy: [
				{ views: 'desc' },
				{ createdAt: 'desc' },
			],
			take: 5,
			select: productSelect,
		})

		await logEvent('info', 'search.suggestions', { query: rawQuery, results: suggestions.length })

		return NextResponse.json(
			{
				suggestions,
				trending: mapProducts(trendingProducts, 'trending'),
			},
			{ headers: rate.headers },
		)
	} catch (error: any) {
		captureError(error, { route: '/api/search/suggestions', method: 'GET' })
		await logEvent('error', 'search.suggestions.failed', { error: error?.message })
		return NextResponse.json({ error: 'Internal server error' }, { status: 500, headers: rate.headers })
	}
}


