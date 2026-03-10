import React, { createContext, useContext, useState, useCallback, useEffect, useRef } from 'react';
import toast from 'react-hot-toast';
import { io } from 'socket.io-client';

export const NotificationContext = createContext();

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:5000';

export const NotificationProvider = ({ children }) => {
	const [notifications, setNotifications] = useState([]);
	const [loading, setLoading] = useState(false);
	const socketRef = useRef(null);
	const tokenRef = useRef(null);

	// Get token from localStorage (AuthContext stores it there)
	const getToken = useCallback(() => {
		try {
			return localStorage.getItem('token') || null;
		} catch {
			return null;
		}
	}, []);

	// Fetch notifications from backend API
	const fetchNotifications = useCallback(async () => {
		const token = getToken();
		if (!token) return;

		setLoading(true);
		try {
			const res = await fetch(`${API_BASE}/notifications`, {
				headers: { Authorization: `Bearer ${token}` },
			});
			const d = await res.json();
			if (d.success) {
				setNotifications(d.data?.notifications || d.data || []);
			}
		} catch {
			// silent — graceful degradation
		} finally {
			setLoading(false);
		}
	}, [getToken]);

	// Show Airbnb-style toast for a notification
	const showToast = useCallback((notif) => {
		const iconMap = { booking: '📅', payment: '💳', review: '⭐', message: '💬', system: '🔔' };
		const icon = iconMap[notif.type] || '🔔';

		toast.custom(
			(t) => (
				<div
					className={`${t.visible ? 'animate-enter' : 'animate-leave'} max-w-sm w-full bg-white shadow-2xl rounded-2xl pointer-events-auto border border-gray-100 overflow-hidden`}
					style={{ fontFamily: "'DM Sans', system-ui, sans-serif" }}
				>
					<div className="p-4">
						<div className="flex items-start gap-3">
							<span className="text-2xl flex-shrink-0">{icon}</span>
							<div className="flex-1 min-w-0">
								<p className="text-sm font-semibold text-gray-900">{notif.title}</p>
								{notif.message && (
									<p className="text-xs text-gray-500 mt-0.5 line-clamp-2">{notif.message}</p>
								)}
								{notif.body && (
									<p className="text-xs text-gray-400 mt-1">{notif.body}</p>
								)}
							</div>
							<button
								onClick={() => toast.dismiss(t.id)}
								className="flex-shrink-0 text-gray-400 hover:text-gray-600 transition-colors"
							>
								<svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
									<path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
								</svg>
							</button>
						</div>
					</div>
					{/* Progress bar */}
					<div className="h-1 bg-gray-100">
						<div
							className="h-full bg-gradient-to-r from-rose-500 to-pink-500 rounded-full"
							style={{ animation: 'shrink 4s linear forwards' }}
						/>
					</div>
				</div>
			),
			{ duration: 4000, position: 'top-right' }
		);
	}, []);

	// Connect Socket.IO for real-time notifications
	useEffect(() => {
		const token = getToken();
		if (!token) return;
		tokenRef.current = token;

		const socket = io(SOCKET_URL, {
			auth: { token },
			transports: ['websocket', 'polling'],
			reconnection: true,
			reconnectionAttempts: 10,
			reconnectionDelay: 1000,
		});

		socket.on('notification', (notif) => {
			setNotifications((prev) => [notif, ...prev]);
			showToast(notif);
		});

		socketRef.current = socket;

		return () => {
			socket.disconnect();
			socketRef.current = null;
		};
	}, [getToken, showToast]);

	// Fetch notifications on mount
	useEffect(() => {
		fetchNotifications();
	}, [fetchNotifications]);

	// Notify booking confirmed — store in DB (already done by backend), refresh list, show toast
	const notifyBookingConfirmed = useCallback((booking, listingTitle, city) => {
		const checkIn = booking.checkInDate || booking.checkIn;
		const checkOut = booking.checkOutDate || booking.checkOut;
		const ref = booking.bookingReference || (booking._id || '').slice(-8).toUpperCase();
		const nights = booking.pricing?.nights ||
			(checkIn && checkOut
				? Math.ceil((new Date(checkOut) - new Date(checkIn)) / 86400000)
				: 1);
		const fmt = (d) =>
			d ? new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : '—';

		const notif = {
			type: 'booking',
			title: 'Booking Confirmed! 🎉',
			message: `Your trip to ${city || listingTitle || 'your destination'} is confirmed.`,
			body: `${listingTitle ? listingTitle + ' · ' : ''}${fmt(checkIn)} → ${fmt(checkOut)} · ${nights} night${nights !== 1 ? 's' : ''} · Ref #${ref}`,
		};

		showToast(notif);

		// Refresh from DB so the bell + notifications page are in sync
		fetchNotifications();
	}, [showToast, fetchNotifications]);

	// Mark as read (API + local state)
	const markAsRead = useCallback(async (notificationId) => {
		const token = getToken();
		setNotifications((prev) =>
			prev.map((n) => (n._id === notificationId || n.id === notificationId) ? { ...n, isRead: true, read: true } : n)
		);
		if (token) {
			try {
				await fetch(`${API_BASE}/notifications/${notificationId}/read`, {
					method: 'PUT',
					headers: { Authorization: `Bearer ${token}` },
				});
			} catch { /* silent */ }
		}
	}, [getToken]);

	// Mark all as read (API + local state)
	const markAllAsRead = useCallback(async () => {
		const token = getToken();
		setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true, read: true })));
		if (token) {
			try {
				await fetch(`${API_BASE}/notifications/read-all`, {
					method: 'PUT',
					headers: { Authorization: `Bearer ${token}` },
				});
			} catch { /* silent */ }
		}
	}, [getToken]);

	const deleteNotification = useCallback((notificationId) => {
		setNotifications((prev) =>
			prev.filter((n) => n._id !== notificationId && n.id !== notificationId)
		);
	}, []);

	const deleteAllNotifications = useCallback(() => {
		setNotifications([]);
	}, []);

	const getUnreadCount = useCallback(() => {
		return notifications.filter((n) => !n.isRead && !n.read).length;
	}, [notifications]);

	const unreadCount = notifications.filter((n) => !n.isRead && !n.read).length;

	return (
		<NotificationContext.Provider
			value={{
				notifications,
				unreadCount,
				loading,
				addNotification: showToast,
				notifyBookingConfirmed,
				fetchNotifications,
				markAsRead,
				markAllAsRead,
				deleteNotification,
				deleteAllNotifications,
				getUnreadCount,
			}}
		>
			{children}
		</NotificationContext.Provider>
	);
};

export function useNotifications() {
	const ctx = useContext(NotificationContext);
	if (!ctx) throw new Error('useNotifications must be used inside NotificationProvider');
	return ctx;
}
