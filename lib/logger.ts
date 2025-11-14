const LOGTAIL_ENDPOINT = process.env.LOGTAIL_SOURCE_TOKEN
	? 'https://in.logtail.com/'
	: null

type Level = 'info' | 'warn' | 'error'

function baseEntry(level: Level, message: string, context?: Record<string, unknown>) {
	return {
		timestamp: new Date().toISOString(),
		level,
		message,
		context: context ?? {},
	}
}

async function sendToLogtail(entry: ReturnType<typeof baseEntry>) {
	if (!LOGTAIL_ENDPOINT || !process.env.LOGTAIL_SOURCE_TOKEN) return
	try {
		await fetch(LOGTAIL_ENDPOINT, {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
				Authorization: `Bearer ${process.env.LOGTAIL_SOURCE_TOKEN}`,
			},
			body: JSON.stringify(entry),
			keepalive: true,
		})
	} catch (error) {
		console.error('[logger] Failed to send logtail entry', error)
	}
}

export async function logEvent(level: Level, message: string, context?: Record<string, unknown>) {
	const entry = baseEntry(level, message, context)
	if (level === 'error') {
		console.error('[log]', entry)
	} else if (level === 'warn') {
		console.warn('[log]', entry)
	} else {
		console.info('[log]', entry)
	}
	await sendToLogtail(entry)
}


