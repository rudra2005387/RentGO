import { useState } from 'react';
import { motion } from 'framer-motion';
import { FaMapMarkerAlt, FaCalendar, FaUsers, FaSearch } from 'react-icons/fa';

const AdvancedSearchBar = ({ onSearch, variant = 'hero' }) => {
  const [location, setLocation] = useState('');
  const [checkIn, setCheckIn] = useState('');
  const [checkOut, setCheckOut] = useState('');
  const [guests, setGuests] = useState(1);

  const handleSearch = (e) => {
    e.preventDefault();
    if (onSearch) {
      onSearch({ location, checkIn, checkOut, guests });
    }
  };

  const heroClass = variant === 'hero'
    ? 'bg-white shadow-lg rounded-full p-2 flex flex-col sm:flex-row gap-2 sm:gap-0'
    : 'bg-white border border-gray-200 rounded-lg p-4 flex flex-col sm:flex-row gap-3 sm:gap-4';

  const inputClass = variant === 'hero'
    ? 'flex-1 px-4 py-3 sm:py-2 text-sm border-0 focus:outline-none focus:ring-0'
    : 'flex-1 px-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-600';

  return (
    <motion.form
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      onSubmit={handleSearch}
      className={heroClass}
    >
      {/* Location Input */}
      <div className={`flex-1 flex items-center gap-3 ${variant === 'hero' ? 'border-0 sm:border-r' : ''}`}>
        <FaMapMarkerAlt className="text-gray-400 ml-2" />
        <input
          type="text"
          placeholder="Where are you going?"
          value={location}
          onChange={(e) => setLocation(e.target.value)}
          className={`${inputClass} sm:border-0 sm:rounded-none sm:bg-transparent`}
        />
      </div>

      {/* Check-in Date */}
      {variant === 'hero' && (
        <div className={`flex-1 flex items-center gap-3 sm:border-r sm:border-l`}>
          <FaCalendar className="text-gray-400 ml-2" />
          <input
            type="date"
            value={checkIn}
            onChange={(e) => setCheckIn(e.target.value)}
            className={`${inputClass} sm:border-0 sm:rounded-none sm:bg-transparent`}
            placeholder="Check in"
          />
        </div>
      )}

      {/* Check-out Date */}
      {variant === 'hero' && (
        <div className={`flex-1 flex items-center gap-3 sm:border-r sm:border-l`}>
          <FaCalendar className="text-gray-400 ml-2" />
          <input
            type="date"
            value={checkOut}
            onChange={(e) => setCheckOut(e.target.value)}
            className={`${inputClass} sm:border-0 sm:rounded-none sm:bg-transparent`}
            placeholder="Check out"
          />
        </div>
      )}

      {/* Guests */}
      {variant === 'hero' && (
        <div className={`flex-1 flex items-center gap-3 sm:border-r sm:border-l`}>
          <FaUsers className="text-gray-400 ml-2" />
          <select
            value={guests}
            onChange={(e) => setGuests(e.target.value)}
            className={`${inputClass} sm:border-0 sm:rounded-none sm:bg-transparent`}
          >
            {[1, 2, 3, 4, 5, 6, 8, 10].map(num => (
              <option key={num} value={num}>{num} {num === 1 ? 'Guest' : 'Guests'}</option>
            ))}
          </select>
        </div>
      )}

      {/* Search Button */}
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        type="submit"
        className={`
          flex items-center justify-center gap-2 font-semibold
          ${variant === 'hero'
            ? 'bg-gradient-to-r from-pink-500 to-red-400 hover:from-pink-600 hover:to-red-500 text-white px-8 py-3 rounded-full'
            : 'bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg'
          }
          transition-all duration-300
        `}
      >
        <FaSearch className="w-4 h-4" />
        <span className="hidden sm:inline">Search</span>
      </motion.button>
    </motion.form>
  );
};

export default AdvancedSearchBar;
