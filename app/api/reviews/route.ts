import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth-options'
import prisma from '../../../lib/prisma'
import { enforceRateLimit } from '../../../lib/rate-limit'
import { createReviewSchema } from '../../../lib/schemas'

// GET - получить отзывы товара или пользователя
export async function GET(req: NextRequest) {
	try {
		const rate = await enforceRateLimit(req, { tag: 'reviews:get', limit: 60 })
		if (!rate.ok) {
			return NextResponse.json({ error: 'Too many requests' }, { status: 429, headers: rate.headers })
		}

		const { searchParams } = new URL(req.url)
		const productId = searchParams.get('productId')
		const targetId = searchParams.get('targetId') // ID пользователя
		const limit = parseInt(searchParams.get('limit') || '20')
		const page = parseInt(searchParams.get('page') || '1')

		const where: any = {}

		if (productId) {
			where.productId = productId
		}

		if (targetId) {
			where.targetId = targetId
		}

		const reviews = await prisma.review.findMany({
			where,
			include: {
				author: {
					select: {
						id: true,
						name: true,
						image: true,
					},
				},
				product: {
					select: {
						id: true,
						title: true,
						slug: true,
					},
				},
			},
			orderBy: { createdAt: 'desc' },
			skip: (page - 1) * limit,
			take: limit,
		})

		const total = await prisma.review.count({ where })

		// Вычисляем средний рейтинг
		const avgRating = reviews.length > 0
			? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
			: 0

		return NextResponse.json(
			{
				reviews,
				total,
				page,
				limit,
				avgRating: Math.round(avgRating * 10) / 10,
			},
			{ headers: rate.headers }
		)
	} catch (error: any) {
		console.error('Error fetching reviews:', error)
		return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
	}
}

// POST - создать отзыв
export async function POST(req: NextRequest) {
	try {
		const rate = await enforceRateLimit(req, { tag: 'reviews:post', limit: 10 })
		if (!rate.ok) {
			return NextResponse.json({ error: 'Too many requests' }, { status: 429, headers: rate.headers })
		}

		const session = await getServerSession(authOptions)
		if (!session?.user?.id) {
			return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
		}

		const body = await req.json()
		
		// Валидация с Zod
		const validation = createReviewSchema.safeParse(body)
		if (!validation.success) {
			return NextResponse.json(
				{ error: 'Invalid input', details: validation.error.errors },
				{ status: 400 }
			)
		}

		const { productId, targetId, rating, comment, images } = validation.data

		if (targetId === session.user.id) {
			return NextResponse.json({ error: 'Cannot review yourself' }, { status: 400 })
		}

		let targetUserId = targetId

		// Если указан productId, получаем sellerId товара
		if (productId && !targetId) {
			const product = await prisma.product.findUnique({
				where: { id: productId },
				select: { sellerId: true },
			})

			if (!product) {
				return NextResponse.json({ error: 'Product not found' }, { status: 404 })
			}

			targetUserId = product.sellerId

			// Нельзя оставлять отзыв на свой товар
			if (targetUserId === session.user.id) {
				return NextResponse.json({ error: 'Cannot review your own product' }, { status: 400 })
			}
		}

		// Проверяем, не оставлял ли уже отзыв на этот товар
		if (productId) {
			const existingReview = await prisma.review.findFirst({
				where: {
					authorId: session.user.id,
					productId: productId,
				},
			})

			if (existingReview) {
				return NextResponse.json({ error: 'Review already exists for this product' }, { status: 400 })
			}
		}

		// Создаем отзыв
		const review = await prisma.review.create({
			data: {
				authorId: session.user.id,
				targetId: targetUserId,
				productId: productId || null,
				rating: parseInt(rating),
				comment: comment || null,
				images: images || [],
			},
			include: {
				author: {
					select: {
						id: true,
						name: true,
						image: true,
					},
				},
				product: {
					select: {
						id: true,
						title: true,
						slug: true,
					},
				},
			},
		})

		// Обновляем репутацию пользователя
		const userReviews = await prisma.review.findMany({
			where: { targetId: targetUserId },
			select: { rating: true },
		})

		const avgRating = userReviews.reduce((sum, r) => sum + r.rating, 0) / userReviews.length

		await prisma.user.update({
			where: { id: targetUserId },
			data: {
				reputationScore: Math.min(100, Math.max(-100, (avgRating - 3) * 50)), // -100 до +100
			},
		})

		return NextResponse.json(review, { headers: rate.headers })
	} catch (error: any) {
		console.error('Error creating review:', error)
		if (error.code === 'P2002') {
			return NextResponse.json({ error: 'Review already exists' }, { status: 400 })
		}
		return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
	}
}

