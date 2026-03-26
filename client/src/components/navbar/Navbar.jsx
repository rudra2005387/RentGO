import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FaBell, FaEnvelope, FaUser, FaSignOutAlt, FaSearch, FaBars, FaTimes, FaHome, FaMoon, FaSun, FaGlobe, FaHeart, FaCalendarAlt } from 'react-icons/fa';
import { useAuth } from '../../hooks/useAuth';
import { useTheme } from '../../context/ThemeContext';
import NotificationBell from '../NotificationBell';

export default function Navbar() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const isDark = theme === 'dark';
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const [notificationDropdown, setNotificationDropdown] = useState(false);
  const [messageDropdown, setMessageDropdown] = useState(false);
  const [languageDropdown, setLanguageDropdown] = useState(false);
  const [searchInput, setSearchInput] = useState('');
  const [hostMode, setHostMode] = useState(false);
  const [language, setLanguage] = useState('en');
  const [notificationCount] = useState(3);
  const [messageCount] = useState(2);
  const [savedCount] = useState(5);

  const notifications = [
    { id: 1, message: 'New booking request', time: '5 min ago' },
    { id: 2, message: 'Message from John', time: '1 hour ago' },
    { id: 3, message: 'Your review was posted', time: '2 hours ago' }
  ];

  const messages = [
    { id: 1, sender: 'John Doe', message: 'Hi, are you interested?', time: '5 min ago' },
    { id: 2, sender: 'Jane Smith', message: 'Thanks for the booking!', time: '1 hour ago' }
  ];

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchInput.trim()) {
      navigate(`/search?location=${searchInput}`);
      setSearchInput('');
    }
  };

  const handleLogout = () => {
    logout();
    setUserDropdownOpen(false);
    navigate('/');
  };

  return (
    <nav className="w-full bg-white border-b border-gray-100 sticky top-0 z-50 px-4 sm:px-6 py-3 dark:bg-gray-900/95 dark:border-gray-800 dark:text-white transition-colors shadow-sm">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
        
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2 font-bold text-2xl text-blue-600 flex-shrink-0">
          <FaHome />
          <span className="hidden sm:inline">RentGo</span>
        </Link>

        {/* Desktop Search Bar */}
        <form onSubmit={handleSearch} className="hidden md:flex items-center flex-1 max-w-md">
          <div className="relative w-full">
            <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              placeholder="Search properties..."
              className="w-full pl-10 pr-4 py-2 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-blue-500 transition-colors"
            />
          </div>
        </form>

        {/* Desktop Navigation */}
        <div className="hidden md:flex items-center gap-2 lg:gap-4 ml-auto">
          {/* Action Icons Group */}
          <div className="flex items-center gap-3 lg:gap-4 pr-3 lg:pr-4 border-r border-gray-200 dark:border-gray-700">
            {/* Notifications Bell */}
            <NotificationBell />

            {/* Messages */}
            <div className="relative">
              <motion.button
                onClick={() => setMessageDropdown(!messageDropdown)}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
                className="relative text-gray-700 dark:text-gray-300 hover:text-blue-600 transition-colors"
                title="Messages"
              >
                <FaEnvelope className="text-lg" />
                {messageCount > 0 && (
                  <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs font-bold w-5 h-5 rounded-full flex items-center justify-center">
                    {messageCount}
                  </span>
                )}
              </motion.button>

              {/* Messages Dropdown */}
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: messageDropdown ? 1 : 0, y: messageDropdown ? 0 : -10 }}
                transition={{ duration: 0.2 }}
                className={`absolute right-0 mt-2 w-80 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden ${
                  messageDropdown ? 'block' : 'hidden'
                }`}
              >
                <div className="max-h-96 overflow-y-auto">
                  {messages.map((msg) => (
                    <div key={msg.id} className="px-4 py-3 border-b border-gray-100 dark:border-gray-700 hover:bg-blue-50 dark:hover:bg-gray-700 transition-colors cursor-pointer">
                      <p className="text-sm font-semibold text-gray-900 dark:text-white">{msg.sender}</p>
                      <p className="text-sm text-gray-600 dark:text-gray-400 truncate">{msg.message}</p>
                      <p className="text-xs text-gray-500 dark:text-gray-500">{msg.time}</p>
                    </div>
                  ))}
                </div>
                <Link to="/messages" className="block text-center px-4 py-3 text-blue-600 dark:text-blue-400 hover:bg-gray-100 dark:hover:bg-gray-700 font-semibold text-sm border-t border-gray-200 dark:border-gray-700">
                  View All Messages
                </Link>
              </motion.div>
            </div>

            {/* Saved/Wishlist */}
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => navigate('/saved')}
              className="relative text-gray-700 dark:text-gray-300 hover:text-red-600 transition-colors"
              title="Saved items"
            >
              <FaHeart className="text-lg" />
              {savedCount > 0 && (
                <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs font-bold w-5 h-5 rounded-full flex items-center justify-center">
                  {savedCount}
                </span>
              )}
            </motion.button>

            {/* Bookings */}
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => navigate('/dashboard')}
              className="text-gray-700 dark:text-gray-300 hover:text-blue-600 transition-colors"
              title="My bookings"
            >
              <FaCalendarAlt className="text-lg" />
            </motion.button>
          </div>

          {/* Settings Group */}
          <div className="flex items-center gap-2 lg:gap-3 pr-3 lg:pr-4 border-r border-gray-200 dark:border-gray-700">
            {/* Theme Toggle */}
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
              onClick={toggleTheme}
              className="text-gray-700 dark:text-gray-300 hover:text-blue-600 transition-colors"
              title={isDark ? "Light mode" : "Dark mode"}
            >
              {isDark ? <FaSun className="text-lg" /> : <FaMoon className="text-lg" />}
            </motion.button>

            {/* Language Selector */}
            <div className="relative">
              <motion.button
                onClick={() => setLanguageDropdown(!languageDropdown)}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="flex items-center gap-1 text-gray-700 dark:text-gray-300 hover:text-blue-600 transition-colors text-sm font-medium"
                title="Change language"
              >
                <FaGlobe className="text-lg" />
                <span className="hidden lg:inline">{language.toUpperCase()}</span>
              </motion.button>

              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: languageDropdown ? 1 : 0, y: languageDropdown ? 0 : -10 }}
                transition={{ duration: 0.2 }}
                className={`absolute right-0 mt-2 w-40 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden ${
                  languageDropdown ? 'block' : 'hidden'
                }`}
              >
                {['en', 'es', 'fr', 'de'].map((lang) => (
                  <button
                    key={lang}
                    onClick={() => {
                      setLanguage(lang);
                      setLanguageDropdown(false);
                    }}
                    className={`w-full text-left px-4 py-2 text-sm transition-colors ${
                      language === lang
                        ? 'bg-blue-600 text-white'
                        : 'text-gray-700 dark:text-gray-300 hover:bg-blue-50 dark:hover:bg-gray-700'
                    }`}
                  >
                    {lang === 'en' ? 'English' : lang === 'es' ? 'Español' : lang === 'fr' ? 'Français' : 'Deutsch'}
                  </button>
                ))}
              </motion.div>
            </div>
          </div>

          {/* User & Host Group */}
          <div className="flex items-center gap-3 lg:gap-4">
            {/* Host Mode Toggle - only show on larger screens */}
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setHostMode(!hostMode)}
              className={`hidden lg:inline-flex px-3 py-1.5 rounded-lg font-medium text-sm transition-all ${
                hostMode
                  ? 'bg-purple-600 text-white'
                  : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
              }`}
            >
              {hostMode ? 'Host Mode' : 'Become Host'}
            </motion.button>

            {/* User Dropdown */}
            <div className="relative">
              <motion.button
                onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
              >
                {user?.avatar ? (
                  <img src={user.avatar} alt="Profile" className="w-6 h-6 rounded-full" />
                ) : (
                  <FaUser className="text-gray-700 dark:text-gray-300 text-sm" />
                )}
                <span className="text-gray-700 dark:text-gray-300 font-medium text-sm hidden lg:inline">
                  {user?.email ? user.email.split('@')[0] : 'Account'}
                </span>
              </motion.button>

              {/* Dropdown Menu */}
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: userDropdownOpen ? 1 : 0, y: userDropdownOpen ? 0 : -10 }}
                transition={{ duration: 0.2 }}
                className={`absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden ${
                  userDropdownOpen ? 'block' : 'hidden'
                }`}
              >
                <Link
                  to="/profile"
                  className="block px-4 py-3 text-gray-700 dark:text-gray-300 hover:bg-blue-50 dark:hover:bg-gray-700 transition-colors border-b border-gray-100 dark:border-gray-700 text-sm"
                  onClick={() => setUserDropdownOpen(false)}
                >
                  <FaUser className="inline mr-2 text-blue-600" />
                  My Profile
                </Link>
                {hostMode && (
                  <Link
                    to="/host/dashboard"
                    className="block px-4 py-3 text-gray-700 dark:text-gray-300 hover:bg-blue-50 dark:hover:bg-gray-700 transition-colors border-b border-gray-100 dark:border-gray-700 text-sm"
                    onClick={() => setUserDropdownOpen(false)}
                  >
                    <FaHome className="inline mr-2 text-purple-600" />
                    Host Dashboard
                  </Link>
                )}
                <button
                  onClick={() => {
                    handleLogout();
                    setUserDropdownOpen(false);
                  }}
                  className="w-full text-left px-4 py-3 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-gray-700 transition-colors text-sm flex items-center"
                >
                  <FaSignOutAlt className="mr-2" />
                  Logout
                </button>
              </motion.div>
            </div>
          </div>
        </div>

        {/* Mobile Menu Button */}
        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="md:hidden text-gray-700 text-2xl"
        >
          {mobileMenuOpen ? <FaTimes /> : <FaBars />}
        </motion.button>
      </div>

      {/* Mobile Menu */}
      <motion.div
        initial={{ opacity: 0, height: 0 }}
        animate={{ opacity: mobileMenuOpen ? 1 : 0, height: mobileMenuOpen ? 'auto' : 0 }}
        transition={{ duration: 0.3 }}
        className="md:hidden overflow-hidden bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700"
      >
        <div className="pt-4 pb-4 space-y-4">
          
          {/* Mobile Search */}
          <form onSubmit={handleSearch} className="px-4">
            <div className="relative">
              <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                placeholder="Search properties..."
                className="w-full pl-10 pr-4 py-2 border-2 border-gray-200 dark:border-gray-700 rounded-lg focus:outline-none focus:border-blue-500 dark:bg-gray-700 dark:text-white transition-colors"
              />
            </div>
          </form>

          {/* Mobile Navigation Links */}
          <div className="px-4 space-y-4">
            {/* Mobile Search */}
            <form onSubmit={handleSearch}>
              <div className="relative">
                <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  value={searchInput}
                  onChange={(e) => setSearchInput(e.target.value)}
                  placeholder="Search properties..."
                  className="w-full pl-10 pr-4 py-2 border-2 border-gray-200 dark:border-gray-700 rounded-lg focus:outline-none focus:border-blue-500 dark:bg-gray-700 dark:text-white transition-colors"
                />
              </div>
            </form>

            {/* Quick Actions Section */}
            <div className="space-y-2 pt-2">
              <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase">Quick Actions</p>
              
              <Link
                to="/dashboard"
                className="flex items-center justify-between py-2 px-2 text-gray-700 dark:text-gray-300 hover:bg-blue-50 dark:hover:bg-gray-700 rounded transition-colors"
                onClick={() => setMobileMenuOpen(false)}
              >
                <span className="font-medium">My Bookings</span>
                <FaCalendarAlt className="text-blue-600" />
              </Link>

              <button
                onClick={() => {
                  navigate('/saved');
                  setMobileMenuOpen(false);
                }}
                className="flex items-center justify-between w-full py-2 px-2 text-gray-700 dark:text-gray-300 hover:bg-blue-50 dark:hover:bg-gray-700 rounded transition-colors"
              >
                <span className="font-medium">Saved Items {savedCount > 0 && `(${savedCount})`}</span>
                <FaHeart className="text-red-600" />
              </button>

              <button
                onClick={() => {
                  navigate('/messages');
                  setMobileMenuOpen(false);
                }}
                className="flex items-center justify-between w-full py-2 px-2 text-gray-700 dark:text-gray-300 hover:bg-blue-50 dark:hover:bg-gray-700 rounded transition-colors"
              >
                <span className="font-medium">Messages {messageCount > 0 && `(${messageCount})`}</span>
                <FaEnvelope className="text-blue-600" />
              </button>
            </div>

            {/* Settings Section */}
            <div className="space-y-2 pt-2 border-t border-gray-200 dark:border-gray-700">
              <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase">Settings</p>

              {/* Host Mode Toggle */}
              <button
                onClick={() => setHostMode(!hostMode)}
                className={`w-full flex items-center justify-between px-2 py-2 rounded transition-all ${
                  hostMode
                    ? 'bg-purple-600 text-white'
                    : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                }`}
              >
                <span className="font-medium text-sm">{hostMode ? 'Host Mode ON' : 'Become Host'}</span>
              </button>

              {/* Theme Toggle */}
              <button
                onClick={toggleTheme}
                className="flex items-center justify-between w-full px-2 py-2 bg-gray-100 dark:bg-gray-700 rounded text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors font-medium text-sm"
              >
                <span>Dark Mode</span>
                {isDark ? <FaSun className="text-yellow-500" /> : <FaMoon className="text-gray-600" />}
              </button>

              {/* Language Selector */}
              <div className="pb-2">
                <label className="text-gray-700 dark:text-gray-300 font-medium text-sm block mb-2">Language</label>
                <select
                  value={language}
                  onChange={(e) => setLanguage(e.target.value)}
                  className="w-full px-3 py-2 border-2 border-gray-200 dark:border-gray-700 rounded-lg focus:outline-none focus:border-blue-500 dark:bg-gray-700 dark:text-white text-sm"
                >
                  <option value="en">English</option>
                  <option value="es">Español</option>
                  <option value="fr">Français</option>
                  <option value="de">Deutsch</option>
                </select>
              </div>
            </div>

          {/* Mobile User Links */}
          {user ? (
            <div className="px-4 pt-3 border-t border-gray-200 dark:border-gray-700 space-y-3">
              <Link
                to="/profile"
                className="block text-gray-700 dark:text-gray-300 hover:text-blue-600 font-semibold"
                onClick={() => setMobileMenuOpen(false)}
              >
                My Profile
              </Link>
              {hostMode && (
                <Link
                  to="/host/dashboard"
                  className="block text-gray-700 dark:text-gray-300 hover:text-blue-600 font-semibold"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Host Dashboard
                </Link>
              )}
              <button
                onClick={() => {
                  handleLogout();
                  setMobileMenuOpen(false);
                }}
                className="w-full text-left text-red-600 dark:text-red-400 hover:text-red-700 font-semibold"
              >
                Logout
              </button>
            </div>
          ) : (
            <div className="px-4 pt-3 border-t border-gray-200 dark:border-gray-700 space-y-3">
              <Link
                to="/login"
                className="block text-center px-4 py-2 text-blue-600 dark:text-blue-400 border-2 border-blue-600 dark:border-blue-400 rounded-lg font-semibold hover:bg-blue-50 dark:hover:bg-gray-700 transition-colors"
                onClick={() => setMobileMenuOpen(false)}
              >
                Login
              </Link>
              <Link
                to="/register"
                className="block text-center px-4 py-2 bg-blue-600 dark:bg-blue-700 text-white rounded-lg font-semibold hover:bg-blue-700 dark:hover:bg-blue-800 transition-colors"
                onClick={() => setMobileMenuOpen(false)}
              >
                Register
              </Link>
            </div>
          )}
        </div>
      </motion.div>
    </nav>
  );
}
