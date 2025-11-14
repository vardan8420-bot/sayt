'use client'

import { useMemo, useState, useTransition, FormEvent } from 'react'
import styles from './AdminDashboard.module.css'

type Role = 'USER' | 'SELLER' | 'ADMIN'
type RoleFilter = Role | 'ALL'

type AdminUser = {
	id: string
	name: string | null
	email: string
	role: Role
	isSeller: boolean
	isFreelancer: boolean
	isEmployer: boolean
	isVerified: boolean
	reputationScore: number
	createdAt: string
	updatedAt: string
	deletedAt: string | null
}

type AdminStats = {
	totalUsers: number
	activeSellers: number
	verifiedUsers: number
	suspendedUsers: number
}

type Pagination = {
	page: number
	limit: number
	total: number
}

type AdminDashboardProps = {
	initialUsers: AdminUser[]
	initialStats: AdminStats
	initialPagination: Pagination
}

const cx = (...classes: Array<string | false | undefined>) => classes.filter(Boolean).join(' ')

function StatCard({ label, value }: { label: string; value: number }) {
	return (
		<div className={styles.statCard}>
			<p className={styles.statLabel}>{label}</p>
			<p className={styles.statValue}>{value.toLocaleString('ru-RU')}</p>
		</div>
	)
}

export function AdminDashboard({ initialUsers, initialStats, initialPagination }: AdminDashboardProps) {
	const [users, setUsers] = useState<AdminUser[]>(initialUsers)
	const [stats, setStats] = useState<AdminStats>(initialStats)
	const [pagination, setPagination] = useState<Pagination>(initialPagination)
	const [filters, setFilters] = useState<{ q: string; role: RoleFilter }>({ q: '', role: 'ALL' })
	const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)
	const [isPending, startTransition] = useTransition()
	const [updatingId, setUpdatingId] = useState<string | null>(null)

	const totalPages = useMemo(() => Math.max(1, Math.ceil(pagination.total / pagination.limit)), [pagination])

	async function loadUsers(page = pagination.page, nextFilters = filters) {
		startTransition(async () => {
			try {
				const params = new URLSearchParams({
					page: page.toString(),
					limit: pagination.limit.toString(),
				})
				if (nextFilters.q) params.set('q', nextFilters.q)
				if (nextFilters.role !== 'ALL') params.set('role', nextFilters.role)

				const res = await fetch(`/api/admin/users?${params.toString()}`, {
					credentials: 'include',
					cache: 'no-store',
				})
				if (!res.ok) {
					throw new Error('Не удалось получить список пользователей')
				}
				const data = await res.json()

				setUsers(data.users)
				setStats(data.stats)
				setPagination(data.pagination)
			} catch (error: any) {
				setMessage({ type: 'error', text: error?.message || 'Ошибка запроса' })
			}
		})
	}

	async function handleUpdate(userId: string, payload: Record<string, unknown>) {
		setUpdatingId(userId)
		setMessage(null)
		try {
			const res = await fetch(`/api/admin/users/${userId}`, {
				method: 'PATCH',
				headers: { 'Content-Type': 'application/json' },
				credentials: 'include',
				body: JSON.stringify(payload),
			})
			const data = await res.json()
			if (!res.ok) {
				throw new Error(data.error || 'Не удалось обновить пользователя')
			}

			setUsers((prev) => prev.map((user) => (user.id === userId ? data.user : user)))
			setMessage({ type: 'success', text: 'Данные пользователя обновлены' })
		} catch (error: any) {
			setMessage({ type: 'error', text: error?.message || 'Не удалось выполнить действие' })
		} finally {
			setUpdatingId(null)
		}
	}

	function handleSearchSubmit(event: FormEvent<HTMLFormElement>) {
		event.preventDefault()
		loadUsers(1)
	}

	function handleRoleFilterChange(value: RoleFilter) {
		const nextFilters = { ...filters, role: value }
		setFilters(nextFilters)
		loadUsers(1, nextFilters)
	}

	const isBusy = isPending || updatingId !== null

	return (
		<section className={styles.section}>
			<div className={styles.header}>
				<h1 className={styles.title}>Админ-панель</h1>
				<p className={styles.subtitle}>Управляйте пользователями, ролями и статусами безопасности платформы.</p>
			</div>

			<div className={styles.statsGrid}>
				<StatCard label="Всего пользователей" value={stats.totalUsers} />
				<StatCard label="Активные продавцы" value={stats.activeSellers} />
				<StatCard label="Верифицированные" value={stats.verifiedUsers} />
				<StatCard label="Заблокированы" value={stats.suspendedUsers} />
			</div>

			<form onSubmit={handleSearchSubmit} className={styles.searchForm}>
				<input
					type="search"
					name="q"
					value={filters.q}
					onChange={(e) => setFilters((prev) => ({ ...prev, q: e.target.value }))}
					placeholder="Поиск по имени или email"
					className={styles.input}
				/>
				<select
					value={filters.role}
					onChange={(e) => handleRoleFilterChange(e.target.value as RoleFilter)}
					className={styles.select}
				>
					<option value="ALL">Все роли</option>
					<option value="USER">Покупатели</option>
					<option value="SELLER">Продавцы</option>
					<option value="ADMIN">Админы</option>
				</select>
				<button type="submit" disabled={isBusy} className={styles.searchButton}>
					Поиск
				</button>
			</form>

			{message && (
				<div className={cx(styles.message, message.type === 'success' ? styles.messageSuccess : styles.messageError)}>
					{message.text}
				</div>
			)}

			<div className={styles.tableWrapper}>
				<table className={styles.table}>
					<thead className={styles.thead}>
						<tr>
							<th className={styles.th}>Пользователь</th>
							<th className={styles.th}>Роль</th>
							<th className={styles.th}>Флаги</th>
							<th className={styles.th}>Статус</th>
							<th className={styles.th}>Действия</th>
						</tr>
					</thead>
					<tbody>
						{users.map((user) => {
							const created = new Date(user.createdAt).toLocaleDateString('ru-RU')
							const suspended = Boolean(user.deletedAt)

							return (
								<tr key={user.id} className={suspended ? styles.rowSuspended : undefined}>
									<td className={styles.td}>
										<div className={styles.userCell}>
											<span className={styles.userName}>{user.name || 'Без имени'}</span>
											<span className={styles.userEmail}>{user.email}</span>
											<span className={styles.userMeta}>с {created}</span>
										</div>
									</td>
									<td className={styles.td}>
										<select
											disabled={isBusy}
											value={user.role}
											onChange={(e) => handleUpdate(user.id, { role: e.target.value })}
											className={styles.selectRole}
										>
											<option value="USER">USER</option>
											<option value="SELLER">SELLER</option>
											<option value="ADMIN">ADMIN</option>
										</select>
									</td>
									<td className={styles.td}>
										<div className={styles.flagGroup}>
											<button
												type="button"
												disabled={isBusy}
												onClick={() => handleUpdate(user.id, { isSeller: !user.isSeller })}
												className={cx(styles.flagButton, user.isSeller && styles.flagActiveGreen)}
											>
												Продавец
											</button>
											<button
												type="button"
												disabled={isBusy}
												onClick={() => handleUpdate(user.id, { isVerified: !user.isVerified })}
												className={cx(styles.flagButton, user.isVerified && styles.flagActiveBlue)}
											>
												Вериф.
											</button>
											<button
												type="button"
												disabled={isBusy}
												onClick={() => handleUpdate(user.id, { isFreelancer: !user.isFreelancer })}
												className={cx(styles.flagButton, user.isFreelancer && styles.flagActivePurple)}
											>
												Фриланс
											</button>
											<button
												type="button"
												disabled={isBusy}
												onClick={() => handleUpdate(user.id, { isEmployer: !user.isEmployer })}
												className={cx(styles.flagButton, user.isEmployer && styles.flagActiveAmber)}
											>
												Работодатель
											</button>
										</div>
									</td>
									<td className={styles.td}>
										<div className={styles.userCell}>
											<span className={suspended ? styles.statusSuspended : styles.statusActive}>
												{suspended ? 'Заблокирован' : 'Активен'}
											</span>
											<span className={styles.statusMeta}>Рейтинг: {user.reputationScore.toFixed(1)}</span>
										</div>
									</td>
									<td className={styles.td}>
										<button
											type="button"
											disabled={isBusy}
											onClick={() => handleUpdate(user.id, { suspend: !suspended })}
											className={cx(styles.actionButton, suspended ? styles.actionUnban : styles.actionBan)}
										>
											{suspended ? 'Разблокировать' : 'Заблокировать'}
										</button>
									</td>
								</tr>
							)
						})}
					</tbody>
				</table>
			</div>

			<div className={styles.pagination}>
				<p className={styles.paginationInfo}>
					Стр. {pagination.page} из {totalPages} • Всего {pagination.total} записей
				</p>
				<div className={styles.paginationButtons}>
					<button
						type="button"
						disabled={pagination.page === 1 || isBusy}
						onClick={() => loadUsers(pagination.page - 1)}
						className={styles.paginationButton}
					>
						← Назад
					</button>
					<button
						type="button"
						disabled={pagination.page >= totalPages || isBusy}
						onClick={() => loadUsers(pagination.page + 1)}
						className={styles.paginationButton}
					>
						Вперёд →
					</button>
				</div>
			</div>
		</section>
	)
}



