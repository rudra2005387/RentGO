    import React, { useContext, useRef, useEffect, useState } from 'react';
    import { Link } from 'react-router-dom';
    import { NotificationContext } from   '../context/NotificationContext';

    const NotificationBell = () => {
        const { notifications, getUnreadCount, markAsRead, deleteNotification } =
            useContext(NotificationContext);
        const [isOpen, setIsOpen] = useState(false);
        const dropdownRef = useRef(null);

        const unreadCount = getUnreadCount();
        const recentNotifications = notifications.slice(0, 5);


        useEffect(() => {
            const handleClickOutside = (event) => {
                if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                    setIsOpen(false);
                }
            };

            if (isOpen) {
                document.addEventListener('mousedown', handleClickOutside);
                return () => document.removeEventListener('mousedown', handleClickOutside);
            }
        }, [isOpen]);

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

        const getNotificationColor = (isRead) => {
            return isRead ? 'bg-gray-50' : 'bg-blue-50';
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

        return (
            <div className="relative" ref={dropdownRef}>
                {/* Bell Icon Button */}
                <button
                    onClick={() => setIsOpen(!isOpen)}
                    className="relative p-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                    aria-label="Notifications"
                >
                    <svg
                        className="w-6 h-6"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                    >
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
                        />
                    </svg>

                    
                    {unreadCount > 0 && (
                        <span className="absolute top-1 right-1 flex items-center justify-center w-5 h-5 text-xs font-bold text-white bg-red-500 rounded-full">
                            {unreadCount > 9 ? '9+' : unreadCount}
                        </span>
                    )}
                </button>

            
                {isOpen && (
                    <div className="absolute right-0 mt-2 w-96 bg-white rounded-lg shadow-xl z-40 border border-gray-200">
                    
                        <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200">
                            <h3 className="font-semibold text-gray-900">Notifications</h3>
                            {unreadCount > 0 && (
                                <span className="text-xs font-medium text-blue-600 bg-blue-100 px-2 py-1 rounded">
                                    {unreadCount} new
                                </span>
                            )}
                        </div>

                      
                        <div className="max-h-96 overflow-y-auto">
                            {recentNotifications.length === 0 ? (
                                <div className="px-4 py-8 text-center">
                                    <p className="text-gray-500 text-sm">No notifications yet</p>
                                </div>
                            ) : (
                                recentNotifications.map((notification) => (
                                    <div
                                        key={notification.id}
                                        className={`px-4 py-3 border-b border-gray-100 hover:bg-gray-50 transition-colors ${getNotificationColor(
                                            notification.isRead
                                        )}`}
                                        onClick={() => markAsRead(notification.id)}
                                    >
                                        <div className="flex gap-3">
                                            
                                            <div className="flex-shrink-0 text-xl">
                                                {getNotificationIcon(notification.type)}
                                            </div>

                                            
                                            <div className="flex-1 min-w-0">
                                                <p className={`text-sm font-medium text-gray-900`}>
                                                    {notification.title}
                                                </p>
                                                <p className="text-sm text-gray-600 mt-1 truncate">
                                                    {notification.message}
                                                </p>
                                                <p className="text-xs text-gray-400 mt-1">
                                                    {formatTime(notification.timestamp)}
                                                </p>
                                            </div>

                                            {/* Actions */}
                                            <div className="flex-shrink-0 flex items-start">
                                                {!notification.isRead && (
                                                    <span className="w-2 h-2 bg-blue-500 rounded-full mt-2 mr-2"></span>
                                                )}
                                                <button
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        deleteNotification(notification.id);
                                                    }}
                                                    className="text-gray-400 hover:text-red-500 transition-colors"
                                                >
                                                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                                                        <path
                                                            fillRule="evenodd"
                                                            d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                                                            clipRule="evenodd"
                                                        />
                                                    </svg>
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>

                        {/* Footer */}
                        {notifications.length > 0 && (
                            <Link
                                to="/notifications"
                                className="block px-4 py-3 text-center text-sm font-medium text-blue-600 hover:bg-blue-50 border-t border-gray-200 transition-colors"
                                onClick={() => setIsOpen(false)}
                            >
                                View all notifications
                            </Link>
                        )}
                    </div>
                )}
            </div>
        );
    };

    export default NotificationBell;
