import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FaBell, FaEnvelope, FaUser, FaSignOutAlt, FaSearch, FaBars, FaTimes, FaHome, FaMoon, FaSun, FaGlobe, FaHeart, FaCalendarAlt, FaMapMarkerAlt } from 'react-icons/fa';
import { useAuth } from '../../hooks/useAuth';
import { useTheme } from '../../context/ThemeContext';

export default function AirbnbStyleNavbar() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const isDark = theme === 'dark';
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const handleLogout = () => {
    logout();
    setUserDropdownOpen(false);
    navigate('/');
  };

  return (
    <>
      {/* ====== HEADER ====== */}
      <header className={`header ${scrolled ? 'shadow-md' : ''}`}>
        <div className="header-container">
          {/* LEFT: Logo */}
          <div className="header-left">
            <Link to="/" className="logo">RentGo</Link>
          </div>

          {/* CENTER: Navigation */}
          <nav className="main-nav">
            <Link to="/" className="nav-link">Homes</Link>
            <Link to="/search" className="nav-link">Experiences</Link>
            <a href="#" className="nav-link">Services</a>
          </nav>

          {/* RIGHT: User actions */}
          <div className="header-right">
            <a href="#" className="become-host-link hidden lg:inline">Become a Host</a>

            <button className="globe-btn" aria-label="Change language">
              <FaGlobe />
            </button>

            <div className="relative">
              <button
                onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                className="user-menu-btn"
                aria-expanded={userDropdownOpen}
              >
                <FaBars className="hamburger-icon" />
                {user?.avatar ? (
                  <img src={user.avatar} alt="Profile" className="user-icon rounded-full" />
                ) : (
                  <FaUser className="user-icon" />
                )}
              </button>

              <motion.div
                initial={{ opacity: 0, y: -6 }}
                animate={{ opacity: userDropdownOpen ? 1 : 0, y: userDropdownOpen ? 0 : -6 }}
                transition={{ duration: 0.15 }}
                className={`absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-lg border border-[#EBEBEB] overflow-hidden ${userDropdownOpen ? 'block' : 'hidden'}`}
              >
                <div className="px-4 py-3 border-b border-[#EBEBEB]">
                  {user ? (
                    <>
                      <p className="text-sm font-semibold text-black">{user.email?.split('@')[0]}</p>
                      <p className="text-xs text-gray-600">{user.email}</p>
                    </>
                  ) : (
                    <p className="text-sm text-gray-600">Not logged in</p>
                  )}
                </div>

                {user ? (
                  <>
                    <Link to="/profile" className="block px-4 py-3 text-sm text-black hover:bg-[#F7F7F7]">My Profile</Link>
                    <Link to="/dashboard" className="block px-4 py-3 text-sm text-black hover:bg-[#F7F7F7] border-b border-[#EBEBEB]">My Bookings</Link>
                    <button onClick={handleLogout} className="w-full text-left px-4 py-3 text-sm text-red-600 hover:bg-red-50">Logout</button>
                  </>
                ) : (
                  <>
                    <Link to="/login" className="block px-4 py-3 text-sm text-black hover:bg-[#F7F7F7]">Log In</Link>
                    <Link to="/register" className="block px-4 py-3 text-sm text-black hover:bg-[#F7F7F7] border-b border-[#EBEBEB]">Sign Up</Link>
                  </>
                )}
              </motion.div>
            </div>

            {/* Mobile menu toggle for very small screens */}
            <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="md:hidden text-2xl text-black">
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
        className="md:hidden bg-white border-b border-[#EBEBEB] overflow-hidden"
      >
        <div className="container py-4 space-y-2">
          <Link to="/" className="block px-4 py-2 text-black hover:bg-[#F7F7F7] rounded-lg transition-colors">
            Homes
          </Link>
          <Link to="/search" className="block px-4 py-2 text-black hover:bg-[#F7F7F7] rounded-lg transition-colors">
            Experiences
          </Link>
          <a href="#" className="block px-4 py-2 text-black hover:bg-[#F7F7F7] rounded-lg transition-colors">
            Become a Host
          </a>
        </div>
      </motion.div>
    </>
  );
}
