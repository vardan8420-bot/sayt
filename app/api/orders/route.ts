import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth-options'
import prisma from '../../../lib/prisma'
import { createOrderSchema } from '../../../lib/schemas'

export async function GET(_req: NextRequest) {
	try {
		const session = await getServerSession(authOptions)
		if (!session?.user?.id) {
			return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
		}
		const userId = session.user.id

		const [buyerOrders, sellerOrders] = await Promise.all([
			prisma.order.findMany({
				where: { buyerId: userId },
				orderBy: { createdAt: 'desc' },
				select: {
					id: true,
					status: true,
					escrowStatus: true,
					amount: true,
					createdAt: true,
					items: {
						select: {
							product: { select: { title: true } },
							service: { select: { title: true } },
						},
					},
				},
				take: 50,
			}),
			prisma.order.findMany({
				where: { sellerId: userId },
				orderBy: { createdAt: 'desc' },
				select: {
					id: true,
					status: true,
					escrowStatus: true,
					amount: true,
					createdAt: true,
					items: {
						select: {
							product: { select: { title: true } },
							service: { select: { title: true } },
						},
					},
				},
				take: 50,
			}),
		])

		return NextResponse.json({ buyerOrders, sellerOrders })
	} catch (error: any) {
		console.error('Error listing orders:', error)
		return NextResponse.json(
			{ error: 'Internal server error', message: error.message },
			{ status: 500 }
		)
	}
}

// POST - создать заказ из корзины или одного товара
export async function POST(req: NextRequest) {
	try {
		const session = await getServerSession(authOptions)
		if (!session?.user?.id) {
			return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
		}

		const body = await req.json()
		
		// Валидация с Zod
		const validation = createOrderSchema.safeParse(body)
		if (!validation.success) {
			return NextResponse.json(
				{ error: 'Invalid input', details: validation.error.errors },
				{ status: 400 }
			)
		}

		const { productId, cartItemIds, shippingAddressId, couponCode } = validation.data
		const userId = session.user.id

		// Получаем товары для заказа
		let cartItems: Array<{ productId: string; quantity: number; price: string; sellerId: string }> = []

		if (productId) {
			// Один товар (buy now)
			const product = await prisma.product.findUnique({
				where: { id: productId },
				select: {
					id: true,
					price: true,
					sellerId: true,
					stock: true,
					published: true,
					title: true,
				},
			})

			if (!product || !product.published || product.stock < 1) {
				return NextResponse.json({ error: 'Product not available' }, { status: 400 })
			}

			if (product.sellerId === userId) {
				return NextResponse.json({ error: 'Cannot order your own product' }, { status: 400 })
			}

			cartItems = [
				{
					productId: product.id,
					quantity: 1,
					price: product.price.toString(),
					sellerId: product.sellerId,
				},
			]
		} else if (cartItemIds && Array.isArray(cartItemIds) && cartItemIds.length > 0) {
			// Из корзины
			const items = await prisma.cartItem.findMany({
				where: {
					id: { in: cartItemIds },
					userId: userId,
				},
				include: {
					product: {
						select: {
							id: true,
							price: true,
							sellerId: true,
							stock: true,
							published: true,
						},
					},
				},
			})

			cartItems = items
				.filter((item) => item.product.published && item.product.stock >= item.quantity)
				.map((item) => ({
					productId: item.product.id,
					quantity: item.quantity,
					price: item.product.price.toString(),
					sellerId: item.product.sellerId,
				}))

			if (cartItems.length === 0) {
				return NextResponse.json({ error: 'No valid items in cart' }, { status: 400 })
			}
		} else {
			// Из всей корзины
			const items = await prisma.cartItem.findMany({
				where: { userId: userId },
				include: {
					product: {
						select: {
							id: true,
							price: true,
							sellerId: true,
							stock: true,
							published: true,
						},
					},
				},
			})

			cartItems = items
				.filter((item) => item.product.published && item.product.stock >= item.quantity)
				.map((item) => ({
					productId: item.product.id,
					quantity: item.quantity,
					price: item.product.price.toString(),
					sellerId: item.product.sellerId,
				}))

			if (cartItems.length === 0) {
				return NextResponse.json({ error: 'Cart is empty' }, { status: 400 })
			}
		}

		// Проверяем, что все товары от одного продавца (упрощенная логика)
		const sellers = [...new Set(cartItems.map((item) => item.sellerId))]
		if (sellers.length > 1) {
			return NextResponse.json({ error: 'Multiple sellers not supported' }, { status: 400 })
		}

		const sellerId = sellers[0]

		// Рассчитываем сумму
		const subtotal = cartItems.reduce(
			(sum, item) => sum + Number(item.price) * item.quantity,
			0
		)

		// Применяем промокод, если есть
		let coupon = null
		let discount = 0
		if (couponCode) {
			coupon = await prisma.coupon.findUnique({
				where: {
					code: couponCode,
					active: true,
				},
			})

			if (coupon && new Date() >= coupon.validFrom && new Date() <= coupon.validUntil) {
				if (coupon.discountType === 'PERCENT') {
					discount = subtotal * (Number(coupon.discount) / 100)
				} else {
					discount = Number(coupon.discount)
				}
				discount = Math.min(discount, subtotal)
			}
		}

		const platformFeePercent = 5 // 5% комиссия платформы
		const platformFee = (subtotal - discount) * (platformFeePercent / 100)
		const amount = subtotal - discount + platformFee

		// Создаем заказ
		const order = await prisma.order.create({
			data: {
				buyerId: userId,
				sellerId: sellerId,
				amount: amount,
				subtotal: subtotal,
				platformFee: platformFee,
				platformFeePercent: platformFeePercent,
				status: 'PENDING',
				escrowStatus: 'PENDING',
				couponId: coupon?.id,
				shippingAddressId: shippingAddressId || null,
				items: {
					create: cartItems.map((item) => ({
						productId: item.productId,
						quantity: item.quantity,
						price: item.price,
					})),
				},
			},
			include: {
				items: {
					include: {
						product: {
							select: {
								id: true,
								title: true,
								price: true,
							},
						},
					},
				},
			},
		})

		// Удаляем товары из корзины, если заказ из корзины
		if (!productId && cartItemIds) {
			await prisma.cartItem.deleteMany({
				where: {
					id: { in: cartItemIds },
					userId: userId,
				},
			})
		} else if (!productId && !cartItemIds) {
			// Удаляем всю корзину
			await prisma.cartItem.deleteMany({
				where: { userId: userId },
			})
		}

		// Обновляем количество продаж товаров
		for (const item of cartItems) {
			await prisma.product.update({
				where: { id: item.productId },
				data: {
					stock: { decrement: item.quantity },
					reservedStock: { increment: item.quantity },
					soldCount: { increment: item.quantity },
				},
			})
		}

		return NextResponse.json(order)
	} catch (error: any) {
		console.error('Error creating order:', error)
		return NextResponse.json(
			{ error: 'Internal server error', message: error.message },
			{ status: 500 }
		)
	}
}


