import React, { createContext, useState, useCallback, useEffect } from 'react';

export const NotificationContext = createContext();

export const NotificationProvider = ({ children }) => {
	const [notifications, setNotifications] = useState([]);

	// Load notifications from localStorage on mount
	useEffect(() => {
		const saved = localStorage.getItem('rg_notifications');
		if (saved) {
			try {
				setNotifications(JSON.parse(saved));
			} catch (error) {
				console.error('Failed to load notifications:', error);
			}
		}
	}, []);

	// Save notifications to localStorage whenever they change
	const saveToLocalStorage = useCallback((notifs) => {
		localStorage.setItem('rg_notifications', JSON.stringify(notifs));
	}, []);

	const addNotification = useCallback((notification) => {
		const newNotification = {
			id: Date.now(),
			timestamp: new Date(),
			isRead: false,
			...notification,
		};

		setNotifications((prev) => {
			const updated = [newNotification, ...prev];
			saveToLocalStorage(updated);
			return updated;
		});

		return newNotification.id;
	}, [saveToLocalStorage]);

	const markAsRead = useCallback((notificationId) => {
		setNotifications((prev) => {
			const updated = prev.map((notif) =>
				notif.id === notificationId ? { ...notif, isRead: true } : notif
			);
			saveToLocalStorage(updated);
			return updated;
		});
	}, [saveToLocalStorage]);

	const markAllAsRead = useCallback(() => {
		setNotifications((prev) => {
			const updated = prev.map((notif) => ({ ...notif, isRead: true }));
			saveToLocalStorage(updated);
			return updated;
		});
	}, [saveToLocalStorage]);

	const deleteNotification = useCallback((notificationId) => {
		setNotifications((prev) => {
			const updated = prev.filter((notif) => notif.id !== notificationId);
			saveToLocalStorage(updated);
			return updated;
		});
	}, [saveToLocalStorage]);

	const deleteAllNotifications = useCallback(() => {
		setNotifications([]);
		saveToLocalStorage([]);
	}, [saveToLocalStorage]);

	const getUnreadCount = useCallback(() => {
		return notifications.filter((n) => !n.isRead).length;
	}, [notifications]);

	return (
		<NotificationContext.Provider
			value={{
				notifications,
				addNotification,
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
