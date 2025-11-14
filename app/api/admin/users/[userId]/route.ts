import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { Prisma } from '@prisma/client'
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

export async function PATCH(
	req: NextRequest,
	context: { params: Promise<{ userId: string }> }
) {
	const rate = await enforceRateLimit(req, { tag: 'admin-users:patch', limit: 60, windowSeconds: 60 })
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

	const { userId } = await context.params
	if (!userId) {
		return NextResponse.json({ error: 'Missing userId' }, { status: 400, headers: rate.headers })
	}

	try {
		const body = await req.json()

		const target = await prisma.user.findUnique({
			where: { id: userId },
			select: { id: true, role: true },
		})

		if (!target) {
			return NextResponse.json({ error: 'User not found' }, { status: 404, headers: rate.headers })
		}

		const data: Prisma.UserUpdateInput = {}
		const validRoles = ['USER', 'SELLER', 'ADMIN']

		if (body.role && validRoles.includes(body.role) && body.role !== target.role) {
			if (target.role === 'ADMIN' && body.role !== 'ADMIN') {
				const otherAdmins = await prisma.user.count({
					where: { role: 'ADMIN', id: { not: userId }, deletedAt: null },
				})
				if (otherAdmins === 0) {
					return NextResponse.json(
						{ error: 'Нельзя понизить последнего администратора' },
						{ status: 400, headers: rate.headers },
					)
				}
			}

			if (userId === adminUser.id && body.role !== 'ADMIN') {
				return NextResponse.json(
					{ error: 'Вы не можете изменить собственную роль' },
					{ status: 400, headers: rate.headers },
				)
			}

			data.role = body.role
		}

		if (typeof body.isSeller === 'boolean') {
			data.isSeller = body.isSeller
		}

		if (typeof body.isFreelancer === 'boolean') {
			data.isFreelancer = body.isFreelancer
		}

		if (typeof body.isEmployer === 'boolean') {
			data.isEmployer = body.isEmployer
		}

		if (typeof body.isVerified === 'boolean') {
			data.isVerified = body.isVerified
			data.verifiedAt = body.isVerified ? new Date() : null
		}

		if (typeof body.suspend === 'boolean') {
			if (userId === adminUser.id && body.suspend) {
				return NextResponse.json(
					{ error: 'Вы не можете заблокировать себя' },
					{ status: 400, headers: rate.headers },
				)
			}
			data.deletedAt = body.suspend ? new Date() : null
		}

		if (Object.keys(data).length === 0) {
			return NextResponse.json({ error: 'Нет изменений' }, { status: 400, headers: rate.headers })
		}

		const updated = await prisma.user.update({
			where: { id: userId },
			data,
			select: userSelect,
		})

		await logEvent('info', 'admin.user.updated', {
			adminId: adminUser.id,
			targetUserId: userId,
			changes: Object.keys(data),
		})

		return NextResponse.json({ user: updated }, { headers: rate.headers })
	} catch (error: any) {
		captureError(error, { route: '/api/admin/users/[userId]', method: 'PATCH' })
		await logEvent('error', 'admin.user.update.failed', { error: error?.message, userId })
		return NextResponse.json({ error: 'Internal server error' }, { status: 500, headers: rate.headers })
	}
}


