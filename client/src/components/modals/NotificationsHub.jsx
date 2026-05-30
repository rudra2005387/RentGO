// Real-time Notifications Component
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaBell, FaTimes, FaCheckCircle, FaInfoCircle, FaExclamationCircle } from 'react-icons/fa';
import { containerVariants, itemVariants } from '../../utils/animations';
import useSocket from '../../hooks/useSocket';

export const NotificationsHub = ({ userId, token }) => {
  const { connected, on, off, emit } = useSocket(token);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    if (!connected) return;

    const handleNotification = (notif) => {
      setNotifications(prev => [notif, ...prev]);
      setUnreadCount(prev => prev + 1);

      // Auto remove after 5 seconds
      setTimeout(() => {
        setNotifications(prev => prev.filter(n => n._id !== notif._id));
      }, 5000);
    };

    on('notification', handleNotification);
    on('bookingUpdate', (data) => {
      handleNotification({
        type: 'booking',
        title: 'Booking Update',
        message: data.message,
        _id: Date.now().toString(),
        createdAt: new Date(),
      });
    });

    return () => {
      off('notification', handleNotification);
      off('bookingUpdate', handleNotification);
    };
  }, [connected, on, off]);

  const getIcon = (type) => {
    const icons = {
      success: <FaCheckCircle className="text-green-500" />,
      error: <FaExclamationCircle className="text-red-500" />,
      info: <FaInfoCircle className="text-blue-500" />,
      booking: <FaBell className="text-rose-500" />,
    };
    return icons[type] || icons.info;
  };

  const getColor = (type) => {
    const colors = {
      success: 'bg-green-50 border-green-200',
      error: 'bg-red-50 border-red-200',
      info: 'bg-blue-50 border-blue-200',
      booking: 'bg-rose-50 border-rose-200',
    };
    return colors[type] || colors.info;
  };

  return (
    <div className="relative">
      {/* Notification Bell */}
      <motion.button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 text-gray-700 hover:text-gray-900 transition-colors"
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
      >
        <FaBell className="text-xl" />
        {unreadCount > 0 && (
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="absolute top-1 right-1 bg-rose-500 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center"
          >
            {unreadCount > 9 ? '9+' : unreadCount}
          </motion.div>
        )}
      </motion.button>

      {/* Notifications Dropdown */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            transition={{ type: 'spring', damping: 20 }}
            className="absolute right-0 top-12 w-80 bg-white rounded-2xl shadow-2xl border border-gray-200 z-50 max-h-96 overflow-y-auto"
          >
            {/* Header */}
            <div className="sticky top-0 bg-white border-b border-gray-200 p-4 flex items-center justify-between rounded-t-2xl">
              <h3 className="font-bold text-gray-900">Notifications</h3>
              <button
                onClick={() => setIsOpen(false)}
                className="text-gray-500 hover:text-gray-700 transition-colors"
              >
                <FaTimes />
              </button>
            </div>

            {/* Notifications List */}
            <motion.div
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              className="p-2"
            >
              {notifications.length === 0 ? (
                <div className="p-8 text-center text-gray-500">
                  <FaBell className="text-4xl mx-auto mb-2 opacity-20" />
                  <p>No notifications</p>
                </div>
              ) : (
                <AnimatePresence>
                  {notifications.map((notif) => (
                    <motion.div
                      key={notif._id}
                      variants={itemVariants}
                      initial="hidden"
                      animate="visible"
                      exit={{ opacity: 0, x: 20 }}
                      className={`p-3 mb-2 rounded-lg border ${getColor(notif.type)} flex gap-3 cursor-pointer hover:shadow-md transition-shadow`}
                    >
                      <div className="flex-shrink-0 mt-0.5">
                        {getIcon(notif.type)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-sm text-gray-900">{notif.title}</p>
                        <p className="text-xs text-gray-600 mt-0.5 line-clamp-2">{notif.message}</p>
                        <p className="text-xs text-gray-500 mt-1">
                          {new Date(notif.createdAt).toLocaleTimeString()}
                        </p>
                      </div>
                      <button
                        onClick={() => setNotifications(prev => prev.filter(n => n._id !== notif._id))}
                        className="flex-shrink-0 text-gray-400 hover:text-gray-600"
                      >
                        <FaTimes className="text-xs" />
                      </button>
                    </motion.div>
                  ))}
                </AnimatePresence>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Floating Notifications */}
      <div className="fixed bottom-4 right-4 pointer-events-none z-40">
        <AnimatePresence>
          {notifications.slice(0, 3).map((notif) => (
            <motion.div
              key={`float-${notif._id}`}
              initial={{ opacity: 0, y: 20, x: 20 }}
              animate={{ opacity: 1, y: 0, x: 0 }}
              exit={{ opacity: 0, y: 20, x: 20 }}
              className={`mb-3 p-4 rounded-xl border pointer-events-auto ${getColor(notif.type)} flex gap-3 shadow-lg`}
            >
              {getIcon(notif.type)}
              <div>
                <p className="font-semibold text-sm text-gray-900">{notif.title}</p>
                <p className="text-xs text-gray-600">{notif.message}</p>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default NotificationsHub;
