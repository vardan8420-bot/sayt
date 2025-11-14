import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import prisma from '@/lib/prisma'
import { authOptions } from '@/lib/auth-options'
import { enforceRateLimit } from '@/lib/rate-limit'
import { captureError } from '@/lib/monitoring'
import { logEvent } from '@/lib/logger'

const userSelect = {
	id: true,
	name: true,
	email: true,
	role: true,
	isSeller: true,
	isFreelancer: true,
	isEmployer: true,
	isVerified: true,
	reputationScore: true,
	createdAt: true,
	updatedAt: true,
	deletedAt: true,
}

async function requireAdmin() {
	const session = await getServerSession(authOptions)
	if (!session?.user) {
		return { status: 401, error: 'Unauthorized' as const }
	}
	if (session.user.role !== 'ADMIN') {
		return { status: 403, error: 'Forbidden' as const }
	}
	return { status: 200, user: session.user }
}

export async function GET(req: NextRequest) {
	const rate = await enforceRateLimit(req, { tag: 'admin-users:get', limit: 120, windowSeconds: 60 })
	if (!rate.ok) {
		return NextResponse.json({ error: 'Too many requests' }, { status: 429, headers: rate.headers })
	}

	const adminResult = await requireAdmin()
	if (!('user' in adminResult)) {
		return NextResponse.json({ error: adminResult.error }, { status: adminResult.status, headers: rate.headers })
	}
	const adminUser = adminResult.user
	if (!adminUser) {
		return NextResponse.json({ error: 'Unauthorized' }, { status: 401, headers: rate.headers })
	}

	try {
		const { searchParams } = new URL(req.url)
		const page = Math.max(parseInt(searchParams.get('page') || '1', 10), 1)
		const limit = Math.min(Math.max(parseInt(searchParams.get('limit') || '20', 10), 1), 100)
		const role = searchParams.get('role')
		const q = searchParams.get('q')?.trim()

		const where: any = {}

		if (role && ['USER', 'SELLER', 'ADMIN'].includes(role)) {
			where.role = role
		}

		if (q) {
			where.OR = [
				{ email: { contains: q, mode: 'insensitive' } },
				{ name: { contains: q, mode: 'insensitive' } },
				{ phone: { contains: q, mode: 'insensitive' } },
			]
		}

		const skip = (page - 1) * limit

		const [users, total, totals, sellers, verified, suspended] = await Promise.all([
			prisma.user.findMany({
				where,
				orderBy: { createdAt: 'desc' },
				skip,
				take: limit,
				select: userSelect,
			}),
			prisma.user.count({ where }),
			prisma.user.count(),
			prisma.user.count({ where: { isSeller: true, deletedAt: null } }),
			prisma.user.count({ where: { isVerified: true, deletedAt: null } }),
			prisma.user.count({ where: { deletedAt: { not: null } } }),
		])

		await logEvent('info', 'admin.users.list', {
			adminId: adminUser.id,
			total,
			filters: { role, q },
		})

		return NextResponse.json(
			{
				users,
				pagination: {
					page,
					limit,
					total,
				},
				stats: {
					totalUsers: totals,
					activeSellers: sellers,
					verifiedUsers: verified,
					suspendedUsers: suspended,
				},
			},
			{ headers: rate.headers },
		)
	} catch (error: any) {
		captureError(error, { route: '/api/admin/users', method: 'GET' })
		await logEvent('error', 'admin.users.list.failed', { error: error?.message })
		return NextResponse.json({ error: 'Internal server error' }, { status: 500, headers: rate.headers })
	}
}


