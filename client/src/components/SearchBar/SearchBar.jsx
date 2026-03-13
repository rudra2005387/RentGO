import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export default function SearchBar() {
  const navigate = useNavigate();
  const [expanded, setExpanded] = useState(false);
  const [city, setCity] = useState('');
  const [checkIn, setCheckIn] = useState('');
  const [checkOut, setCheckOut] = useState('');
  const [guests, setGuests] = useState(1);
  const [suggestions, setSuggestions] = useState([]);
  const [suggestLoading, setSuggestLoading] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const barRef = useRef(null);

  // Close on outside click
  useEffect(() => {
    const handler = (e) => {
      if (barRef.current && !barRef.current.contains(e.target)) setExpanded(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const handleSearch = () => {
    const params = new URLSearchParams();
    if (city.trim()) params.set('city', city.trim());
    if (checkIn) params.set('checkInDate', checkIn);
    if (checkOut) params.set('checkOutDate', checkOut);
    if (guests > 1) params.set('guests', guests);
    navigate(`/search?${params.toString()}`);
    setExpanded(false);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') handleSearch();
  };

  const today = new Date().toISOString().split('T')[0];

  useEffect(() => {
    const query = city.trim();
    if (query.length < 2) {
      setSuggestions([]);
      return;
    }

    const t = setTimeout(async () => {
      setSuggestLoading(true);
      try {
        const res = await fetch(`${API_BASE}/listings/suggestions?q=${encodeURIComponent(query)}&limit=6`);
        const data = await res.json();
        if (data.success) {
          setSuggestions(data.data?.suggestions || []);
          setShowSuggestions(true);
        }
      } catch {
        setSuggestions([]);
      } finally {
        setSuggestLoading(false);
      }
    }, 300);

    return () => clearTimeout(t);
  }, [city]);

  const selectSuggestion = (value) => {
    setCity(value);
    setShowSuggestions(false);
  };

  // ─── Compact pill (collapsed) ──────────────────────────────────────────
  if (!expanded) {
    return (
      <button
        onClick={() => setExpanded(true)}
        className="flex items-center border border-[#DDDDDD] rounded-full shadow-sm hover:shadow-md transition-shadow px-4 py-2 gap-3 bg-white cursor-pointer"
      >
        <span className="text-sm font-semibold text-[#222222] hidden sm:inline">Anywhere</span>
        <span className="w-px h-6 bg-[#DDDDDD] hidden sm:block" />
        <span className="text-sm font-semibold text-[#222222] hidden sm:inline">Any week</span>
        <span className="w-px h-6 bg-[#DDDDDD] hidden sm:block" />
        <span className="text-sm text-[#717171] hidden sm:inline">Add guests</span>
        <span className="text-sm text-[#717171] sm:hidden">Search</span>
        <div className="w-8 h-8 bg-[#FF385C] rounded-full flex items-center justify-center ml-1 flex-shrink-0">
          <svg viewBox="0 0 32 32" className="w-3 h-3 fill-none stroke-white" strokeWidth="4">
            <circle cx="13" cy="13" r="11" />
            <path d="M21 21l9 9" />
          </svg>
        </div>
      </button>
    );
  }

  // ─── Expanded bar ──────────────────────────────────────────────────────
  return (
    <>
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black/20 z-40" onClick={() => setExpanded(false)} />

      <div ref={barRef} className="fixed left-1/2 -translate-x-1/2 top-[10px] z-50 w-[95vw] max-w-[850px]">
        <AnimatePresence>
          {/* Desktop pill */}
          <motion.div
            initial={{ opacity: 0, y: -8, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.97 }}
            transition={{ duration: 0.2 }}
            className="hidden md:flex bg-white rounded-full border border-[#DDDDDD] shadow-lg items-center"
          >
            {/* Where */}
            <div className="relative flex-1 px-6 py-3 rounded-full hover:bg-[#EBEBEB] transition-colors">
              <label className="block text-xs font-bold text-[#222222]">Where</label>
              <input
                type="text"
                value={city}
                onChange={(e) => setCity(e.target.value)}
                onKeyDown={handleKeyDown}
                onFocus={() => setShowSuggestions(true)}
                placeholder="Search destinations"
                className="w-full text-sm text-[#222222] placeholder-[#717171] bg-transparent outline-none"
                autoFocus
              />
              {showSuggestions && city.trim().length >= 2 && (
                <div className="absolute mt-2 w-[280px] max-h-64 overflow-auto rounded-2xl border border-[#DDDDDD] bg-white shadow-xl z-[60]">
                  {suggestLoading && <p className="px-4 py-3 text-sm text-[#717171]">Searching...</p>}
                  {!suggestLoading && suggestions.length === 0 && <p className="px-4 py-3 text-sm text-[#717171]">No suggestions</p>}
                  {!suggestLoading && suggestions.map((item) => (
                    <button
                      key={item}
                      type="button"
                      onClick={() => selectSuggestion(item)}
                      className="w-full text-left px-4 py-3 text-sm text-[#222222] hover:bg-[#F7F7F7]"
                    >
                      {item}
                    </button>
                  ))}
                </div>
              )}
            </div>

            <span className="w-px h-8 bg-[#DDDDDD]" />

            {/* Check in */}
            <div className="px-4 py-3 rounded-full hover:bg-[#EBEBEB] transition-colors">
              <label className="block text-xs font-bold text-[#222222]">Check in</label>
              <input
                type="date"
                value={checkIn}
                onChange={(e) => setCheckIn(e.target.value)}
                min={today}
                className="text-sm text-[#222222] bg-transparent outline-none cursor-pointer"
              />
            </div>

            <span className="w-px h-8 bg-[#DDDDDD]" />

            {/* Check out */}
            <div className="px-4 py-3 rounded-full hover:bg-[#EBEBEB] transition-colors">
              <label className="block text-xs font-bold text-[#222222]">Check out</label>
              <input
                type="date"
                value={checkOut}
                onChange={(e) => setCheckOut(e.target.value)}
                min={checkIn || today}
                className="text-sm text-[#222222] bg-transparent outline-none cursor-pointer"
              />
            </div>

            <span className="w-px h-8 bg-[#DDDDDD]" />

            {/* Guests */}
            <div className="flex items-center gap-2 pl-4 pr-2 py-3 rounded-full hover:bg-[#EBEBEB] transition-colors">
              <div>
                <label className="block text-xs font-bold text-[#222222]">Who</label>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setGuests((g) => Math.max(1, g - 1))}
                    className="w-6 h-6 rounded-full border border-[#B0B0B0] text-[#717171] flex items-center justify-center text-sm hover:border-[#222222] hover:text-[#222222] transition-colors"
                    type="button"
                  >
                    −
                  </button>
                  <span className="text-sm font-medium text-[#222222] w-4 text-center">{guests}</span>
                  <button
                    onClick={() => setGuests((g) => Math.min(16, g + 1))}
                    className="w-6 h-6 rounded-full border border-[#B0B0B0] text-[#717171] flex items-center justify-center text-sm hover:border-[#222222] hover:text-[#222222] transition-colors"
                    type="button"
                  >
                    +
                  </button>
                </div>
              </div>

              {/* Search button */}
              <button
                onClick={handleSearch}
                type="button"
                className="w-12 h-12 bg-[#FF385C] hover:bg-[#E00B41] rounded-full flex items-center justify-center transition-colors ml-2"
              >
                <svg viewBox="0 0 32 32" className="w-4 h-4 fill-none stroke-white" strokeWidth="4">
                  <circle cx="13" cy="13" r="11" />
                  <path d="M21 21l9 9" />
                </svg>
              </button>
            </div>
          </motion.div>
        </AnimatePresence>

        {/* Mobile expanded form */}
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          className="md:hidden bg-white rounded-2xl shadow-lg border border-[#DDDDDD] p-5 space-y-4"
        >
          <div>
            <label className="block text-xs font-bold text-[#222222] mb-1">Where</label>
            <input
              type="text"
              value={city}
              onChange={(e) => setCity(e.target.value)}
              onKeyDown={handleKeyDown}
              onFocus={() => setShowSuggestions(true)}
              placeholder="Search destinations"
              className="w-full border border-[#DDDDDD] rounded-lg px-3 py-2 text-sm outline-none focus:border-[#222222]"
              autoFocus
            />
            {showSuggestions && city.trim().length >= 2 && (
              <div className="mt-2 max-h-48 overflow-auto rounded-xl border border-[#DDDDDD] bg-white">
                {suggestLoading && <p className="px-3 py-2 text-sm text-[#717171]">Searching...</p>}
                {!suggestLoading && suggestions.length === 0 && <p className="px-3 py-2 text-sm text-[#717171]">No suggestions</p>}
                {!suggestLoading && suggestions.map((item) => (
                  <button
                    key={item}
                    type="button"
                    onClick={() => selectSuggestion(item)}
                    className="w-full text-left px-3 py-2 text-sm text-[#222222] hover:bg-[#F7F7F7]"
                  >
                    {item}
                  </button>
                ))}
              </div>
            )}
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-[#222222] mb-1">Check in</label>
              <input
                type="date"
                value={checkIn}
                onChange={(e) => setCheckIn(e.target.value)}
                min={today}
                className="w-full border border-[#DDDDDD] rounded-lg px-3 py-2 text-sm outline-none focus:border-[#222222]"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-[#222222] mb-1">Check out</label>
              <input
                type="date"
                value={checkOut}
                onChange={(e) => setCheckOut(e.target.value)}
                min={checkIn || today}
                className="w-full border border-[#DDDDDD] rounded-lg px-3 py-2 text-sm outline-none focus:border-[#222222]"
              />
            </div>
          </div>
          <div>
            <label className="block text-xs font-bold text-[#222222] mb-1">Guests</label>
            <div className="flex items-center gap-3">
              <button type="button" onClick={() => setGuests((g) => Math.max(1, g - 1))} className="w-8 h-8 rounded-full border border-[#B0B0B0] flex items-center justify-center text-lg">−</button>
              <span className="text-sm font-semibold w-4 text-center">{guests}</span>
              <button type="button" onClick={() => setGuests((g) => Math.min(16, g + 1))} className="w-8 h-8 rounded-full border border-[#B0B0B0] flex items-center justify-center text-lg">+</button>
            </div>
          </div>
          <button
            onClick={handleSearch}
            type="button"
            className="w-full bg-[#FF385C] text-white font-semibold py-3 rounded-lg hover:bg-[#E00B41] transition-colors flex items-center justify-center gap-2"
          >
            <svg viewBox="0 0 32 32" className="w-4 h-4 fill-none stroke-white" strokeWidth="4">
              <circle cx="13" cy="13" r="11" />
              <path d="M21 21l9 9" />
            </svg>
            Search
          </button>
        </motion.div>
      </div>
    </>
  );
}