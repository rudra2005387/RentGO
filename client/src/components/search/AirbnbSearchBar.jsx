import { useState } from 'react';
import { motion } from 'framer-motion';
import { FaSearch, FaMapMarkerAlt, FaCalendarAlt, FaUsers } from 'react-icons/fa';

export default function AirbnbSearchBar({ onSearch, variant = 'default' }) {
  const [location, setLocation] = useState('');
  const [checkIn, setCheckIn] = useState('');
  const [checkOut, setCheckOut] = useState('');
  const [guests, setGuests] = useState('');
  const [activeSection, setActiveSection] = useState(null);

  const handleSearch = (e) => {
    e.preventDefault();
    if (onSearch) {
      onSearch({
        location,
        checkIn,
        checkOut,
        guests
      });
    }
  };

  if (variant === 'hero') {
    return (
      <form onSubmit={handleSearch} className="w-full">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="bg-white rounded-full shadow-md px-6 py-4 flex items-center gap-4 max-w-4xl mx-auto"
        >
          {/* Location */}
          <div className="flex-1">
            <input
              type="text"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="Where are you going?"
              className="w-full bg-transparent text-base placeholder-gray-400 outline-none text-black font-medium"
            />
          </div>

          {/* Check-in */}
          <div className="flex-1 border-l border-[#DDDDDD] pl-4">
            <input
              type="date"
              value={checkIn}
              onChange={(e) => setCheckIn(e.target.value)}
              className="w-full bg-transparent text-base outline-none text-black font-medium"
            />
          </div>

          {/* Check-out */}
          <div className="flex-1 border-l border-[#DDDDDD] pl-4">
            <input
              type="date"
              value={checkOut}
              onChange={(e) => setCheckOut(e.target.value)}
              className="w-full bg-transparent text-base outline-none text-black font-medium"
            />
          </div>

          {/* Guests */}
          <div className="flex-1 border-l border-[#DDDDDD] pl-4">
            <input
              type="number"
              value={guests}
              onChange={(e) => setGuests(e.target.value)}
              placeholder="Guests"
              min="1"
              className="w-full bg-transparent text-base placeholder-gray-400 outline-none text-black font-medium"
            />
          </div>

          {/* Search Button */}
          <button
            type="submit"
            className="w-12 h-12 rounded-full bg-gradient-to-r from-[#E61E4D] to-[#D70466] flex items-center justify-center text-white text-xl hover:scale-105 transition-transform shadow-lg flex-shrink-0"
          >
            <FaSearch />
          </button>
        </motion.div>
      </form>
    );
  }

  return (
    <form onSubmit={handleSearch} className="w-full">
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="bg-white rounded-full shadow-md px-2 py-2 flex items-center gap-2 max-w-2xl mx-auto h-16 relative"
      >
        {/* Location Section */}
        <motion.div
          onClick={() => setActiveSection('location')}
          className={`flex-1 px-6 py-3 rounded-full cursor-pointer transition-all ${
            activeSection === 'location' ? 'bg-[#F7F7F7]' : 'hover:bg-[#F7F7F7]'
          }`}
        >
          <div className="text-xs font-semibold text-black mb-1">Where</div>
          <input
            type="text"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            placeholder="Search destinations"
            className="bg-transparent text-sm text-gray-600 outline-none w-full placeholder-gray-400"
          />
        </motion.div>

        {/* Divider */}
        <div className="w-px h-8 bg-[#DDDDDD]"></div>

        {/* Check-in Section */}
        <motion.div
          onClick={() => setActiveSection('checkin')}
          className={`flex-1 px-6 py-3 rounded-full cursor-pointer transition-all ${
            activeSection === 'checkin' ? 'bg-[#F7F7F7]' : 'hover:bg-[#F7F7F7]'
          }`}
        >
          <div className="text-xs font-semibold text-black mb-1">Check in</div>
          <input
            type="date"
            value={checkIn}
            onChange={(e) => setCheckIn(e.target.value)}
            className="bg-transparent text-sm text-gray-600 outline-none w-full"
          />
        </motion.div>

        {/* Divider */}
        <div className="w-px h-8 bg-[#DDDDDD]"></div>

        {/* Check-out Section */}
        <motion.div
          onClick={() => setActiveSection('checkout')}
          className={`flex-1 px-6 py-3 rounded-full cursor-pointer transition-all ${
            activeSection === 'checkout' ? 'bg-[#F7F7F7]' : 'hover:bg-[#F7F7F7]'
          }`}
        >
          <div className="text-xs font-semibold text-black mb-1">Check out</div>
          <input
            type="date"
            value={checkOut}
            onChange={(e) => setCheckOut(e.target.value)}
            className="bg-transparent text-sm text-gray-600 outline-none w-full"
          />
        </motion.div>

        {/* Divider */}
        <div className="w-px h-8 bg-[#DDDDDD]"></div>

        {/* Guests Section */}
        <motion.div
          onClick={() => setActiveSection('guests')}
          className={`flex-1 px-6 py-3 rounded-full cursor-pointer transition-all ${
            activeSection === 'guests' ? 'bg-[#F7F7F7]' : 'hover:bg-[#F7F7F7]'
          }`}
        >
          <div className="text-xs font-semibold text-black mb-1">Who</div>
          <input
            type="number"
            value={guests}
            onChange={(e) => setGuests(e.target.value)}
            placeholder="Add guests"
            min="1"
            className="bg-transparent text-sm text-gray-600 outline-none w-full placeholder-gray-400"
          />
        </motion.div>

        {/* Search Button */}
        <button
          type="submit"
          className="w-12 h-12 rounded-full bg-gradient-to-r from-[#E61E4D] to-[#D70466] flex items-center justify-center text-white text-lg hover:scale-105 transition-transform shadow-lg flex-shrink-0 mr-1"
        >
          <FaSearch />
        </button>
      </motion.div>
    </form>
  );
}
