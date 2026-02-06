import { useState } from 'react';
import { motion } from 'framer-motion';
import { FaSearch, FaMapMarkerAlt, FaCalendarAlt, FaUsers } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import CategoryFilter from '../CategoryFilter';

const SearchBar = () => {
  const navigate = useNavigate();
  const [location, setLocation] = useState('');
  const [checkIn, setCheckIn] = useState('');
  const [checkOut, setCheckOut] = useState('');
  const [guests, setGuests] = useState(1);
  const [expandedMobile, setExpandedMobile] = useState(false);

  const handleSearch = (e) => {
    e.preventDefault();
    const searchParams = new URLSearchParams({
      location: location || 'all',
      checkIn: checkIn || '',
      checkOut: checkOut || '',
      guests: guests
    });
    navigate(`/search?${searchParams.toString()}`);
  };

  return (
    <motion.form
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: 0.8 }}
      onSubmit={handleSearch}
      className="w-full max-w-6xl mx-auto bg-white/95 backdrop-blur-md rounded-2xl shadow-2xl p-4 sm:p-6 border border-white/50"
    >
      {/* Category Filter */}
      <div className="mb-6">
        <CategoryFilter />
      </div>

      {/* Main Search Inputs */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-3 md:gap-4">
        {/* Location Input */}
        <motion.div 
          whileFocus={{ scale: 1.02 }}
          className="relative col-span-1 md:col-span-2"
        >
          <FaMapMarkerAlt className="absolute top-1/2 left-4 -translate-y-1/2 text-gray-400 pointer-events-none" />
          <input
            type="text"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            placeholder="City, address, or zip"
            className="w-full pl-12 pr-4 py-3 md:py-4 bg-transparent border-2 border-gray-200 rounded-xl focus:outline-none focus:border-blue-500 focus:bg-blue-50/50 transition-all text-sm md:text-base"
          />
        </motion.div>

        {/* Check-in Date */}
        <motion.div whileFocus={{ scale: 1.02 }} className="relative">
          <FaCalendarAlt className="absolute top-1/2 left-4 -translate-y-1/2 text-gray-400 pointer-events-none" />
          <input
            type="date"
            value={checkIn}
            onChange={(e) => setCheckIn(e.target.value)}
            className="w-full pl-12 pr-4 py-3 md:py-4 bg-transparent border-2 border-gray-200 rounded-xl focus:outline-none focus:border-blue-500 focus:bg-blue-50/50 transition-all text-sm md:text-base"
          />
        </motion.div>

        {/* Check-out Date */}
        <motion.div whileFocus={{ scale: 1.02 }} className="relative">
          <FaCalendarAlt className="absolute top-1/2 left-4 -translate-y-1/2 text-gray-400 pointer-events-none" />
          <input
            type="date"
            value={checkOut}
            onChange={(e) => setCheckOut(e.target.value)}
            className="w-full pl-12 pr-4 py-3 md:py-4 bg-transparent border-2 border-gray-200 rounded-xl focus:outline-none focus:border-blue-500 focus:bg-blue-50/50 transition-all text-sm md:text-base"
          />
        </motion.div>

        {/* Guest Counter */}
        <motion.div 
          whileFocus={{ scale: 1.02 }}
          className="relative flex items-center"
        >
          <FaUsers className="absolute left-4 text-gray-400 pointer-events-none" />
          <select
            value={guests}
            onChange={(e) => setGuests(parseInt(e.target.value))}
            className="w-full pl-12 pr-4 py-3 md:py-4 bg-transparent border-2 border-gray-200 rounded-xl focus:outline-none focus:border-blue-500 focus:bg-blue-50/50 transition-all appearance-none text-sm md:text-base"
          >
            {[1, 2, 3, 4, 5, 6, 7, 8].map((num) => (
              <option key={num} value={num}>
                {num} {num === 1 ? 'Guest' : 'Guests'}
              </option>
            ))}
          </select>
        </motion.div>

        {/* Search Button */}
        <motion.button
          type="submit"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="col-span-1 md:col-span-2 lg:col-span-1 w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-bold py-3 md:py-4 px-6 md:px-8 rounded-xl flex items-center justify-center gap-2 transform transition-all duration-300 shadow-lg hover:shadow-xl text-sm md:text-base"
        >
          <FaSearch className="hidden md:inline" />
          <span>Search</span>
        </motion.button>
      </div>

      {/* Mobile Expanded Info */}
      {expandedMobile && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
          className="mt-4 p-4 bg-blue-50 rounded-xl text-sm text-gray-700"
        >
          <p>📍 {location || 'Select a location'}</p>
          <p>📅 {checkIn ? `Check-in: ${checkIn}` : 'Select check-in date'}</p>
          <p>📅 {checkOut ? `Check-out: ${checkOut}` : 'Select check-out date'}</p>
          <p>👥 {guests} {guests === 1 ? 'guest' : 'guests'}</p>
        </motion.div>
      )}
    </motion.form>
  );
};

export default SearchBar;
