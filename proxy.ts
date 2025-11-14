import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { getToken } from 'next-auth/jwt'

const protectedPrefixes = ['/dashboard', '/admin']

export async function proxy(req: NextRequest) {
	const { pathname } = req.nextUrl
	const isProtected = protectedPrefixes.some((prefix) => pathname.startsWith(prefix))

	if (!isProtected) {
		return NextResponse.next()
	}

	const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET })
	const userRole = (token as any)?.role as string | undefined

	if (!token) {
		const url = req.nextUrl.clone()
		url.pathname = '/auth/signin'
		url.searchParams.set('callbackUrl', pathname)
		return NextResponse.redirect(url)
	}

	if (pathname.startsWith('/admin') && userRole !== 'ADMIN') {
		const url = req.nextUrl.clone()
		url.pathname = '/'
		url.searchParams.delete('callbackUrl')
		return NextResponse.redirect(url)
	}

	return NextResponse.next()
}

export const config = {
	matcher: ['/dashboard/:path*', '/admin/:path*'],
}

