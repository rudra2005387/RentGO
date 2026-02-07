// Example: How to use Notification System

import { useNotification } from '../hooks/useNotification';

export default function NotificationExample() {
	const { addNotification, notifications, markAsRead, deleteNotification } =
		useNotification();

	const createNotification = (type) => {
		const notificationData = {
			booking: {
				title: 'New Booking Request',
				message: 'John Doe has requested to book your property',
				type: 'booking',
				details: 'Check-in: Feb 10, Check-out: Feb 15',
			},
			review: {
				title: '⭐ New Review',
				message: 'You received a 5-star review',
				type: 'review',
				details: 'Great hosting! Would recommend to friends.',
			},
			payment: {
				title: '💰 Payment Received',
				message: 'Payment of $500 has been received',
				type: 'payment',
				details: 'Booking ID: #12345',
			},
			message: {
				title: 'New Message',
				message: 'Jane Smith sent you a message',
				type: 'message',
				details: 'Hi, are you still interested?',
			},
			system: {
				title: '🔔 System Update',
				message: 'New feature: Advanced search is now live',
				type: 'system',
				details: 'Check out our latest enhancements',
			},
		};

		addNotification(notificationData[type] || notificationData.system);
	};

	return (
		<div className="space-y-4">
			{/* Create Notifications */}
			<div className="space-y-2">
				<h3 className="font-bold">Create Notifications:</h3>
				<div className="flex flex-wrap gap-2">
					<button
						onClick={() => createNotification('booking')}
						className="px-3 py-2 bg-purple-600 text-white text-sm rounded-lg"
					>
						📅 Booking
					</button>
					<button
						onClick={() => createNotification('review')}
						className="px-3 py-2 bg-yellow-600 text-white text-sm rounded-lg"
					>
						⭐ Review
					</button>
					<button
						onClick={() => createNotification('payment')}
						className="px-3 py-2 bg-blue-600 text-white text-sm rounded-lg"
					>
						💰 Payment
					</button>
					<button
						onClick={() => createNotification('message')}
						className="px-3 py-2 bg-green-600 text-white text-sm rounded-lg"
					>
						💬 Message
					</button>
					<button
						onClick={() => createNotification('system')}
						className="px-3 py-2 bg-red-600 text-white text-sm rounded-lg"
					>
						🔔 System
					</button>
				</div>
			</div>

			{/* Notifications List */}
			<div>
				<h3 className="font-bold mb-3">
					Notifications ({notifications.length})
				</h3>
				{notifications.length === 0 ? (
					<p className="text-gray-500">No notifications yet. Create one above!</p>
				) : (
					<div className="space-y-2 max-h-64 overflow-y-auto">
						{notifications.map((notif) => (
							<div
								key={notif.id}
								className={`p-3 rounded-lg border ${
									notif.isRead ? 'bg-gray-50' : 'bg-blue-50'
								}`}
							>
								<div className="flex justify-between items-start">
									<div className="flex-1">
										<p className="font-semibold text-sm">{notif.title}</p>
										<p className="text-xs text-gray-600">{notif.message}</p>
									</div>
									<button
										onClick={() => deleteNotification(notif.id)}
										className="text-gray-400 hover:text-red-500 ml-2"
									>
										✕
									</button>
								</div>
								{!notif.isRead && (
									<button
										onClick={() => markAsRead(notif.id)}
										className="text-xs text-blue-600 mt-2"
									>
										Mark as read
									</button>
								)}
							</div>
						))}
					</div>
				)}
			</div>
		</div>
	);
}
