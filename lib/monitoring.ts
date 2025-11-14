let sentry: typeof import('@sentry/node') | null = null

if (process.env.SENTRY_DSN) {
	const Sentry = require('@sentry/node') as typeof import('@sentry/node')
	Sentry.init({
		dsn: process.env.SENTRY_DSN,
		tracesSampleRate: Number(process.env.SENTRY_TRACES_SAMPLE_RATE || 0.1),
		environment: process.env.NODE_ENV || 'development',
	})
	sentry = Sentry
}

export function captureError(error: unknown, context?: Record<string, unknown>) {
	if (sentry) {
		sentry.captureException(error, { extra: context })
	} else {
		console.error('[monitoring]', context, error)
	}
}


