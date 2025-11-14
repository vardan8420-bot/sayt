import { getServerSession } from 'next-auth'
import { redirect } from 'next/navigation'
import prisma from '@/lib/prisma'
import { authOptions } from '@/lib/auth-options'
import { AdminDashboard } from '@/app/components/admin/AdminDashboard'
import { AppProvider } from '@/app/context/AppContext'

const PAGE_LIMIT = 20

const baseSelect = {
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

export const dynamic = 'force-dynamic'

export default async function AdminPage() {
	const session = await getServerSession(authOptions)

	if (!session?.user) {
		redirect('/auth/signin?callbackUrl=/admin')
	}

	if (session.user.role !== 'ADMIN') {
		redirect('/')
	}

	const [users, totalUsers, sellers, verified, suspended] = await Promise.all([
		prisma.user.findMany({
			orderBy: { createdAt: 'desc' },
			take: PAGE_LIMIT,
			select: baseSelect,
		}),
		prisma.user.count(),
		prisma.user.count({ where: { isSeller: true, deletedAt: null } }),
		prisma.user.count({ where: { isVerified: true, deletedAt: null } }),
		prisma.user.count({ where: { deletedAt: { not: null } } }),
	])

	const serializedUsers = users.map((user) => ({
		...user,
		createdAt: user.createdAt.toISOString(),
		updatedAt: user.updatedAt.toISOString(),
		deletedAt: user.deletedAt ? user.deletedAt.toISOString() : null,
	}))

	return (
		<AppProvider>
			<main className="mx-auto w-full max-w-6xl p-6">
				<AdminDashboard
					initialUsers={serializedUsers}
					initialStats={{
						totalUsers,
						activeSellers: sellers,
						verifiedUsers: verified,
						suspendedUsers: suspended,
					}}
					initialPagination={{ page: 1, limit: PAGE_LIMIT, total: totalUsers }}
				/>
			</main>
		</AppProvider>
	)
}


