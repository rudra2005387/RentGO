import { useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FaUser,
  FaBars,
  FaTimes,
  FaBell,
  FaEnvelope,
  FaHeart,
  FaCog,
  FaSignOutAlt,
  FaGlobe,
  FaSearch,
} from 'react-icons/fa';
import { useAuth } from '../../hooks/useAuth';
import { useNotifications } from '../../context/NotificationContext';
import Button from './Button';
import { Avatar, Badge } from './UIComponents';
import clsx from 'clsx';

export default function ModernNavbar() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, token, logout } = useAuth();
  const { notifications, unreadCount, markAsRead, markAllAsRead } = useNotifications();

  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [notifMenuOpen, setNotifMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const userMenuRef = useRef(null);
  const notifMenuRef = useRef(null);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target)) {
        setUserMenuOpen(false);
      }
      if (notifMenuRef.current && !notifMenuRef.current.contains(e.target)) {
        setNotifMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = () => {
    logout();
    setUserMenuOpen(false);
    navigate('/login');
  };

  const formatTime = (ts) => {
    if (!ts) return '';
    const now = new Date();
    const d = new Date(ts);
    const diffMs = now - d;
    const diffMins = Math.floor(diffMs / 60000);
    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `${diffHours}h ago`;
    const diffDays = Math.floor(diffHours / 24);
    if (diffDays < 7) return `${diffDays}d ago`;
    return d.toLocaleDateString();
  };

  return (
    <header
      className={clsx(
        'fixed top-0 left-0 right-0 z-50 transition-all duration-300',
        'bg-white/95 backdrop-blur-sm',
        scrolled ? 'border-b border-neutral-200 shadow-sm' : 'border-b border-neutral-100',
      )}
    >
      <div className="px-4 md:px-8 h-20 flex items-center justify-between gap-4">
        {/* Logo */}
        <Link
          to="/"
          className="flex-shrink-0 text-airbnb-500 font-bold text-2xl hover:text-airbnb-600 transition-colors"
        >
          RentGo
        </Link>

        {/* Search Bar - Hidden on Mobile */}
        <div className="hidden md:flex flex-1 max-w-md">
          <div className="w-full px-4 py-2.5 rounded-full border border-neutral-200 bg-white hover:border-neutral-300 hover:shadow-sm transition-all duration-250 flex items-center gap-2">
            <FaSearch className="w-4 h-4 text-neutral-400" />
            <input
              type="text"
              placeholder="Search locations"
              className="flex-1 bg-transparent border-none outline-none text-sm placeholder-neutral-500"
              onClick={() => navigate('/advanced-search')}
              readOnly
            />
          </div>
        </div>

        {/* Right Side Actions */}
        <div className="flex items-center gap-1 md:gap-2">
          {/* Become Host */}
          <button
            onClick={() => navigate('/become-host')}
            className="hidden lg:inline-flex items-center gap-2 px-4 py-2 text-sm font-semibold text-neutral-900 hover:bg-neutral-50 rounded-full transition-colors"
          >
            Become a Host
          </button>

          {user ? (
            <>
              {/* Messages */}
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => navigate('/messages')}
                className="hidden md:flex items-center justify-center w-10 h-10 rounded-full hover:bg-neutral-100 transition-colors text-neutral-700"
                title="Messages"
              >
                <FaEnvelope className="w-4 h-4" />
              </motion.button>

              {/* Notifications */}
              <div className="relative" ref={notifMenuRef}>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setNotifMenuOpen(!notifMenuOpen)}
                  className="hidden md:flex items-center justify-center w-10 h-10 rounded-full hover:bg-neutral-100 transition-colors text-neutral-700 relative"
                  title="Notifications"
                >
                  <FaBell className="w-4 h-4" />
                  {unreadCount > 0 && (
                    <Badge
                      variant="error"
                      size="sm"
                      className="absolute -top-1 -right-1 w-5 h-5 flex items-center justify-center text-xs"
                    >
                      {unreadCount > 9 ? '9+' : unreadCount}
                    </Badge>
                  )}
                </motion.button>

                {/* Notifications Dropdown */}
                <AnimatePresence>
                  {notifMenuOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: -10, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: -10, scale: 0.95 }}
                      transition={{ duration: 0.15 }}
                      className="absolute right-0 mt-2 w-96 bg-white rounded-2xl shadow-lg border border-neutral-200 z-50 max-h-96 overflow-y-auto"
                    >
                      <div className="border-b border-neutral-100 p-4">
                        <div className="flex items-center justify-between mb-2">
                          <h3 className="font-semibold text-neutral-900">Notifications</h3>
                          {unreadCount > 0 && (
                            <button
                              onClick={markAllAsRead}
                              className="text-xs text-airbnb-500 hover:text-airbnb-600 font-medium"
                            >
                              Mark all as read
                            </button>
                          )}
                        </div>
                      </div>

                      {notifications.length === 0 ? (
                        <div className="p-8 text-center">
                          <FaBell className="w-8 h-8 text-neutral-300 mx-auto mb-3" />
                          <p className="text-sm text-neutral-500">No notifications yet</p>
                        </div>
                      ) : (
                        <div className="divide-y divide-neutral-100">
                          {notifications.slice(0, 5).map((notif) => (
                            <motion.div
                              key={notif._id}
                              whileHover={{ backgroundColor: '#f9f9f9' }}
                              className="p-4 cursor-pointer transition-colors"
                              onClick={() => {
                                markAsRead(notif._id);
                                setNotifMenuOpen(false);
                              }}
                            >
                              <div className="flex items-start gap-3">
                                <div className="w-2 h-2 rounded-full bg-airbnb-500 mt-1.5 flex-shrink-0" />
                                <div className="flex-1 min-w-0">
                                  <p className="text-sm font-medium text-neutral-900 line-clamp-2">
                                    {notif.message}
                                  </p>
                                  <p className="text-xs text-neutral-500 mt-1">
                                    {formatTime(notif.createdAt)}
                                  </p>
                                </div>
                              </div>
                            </motion.div>
                          ))}
                        </div>
                      )}

                      {notifications.length > 5 && (
                        <div className="border-t border-neutral-100 p-3 text-center">
                          <button
                            onClick={() => {
                              navigate('/notifications');
                              setNotifMenuOpen(false);
                            }}
                            className="text-sm font-semibold text-airbnb-500 hover:text-airbnb-600"
                          >
                            View all notifications
                          </button>
                        </div>
                      )}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* User Menu */}
              <div className="relative ml-2" ref={userMenuRef}>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setUserMenuOpen(!userMenuOpen)}
                  className="flex items-center gap-2 px-2 py-1.5 rounded-full border border-neutral-200 bg-white hover:shadow-sm hover:border-neutral-300 transition-all duration-250"
                >
                  <FaBars className="w-4 h-4 text-neutral-700" />
                  <Avatar src={user?.profileImage} name={user?.firstName || 'U'} size="sm" />
                </motion.button>

                {/* User Dropdown Menu */}
                <AnimatePresence>
                  {userMenuOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: -10, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: -10, scale: 0.95 }}
                      transition={{ duration: 0.15 }}
                      className="absolute right-0 mt-2 w-56 bg-white rounded-2xl shadow-lg border border-neutral-200 z-50 overflow-hidden"
                    >
                      <div className="p-4 border-b border-neutral-100">
                        <p className="text-sm font-semibold text-neutral-900">
                          {user?.firstName} {user?.lastName}
                        </p>
                        <p className="text-xs text-neutral-500">{user?.email}</p>
                      </div>

                      <div className="py-2 divide-y divide-neutral-100">
                        <Link
                          to="/profile"
                          onClick={() => setUserMenuOpen(false)}
                          className="flex items-center gap-3 px-4 py-3 text-sm text-neutral-900 hover:bg-neutral-50 transition-colors"
                        >
                          <FaUser className="w-4 h-4 text-neutral-500" />
                          <span>Profile</span>
                        </Link>

                        <Link
                          to="/dashboard"
                          onClick={() => setUserMenuOpen(false)}
                          className="flex items-center gap-3 px-4 py-3 text-sm text-neutral-900 hover:bg-neutral-50 transition-colors"
                        >
                          <FaHeart className="w-4 h-4 text-neutral-500" />
                          <span>Wishlists</span>
                        </Link>

                        <Link
                          to="/host/dashboard"
                          onClick={() => setUserMenuOpen(false)}
                          className="flex items-center gap-3 px-4 py-3 text-sm text-neutral-900 hover:bg-neutral-50 transition-colors"
                        >
                          <FaGlobe className="w-4 h-4 text-neutral-500" />
                          <span>Host Dashboard</span>
                        </Link>

                        <button
                          onClick={() => {
                            navigate('/profile?section=settings');
                            setUserMenuOpen(false);
                          }}
                          className="w-full flex items-center gap-3 px-4 py-3 text-sm text-neutral-900 hover:bg-neutral-50 transition-colors text-left"
                        >
                          <FaCog className="w-4 h-4 text-neutral-500" />
                          <span>Settings</span>
                        </button>
                      </div>

                      <div className="p-2 border-t border-neutral-100">
                        <button
                          onClick={handleLogout}
                          className="w-full flex items-center gap-3 px-4 py-3 text-sm text-error hover:bg-red-50 transition-colors rounded-lg"
                        >
                          <FaSignOutAlt className="w-4 h-4" />
                          <span>Logout</span>
                        </button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </>
          ) : (
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate('/login')}
                className="hidden sm:inline-flex"
              >
                Login
              </Button>
              <Button
                variant="primary"
                size="sm"
                onClick={() => navigate('/register')}
              >
                Sign up
              </Button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
