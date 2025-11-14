import { NextRequest } from 'next/server'
import { Ratelimit } from '@upstash/ratelimit'
import { Redis } from '@upstash/redis'

type RateLimitHeaders = {
	'RateLimit-Limit': string
	'RateLimit-Remaining': string
	'RateLimit-Reset': string
}

const upstashConfigured = Boolean(process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN)

const upstashLimiter = upstashConfigured
	? new Ratelimit({
			redis: Redis.fromEnv(),
			limiter: Ratelimit.slidingWindow(60, '1 m'),
	  })
	: null

const memoryBucket = new Map<string, { remaining: number; resetAt: number }>()

const defaultHeaders: RateLimitHeaders = {
	'RateLimit-Limit': '60',
	'RateLimit-Remaining': '59',
	'RateLimit-Reset': Math.ceil(Date.now() / 1000 + 60).toString(),
}

function getClientId(req: NextRequest) {
	const forwarded = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim()
	const realIp = req.headers.get('x-real-ip')?.trim()
	const cfIp = req.headers.get('cf-connecting-ip')?.trim()
	return forwarded || realIp || cfIp || 'anonymous'
}

export async function enforceRateLimit(
	req: NextRequest,
	{
		limit = 60,
		windowSeconds = 60,
		tag = 'default',
	}: { limit?: number; windowSeconds?: number; tag?: string } = {}
) {
	const identifier = `${tag}:${getClientId(req)}`

	if (upstashLimiter) {
		const result = await upstashLimiter.limit(identifier)
		const headers: RateLimitHeaders = {
			'RateLimit-Limit': result.limit.toString(),
			'RateLimit-Remaining': result.remaining.toString(),
			'RateLimit-Reset': result.reset.toString(),
		}
		return { ok: result.success, headers }
	}

	const now = Date.now()
	const bucket = memoryBucket.get(identifier) || { remaining: limit, resetAt: now + windowSeconds * 1000 }

	if (bucket.resetAt < now) {
		bucket.remaining = limit
		bucket.resetAt = now + windowSeconds * 1000
	}

	if (bucket.remaining <= 0) {
		const headers: RateLimitHeaders = {
			'RateLimit-Limit': limit.toString(),
			'RateLimit-Remaining': '0',
			'RateLimit-Reset': Math.ceil(bucket.resetAt / 1000).toString(),
		}
		return { ok: false, headers }
	}

	bucket.remaining -= 1
	memoryBucket.set(identifier, bucket)

	const headers: RateLimitHeaders = {
		'RateLimit-Limit': limit.toString(),
		'RateLimit-Remaining': bucket.remaining.toString(),
		'RateLimit-Reset': Math.ceil(bucket.resetAt / 1000).toString(),
	}

	return { ok: true, headers }
}


