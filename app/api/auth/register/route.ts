import { NextRequest, NextResponse } from 'next/server'
import prisma from '../../../../lib/prisma'
import bcrypt from 'bcryptjs'
import { enforceRateLimit } from '../../../../lib/rate-limit'
import { captureError } from '../../../../lib/monitoring'
import { logEvent } from '../../../../lib/logger'

export async function POST(req: NextRequest) {
	try {
		const rate = await enforceRateLimit(req, { tag: 'auth:register', limit: 10 })
		if (!rate.ok) {
			return NextResponse.json({ error: 'Слишком много запросов' }, { status: 429, headers: rate.headers })
		}
		const { email, password, name } = await req.json()
		if (!email || !password || typeof email !== 'string' || typeof password !== 'string') {
			return NextResponse.json({ error: 'Некорректные данные' }, { status: 400 })
		}
		const existing = await prisma.user.findUnique({ where: { email } })
		if (existing) {
			return NextResponse.json({ error: 'Email уже зарегистрирован' }, { status: 409 })
		}
		const hash = await bcrypt.hash(password, 10)
		await prisma.user.create({
			data: {
				email,
				name: typeof name === 'string' && name.trim() ? name.trim() : null,
				password: hash,
			},
		})
		await logEvent('info', 'auth.register', { email })
		return NextResponse.json({ success: true }, { headers: rate.headers })
	} catch (error: any) {
		captureError(error, { route: '/api/auth/register', method: 'POST' })
		await logEvent('error', 'auth.register.failed', { error: error?.message })
		return NextResponse.json({ error: 'Внутренняя ошибка', message: error.message }, { status: 500 })
	}
}


