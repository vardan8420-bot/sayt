import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth-options'
import prisma from '../../../lib/prisma'
import { enforceRateLimit } from '../../../lib/rate-limit'
import { updateNotificationsSchema } from '../../../lib/schemas'

// GET - получить уведомления пользователя
export async function GET(req: NextRequest) {
	try {
		const rate = await enforceRateLimit(req, { tag: 'notifications:get', limit: 60 })
		if (!rate.ok) {
			return NextResponse.json({ error: 'Too many requests' }, { status: 429, headers: rate.headers })
		}

		const session = await getServerSession(authOptions)
		if (!session?.user?.id) {
			return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
		}

		const { searchParams } = new URL(req.url)
		const limit = parseInt(searchParams.get('limit') || '20')
		const page = parseInt(searchParams.get('page') || '1')
		const unreadOnly = searchParams.get('unreadOnly') === 'true'

		const where: any = {
			userId: session.user.id,
		}

		if (unreadOnly) {
			where.read = false
		}

		const notifications = await prisma.notification.findMany({
			where,
			orderBy: { createdAt: 'desc' },
			skip: (page - 1) * limit,
			take: limit,
		})

		const total = await prisma.notification.count({ where })
		const unreadCount = await prisma.notification.count({
			where: {
				userId: session.user.id,
				read: false,
			},
		})

		return NextResponse.json(
			{
				notifications,
				total,
				unreadCount,
				page,
				limit,
			},
			{ headers: rate.headers }
		)
	} catch (error: any) {
		console.error('Error fetching notifications:', error)
		return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
	}
}

// PATCH - отметить уведомления как прочитанные
export async function PATCH(req: NextRequest) {
	try {
		const rate = await enforceRateLimit(req, { tag: 'notifications:patch', limit: 30 })
		if (!rate.ok) {
			return NextResponse.json({ error: 'Too many requests' }, { status: 429, headers: rate.headers })
		}

		const session = await getServerSession(authOptions)
		if (!session?.user?.id) {
			return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
		}

		const body = await req.json()
		
		// Валидация с Zod
		const validation = updateNotificationsSchema.safeParse(body)
		if (!validation.success) {
			return NextResponse.json(
				{ error: 'Invalid input', details: validation.error.errors },
				{ status: 400 }
			)
		}

		const { notificationIds, markAllAsRead } = validation.data

		if (markAllAsRead) {
			// Отмечаем все уведомления как прочитанные
			await prisma.notification.updateMany({
				where: {
					userId: session.user.id,
					read: false,
				},
				data: {
					read: true,
				},
			})
		} else if (notificationIds && Array.isArray(notificationIds)) {
			// Отмечаем выбранные уведомления как прочитанные
			await prisma.notification.updateMany({
				where: {
					id: { in: notificationIds },
					userId: session.user.id,
				},
				data: {
					read: true,
				},
			})
		}

		return NextResponse.json({ success: true }, { headers: rate.headers })
	} catch (error: any) {
		console.error('Error updating notifications:', error)
		return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
	}
}

