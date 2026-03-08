import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaBell, FaCheck, FaCheckDouble } from 'react-icons/fa';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../hooks/useAuth';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const ICON_MAP = {
  booking: '📅',
  payment: '💳',
  review: '⭐',
  message: '💬',
  system: '🔔',
  listing: '🏠',
  cancellation: '❌',
};

function NotificationItem({ notification, onMarkRead }) {
  const isRead = notification.read || notification.isRead;
  const icon = ICON_MAP[notification.type] || '🔔';
  const time = notification.createdAt
    ? new Date(notification.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' })
    : '';

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={`flex items-start gap-4 px-6 py-4 transition-colors ${
        isRead ? 'bg-white' : 'bg-rose-50/40'
      } hover:bg-gray-50 group`}
    >
      <span className="text-2xl flex-shrink-0 mt-0.5">{icon}</span>
      <div className="flex-1 min-w-0">
        <p className={`text-sm ${isRead ? 'text-[#484848]' : 'text-[#222222] font-semibold'}`}>
          {notification.title || notification.message}
        </p>
        {notification.body && (
          <p className="text-xs text-[#717171] mt-0.5 line-clamp-2">{notification.body}</p>
        )}
        <p className="text-xs text-[#B0B0B0] mt-1">{time}</p>
      </div>
      {!isRead && (
        <button
          onClick={() => onMarkRead(notification._id)}
          className="opacity-0 group-hover:opacity-100 transition-opacity text-[#717171] hover:text-[#FF385C] p-1"
          title="Mark as read"
        >
          <FaCheck size={12} />
        </button>
      )}
      {!isRead && (
        <div className="w-2 h-2 rounded-full bg-[#FF385C] flex-shrink-0 mt-2" />
      )}
    </motion.div>
  );
}

export default function NotificationsPage() {
  const navigate = useNavigate();
  const { token } = useAuth();

  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all'); // all | unread

  useEffect(() => {
    if (!token) { navigate('/login'); return; }

    const fetchNotifications = async () => {
      try {
        const res = await fetch(`${API_BASE}/notifications`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const d = await res.json();
        if (d.success) {
          setNotifications(d.data?.notifications || d.data || []);
        }
      } catch {
        // silent
      } finally {
        setLoading(false);
      }
    };
    fetchNotifications();
  }, [token, navigate]);

  const markRead = useCallback(
    async (id) => {
      try {
        await fetch(`${API_BASE}/notifications/${id}/read`, {
          method: 'PUT',
          headers: { Authorization: `Bearer ${token}` },
        });
        setNotifications((prev) =>
          prev.map((n) => (n._id === id ? { ...n, read: true, isRead: true } : n))
        );
      } catch {
        // silent
      }
    },
    [token]
  );

  const markAllRead = useCallback(async () => {
    try {
      await fetch(`${API_BASE}/notifications/read-all`, {
        method: 'PUT',
        headers: { Authorization: `Bearer ${token}` },
      });
      setNotifications((prev) => prev.map((n) => ({ ...n, read: true, isRead: true })));
    } catch {
      // silent
    }
  }, [token]);

  const unreadCount = notifications.filter((n) => !n.read && !n.isRead).length;
  const displayed = filter === 'unread' ? notifications.filter((n) => !n.read && !n.isRead) : notifications;

  return (
    <div className="min-h-screen bg-[#F7F7F7]" style={{ fontFamily: "'DM Sans', sans-serif" }}>
      <div className="max-w-2xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <FaBell className="text-[#FF385C]" size={20} />
            <h1 className="text-2xl font-bold text-[#222222]">Notifications</h1>
            {unreadCount > 0 && (
              <span className="bg-[#FF385C] text-white text-xs font-bold px-2 py-0.5 rounded-full">
                {unreadCount}
              </span>
            )}
          </div>
          {unreadCount > 0 && (
            <button
              onClick={markAllRead}
              className="flex items-center gap-1.5 text-sm font-medium text-[#717171] hover:text-[#222222] transition-colors"
            >
              <FaCheckDouble size={12} /> Mark all read
            </button>
          )}
        </div>

        {/* Filter tabs */}
        <div className="flex gap-2 mb-6">
          {['all', 'unread'].map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${
                filter === f
                  ? 'bg-[#222222] text-white'
                  : 'bg-white text-[#717171] border border-gray-200 hover:border-[#222222]'
              }`}
            >
              {f === 'all' ? 'All' : `Unread (${unreadCount})`}
            </button>
          ))}
        </div>

        {/* Notifications list */}
        <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
          {loading ? (
            <div className="p-6 space-y-4">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="flex items-start gap-4 animate-pulse">
                  <div className="w-10 h-10 rounded-full bg-gray-200" />
                  <div className="flex-1 space-y-2">
                    <div className="h-3 bg-gray-200 rounded w-3/4" />
                    <div className="h-2 bg-gray-200 rounded w-1/2" />
                  </div>
                </div>
              ))}
            </div>
          ) : displayed.length === 0 ? (
            <div className="text-center py-16">
              <p className="text-4xl mb-3">🔔</p>
              <p className="text-sm font-semibold text-[#222222]">
                {filter === 'unread' ? 'No unread notifications' : 'No notifications yet'}
              </p>
              <p className="text-xs text-[#717171] mt-1">
                {filter === 'unread' ? 'You\'re all caught up!' : 'Notifications about your bookings and messages will appear here'}
              </p>
            </div>
          ) : (
            <AnimatePresence>
              <div className="divide-y divide-gray-100">
                {displayed.map((n) => (
                  <NotificationItem key={n._id} notification={n} onMarkRead={markRead} />
                ))}
              </div>
            </AnimatePresence>
          )}
        </div>
      </div>
    </div>
  );
}
