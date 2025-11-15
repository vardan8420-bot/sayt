import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth-options'
import prisma from '../../../lib/prisma'
import { enforceRateLimit } from '../../../lib/rate-limit'
import { addToCartSchema } from '../../../lib/schemas'

// GET - получить корзину текущего пользователя
export async function GET(req: NextRequest) {
	try {
		const rate = await enforceRateLimit(req, { tag: 'cart:get', limit: 60 })
		if (!rate.ok) {
			return NextResponse.json({ error: 'Too many requests' }, { status: 429, headers: rate.headers })
		}

		const session = await getServerSession(authOptions)
		if (!session?.user?.id) {
			return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
		}

		const cartItems = await prisma.cartItem.findMany({
			where: { userId: session.user.id },
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
			},
			orderBy: { createdAt: 'desc' },
		})

		// Фильтруем товары, которые опубликованы и есть в наличии
		const validItems = cartItems.filter(
			(item) => item.product.published && item.product.stock >= item.quantity
		)

		return NextResponse.json({ items: validItems }, { headers: rate.headers })
	} catch (error: any) {
		console.error('Error fetching cart:', error)
		return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
	}
}

// POST - добавить товар в корзину
export async function POST(req: NextRequest) {
	try {
		const rate = await enforceRateLimit(req, { tag: 'cart:post', limit: 30 })
		if (!rate.ok) {
			return NextResponse.json({ error: 'Too many requests' }, { status: 429, headers: rate.headers })
		}

		const session = await getServerSession(authOptions)
		if (!session?.user?.id) {
			return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
		}

		const body = await req.json()
		
		// Валидация с Zod
		const validation = addToCartSchema.safeParse(body)
		if (!validation.success) {
			return NextResponse.json(
				{ error: 'Invalid input', details: validation.error.errors },
				{ status: 400 }
			)
		}

		const { productId, quantity } = validation.data

		// Проверяем, что товар существует и опубликован
		const product = await prisma.product.findUnique({
			where: { id: productId },
			select: {
				id: true,
				title: true,
				price: true,
				stock: true,
				published: true,
				sellerId: true,
			},
		})

		if (!product) {
			return NextResponse.json({ error: 'Product not found' }, { status: 404 })
		}

		if (!product.published) {
			return NextResponse.json({ error: 'Product is not published' }, { status: 400 })
		}

		if (product.stock < quantity) {
			return NextResponse.json({ error: 'Not enough stock' }, { status: 400 })
		}

		// Нельзя добавить свой товар в корзину
		if (product.sellerId === session.user.id) {
			return NextResponse.json({ error: 'Cannot add your own product to cart' }, { status: 400 })
		}

		const qty = Math.max(1, Math.min(quantity, product.stock))

		// Используем upsert для добавления или обновления количества
		const cartItem = await prisma.cartItem.upsert({
			where: {
				userId_productId: {
					userId: session.user.id,
					productId: product.id,
				},
			},
			update: {
				quantity: qty,
			},
			create: {
				userId: session.user.id,
				productId: product.id,
				quantity: qty,
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
			},
		})

		return NextResponse.json(cartItem, { headers: rate.headers })
	} catch (error: any) {
		console.error('Error adding to cart:', error)
		if (error.code === 'P2002') {
			return NextResponse.json({ error: 'Product already in cart' }, { status: 400 })
		}
		return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
	}
}

