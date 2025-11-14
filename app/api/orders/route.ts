import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth-options'
import prisma from '../../../lib/prisma'

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


