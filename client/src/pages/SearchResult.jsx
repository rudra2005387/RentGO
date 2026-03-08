import { useState, useEffect, useCallback, useRef } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { FaSlidersH, FaTimes, FaMap, FaThLarge } from 'react-icons/fa';
import { lazy, Suspense } from 'react';
const MapView = lazy(() => import('../components/MapView'));
import { useAuth } from '../hooks/useAuth';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const authFetch = (path, token) =>
  fetch(`${API_BASE}${path}`, {
    headers: { Authorization: `Bearer ${token}` },
  }).then((r) => r.json());

// ─── Property types matching backend ─────────────────────────────────────────
const PROPERTY_TYPES = [
  { label: 'Apartment', value: 'apartment' },
  { label: 'House', value: 'house' },
  { label: 'Villa', value: 'villa' },
  { label: 'Condo', value: 'condo' },
  { label: 'Townhouse', value: 'townhouse' },
  { label: 'Hotel', value: 'hotel' },
  { label: 'Hostel', value: 'hostel' },
  { label: 'Private Room', value: 'private_room' },
  { label: 'Entire Place', value: 'entire_place' },
];

const AMENITIES = ['WiFi', 'Kitchen', 'Pool', 'Gym', 'Parking', 'Air conditioning', 'Washer', 'TV', 'Hot tub', 'Garden'];

// ─── Skeleton Card ───────────────────────────────────────────────────────────
const SkeletonCard = () => (
  <div className="space-y-3">
    <div className="aspect-square skeleton rounded-2xl" />
    <div className="h-4 skeleton rounded w-3/4" />
    <div className="h-3 skeleton rounded w-1/2" />
    <div className="h-3 skeleton rounded w-1/3" />
  </div>
);

// ─── Result Card (Airbnb style) ──────────────────────────────────────────────
const ResultCard = ({ listing, token, userId, isWishlisted, onWishlistToggle }) => {
  const [imgIndex, setImgIndex] = useState(0);
  const [wishLoading, setWishLoading] = useState(false);

  const images = (listing.images || []).map((i) => i.url).filter(Boolean);
  const displayImgs = images.length > 0 ? images : ['https://images.unsplash.com/photo-1568605114967-8130f3a36994?w=400'];

  const city = listing.location?.city || '';
  const state = listing.location?.state || '';
  const locationStr = [city, state].filter(Boolean).join(', ');
  const price = listing.pricing?.basePrice;
  const rating = listing.averageRating;

  const handleWishlist = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!token || !userId) return;
    setWishLoading(true);
    try {
      if (isWishlisted) {
        await fetch(`${API_BASE}/users/${userId}/wishlist/${listing._id}`, {
          method: 'DELETE',
          headers: { Authorization: `Bearer ${token}` },
        });
      } else {
        await fetch(`${API_BASE}/users/${userId}/wishlist`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
          body: JSON.stringify({ listingId: listing._id }),
        });
      }
      onWishlistToggle?.();
    } catch (err) {
      console.error(err);
    } finally {
      setWishLoading(false);
    }
  };

  return (
    <Link to={`/listing/${listing._id}`} className="group block transition-transform duration-300 hover:-translate-y-1">
      <div className="aspect-square rounded-2xl overflow-hidden bg-gray-100 mb-3 relative shadow-card group-hover:shadow-card-hover transition-shadow duration-300">
        <img
          src={displayImgs[imgIndex]}
          alt={listing.title}
          className="w-full h-full object-cover group-hover:scale-[1.02] transition-transform duration-500"
          onError={(e) => { e.target.src = 'https://images.unsplash.com/photo-1568605114967-8130f3a36994?w=400'; }}
        />
        {/* Wishlist button */}
        <button
          onClick={handleWishlist}
          disabled={wishLoading}
          className="absolute top-3 right-3 w-8 h-8 flex items-center justify-center transition-transform hover:scale-110"
        >
          <svg viewBox="0 0 32 32" className="w-6 h-6" fill={isWishlisted ? '#FF385C' : 'rgba(0,0,0,0.5)'} stroke={isWishlisted ? '#FF385C' : 'white'} strokeWidth="2">
            <path d="M16 28c0 0-14-8.35-14-17.5C2 5.58 5.58 2 9.5 2c2.54 0 4.77 1.3 6.5 3.4C17.73 3.3 19.96 2 22.5 2 26.42 2 30 5.58 30 10.5 30 19.65 16 28 16 28z" />
          </svg>
        </button>
        {/* Carousel arrows */}
        {displayImgs.length > 1 && (
          <>
            <button
              onClick={(e) => { e.preventDefault(); setImgIndex((i) => Math.max(0, i - 1)); }}
              className={`absolute left-2 top-1/2 -translate-y-1/2 w-7 h-7 bg-white rounded-full shadow flex items-center justify-center text-xs opacity-0 group-hover:opacity-100 transition-opacity ${imgIndex === 0 ? 'invisible' : ''}`}
            >‹</button>
            <button
              onClick={(e) => { e.preventDefault(); setImgIndex((i) => Math.min(displayImgs.length - 1, i + 1)); }}
              className={`absolute right-2 top-1/2 -translate-y-1/2 w-7 h-7 bg-white rounded-full shadow flex items-center justify-center text-xs opacity-0 group-hover:opacity-100 transition-opacity ${imgIndex === displayImgs.length - 1 ? 'invisible' : ''}`}
            >›</button>
          </>
        )}
      </div>
      <div className="flex items-start justify-between">
        <div className="min-w-0 pr-2">
          <p className="font-semibold text-[#222222] text-sm truncate">{locationStr || listing.title}</p>
          <p className="text-sm text-[#717171] truncate">{listing.title}</p>
          {price && (
            <p className="text-sm mt-1">
              <span className="font-semibold text-[#222222]">${price.toLocaleString()}</span>
              <span className="text-[#717171] font-normal"> /night</span>
            </p>
          )}
        </div>
        {rating && (
          <div className="flex items-center gap-1 flex-shrink-0 mt-0.5">
            <span className="text-[#222222] text-xs">★</span>
            <span className="text-xs font-semibold text-[#222222]">{rating.toFixed(1)}</span>
          </div>
        )}
      </div>
    </Link>
  );
};

// ─── Dual-handle Price Slider ────────────────────────────────────────────────
const PriceRangeSlider = ({ min, max, value, onChange }) => {
  const [localMin, setLocalMin] = useState(value[0]);
  const [localMax, setLocalMax] = useState(value[1]);

  useEffect(() => { setLocalMin(value[0]); setLocalMax(value[1]); }, [value]);

  const handleMinChange = (e) => {
    const v = Math.min(Number(e.target.value), localMax - 10);
    setLocalMin(v);
    onChange([v, localMax]);
  };
  const handleMaxChange = (e) => {
    const v = Math.max(Number(e.target.value), localMin + 10);
    setLocalMax(v);
    onChange([localMin, v]);
  };

  const leftPct = ((localMin - min) / (max - min)) * 100;
  const rightPct = ((localMax - min) / (max - min)) * 100;

  return (
    <div>
      <div className="flex justify-between text-sm text-[#717171] mb-2">
        <span>${localMin.toLocaleString()}</span>
        <span>${localMax.toLocaleString()}</span>
      </div>
      <div className="relative h-2">
        <div className="absolute inset-0 bg-[#EBEBEB] rounded-full" />
        <div className="absolute top-0 h-2 bg-[#222222] rounded-full" style={{ left: `${leftPct}%`, right: `${100 - rightPct}%` }} />
        <input
          type="range" min={min} max={max} step={10} value={localMin} onChange={handleMinChange}
          className="absolute inset-0 w-full appearance-none bg-transparent pointer-events-none [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:pointer-events-auto [&::-webkit-slider-thumb]:w-5 [&::-webkit-slider-thumb]:h-5 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-white [&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-[#222222] [&::-webkit-slider-thumb]:cursor-pointer"
        />
        <input
          type="range" min={min} max={max} step={10} value={localMax} onChange={handleMaxChange}
          className="absolute inset-0 w-full appearance-none bg-transparent pointer-events-none [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:pointer-events-auto [&::-webkit-slider-thumb]:w-5 [&::-webkit-slider-thumb]:h-5 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-white [&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-[#222222] [&::-webkit-slider-thumb]:cursor-pointer"
        />
      </div>
    </div>
  );
};

// ─── Filters Sidebar ─────────────────────────────────────────────────────────
const FiltersPanel = ({ filters, setFilters, onClear }) => (
  <div className="space-y-6">
    <div>
      <h3 className="font-semibold text-[#222222] text-sm mb-3">Price range</h3>
      <PriceRangeSlider min={0} max={2000} value={filters.priceRange} onChange={(v) => setFilters((f) => ({ ...f, priceRange: v }))} />
    </div>
    <div>
      <h3 className="font-semibold text-[#222222] text-sm mb-3">Property type</h3>
      <div className="space-y-2">
        {PROPERTY_TYPES.map((pt) => (
          <label key={pt.value} className="flex items-center gap-3 cursor-pointer group">
            <input
              type="checkbox"
              checked={filters.propertyTypes.includes(pt.value)}
              onChange={(e) => {
                setFilters((f) => ({
                  ...f,
                  propertyTypes: e.target.checked
                    ? [...f.propertyTypes, pt.value]
                    : f.propertyTypes.filter((t) => t !== pt.value),
                }));
              }}
              className="w-4 h-4 rounded border-[#B0B0B0] accent-[#222222]"
            />
            <span className="text-sm text-[#222222] group-hover:underline">{pt.label}</span>
          </label>
        ))}
      </div>
    </div>
    <div>
      <h3 className="font-semibold text-[#222222] text-sm mb-3">Amenities</h3>
      <div className="space-y-2">
        {AMENITIES.map((am) => (
          <label key={am} className="flex items-center gap-3 cursor-pointer group">
            <input
              type="checkbox"
              checked={filters.amenities.includes(am)}
              onChange={(e) => {
                setFilters((f) => ({
                  ...f,
                  amenities: e.target.checked
                    ? [...f.amenities, am]
                    : f.amenities.filter((a) => a !== am),
                }));
              }}
              className="w-4 h-4 rounded border-[#B0B0B0] accent-[#222222]"
            />
            <span className="text-sm text-[#222222] group-hover:underline">{am}</span>
          </label>
        ))}
      </div>
    </div>
    <div>
      <h3 className="font-semibold text-[#222222] text-sm mb-3">Minimum rating</h3>
      <div className="flex items-center gap-2">
        <input
          type="range" min={3} max={5} step={0.1} value={filters.minRating}
          onChange={(e) => setFilters((f) => ({ ...f, minRating: Number(e.target.value) }))}
          className="flex-1 accent-[#222222]"
        />
        <span className="text-sm font-semibold text-[#222222] w-8 text-right">{filters.minRating.toFixed(1)}★</span>
      </div>
    </div>
    <div className="flex items-center justify-between">
      <span className="text-sm font-semibold text-[#222222]">Instant Book</span>
      <button
        onClick={() => setFilters((f) => ({ ...f, instantBook: !f.instantBook }))}
        className={`w-12 h-7 rounded-full transition-colors relative ${filters.instantBook ? 'bg-[#222222]' : 'bg-[#B0B0B0]'}`}
      >
        <span className={`absolute top-0.5 w-6 h-6 bg-white rounded-full shadow transition-transform ${filters.instantBook ? 'translate-x-5' : 'translate-x-0.5'}`} />
      </button>
    </div>
    <button onClick={onClear} className="w-full text-sm font-semibold text-[#FF385C] hover:underline py-2">
      Clear all filters
    </button>
  </div>
);

// ─── MAIN COMPONENT ──────────────────────────────────────────────────────────
const INITIAL_FILTERS = {
  priceRange: [0, 2000],
  propertyTypes: [],
  amenities: [],
  minRating: 3.0,
  instantBook: false,
};

// ✅ FIX: Fuzzy city search — tries multiple param strategies until results found
const fetchWithFallback = async (baseParams, cityQuery) => {
  const cityLower = cityQuery?.trim().toLowerCase();

  // Strategy 1: send both `city` and `search` params (covers most backend implementations)
  const p1 = new URLSearchParams(baseParams);
  if (cityLower) {
    p1.set('city', cityQuery.trim());
    p1.set('search', cityQuery.trim());
  }
  const r1 = await fetch(`${API_BASE}/listings?${p1}`);
  const d1 = await r1.json();
  if (d1.success && (d1.data?.listings?.length || 0) > 0) return d1;

  // Strategy 2: title/location text search only
  const p2 = new URLSearchParams(baseParams);
  if (cityLower) p2.set('search', cityQuery.trim());
  const r2 = await fetch(`${API_BASE}/listings?${p2}`);
  const d2 = await r2.json();
  if (d2.success && (d2.data?.listings?.length || 0) > 0) return d2;

  // Strategy 3: no city filter — return all (so page is never empty)
  const p3 = new URLSearchParams(baseParams);
  const r3 = await fetch(`${API_BASE}/listings?${p3}`);
  const d3 = await r3.json();
  return d3;
};

const SearchResult = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { user, token } = useAuth();
  const userId = user?._id || user?.id;

  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [totalResults, setTotalResults] = useState(0);
  const [sortBy, setSortBy] = useState('newest');
  const [showFilters, setShowFilters] = useState(true);
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);
  const viewParam = searchParams.get('view');
  const [mapView, setMapView] = useState(viewParam === 'map');
  const [filters, setFilters] = useState(INITIAL_FILTERS);
  const [wishlistedIds, setWishlistedIds] = useState(new Set());
  const [noExactMatch, setNoExactMatch] = useState(false);

  // ✅ Read URL params — support both ?city= and ?search= and ?location=
  const city = searchParams.get('city') || searchParams.get('search') || searchParams.get('location') || searchParams.get('query') || '';
  const checkInDate = searchParams.get('checkInDate') || searchParams.get('checkIn') || '';
  const checkOutDate = searchParams.get('checkOutDate') || searchParams.get('checkOut') || '';
  const guestsParam = searchParams.get('guests') || '';

  // ✅ Smooth scroll to top on new search
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [city]);

  // Fetch wishlist
  const fetchWishlist = useCallback(() => {
    if (!token || !userId) return;
    authFetch(`/users/${userId}/wishlist`, token)
      .then((d) => {
        if (d.success && Array.isArray(d.data)) {
          setWishlistedIds(new Set(d.data.map((item) => item._id || item.listing?._id || item)));
        }
      })
      .catch(() => {});
  }, [token, userId]);

  useEffect(() => { fetchWishlist(); }, [fetchWishlist]);

  // ✅ Fetch listings with fuzzy city matching
  useEffect(() => {
    const fetchResults = async () => {
      setLoading(true);
      setNoExactMatch(false);
      try {
        // Build base params (no city — city handled by fetchWithFallback)
        const baseParams = new URLSearchParams();
        if (checkInDate) baseParams.set('checkInDate', checkInDate);
        if (checkOutDate) baseParams.set('checkOutDate', checkOutDate);
        if (guestsParam) baseParams.set('guests', guestsParam);
        if (filters.priceRange[0] > 0) baseParams.set('minPrice', filters.priceRange[0]);
        if (filters.priceRange[1] < 2000) baseParams.set('maxPrice', filters.priceRange[1]);
        if (filters.propertyTypes.length > 0) baseParams.set('propertyType', filters.propertyTypes.join(','));
        if (filters.amenities.length > 0) baseParams.set('amenities', filters.amenities.join(','));
        if (filters.minRating > 3) baseParams.set('minRating', filters.minRating);
        if (filters.instantBook) baseParams.set('instantBook', 'true');
        const sortMap = { 'price-low': 'price_asc', 'price-high': 'price_desc', 'rating': 'rating', 'newest': 'newest' };
        baseParams.set('sortBy', sortMap[sortBy] || 'newest');
        baseParams.set('limit', '48');

        const d = await fetchWithFallback(baseParams, city);

        if (d.success) {
          const resultList = d.data?.listings || [];
          setListings(resultList);
          setTotalResults(d.data?.pagination?.total || resultList.length);

          // ✅ Detect if results are from fallback (no exact city match)
          if (city && resultList.length > 0) {
            const exactMatch = resultList.some(
              (l) => l.location?.city?.toLowerCase() === city.toLowerCase()
            );
            if (!exactMatch) setNoExactMatch(true);
          }
        }
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    fetchResults();
  }, [city, checkInDate, checkOutDate, guestsParam, filters, sortBy]);

  const clearFilters = () => setFilters(INITIAL_FILTERS);

  // Active filter badges
  const activeBadges = [];
  if (city) activeBadges.push({ label: city, clear: () => navigate('/search') });
  if (filters.priceRange[0] > 0 || filters.priceRange[1] < 2000)
    activeBadges.push({ label: `$${filters.priceRange[0]}–$${filters.priceRange[1]}`, clear: () => setFilters((f) => ({ ...f, priceRange: [0, 2000] })) });
  filters.propertyTypes.forEach((pt) =>
    activeBadges.push({ label: PROPERTY_TYPES.find((p) => p.value === pt)?.label || pt, clear: () => setFilters((f) => ({ ...f, propertyTypes: f.propertyTypes.filter((t) => t !== pt) })) })
  );
  if (filters.minRating > 3) activeBadges.push({ label: `${filters.minRating.toFixed(1)}★+`, clear: () => setFilters((f) => ({ ...f, minRating: 3.0 })) });
  if (filters.instantBook) activeBadges.push({ label: 'Instant Book', clear: () => setFilters((f) => ({ ...f, instantBook: false })) });

  return (
    // ✅ scroll-smooth on the page container
    <div className="min-h-screen bg-white scroll-smooth">
      {/* Header Bar */}
      <div className="sticky top-[80px] z-30 bg-white/80 backdrop-blur-md border-b border-gray-divider">
        <div className="container-page py-3 flex items-center justify-between gap-4 flex-wrap">
          <div>
            <h1 className="text-lg font-semibold text-[#222222]">
              {city ? `Results for "${city}"` : 'All properties'}
            </h1>
            <p className="text-sm text-[#717171]">
              {loading ? (
                <span className="inline-flex items-center gap-1.5">
                  <span className="w-3 h-3 rounded-full border-2 border-[#FF385C] border-t-transparent animate-spin" />
                  Searching...
                </span>
              ) : (
                `${totalResults.toLocaleString()} propert${totalResults === 1 ? 'y' : 'ies'} found`
              )}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="hidden lg:flex items-center gap-2 px-4 py-2 rounded-lg border border-[#DDDDDD] hover:border-[#222222] transition-colors text-sm font-medium"
            >
              <FaSlidersH className="w-3.5 h-3.5" />
              Filters
            </button>
            <button
              onClick={() => setMobileFiltersOpen(true)}
              className="lg:hidden flex items-center gap-2 px-4 py-2 rounded-lg border border-[#DDDDDD] hover:border-[#222222] transition-colors text-sm font-medium"
            >
              <FaSlidersH className="w-3.5 h-3.5" />
              Filters
            </button>
            <button
              onClick={() => setMapView(!mapView)}
              className="flex items-center gap-2 px-4 py-2 rounded-lg border border-[#DDDDDD] hover:border-[#222222] transition-colors text-sm font-medium"
            >
              {mapView ? <FaThLarge className="w-3.5 h-3.5" /> : <FaMap className="w-3.5 h-3.5" />}
              {mapView ? 'List' : 'Map'}
            </button>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="px-4 py-2 rounded-lg border border-[#DDDDDD] hover:border-[#222222] text-sm outline-none transition-colors"
            >
              <option value="newest">Newest</option>
              <option value="price-low">Price: Low → High</option>
              <option value="price-high">Price: High → Low</option>
              <option value="rating">Highest Rated</option>
            </select>
          </div>
        </div>

        {/* Active filter badges */}
        {activeBadges.length > 0 && (
          <div className="container-page pb-3 flex items-center gap-2 flex-wrap">
            {activeBadges.map((badge, i) => (
              <span key={i} className="inline-flex items-center gap-1 bg-[#F7F7F7] text-[#222222] text-xs font-medium px-3 py-1.5 rounded-full">
                {badge.label}
                <button onClick={badge.clear} className="ml-0.5 hover:text-[#FF385C] transition-colors">
                  <FaTimes className="w-2.5 h-2.5" />
                </button>
              </span>
            ))}
            <button onClick={clearFilters} className="text-xs font-semibold text-[#FF385C] hover:underline">Clear all</button>
          </div>
        )}
      </div>

      {/* ✅ "No exact match" banner — shows similar listings instead of blank page */}
      <AnimatePresence>
        {noExactMatch && !loading && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="container-page pt-4"
          >
            <div className="bg-[#FFF8F0] border border-[#FFD9B3] rounded-xl px-4 py-3 flex items-start gap-3">
              <span className="text-xl">🔍</span>
              <div>
                <p className="text-sm font-semibold text-[#222222]">No exact results for "{city}"</p>
                <p className="text-xs text-[#717171] mt-0.5">Showing similar properties from other locations. Try adding more listings for this city.</p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Content */}
      <div className="container-page py-6">
        <div className="flex gap-8">
          {/* Desktop Filters Sidebar */}
          {showFilters && (
            <div className="hidden lg:block w-72 flex-shrink-0">
              <div className="sticky top-[180px] bg-white border border-[#EBEBEB] rounded-2xl p-6">
                <FiltersPanel filters={filters} setFilters={setFilters} onClear={clearFilters} />
              </div>
            </div>
          )}

          {/* Results Grid / Map */}
          <div className="flex-1">
            {mapView ? (
              <Suspense fallback={<div className="h-[calc(100vh-200px)] bg-gray-100 rounded-xl animate-pulse" />}>
                <div className="h-[calc(100vh-200px)] rounded-xl overflow-hidden">
                  <MapView listings={listings} city={city} />
                </div>
              </Suspense>
            ) : loading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {Array.from({ length: 12 }).map((_, i) => <SkeletonCard key={i} />)}
              </div>
            ) : listings.length === 0 ? (
              <div className="text-center py-20">
                <p className="text-5xl mb-4">🏠</p>
                <p className="text-lg font-semibold text-[#222222] mb-2">No properties found</p>
                <p className="text-[#717171] text-sm mb-6 max-w-sm mx-auto">
                  We couldn't find properties matching your search. Try a different location or adjust your filters.
                </p>
                <div className="flex justify-center gap-3">
                  <button
                    onClick={clearFilters}
                    className="px-5 py-2.5 text-sm font-semibold border border-[#222222] rounded-lg hover:bg-[#F7F7F7] transition-colors"
                  >
                    Clear filters
                  </button>
                  <button
                    onClick={() => navigate('/')}
                    className="px-5 py-2.5 text-sm font-semibold bg-[#FF385C] text-white rounded-lg hover:bg-[#e0314f] transition-colors"
                  >
                    Explore all homes
                  </button>
                </div>
              </div>
            ) : (
              <motion.div
                key={city + sortBy}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.3 }}
                className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 xl:grid-cols-4 gap-6"
              >
                {listings.map((l, i) => (
                  <motion.div
                    key={l._id}
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.25, delay: Math.min(i * 0.04, 0.5) }}
                  >
                    <ResultCard
                      listing={l}
                      token={token}
                      userId={userId}
                      isWishlisted={wishlistedIds.has(l._id)}
                      onWishlistToggle={fetchWishlist}
                    />
                  </motion.div>
                ))}
              </motion.div>
            )}
          </div>
        </div>
      </div>

      {/* Mobile Filters Modal */}
      <AnimatePresence>
        {mobileFiltersOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/40 z-50"
              onClick={() => setMobileFiltersOpen(false)}
            />
            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 30, stiffness: 300 }}
              className="fixed bottom-0 left-0 right-0 z-50 bg-white rounded-t-2xl max-h-[85vh] overflow-y-auto"
            >
              <div className="sticky top-0 bg-white border-b border-[#EBEBEB] px-6 py-4 flex items-center justify-between">
                <h2 className="text-lg font-semibold text-[#222222]">Filters</h2>
                <button onClick={() => setMobileFiltersOpen(false)} className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-[#F7F7F7]">
                  <FaTimes className="w-4 h-4" />
                </button>
              </div>
              <div className="px-6 py-6">
                <FiltersPanel filters={filters} setFilters={setFilters} onClear={clearFilters} />
              </div>
              <div className="sticky bottom-0 bg-white border-t border-[#EBEBEB] px-6 py-4">
                <button
                  onClick={() => setMobileFiltersOpen(false)}
                  className="w-full bg-[#222222] text-white font-semibold py-3 rounded-lg hover:bg-black transition-colors"
                >
                  Show {totalResults} results
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
};

export default SearchResult;