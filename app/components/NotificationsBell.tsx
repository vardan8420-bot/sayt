'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import Link from 'next/link'
import * as DropdownMenu from '@radix-ui/react-dropdown-menu'
import styles from './NotificationsBell.module.css'

type Notification = {
	id: string
	type: string
	title: string
	message: string
	link: string | null
	read: boolean
	createdAt: string
}

export function NotificationsBell() {
	const { data: session } = useSession()
	const [notifications, setNotifications] = useState<Notification[]>([])
	const [unreadCount, setUnreadCount] = useState(0)
	const [loading, setLoading] = useState(false)

	useEffect(() => {
		if (session) {
			loadNotifications()
			// Обновляем уведомления каждые 30 секунд
			const interval = setInterval(loadNotifications, 30000)
			return () => clearInterval(interval)
		}
	}, [session])

	const loadNotifications = async () => {
		if (!session) return

		try {
			const res = await fetch('/api/notifications?limit=10&unreadOnly=true')
			if (res.ok) {
				const data = await res.json()
				setNotifications(data.notifications || [])
				setUnreadCount(data.unreadCount || 0)
			}
		} catch (error) {
			console.error('Error loading notifications:', error)
		} finally {
			setLoading(false)
		}
	}

	const markAsRead = async (notificationId: string) => {
		try {
			const res = await fetch('/api/notifications', {
				method: 'PATCH',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ notificationIds: [notificationId] }),
			})

			if (res.ok) {
				setNotifications(
					notifications.map((n) => (n.id === notificationId ? { ...n, read: true } : n))
				)
				setUnreadCount(Math.max(0, unreadCount - 1))
			}
		} catch (error) {
			console.error('Error marking notification as read:', error)
		}
	}

	if (!session) {
		return null
	}

	return (
		<DropdownMenu.Root>
			<DropdownMenu.Trigger asChild>
				<button className={styles.trigger} aria-label="Notifications">
					<svg
						width="24"
						height="24"
						viewBox="0 0 24 24"
						fill="none"
						stroke="currentColor"
						strokeWidth="2"
						strokeLinecap="round"
						strokeLinejoin="round"
					>
						<path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path>
						<path d="M13.73 21a2 2 0 0 1-3.46 0"></path>
					</svg>
					{unreadCount > 0 && <span className={styles.badge}>{unreadCount}</span>}
				</button>
			</DropdownMenu.Trigger>

			<DropdownMenu.Portal>
				<DropdownMenu.Content className={styles.content} sideOffset={5}>
					<div className={styles.header}>
						<span className={styles.headerTitle}>Уведомления</span>
						{unreadCount > 0 && (
							<button
								className={styles.markAllButton}
								onClick={async () => {
									const res = await fetch('/api/notifications', {
										method: 'PATCH',
										headers: { 'Content-Type': 'application/json' },
										body: JSON.stringify({ markAllAsRead: true }),
									})
									if (res.ok) {
										await loadNotifications()
									}
								}}
							>
								Отметить все как прочитанные
							</button>
						)}
					</div>

					{loading ? (
						<div className={styles.empty}>Загрузка...</div>
					) : notifications.length === 0 ? (
						<div className={styles.empty}>Нет новых уведомлений</div>
					) : (
						<div className={styles.list}>
							{notifications.map((notification) => (
								<DropdownMenu.Item
									key={notification.id}
									className={`${styles.item} ${!notification.read ? styles.unread : ''}`}
									onClick={() => markAsRead(notification.id)}
								>
									{notification.link ? (
										<Link href={notification.link} className={styles.link}>
											<div className={styles.itemTitle}>{notification.title}</div>
											<div className={styles.itemMessage}>{notification.message}</div>
											<div className={styles.itemTime}>
												{new Date(notification.createdAt).toLocaleDateString('ru-RU')}
											</div>
										</Link>
									) : (
										<div>
											<div className={styles.itemTitle}>{notification.title}</div>
											<div className={styles.itemMessage}>{notification.message}</div>
											<div className={styles.itemTime}>
												{new Date(notification.createdAt).toLocaleDateString('ru-RU')}
											</div>
										</div>
									)}
								</DropdownMenu.Item>
							))}
						</div>
					)}

					<div className={styles.footer}>
						<Link href="/notifications" className={styles.viewAll}>
							Посмотреть все
						</Link>
					</div>
				</DropdownMenu.Content>
			</DropdownMenu.Portal>
		</DropdownMenu.Root>
	)
}

