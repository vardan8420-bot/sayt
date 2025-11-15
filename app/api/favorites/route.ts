import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth-options'
import prisma from '../../../lib/prisma'
import { enforceRateLimit } from '../../../lib/rate-limit'
import { addToFavoritesSchema } from '../../../lib/schemas'

// GET - получить избранное пользователя
export async function GET(req: NextRequest) {
	try {
		const rate = await enforceRateLimit(req, { tag: 'favorites:get', limit: 60 })
		if (!rate.ok) {
			return NextResponse.json({ error: 'Too many requests' }, { status: 429, headers: rate.headers })
		}

		const session = await getServerSession(authOptions)
		if (!session?.user?.id) {
			return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
		}

		const { searchParams } = new URL(req.url)
		const productId = searchParams.get('productId')
		const limit = parseInt(searchParams.get('limit') || '50')
		const page = parseInt(searchParams.get('page') || '1')

		const where: any = {
			userId: session.user.id,
		}

		if (productId) {
			where.productId = productId
		}

		const favorites = await prisma.favorite.findMany({
			where,
			include: {
				product: {
					select: {
						id: true,
						title: true,
						price: true,
						images: true,
						slug: true,
						stock: true,
						published: true,
						seller: {
							select: {
								id: true,
								name: true,
							},
						},
					},
				},
				service: {
					select: {
						id: true,
						title: true,
						price: true,
						slug: true,
						published: true,
					},
				},
			},
			orderBy: { createdAt: 'desc' },
			skip: (page - 1) * limit,
			take: limit,
		})

		const total = await prisma.favorite.count({ where })

		return NextResponse.json({ favorites, total, page, limit }, { headers: rate.headers })
	} catch (error: any) {
		console.error('Error fetching favorites:', error)
		return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
	}
}

// POST - добавить в избранное
export async function POST(req: NextRequest) {
	try {
		const rate = await enforceRateLimit(req, { tag: 'favorites:post', limit: 30 })
		if (!rate.ok) {
			return NextResponse.json({ error: 'Too many requests' }, { status: 429, headers: rate.headers })
		}

		const session = await getServerSession(authOptions)
		if (!session?.user?.id) {
			return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
		}

		const body = await req.json()
		
		// Валидация с Zod
		const validation = addToFavoritesSchema.safeParse(body)
		if (!validation.success) {
			return NextResponse.json(
				{ error: 'Invalid input', details: validation.error.errors },
				{ status: 400 }
			)
		}

		const { productId, serviceId } = validation.data

		// Проверяем существование товара/услуги
		if (productId) {
			const product = await prisma.product.findUnique({
				where: { id: productId },
				select: { id: true, published: true },
			})

			if (!product) {
				return NextResponse.json({ error: 'Product not found' }, { status: 404 })
			}

			if (!product.published) {
				return NextResponse.json({ error: 'Product is not published' }, { status: 400 })
			}
		}

		if (serviceId) {
			const service = await prisma.service.findUnique({
				where: { id: serviceId },
				select: { id: true, published: true },
			})

			if (!service) {
				return NextResponse.json({ error: 'Service not found' }, { status: 404 })
			}

			if (!service.published) {
				return NextResponse.json({ error: 'Service is not published' }, { status: 400 })
			}
		}

		// Создаем избранное
		const favorite = await prisma.favorite.create({
			data: {
				userId: session.user.id,
				productId: productId || null,
				serviceId: serviceId || null,
			},
			include: {
				product: {
					select: {
						id: true,
						title: true,
						price: true,
						images: true,
						slug: true,
						stock: true,
						published: true,
					},
				},
				service: {
					select: {
						id: true,
						title: true,
						price: true,
						slug: true,
						published: true,
					},
				},
			},
		})

		return NextResponse.json(favorite, { headers: rate.headers })
	} catch (error: any) {
		console.error('Error adding to favorites:', error)
		if (error.code === 'P2002') {
			return NextResponse.json({ error: 'Already in favorites' }, { status: 400 })
		}
		return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
	}
}

