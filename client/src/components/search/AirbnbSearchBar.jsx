import { useState } from 'react';
import { FaSearch } from 'react-icons/fa';

export default function AirbnbSearchBar({ onSearch }) {
  const [location, setLocation] = useState('');
  const [dates, setDates] = useState('');
  const [guests, setGuests] = useState('');

  const handleSearch = (e) => {
    e.preventDefault();
    if (onSearch) {
      onSearch({ location, checkIn: dates, checkOut: '', guests });
    }
  };

  return (
    <form onSubmit={handleSearch}>
      <div className="flex flex-row items-center bg-white rounded-full shadow-md border border-[#DDDDDD] mx-auto w-fit hover:shadow-lg transition-shadow">
        {/* Where */}
        <div className="px-6 py-3 cursor-pointer rounded-full hover:bg-[#F7F7F7] transition-colors">
          <div className="text-xs font-semibold text-[#222222]">Where</div>
          <input
            type="text"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            placeholder="Search destinations"
            className="bg-transparent text-sm text-[#717171] placeholder-[#717171] outline-none w-full min-w-[140px]"
          />
        </div>

        <div className="w-px h-8 bg-[#DDDDDD]" />

        {/* When */}
        <div className="px-6 py-3 cursor-pointer rounded-full hover:bg-[#F7F7F7] transition-colors">
          <div className="text-xs font-semibold text-[#222222]">When</div>
          <input
            type="text"
            value={dates}
            onChange={(e) => setDates(e.target.value)}
            placeholder="Add dates"
            className="bg-transparent text-sm text-[#717171] placeholder-[#717171] outline-none w-full min-w-[100px]"
          />
        </div>

        <div className="w-px h-8 bg-[#DDDDDD]" />

        {/* Who */}
        <div className="px-6 py-3 cursor-pointer rounded-full hover:bg-[#F7F7F7] transition-colors">
          <div className="text-xs font-semibold text-[#222222]">Who</div>
          <input
            type="text"
            value={guests}
            onChange={(e) => setGuests(e.target.value)}
            placeholder="Add guests"
            className="bg-transparent text-sm text-[#717171] placeholder-[#717171] outline-none w-full min-w-[100px]"
          />
        </div>

        {/* Search Button */}
        <button
          type="submit"
          className="w-12 h-12 bg-[#FF385C] rounded-full flex items-center justify-center mr-2 hover:bg-[#E31C5F] transition-colors flex-shrink-0"
        >
          <FaSearch className="text-white text-sm" />
        </button>
      </div>
    </form>
  );
}
