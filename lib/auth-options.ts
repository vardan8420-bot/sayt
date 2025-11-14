import { PrismaAdapter } from '@next-auth/prisma-adapter'
import CredentialsProvider from 'next-auth/providers/credentials'
import GoogleProvider from 'next-auth/providers/google'
import GitHubProvider from 'next-auth/providers/github'
import type { NextAuthOptions } from 'next-auth'
import prisma from './prisma'
import bcrypt from 'bcryptjs'

export const authOptions: NextAuthOptions = {
	adapter: PrismaAdapter(prisma as any),
	providers: [
		CredentialsProvider({
			name: 'Credentials',
			credentials: {
				email: { label: 'Email', type: 'email' },
				password: { label: 'Password', type: 'password' },
			},
			async authorize(credentials) {
				if (!credentials?.email || !credentials?.password) {
					throw new Error('Invalid credentials')
				}

				const user = await prisma.user.findUnique({
					where: { email: credentials.email },
				})

				if (!user || !user.password) {
					throw new Error('Invalid credentials')
				}

				const isPasswordValid = await bcrypt.compare(credentials.password, user.password)
				if (!isPasswordValid) {
					throw new Error('Invalid credentials')
				}

				return {
					id: user.id,
					email: user.email,
					name: user.name,
					image: user.image,
					role: user.role,
				}
			},
		}),
		GoogleProvider({
			clientId: process.env.GOOGLE_CLIENT_ID || '',
			clientSecret: process.env.GOOGLE_CLIENT_SECRET || '',
		}),
		GitHubProvider({
			clientId: process.env.GITHUB_CLIENT_ID || '',
			clientSecret: process.env.GITHUB_CLIENT_SECRET || '',
		}),
	],
	session: {
		strategy: 'jwt',
	},
	pages: {
		signIn: '/auth/signin',
		signOut: '/auth/signout',
		error: '/auth/error',
	},
	callbacks: {
		async jwt({ token, user }) {
			if (user) {
				;(token as any).role = (user as any).role
				;(token as any).id = (user as any).id
			}
			return token
		},
		async session({ session, token }) {
			if (session.user) {
				;(session.user as any).id = (token as any).id as string
				;(session.user as any).role = (token as any).role as string
			}
			return session
		},
	},
	secret: process.env.NEXTAUTH_SECRET,
}


