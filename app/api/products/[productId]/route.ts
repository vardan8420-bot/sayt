import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth-options'
import prisma from '../../../../lib/prisma'
import { Prisma } from '@prisma/client'
import { revalidateTag } from 'next/cache'
import { enforceRateLimit } from '../../../../lib/rate-limit'
import { captureError } from '../../../../lib/monitoring'
import { logEvent } from '../../../../lib/logger'

// GET - получить один товар
export async function GET(
	req: NextRequest,
	context: { params: Promise<{ productId: string }> }
) {
	const { productId } = await context.params
	try {
		const rate = await enforceRateLimit(req, { tag: 'products:get', limit: 60 })
		if (!rate.ok) {
			return NextResponse.json({ error: 'Too many requests' }, { status: 429, headers: rate.headers })
		}

		const product = await prisma.product.findUnique({
			where: { id: productId },
			select: {
				id: true,
				title: true,
				description: true,
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
				category: {
					select: {
						id: true,
						name: true,
						slug: true,
					},
				},
			},
		})

		if (!product) {
			return NextResponse.json({ error: 'Product not found' }, { status: 404 })
		}

		return NextResponse.json(product, { headers: rate.headers })
	} catch (error: any) {
		console.error('Error fetching product:', error)
		return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
	}
}

export async function PATCH(
	req: NextRequest,
	context: { params: Promise<{ productId: string }> }
) {
	const { productId } = await context.params
	try {
		const rate = await enforceRateLimit(req, { tag: 'products:patch', limit: 30 })
		if (!rate.ok) {
			return NextResponse.json({ error: 'Too many requests' }, { status: 429, headers: rate.headers })
		}

		const session = await getServerSession(authOptions)
		if (!session?.user?.id) {
			return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
		}

		const body = await req.json()
		const allowed: Record<string, unknown> = {}

		if (typeof body.title === 'string' && body.title.trim().length > 0) {
			allowed.title = body.title.trim()
		}
		if (typeof body.published === 'boolean') {
			allowed.published = body.published
		}
		if (typeof body.stock === 'number' && Number.isFinite(body.stock) && body.stock >= 0) {
			allowed.stock = Math.floor(body.stock)
		}
		if (typeof body.price === 'number' && Number.isFinite(body.price) && body.price >= 0) {
			allowed.price = new Prisma.Decimal(body.price)
		}

		// Убедимся, что товар принадлежит текущему пользователю
		const product = await prisma.product.findUnique({
			where: { id: productId },
			select: { id: true, sellerId: true },
		})
		if (!product) {
			return NextResponse.json({ error: 'Product not found' }, { status: 404 })
		}
		if (product.sellerId !== session.user.id) {
			return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
		}

		const updated = await prisma.product.update({
			where: { id: productId },
			data: allowed,
			select: {
				id: true,
				title: true,
				price: true,
				published: true,
				stock: true,
				slug: true,
			},
		})

		await revalidateTag('products', 'default')
		await logEvent('info', 'product.updated', { productId, sellerId: session.user.id })
		return NextResponse.json(updated, { headers: rate.headers })
	} catch (error: any) {
		captureError(error, { route: '/api/products/[id]', method: 'PATCH' })
		await logEvent('error', 'product.update.failed', { productId, error: error?.message })
		console.error('Error updating product:', error)
		return NextResponse.json(
			{ error: 'Internal server error', message: error.message },
			{ status: 500 }
		)
	}
}

export async function DELETE(
	req: NextRequest,
	context: { params: Promise<{ productId: string }> }
) {
	const { productId } = await context.params
	try {
		const rate = await enforceRateLimit(req, { tag: 'products:delete', limit: 20 })
		if (!rate.ok) {
			return NextResponse.json({ error: 'Too many requests' }, { status: 429, headers: rate.headers })
		}

		const session = await getServerSession(authOptions)
		if (!session?.user?.id) {
			return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
		}


		// Проверка владельца
		const product = await prisma.product.findUnique({
			where: { id: productId },
			select: { id: true, sellerId: true },
		})
		if (!product) {
			return NextResponse.json({ error: 'Product not found' }, { status: 404 })
		}
		if (product.sellerId !== session.user.id) {
			return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
		}

		await prisma.product.delete({ where: { id: productId } })
		await revalidateTag('products', 'default')
		await logEvent('info', 'product.deleted', { productId, sellerId: session.user.id })
		return NextResponse.json({ success: true }, { headers: rate.headers })
	} catch (error: any) {
		captureError(error, { route: '/api/products/[id]', method: 'DELETE' })
		await logEvent('error', 'product.delete.failed', { productId, error: error?.message })
		console.error('Error deleting product:', error)
		return NextResponse.json(
			{ error: 'Internal server error', message: error.message },
			{ status: 500 }
		)
	}
}


