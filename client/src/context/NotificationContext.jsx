import React, { createContext, useContext, useState, useCallback, useEffect, useRef } from 'react';
import toast from 'react-hot-toast';
import { io } from 'socket.io-client';
import { useAuth } from '../hooks/useAuth';
import apiClient, { API_BASE_URL } from '../config/apiClient';

export const NotificationContext = createContext();

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || API_BASE_URL?.replace('/api', '') || 'http://localhost:5000';

// Minimum interval between fetches (ms) to avoid 429
const FETCH_THROTTLE_MS = 5000;

export const NotificationProvider = ({ children }) => {
	const { token, isAuthenticated } = useAuth();
	const [notifications, setNotifications] = useState([]);
	const [loading, setLoading] = useState(false);
	const socketRef = useRef(null);
	const lastFetchRef = useRef(0);
	const fetchInFlightRef = useRef(null);

	// Fetch notifications from backend API (throttled to prevent 429)
	const fetchNotifications = useCallback(async (force = false) => {
		if (!token) return;

		const now = Date.now();
		if (!force && now - lastFetchRef.current < FETCH_THROTTLE_MS) return;

		// Deduplicate concurrent fetches
		if (fetchInFlightRef.current) return fetchInFlightRef.current;

		lastFetchRef.current = now;
		setLoading(true);

		const promise = (async () => {
			try {
				const res = await apiClient.get('/notifications');
				const d = res.data;
				if (d.success) {
					setNotifications(d.data?.notifications || d.data || []);
				}
			} catch {
				// silent — graceful degradation
			} finally {
				setLoading(false);
				fetchInFlightRef.current = null;
			}
		})();

		fetchInFlightRef.current = promise;
		return promise;
	}, [token]);

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
		if (!token) {
			// Not logged in — disconnect any existing socket and clear state
			if (socketRef.current) {
				socketRef.current.disconnect();
				socketRef.current = null;
			}
			setNotifications([]);
			return;
		}

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
	}, [token, showToast]);

	// Fetch notifications when token becomes available (login / mount with existing session)
	useEffect(() => {
		if (token) {
			fetchNotifications(true);
		}
	}, [token, fetchNotifications]);

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
		setNotifications((prev) =>
			prev.map((n) => (n._id === notificationId || n.id === notificationId) ? { ...n, isRead: true, read: true } : n)
		);
		if (token) {
			try {
				await apiClient.put(`/notifications/${notificationId}/read`);
			} catch { /* silent */ }
		}
	}, [token]);

	// Mark all as read (API + local state)
	const markAllAsRead = useCallback(async () => {
		setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true, read: true })));
		if (token) {
			try {
				await apiClient.put('/notifications/read-all');
			} catch { /* silent */ }
		}
	}, [token]);

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
