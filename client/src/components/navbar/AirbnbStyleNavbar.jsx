import { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FaUser, FaBars, FaTimes, FaGlobe, FaBell, FaComments } from 'react-icons/fa';
import { useAuth } from '../../hooks/useAuth';
import SearchBar from '../SearchBar/SearchBar';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export default function AirbnbStyleNavbar() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, token, logout } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  // No backend /api/notifications route — use local NotificationContext instead
  // (unreadCount stays at 0 until NotificationContext is wired up)

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
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

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

            {/* Messages */}
            {user && (
              <Link
                to="/messages"
                className="hidden md:flex w-10 h-10 items-center justify-center rounded-full hover:bg-[#F7F7F7] transition-colors relative"
              >
                <FaComments className="w-4 h-4 text-[#222222]" />
              </Link>
            )}

            {/* Notifications bell */}
            {user && (
              <Link
                to="/notifications"
                className="hidden md:flex w-10 h-10 items-center justify-center rounded-full hover:bg-[#F7F7F7] transition-colors relative"
              >
                <FaBell className="w-4 h-4 text-[#222222]" />
                {unreadCount > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] bg-[#FF385C] text-white text-[10px] font-bold rounded-full flex items-center justify-center px-1">
                    {unreadCount > 9 ? '9+' : unreadCount}
                  </span>
                )}
              </Link>
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

              <motion.div
                initial={{ opacity: 0, y: -6 }}
                animate={{ opacity: userDropdownOpen ? 1 : 0, y: userDropdownOpen ? 0 : -6 }}
                transition={{ duration: 0.15 }}
                className={`absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-dropdown border border-gray-divider overflow-hidden ${userDropdownOpen ? 'block' : 'hidden'}`}
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
                    <Link
                      to="/dashboard"
                      onClick={() => setUserDropdownOpen(false)}
                      className="block px-4 py-3 text-sm text-[#222222] hover:bg-[#F7F7F7] transition-colors"
                    >
                      Dashboard
                    </Link>
                    <Link
                      to="/profile"
                      onClick={() => setUserDropdownOpen(false)}
                      className="block px-4 py-3 text-sm text-[#222222] hover:bg-[#F7F7F7] transition-colors"
                    >
                      Profile
                    </Link>
                    <Link
                      to="/dashboard?tab=bookings"
                      onClick={() => setUserDropdownOpen(false)}
                      className="block px-4 py-3 text-sm text-[#222222] hover:bg-[#F7F7F7] transition-colors"
                    >
                      My Bookings
                    </Link>
                    <Link
                      to="/messages"
                      onClick={() => setUserDropdownOpen(false)}
                      className="block px-4 py-3 text-sm text-[#222222] hover:bg-[#F7F7F7] transition-colors"
                    >
                      Messages
                    </Link>
                    <Link
                      to="/notifications"
                      onClick={() => setUserDropdownOpen(false)}
                      className="block px-4 py-3 text-sm text-[#222222] hover:bg-[#F7F7F7] transition-colors border-b border-[#EBEBEB]"
                    >
                      Notifications{unreadCount > 0 && ` (${unreadCount})`}
                    </Link>
                    <button
                      onClick={handleLogout}
                      className="w-full text-left px-4 py-3 text-sm text-[#222222] hover:bg-[#F7F7F7] transition-colors"
                    >
                      Log out
                    </button>
                  </>
                ) : (
                  <>
                    <Link
                      to="/login"
                      onClick={() => setUserDropdownOpen(false)}
                      className="block px-4 py-3 text-sm font-semibold text-[#222222] hover:bg-[#F7F7F7] transition-colors"
                    >
                      Log in
                    </Link>
                    <Link
                      to="/register"
                      onClick={() => setUserDropdownOpen(false)}
                      className="block px-4 py-3 text-sm text-[#222222] hover:bg-[#F7F7F7] transition-colors border-b border-[#EBEBEB]"
                    >
                      Sign up
                    </Link>
                  </>
                )}
              </motion.div>
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
                <Link to="/notifications" onClick={() => setMobileMenuOpen(false)} className="block px-4 py-3 text-[#222222] hover:bg-[#F7F7F7] rounded-lg text-sm font-medium">
                  Notifications{unreadCount > 0 && ` (${unreadCount})`}
                </Link>
                <Link to="/profile" onClick={() => setMobileMenuOpen(false)} className="block px-4 py-3 text-[#222222] hover:bg-[#F7F7F7] rounded-lg text-sm font-medium">Profile</Link>
                <button onClick={() => { handleLogout(); setMobileMenuOpen(false); }} className="w-full text-left px-4 py-3 text-[#222222] hover:bg-[#F7F7F7] rounded-lg text-sm font-medium">
                  Log out
                </button>
              </>
            ) : (
              <>
                <Link to="/login" onClick={() => setMobileMenuOpen(false)} className="block px-4 py-3 text-[#222222] hover:bg-[#F7F7F7] rounded-lg text-sm font-semibold">Log in</Link>
                <Link to="/register" onClick={() => setMobileMenuOpen(false)} className="block px-4 py-3 text-[#222222] hover:bg-[#F7F7F7] rounded-lg text-sm font-medium">Sign up</Link>
              </>
            )}
          </div>
        </div>
      </motion.div>
    </>
  );
}