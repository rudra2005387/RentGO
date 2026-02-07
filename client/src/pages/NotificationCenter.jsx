import React, { useContext, useState } from 'react';
import { NotificationContext } from '../context/NotificationContext';

const NotificationCenter = () => {
	const {
		notifications,
		markAsRead,
		markAllAsRead,
		deleteNotification,
		deleteAllNotifications,
	} = useContext(NotificationContext);

	const [filter, setFilter] = useState('all'); // all, unread, read
	const [selectedNotifications, setSelectedNotifications] = useState([]);

	const filteredNotifications =
		filter === 'unread'
			? notifications.filter((n) => !n.isRead)
			: filter === 'read'
				? notifications.filter((n) => n.isRead)
				: notifications;

	const getNotificationIcon = (type) => {
		switch (type) {
			case 'booking':
				return '📅';
			case 'review':
				return '⭐';
			case 'message':
				return '💬';
			case 'payment':
				return '💰';
			case 'system':
				return '🔔';
			default:
				return '📬';
		}
	};

	const getNotificationBgColor = (type) => {
		switch (type) {
			case 'booking':
				return 'bg-purple-100';
			case 'review':
				return 'bg-yellow-100';
			case 'message':
				return 'bg-green-100';
			case 'payment':
				return 'bg-blue-100';
			case 'system':
				return 'bg-red-100';
			default:
				return 'bg-gray-100';
		}
	};

	const getNotificationBadgeColor = (type) => {
		switch (type) {
			case 'booking':
				return 'text-purple-800 bg-purple-50';
			case 'review':
				return 'text-yellow-800 bg-yellow-50';
			case 'message':
				return 'text-green-800 bg-green-50';
			case 'payment':
				return 'text-blue-800 bg-blue-50';
			case 'system':
				return 'text-red-800 bg-red-50';
			default:
				return 'text-gray-800 bg-gray-50';
		}
	};

	const formatTime = (timestamp) => {
		const now = new Date();
		const date = new Date(timestamp);
		const diffMs = now - date;
		const diffMins = Math.floor(diffMs / 60000);
		const diffHours = Math.floor(diffMins / 60);
		const diffDays = Math.floor(diffHours / 24);

		if (diffMins < 1) return 'Just now';
		if (diffMins < 60) return `${diffMins}m ago`;
		if (diffHours < 24) return `${diffHours}h ago`;
		if (diffDays < 7) return `${diffDays}d ago`;

		return date.toLocaleDateString();
	};

	const toggleNotificationSelection = (id) => {
		setSelectedNotifications((prev) =>
			prev.includes(id) ? prev.filter((notifId) => notifId !== id) : [...prev, id]
		);
	};

	const toggleSelectAll = () => {
		if (selectedNotifications.length === filteredNotifications.length) {
			setSelectedNotifications([]);
		} else {
			setSelectedNotifications(filteredNotifications.map((n) => n.id));
		}
	};

	const deleteSelected = () => {
		selectedNotifications.forEach((id) => deleteNotification(id));
		setSelectedNotifications([]);
	};

	const markSelectedAsRead = () => {
		selectedNotifications.forEach((id) => markAsRead(id));
		setSelectedNotifications([]);
	};

	const unreadCount = notifications.filter((n) => !n.isRead).length;

	return (
		<div className="min-h-screen bg-gray-50">
			{/* Header */}
			<div className="sticky top-0 bg-white border-b border-gray-200 z-10">
				<div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
					<div className="flex items-center justify-between">
						<div>
							<h1 className="text-3xl font-bold text-gray-900">Notifications</h1>
							<p className="text-gray-600 mt-1">
								{unreadCount > 0
									? `You have ${unreadCount} unread notification${unreadCount !== 1 ? 's' : ''}`
									: 'All notifications read'}
							</p>
						</div>

						{unreadCount > 0 && (
							<button
								onClick={markAllAsRead}
								className="px-4 py-2 text-sm font-medium text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
							>
								Mark all as read
							</button>
						)}
					</div>
				</div>
			</div>

			{/* Main Content */}
			<div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
				{/* Filter Tabs */}
				<div className="flex gap-4 mb-6 border-b border-gray-200">
					<button
						onClick={() => {
							setFilter('all');
							setSelectedNotifications([]);
						}}
						className={`pb-4 px-2 font-medium border-b-2 transition-colors ${
							filter === 'all'
								? 'border-blue-500 text-blue-600'
								: 'border-transparent text-gray-600 hover:text-gray-900'
						}`}
					>
						All {notifications.length > 0 && `(${notifications.length})`}
					</button>
					<button
						onClick={() => {
							setFilter('unread');
							setSelectedNotifications([]);
						}}
						className={`pb-4 px-2 font-medium border-b-2 transition-colors ${
							filter === 'unread'
								? 'border-blue-500 text-blue-600'
								: 'border-transparent text-gray-600 hover:text-gray-900'
						}`}
					>
						Unread {unreadCount > 0 && `(${unreadCount})`}
					</button>
					<button
						onClick={() => {
							setFilter('read');
							setSelectedNotifications([]);
						}}
						className={`pb-4 px-2 font-medium border-b-2 transition-colors ${
							filter === 'read'
								? 'border-blue-500 text-blue-600'
								: 'border-transparent text-gray-600 hover:text-gray-900'
						}`}
					>
						Read {notifications.length - unreadCount > 0 && `(${notifications.length - unreadCount})`}
					</button>
				</div>

				{/* Bulk Actions */}
				{filteredNotifications.length > 0 && selectedNotifications.length > 0 && (
					<div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6 flex items-center justify-between">
						<div className="flex items-center gap-3">
							<input
								type="checkbox"
								checked={selectedNotifications.length === filteredNotifications.length}
								onChange={toggleSelectAll}
								className="w-5 h-5 text-blue-600 rounded"
							/>
							<span className="text-sm font-medium text-gray-900">
								{selectedNotifications.length} selected
							</span>
						</div>
						<div className="flex gap-2">
							<button
								onClick={markSelectedAsRead}
								className="px-3 py-1 text-sm font-medium text-blue-600 hover:bg-blue-100 rounded transition-colors"
							>
								Mark as read
							</button>
							<button
								onClick={deleteSelected}
								className="px-3 py-1 text-sm font-medium text-red-600 hover:bg-red-100 rounded transition-colors"
							>
								Delete
							</button>
						</div>
					</div>
				)}

				{/* Notifications List */}
				{filteredNotifications.length === 0 ? (
					<div className="text-center py-12">
						<div className="text-4xl mb-4">📭</div>
						<p className="text-lg font-medium text-gray-900">No notifications</p>
						<p className="text-gray-600 mt-1">
							{filter === 'unread' && 'All notifications have been read'}
							{filter === 'read' && 'You have no read notifications yet'}
							{filter === 'all' && "You don't have any notifications yet"}
						</p>
					</div>
				) : (
					<div className="space-y-3">
						{filteredNotifications.map((notification) => (
							<div
								key={notification.id}
								className={`bg-white rounded-lg border ${
									notification.isRead ? 'border-gray-200' : 'border-blue-200 bg-blue-50'
								} p-4 hover:shadow-md transition-shadow`}
							>
								<div className="flex items-start gap-4">
									{/* Checkbox */}
									<input
										type="checkbox"
										checked={selectedNotifications.includes(notification.id)}
										onChange={() => toggleNotificationSelection(notification.id)}
										className="w-5 h-5 text-blue-600 rounded mt-1"
									/>

									{/* Icon */}
									<div
										className={`text-3xl flex-shrink-0 flex items-center justify-center w-12 h-12 rounded-lg ${getNotificationBgColor(
											notification.type
										)}`}
									>
										{getNotificationIcon(notification.type)}
									</div>

									{/* Content */}
									<div className="flex-1 min-w-0">
										<div className="flex items-start justify-between gap-4">
											<div>
												<div className="flex items-center gap-2 mb-1">
													<h3 className="font-semibold text-gray-900">
														{notification.title}
													</h3>
													<span
														className={`text-xs font-medium px-2 py-1 rounded ${getNotificationBadgeColor(
															notification.type
														)}`}
													>
														{notification.type}
													</span>
													{!notification.isRead && (
														<span className="w-2 h-2 bg-blue-500 rounded-full"></span>
													)}
												</div>
												<p className="text-gray-700 text-sm">
													{notification.message}
												</p>
												{notification.details && (
													<p className="text-gray-600 text-sm mt-2">
														{notification.details}
													</p>
												)}
											</div>

											{/* Time */}
											<time className="text-xs text-gray-500 flex-shrink-0 whitespace-nowrap">
												{formatTime(notification.timestamp)}
											</time>
										</div>

										{/* Action Buttons */}
										<div className="flex items-center gap-2 mt-3 pt-3 border-t border-gray-200">
											{!notification.isRead && (
												<button
													onClick={() => markAsRead(notification.id)}
													className="text-xs font-medium text-blue-600 hover:bg-blue-100 px-3 py-1 rounded transition-colors"
												>
													Mark as read
												</button>
											)}
											<button
												onClick={() => deleteNotification(notification.id)}
												className="text-xs font-medium text-red-600 hover:bg-red-100 px-3 py-1 rounded transition-colors"
											>
												Delete
											</button>
										</div>
									</div>
								</div>
							</div>
						))}
					</div>
				)}

				{/* Clear All Button */}
				{notifications.length > 0 && (
					<div className="mt-8 text-center">
						<button
							onClick={() => {
								if (
									confirm(
										'Are you sure you want to delete all notifications? This action cannot be undone.'
									)
								) {
									deleteAllNotifications();
									setSelectedNotifications([]);
								}
							}}
							className="text-sm font-medium text-red-600 hover:bg-red-50 px-4 py-2 rounded transition-colors"
						>
							Clear all notifications
						</button>
					</div>
				)}
			</div>
		</div>
	);
};

export default NotificationCenter;
