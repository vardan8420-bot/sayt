import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth-options'
import prisma from '../../../../lib/prisma'
import { enforceRateLimit } from '../../../../lib/rate-limit'

// DELETE - удалить из избранного
export async function DELETE(
	req: NextRequest,
	context: { params: Promise<{ favoriteId: string }> }
) {
	const { favoriteId } = await context.params
	try {
		const rate = await enforceRateLimit(req, { tag: 'favorites:delete', limit: 30 })
		if (!rate.ok) {
			return NextResponse.json({ error: 'Too many requests' }, { status: 429, headers: rate.headers })
		}

		const session = await getServerSession(authOptions)
		if (!session?.user?.id) {
			return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
		}

		// Проверяем, что избранное принадлежит текущему пользователю
		const favorite = await prisma.favorite.findUnique({
			where: { id: favoriteId },
			select: { userId: true },
		})

		if (!favorite) {
			return NextResponse.json({ error: 'Favorite not found' }, { status: 404 })
		}

		if (favorite.userId !== session.user.id) {
			return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
		}

		await prisma.favorite.delete({
			where: { id: favoriteId },
		})

		return NextResponse.json({ success: true }, { headers: rate.headers })
	} catch (error: any) {
		console.error('Error deleting favorite:', error)
		return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
	}
}

