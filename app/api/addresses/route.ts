import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth-options'
import prisma from '../../../lib/prisma'
import { enforceRateLimit } from '../../../lib/rate-limit'

// GET - получить адреса пользователя
export async function GET(req: NextRequest) {
	try {
		const rate = await enforceRateLimit(req, { tag: 'addresses:get', limit: 60 })
		if (!rate.ok) {
			return NextResponse.json({ error: 'Too many requests' }, { status: 429, headers: rate.headers })
		}

		const session = await getServerSession(authOptions)
		if (!session?.user?.id) {
			return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
		}

		const addresses = await prisma.address.findMany({
			where: {
				userId: session.user.id,
				deletedAt: null,
			},
			orderBy: [
				{ isDefault: 'desc' },
				{ createdAt: 'desc' },
			],
		})

		return NextResponse.json({ addresses }, { headers: rate.headers })
	} catch (error: any) {
		console.error('Error fetching addresses:', error)
		return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
	}
}

