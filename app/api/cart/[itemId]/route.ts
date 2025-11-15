import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth-options'
import prisma from '../../../../lib/prisma'
import { enforceRateLimit } from '../../../../lib/rate-limit'
import { updateCartSchema } from '../../../../lib/schemas'

// PATCH - обновить количество товара в корзине
export async function PATCH(
	req: NextRequest,
	context: { params: Promise<{ itemId: string }> }
) {
	const { itemId } = await context.params
	try {
		const rate = await enforceRateLimit(req, { tag: 'cart:patch', limit: 30 })
		if (!rate.ok) {
			return NextResponse.json({ error: 'Too many requests' }, { status: 429, headers: rate.headers })
		}

		const session = await getServerSession(authOptions)
		if (!session?.user?.id) {
			return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
		}

		const body = await req.json()
		
		// Валидация с Zod
		const validation = updateCartSchema.safeParse(body)
		if (!validation.success) {
			return NextResponse.json(
				{ error: 'Invalid input', details: validation.error.errors },
				{ status: 400 }
			)
		}

		const { quantity } = validation.data

		// Проверяем, что товар в корзине принадлежит текущему пользователю
		const cartItem = await prisma.cartItem.findUnique({
			where: { id: itemId },
			include: {
				product: {
					select: {
						stock: true,
					},
				},
			},
		})

		if (!cartItem) {
			return NextResponse.json({ error: 'Cart item not found' }, { status: 404 })
		}

		if (cartItem.userId !== session.user.id) {
			return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
		}

		const qty = Math.min(quantity, cartItem.product.stock)

		const updated = await prisma.cartItem.update({
			where: { id: itemId },
			data: { quantity: qty },
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

		return NextResponse.json(updated, { headers: rate.headers })
	} catch (error: any) {
		console.error('Error updating cart item:', error)
		return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
	}
}

// DELETE - удалить товар из корзины
export async function DELETE(
	req: NextRequest,
	context: { params: Promise<{ itemId: string }> }
) {
	const { itemId } = await context.params
	try {
		const rate = await enforceRateLimit(req, { tag: 'cart:delete', limit: 30 })
		if (!rate.ok) {
			return NextResponse.json({ error: 'Too many requests' }, { status: 429, headers: rate.headers })
		}

		const session = await getServerSession(authOptions)
		if (!session?.user?.id) {
			return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
		}

		// Проверяем, что товар в корзине принадлежит текущему пользователю
		const cartItem = await prisma.cartItem.findUnique({
			where: { id: itemId },
			select: {
				userId: true,
			},
		})

		if (!cartItem) {
			return NextResponse.json({ error: 'Cart item not found' }, { status: 404 })
		}

		if (cartItem.userId !== session.user.id) {
			return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
		}

		await prisma.cartItem.delete({
			where: { id: itemId },
		})

		return NextResponse.json({ success: true }, { headers: rate.headers })
	} catch (error: any) {
		console.error('Error deleting cart item:', error)
		return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
	}
}

