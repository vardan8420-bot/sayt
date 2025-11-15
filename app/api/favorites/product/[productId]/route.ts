import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth-options'
import prisma from '../../../../../lib/prisma'
import { enforceRateLimit } from '../../../../../lib/rate-limit'

// DELETE - удалить товар из избранного по productId
export async function DELETE(
	req: NextRequest,
	context: { params: Promise<{ productId: string }> }
) {
	const { productId } = await context.params
	try {
		const rate = await enforceRateLimit(req, { tag: 'favorites:delete', limit: 30 })
		if (!rate.ok) {
			return NextResponse.json({ error: 'Too many requests' }, { status: 429, headers: rate.headers })
		}

		const session = await getServerSession(authOptions)
		if (!session?.user?.id) {
			return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
		}

		// Удаляем избранное по userId и productId
		const favorite = await prisma.favorite.findUnique({
			where: {
				userId_productId: {
					userId: session.user.id,
					productId: productId,
				},
			},
		})

		if (!favorite) {
			return NextResponse.json({ error: 'Favorite not found' }, { status: 404 })
		}

		await prisma.favorite.delete({
			where: { id: favorite.id },
		})

		return NextResponse.json({ success: true }, { headers: rate.headers })
	} catch (error: any) {
		console.error('Error deleting favorite:', error)
		return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
	}
}

