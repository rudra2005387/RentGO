import { useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { FaUser, FaBars, FaTimes, FaGlobe, FaBell, FaComments } from 'react-icons/fa';
import { useAuth } from '../../hooks/useAuth';
import { useNotifications } from '../../context/NotificationContext';
import { useTheme } from '../../context/ThemeContext';
import SearchBar from '../SearchBar/SearchBar';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export default function AirbnbStyleNavbar() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, token, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const { notifications, unreadCount, markAsRead, markAllAsRead } = useNotifications();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const [notifDropdownOpen, setNotifDropdownOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const notifRef = useRef(null);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (!e.target.closest('[data-dropdown]')) {
        setUserDropdownOpen(false);
      }
      if (notifRef.current && !notifRef.current.contains(e.target)) {
        setNotifDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const ICON_MAP = { booking: '📅', payment: '💳', review: '⭐', message: '💬', system: '🔔', listing: '🏠', cancellation: '❌' };
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
  const recentNotifications = notifications.slice(0, 6);

  const handleLogout = () => {
    logout();
    setUserDropdownOpen(false);
    navigate('/');
  };

  const navTabs = [
    { label: 'Homes', path: '/' },
    { label: 'Experiences', path: '/experiences' },
    { label: 'Services', path: '/services' },  // ← fixed
  ];

  const isTabActive = (tab) => {
    if (tab.path === '/') return location.pathname === '/';
    return location.pathname.startsWith(tab.path);
  };

  return (
    <>
      <header className={`fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-200 h-[80px] transition-shadow duration-300 ${scrolled ? 'shadow-navbar' : ''}`}>
        <div className="container-page h-full flex items-center justify-between">

          {/* LEFT: Logo */}
          <div className="flex-shrink-0">
            <Link to="/" className="text-[#FF385C] text-2xl font-bold no-underline">
              RentGo
            </Link>
          </div>

          {/* CENTER: Search Bar + Tabs */}
          <div className="hidden md:flex flex-col items-center absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
            <SearchBar />
          </div>

          {/* RIGHT: Host link + Globe + User pill */}
          <div className="flex items-center gap-2 flex-shrink-0">
            <Link
              to="/become-host"
              className="hidden lg:block text-sm font-semibold text-[#222222] px-3 py-2 rounded-full hover:bg-[#F7F7F7] transition-colors"
            >
              Become a Host
            </Link>

            <button className="hidden md:flex w-10 h-10 items-center justify-center rounded-full hover:bg-[#F7F7F7] transition-colors">
              <FaGlobe className="w-4 h-4 text-[#222222]" />
            </button>

            <button
              onClick={toggleTheme}
              className="hidden md:flex h-10 items-center gap-2 px-3 rounded-full hover:bg-[#F7F7F7] transition-colors text-sm font-semibold text-[#222222]"
              title={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
            >
              <span>{theme === 'dark' ? '☀️' : '🌙'}</span>
              <span className="hidden lg:inline">{theme === 'dark' ? 'Light' : 'Dark'}</span>
            </button>

            {/* Messages */}
            {user && (
              <Link
                to="/messages"
                className="hidden md:flex w-10 h-10 items-center justify-center rounded-full hover:bg-[#F7F7F7] transition-colors relative"
              >
                <FaComments className="w-4 h-4 text-[#222222]" />
              </Link>
            )}

            {/* Notifications bell with dropdown */}
            {user && (
              <div className="relative hidden md:block" ref={notifRef}>
                <button
                  onClick={() => setNotifDropdownOpen(!notifDropdownOpen)}
                  className="flex w-10 h-10 items-center justify-center rounded-full hover:bg-[#F7F7F7] transition-colors relative"
                >
                  <FaBell className="w-[18px] h-[18px] text-[#222222]" />
                  {unreadCount > 0 && (
                    <span className="absolute -top-2 -right-2 min-w-[20px] h-5 bg-[#FF385C] text-white text-[11px] font-semibold rounded-full flex items-center justify-center px-1 shadow-md ring-2 ring-white">
                      {unreadCount > 9 ? '9+' : unreadCount}
                    </span>
                  )}
                </button>

                {/* Notification dropdown */}
                <AnimatePresence>
                  {notifDropdownOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: -8, scale: 0.96 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: -8, scale: 0.96 }}
                      transition={{ duration: 0.15 }}
                      className="absolute right-0 mt-2 w-96 bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden z-50"
                      style={{ fontFamily: "'DM Sans', system-ui, sans-serif" }}
                    >
                      {/* Header */}
                      <div className="flex items-center justify-between px-5 py-3.5 border-b border-gray-100">
                        <h3 className="text-base font-bold text-[#222222]">Notifications</h3>
                        {unreadCount > 0 && (
                          <button
                            onClick={() => markAllAsRead()}
                            className="text-xs font-semibold text-[#FF385C] hover:text-[#E31C5F] transition-colors"
                          >
                            Mark all read
                          </button>
                        )}
                      </div>

                      {/* Notification list */}
                      <div className="max-h-[400px] overflow-y-auto">
                        {recentNotifications.length === 0 ? (
                          <div className="px-5 py-10 text-center">
                            <p className="text-3xl mb-2">🔔</p>
                            <p className="text-sm text-[#717171]">No notifications yet</p>
                          </div>
                        ) : (
                          recentNotifications.map((n) => (
                            <div
                              key={n._id || n.id}
                              onClick={() => {if (!n.isRead && !n.read) markAsRead(n._id || n.id);}}
                              className={`flex items-start gap-3 px-5 py-3.5 border-b border-gray-50 hover:bg-[#F7F7F7] transition-colors cursor-pointer ${!n.isRead && !n.read ? 'bg-rose-50/30' : ''}`}
                            >
                              <span className="text-xl flex-shrink-0 mt-0.5">{ICON_MAP[n.type] || '🔔'}</span>
                              <div className="flex-1 min-w-0">
                                <p className={`text-sm ${!n.isRead && !n.read ? 'font-semibold text-[#222222]' : 'text-[#484848]'}`}>
                                  {n.title}
                                </p>
                                {n.message && (
                                  <p className="text-xs text-[#717171] mt-0.5 line-clamp-1">{n.message}</p>
                                )}
                                <p className="text-[11px] text-[#B0B0B0] mt-1">{formatTime(n.createdAt || n.timestamp)}</p>
                              </div>
                              {!n.isRead && !n.read && (
                                <span className="w-2 h-2 rounded-full bg-[#FF385C] flex-shrink-0 mt-2" />
                              )}
                            </div>
                          ))
                        )}
                      </div>

                      {/* Footer */}
                      {notifications.length > 0 && (
                        <Link
                          to="/notifications"
                          onClick={() => setNotifDropdownOpen(false)}
                          className="block px-5 py-3 text-center text-sm font-semibold text-[#FF385C] hover:bg-[#FFF5F5] border-t border-gray-100 transition-colors"
                        >
                          View all notifications
                        </Link>
                      )}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            )}

            {/* User pill */}
            <div className="relative" data-dropdown>
              <button
                onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                className="flex items-center gap-3 pl-3 pr-1.5 py-1.5 border border-[#DDDDDD] rounded-full bg-white hover:shadow-md transition-shadow cursor-pointer"
                aria-expanded={userDropdownOpen}
              >
                <FaBars className="w-4 h-4 text-[#222222]" />
                <div className="w-8 h-8 rounded-full bg-[#717171] flex items-center justify-center overflow-hidden">
                  {user?.avatar ? (
                    <img src={user.avatar} alt="Profile" className="w-8 h-8 rounded-full object-cover" />
                  ) : (
                    <FaUser className="w-3.5 h-3.5 text-white" />
                  )}
                </div>
              </button>

              <AnimatePresence>
              {userDropdownOpen && (
              <motion.div
                initial={{ opacity: 0, y: -10, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -10, scale: 0.95 }}
                transition={{ duration: 0.18, ease: 'easeOut' }}
                className="absolute right-0 mt-3 w-60 bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden z-50"
                style={{ fontFamily: "'DM Sans', system-ui, sans-serif" }}
              >
                {/* User info header */}
                <div className="px-4 py-3 border-b border-[#EBEBEB]">
                  {user ? (
                    <>
                      <p className="text-sm font-semibold text-[#222222]">
                        {user.firstName ? `${user.firstName} ${user.lastName || ''}`.trim() : user.email?.split('@')[0]}
                      </p>
                      <p className="text-xs text-[#717171] truncate">{user.email}</p>
                    </>
                  ) : (
                    <p className="text-sm text-[#717171]">Not logged in</p>
                  )}
                </div>

                {user ? (
                  <>
                    <div className="py-1">
                      <Link
                        to="/dashboard"
                        onClick={() => setUserDropdownOpen(false)}
                        className="block px-4 py-2.5 text-sm text-[#222222] hover:bg-[#F7F7F7] transition-colors"
                      >
                        Dashboard
                      </Link>
                      <Link
                        to="/profile"
                        onClick={() => setUserDropdownOpen(false)}
                        className="block px-4 py-2.5 text-sm text-[#222222] hover:bg-[#F7F7F7] transition-colors"
                      >
                        Profile
                      </Link>
                      <Link
                        to="/dashboard?tab=bookings"
                        onClick={() => setUserDropdownOpen(false)}
                        className="block px-4 py-2.5 text-sm text-[#222222] hover:bg-[#F7F7F7] transition-colors"
                      >
                        My Bookings
                      </Link>
                      <Link
                        to="/messages"
                        onClick={() => setUserDropdownOpen(false)}
                        className="block px-4 py-2.5 text-sm text-[#222222] hover:bg-[#F7F7F7] transition-colors"
                      >
                        Messages
                      </Link>
                      <Link
                        to="/notifications"
                        onClick={() => setUserDropdownOpen(false)}
                        className="flex items-center justify-between px-4 py-2.5 text-sm text-[#222222] hover:bg-[#F7F7F7] transition-colors"
                      >
                        <span>Notifications</span>
                        {unreadCount > 0 && (
                          <span className="bg-red-50 text-[#FF385C] text-xs font-semibold px-2 py-0.5 rounded-full">
                            {unreadCount}
                          </span>
                        )}
                      </Link>
                    </div>
                    <div className="border-t border-[#EBEBEB] my-1" />
                    <div className="py-1">
                      <button
                        onClick={handleLogout}
                        className="w-full text-left px-4 py-2.5 text-sm text-[#222222] hover:bg-[#F7F7F7] transition-colors"
                      >
                        Log out
                      </button>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="py-1">
                      <Link
                        to="/login"
                        onClick={() => setUserDropdownOpen(false)}
                        className="block px-4 py-2.5 text-sm font-semibold text-[#222222] hover:bg-[#F7F7F7] transition-colors"
                      >
                        Log in
                      </Link>
                      <Link
                        to="/register"
                        onClick={() => setUserDropdownOpen(false)}
                        className="block px-4 py-2.5 text-sm text-[#222222] hover:bg-[#F7F7F7] transition-colors"
                      >
                        Sign up
                      </Link>
                    </div>
                  </>
                )}
              </motion.div>
              )}
              </AnimatePresence>
            </div>

            {/* Mobile hamburger */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden text-xl text-[#222222] ml-1"
            >
              {mobileMenuOpen ? <FaTimes /> : <FaBars />}
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Menu */}
      <motion.div
        initial={{ opacity: 0, height: 0 }}
        animate={{ opacity: mobileMenuOpen ? 1 : 0, height: mobileMenuOpen ? 'auto' : 0 }}
        transition={{ duration: 0.3 }}
        className="md:hidden bg-white border-b border-[#EBEBEB] overflow-hidden fixed top-[80px] left-0 right-0 z-40"
      >
        <div className="px-6 py-4 space-y-1">
          {navTabs.map((tab) => (
            <Link
              key={tab.label}
              to={tab.path}
              onClick={() => setMobileMenuOpen(false)}
              className={`block px-4 py-3 rounded-lg transition-colors text-sm font-medium ${
                isTabActive(tab)
                  ? 'bg-[#F7F7F7] text-[#222222] font-semibold'
                  : 'text-[#222222] hover:bg-[#F7F7F7]'
              }`}
            >
              {tab.label}
            </Link>
          ))}
          <Link
            to="/become-host"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-4 py-3 text-[#222222] hover:bg-[#F7F7F7] rounded-lg transition-colors text-sm font-medium"
          >
            Become a Host
          </Link>
          <div className="border-t border-[#EBEBEB] pt-2 mt-2">
            {user ? (
              <>
                <Link to="/dashboard" onClick={() => setMobileMenuOpen(false)} className="block px-4 py-3 text-[#222222] hover:bg-[#F7F7F7] rounded-lg text-sm font-medium">Dashboard</Link>
                <Link to="/messages" onClick={() => setMobileMenuOpen(false)} className="block px-4 py-3 text-[#222222] hover:bg-[#F7F7F7] rounded-lg text-sm font-medium">Messages</Link>
                <Link to="/notifications" onClick={() => setMobileMenuOpen(false)} className="flex items-center justify-between px-4 py-3 text-[#222222] hover:bg-[#F7F7F7] rounded-lg text-sm font-medium">
                  <span>Notifications</span>
                  {unreadCount > 0 && (
                    <span className="bg-red-50 text-[#FF385C] text-xs font-semibold px-2 py-0.5 rounded-full">
                      {unreadCount}
                    </span>
                  )}
                </Link>
                <Link to="/profile" onClick={() => setMobileMenuOpen(false)} className="block px-4 py-3 text-[#222222] hover:bg-[#F7F7F7] rounded-lg text-sm font-medium">Profile</Link>
                <button onClick={() => { handleLogout(); setMobileMenuOpen(false); }} className="w-full text-left px-4 py-3 text-[#222222] hover:bg-[#F7F7F7] rounded-lg text-sm font-medium">
                  Log out
                </button>
              </>
            ) : null}
          </div>
        </div>
      </motion.div>
    </>
  );
}