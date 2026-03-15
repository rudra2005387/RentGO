import { useState, useEffect, useCallback, useRef } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { FaSlidersH, FaTimes, FaMap, FaThLarge, FaStar, FaChevronLeft, FaChevronRight } from 'react-icons/fa';
import { lazy, Suspense } from 'react';
const MapView = lazy(() => import('../components/MapView'));
import { useAuth } from '../hooks/useAuth';
import EmptyState from '../components/ui/EmptyState';
import { SkeletonPropertyCard } from '../components/ui/SkeletonLoaders';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
const PAGE_LIMIT = 12;

const authFetch = (path, token) =>
  fetch(`${API_BASE}${path}`, {
    headers: { Authorization: `Bearer ${token}` },
  }).then((r) => r.json());

// ─── Property types ──────────────────────────────────────────────────────────
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
  <div className="animate-pulse">
    <div className="aspect-[4/3] skeleton rounded-2xl mb-3" />
    <div className="space-y-2">
      <div className="h-4 skeleton rounded-lg w-3/4" />
      <div className="h-3 skeleton rounded-lg w-1/2" />
      <div className="h-4 skeleton rounded-lg w-1/3" />
    </div>
  </div>
);

// ─── Modern Result Card (Airbnb style) ───────────────────────────────────────
const ResultCard = ({ listing, token, userId, isWishlisted, onWishlistToggle }) => {
  const [imgIndex, setImgIndex] = useState(0);
  const [wishLoading, setWishLoading] = useState(false);
  const [imgLoaded, setImgLoaded] = useState(false);

  const images = (listing.images || []).map((i) => i.url || i).filter(Boolean);
  const displayImgs = images.length > 0 ? images : ['https://images.unsplash.com/photo-1568605114967-8130f3a36994?w=400'];

  const city = listing.location?.city || '';
  const state = listing.location?.state || '';
  const locationStr = [city, state].filter(Boolean).join(', ');
  const price = listing.pricing?.basePrice;
  const rating = listing.averageRating;
  const reviews = listing.totalReviews || 0;
  const guests = listing.guests;
  const bedrooms = listing.bedrooms;
  const propType = listing.propertyType?.replace('_', ' ');

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
    <Link to={`/listing/${listing._id}`} className="group block">
      {/* Image */}
      <div className="aspect-[4/3] rounded-2xl overflow-hidden bg-[#F0F0F0] mb-3 relative">
        {!imgLoaded && <div className="absolute inset-0 skeleton" />}
        <img
          src={displayImgs[imgIndex]}
          alt={listing.title}
          className={`w-full h-full object-cover transition-all duration-500 group-hover:scale-[1.03] ${imgLoaded ? 'opacity-100' : 'opacity-0'}`}
          loading="lazy"
          onLoad={() => setImgLoaded(true)}
          onError={(e) => { e.target.src = 'https://images.unsplash.com/photo-1568605114967-8130f3a36994?w=400'; setImgLoaded(true); }}
        />

        {/* Gradient overlay bottom */}
        <div className="absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-black/20 to-transparent pointer-events-none" />

        {/* Wishlist heart */}
        <button
          onClick={handleWishlist}
          disabled={wishLoading}
          className="absolute top-3 right-3 w-8 h-8 flex items-center justify-center transition-all hover:scale-110 active:scale-95 z-10"
        >
          <svg viewBox="0 0 32 32" className="w-6 h-6 drop-shadow-sm" fill={isWishlisted ? '#FF385C' : 'rgba(0,0,0,0.5)'} stroke={isWishlisted ? '#FF385C' : 'white'} strokeWidth="2">
            <path d="M16 28c0 0-14-8.35-14-17.5C2 5.58 5.58 2 9.5 2c2.54 0 4.77 1.3 6.5 3.4C17.73 3.3 19.96 2 22.5 2 26.42 2 30 5.58 30 10.5 30 19.65 16 28 16 28z" />
          </svg>
        </button>

        {/* Guest favourite badge */}
        {rating >= 4.8 && reviews >= 5 && (
          <div className="absolute top-3 left-3 bg-white/95 backdrop-blur-sm text-[#222222] text-xs font-semibold px-2.5 py-1 rounded-full shadow-sm">
            Guest favourite
          </div>
        )}

        {/* Carousel arrows */}
        {displayImgs.length > 1 && (
          <>
            <button
              onClick={(e) => { e.preventDefault(); e.stopPropagation(); setImgIndex((i) => Math.max(0, i - 1)); }}
              className={`absolute left-2.5 top-1/2 -translate-y-1/2 w-7 h-7 bg-white/90 backdrop-blur-sm rounded-full shadow-md flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all hover:bg-white hover:scale-105 ${imgIndex === 0 ? 'invisible' : ''}`}
            >
              <FaChevronLeft size={10} className="text-[#222222]" />
            </button>
            <button
              onClick={(e) => { e.preventDefault(); e.stopPropagation(); setImgIndex((i) => Math.min(displayImgs.length - 1, i + 1)); }}
              className={`absolute right-2.5 top-1/2 -translate-y-1/2 w-7 h-7 bg-white/90 backdrop-blur-sm rounded-full shadow-md flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all hover:bg-white hover:scale-105 ${imgIndex === displayImgs.length - 1 ? 'invisible' : ''}`}
            >
              <FaChevronRight size={10} className="text-[#222222]" />
            </button>
          </>
        )}

        {/* Image dots */}
        {displayImgs.length > 1 && (
          <div className="absolute bottom-2.5 left-1/2 -translate-x-1/2 flex gap-1">
            {displayImgs.slice(0, 5).map((_, i) => (
              <span key={i} className={`w-1.5 h-1.5 rounded-full transition-all ${i === imgIndex ? 'bg-white w-2' : 'bg-white/60'}`} />
            ))}
          </div>
        )}
      </div>

      {/* Info */}
      <div className="space-y-0.5">
        <div className="flex items-start justify-between gap-2">
          <p className="font-semibold text-[#222222] text-[15px] leading-5 truncate">{locationStr || listing.title}</p>
          {rating > 0 && (
            <span className="flex items-center gap-1 flex-shrink-0 mt-0.5">
              <FaStar className="text-[#222222]" size={11} />
              <span className="text-sm font-medium text-[#222222]">{rating.toFixed(1)}</span>
            </span>
          )}
        </div>
        <p className="text-sm text-[#717171] truncate">{listing.title}</p>
        {propType && (
          <p className="text-sm text-[#717171] capitalize">
            {propType}{guests ? ` · ${guests} guest${guests !== 1 ? 's' : ''}` : ''}{bedrooms ? ` · ${bedrooms} bed${bedrooms !== 1 ? 's' : ''}` : ''}
          </p>
        )}
        {price != null && (
          <p className="text-[15px] mt-1">
            <span className="font-semibold text-[#222222]">${price.toLocaleString()}</span>
            <span className="text-[#717171] font-normal"> /night</span>
          </p>
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
        <span className="bg-[#F7F7F7] px-2.5 py-1 rounded-lg text-xs font-medium">${localMin.toLocaleString()}</span>
        <span className="bg-[#F7F7F7] px-2.5 py-1 rounded-lg text-xs font-medium">${localMax.toLocaleString()}</span>
      </div>
      <div className="relative h-1.5 my-3">
        <div className="absolute inset-0 bg-[#EBEBEB] rounded-full" />
        <div className="absolute top-0 h-1.5 bg-[#FF385C] rounded-full" style={{ left: `${leftPct}%`, right: `${100 - rightPct}%` }} />
        <input
          type="range" min={min} max={max} step={10} value={localMin} onChange={handleMinChange}
          className="absolute inset-0 w-full appearance-none bg-transparent pointer-events-none [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:pointer-events-auto [&::-webkit-slider-thumb]:w-5 [&::-webkit-slider-thumb]:h-5 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-white [&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-[#FF385C] [&::-webkit-slider-thumb]:cursor-pointer [&::-webkit-slider-thumb]:shadow-md"
        />
        <input
          type="range" min={min} max={max} step={10} value={localMax} onChange={handleMaxChange}
          className="absolute inset-0 w-full appearance-none bg-transparent pointer-events-none [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:pointer-events-auto [&::-webkit-slider-thumb]:w-5 [&::-webkit-slider-thumb]:h-5 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-white [&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-[#FF385C] [&::-webkit-slider-thumb]:cursor-pointer [&::-webkit-slider-thumb]:shadow-md"
        />
      </div>
    </div>
  );
};

// ─── Filters Panel ───────────────────────────────────────────────────────────
const FiltersPanel = ({ filters, setFilters, onClear }) => (
  <div className="space-y-6">
    <div>
      <h3 className="font-semibold text-[#222222] text-sm mb-3">Price range</h3>
      <PriceRangeSlider min={0} max={2000} value={filters.priceRange} onChange={(v) => setFilters((f) => ({ ...f, priceRange: v }))} />
    </div>

    <div className="h-px bg-[#EBEBEB]" />

    <div>
      <h3 className="font-semibold text-[#222222] text-sm mb-3">Property type</h3>
      <div className="grid grid-cols-2 gap-2">
        {PROPERTY_TYPES.map((pt) => {
          const isActive = filters.propertyTypes.includes(pt.value);
          return (
            <button
              key={pt.value}
              onClick={() => {
                setFilters((f) => ({
                  ...f,
                  propertyTypes: isActive
                    ? f.propertyTypes.filter((t) => t !== pt.value)
                    : [...f.propertyTypes, pt.value],
                }));
              }}
              className={`px-3 py-2 text-xs font-medium rounded-xl border transition-all ${
                isActive
                  ? 'bg-[#222222] text-white border-[#222222]'
                  : 'bg-white text-[#222222] border-[#DDDDDD] hover:border-[#222222]'
              }`}
            >
              {pt.label}
            </button>
          );
        })}
      </div>
    </div>

    <div className="h-px bg-[#EBEBEB]" />

    <div>
      <h3 className="font-semibold text-[#222222] text-sm mb-3">Amenities</h3>
      <div className="flex flex-wrap gap-2">
        {AMENITIES.map((am) => {
          const isActive = filters.amenities.includes(am);
          return (
            <button
              key={am}
              onClick={() => {
                setFilters((f) => ({
                  ...f,
                  amenities: isActive
                    ? f.amenities.filter((a) => a !== am)
                    : [...f.amenities, am],
                }));
              }}
              className={`px-3 py-1.5 text-xs font-medium rounded-full border transition-all ${
                isActive
                  ? 'bg-[#222222] text-white border-[#222222]'
                  : 'bg-white text-[#717171] border-[#DDDDDD] hover:border-[#222222] hover:text-[#222222]'
              }`}
            >
              {am}
            </button>
          );
        })}
      </div>
    </div>

    <div className="h-px bg-[#EBEBEB]" />

    <div>
      <h3 className="font-semibold text-[#222222] text-sm mb-3">Minimum rating</h3>
      <div className="flex gap-2">
        {[3.0, 3.5, 4.0, 4.5, 4.8].map((r) => (
          <button
            key={r}
            onClick={() => setFilters((f) => ({ ...f, minRating: f.minRating === r ? 3.0 : r }))}
            className={`flex-1 py-2 text-xs font-medium rounded-xl border transition-all ${
              filters.minRating === r
                ? 'bg-[#222222] text-white border-[#222222]'
                : 'bg-white text-[#717171] border-[#DDDDDD] hover:border-[#222222]'
            }`}
          >
            {r}★+
          </button>
        ))}
      </div>
    </div>

    <div className="h-px bg-[#EBEBEB]" />

    <div className="flex items-center justify-between">
      <div>
        <span className="text-sm font-semibold text-[#222222]">Instant Book</span>
        <p className="text-xs text-[#717171] mt-0.5">Book without waiting for host approval</p>
      </div>
      <button
        onClick={() => setFilters((f) => ({ ...f, instantBook: !f.instantBook }))}
        className={`w-12 h-7 rounded-full transition-colors relative flex-shrink-0 ${filters.instantBook ? 'bg-[#222222]' : 'bg-[#B0B0B0]'}`}
      >
        <span className={`absolute top-0.5 w-6 h-6 bg-white rounded-full shadow transition-transform ${filters.instantBook ? 'translate-x-5' : 'translate-x-0.5'}`} />
      </button>
    </div>

    <button onClick={onClear} className="w-full text-sm font-semibold text-[#FF385C] hover:underline py-2 mt-2">
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

const fetchWithFallback = async (baseParams, cityQuery, signal) => {
  const p1 = new URLSearchParams(baseParams);
  if (cityQuery?.trim()) {
    p1.set('city', cityQuery.trim());
    p1.set('search', cityQuery.trim());
  }
  const r1 = await fetch(`${API_BASE}/listings?${p1}`, { signal });
  const d1 = await r1.json();
  if (d1.success && (d1.data?.listings?.length || 0) > 0) return d1;

  const p2 = new URLSearchParams(baseParams);
  if (cityQuery?.trim()) p2.set('search', cityQuery.trim());
  const r2 = await fetch(`${API_BASE}/listings?${p2}`, { signal });
  const d2 = await r2.json();
  if (d2.success && (d2.data?.listings?.length || 0) > 0) return d2;

  const p3 = new URLSearchParams(baseParams);
  const r3 = await fetch(`${API_BASE}/listings?${p3}`, { signal });
  return await r3.json();
};

const SearchResult = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { user, token } = useAuth();
  const userId = user?._id || user?.id;

  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [totalResults, setTotalResults] = useState(0);
  const [sortBy, setSortBy] = useState('newest');
  const [showFilters, setShowFilters] = useState(false);
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);
  const viewParam = searchParams.get('view');
  const [showMap, setShowMap] = useState(viewParam !== 'list');
  const [filters, setFilters] = useState(INITIAL_FILTERS);
  const [wishlistedIds, setWishlistedIds] = useState(new Set());
  const [noExactMatch, setNoExactMatch] = useState(false);

  // ── refs ──────────────────────────────────────────────────────────────────
  const loaderRef = useRef(null);
  const observerRef = useRef(null);
  const listContainerRef = useRef(null);
  const isFetchingRef = useRef(false);

  const city = searchParams.get('city') || searchParams.get('search') || searchParams.get('location') || searchParams.get('query') || '';
  const checkInDate = searchParams.get('checkInDate') || searchParams.get('checkIn') || '';
  const checkOutDate = searchParams.get('checkOutDate') || searchParams.get('checkOut') || '';
  const guestsParam = searchParams.get('guests') || '';

  useEffect(() => { window.scrollTo({ top: 0, behavior: 'smooth' }); }, [city]);

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

  // ── Reset pagination whenever query params or filters change ──────────────
  useEffect(() => {
    setListings([]);
    setTotalResults(0);
    setPage(1);
    setHasMore(true);
    setNoExactMatch(false);
    setInitialLoading(true);
  }, [city, checkInDate, checkOutDate, guestsParam, filters, sortBy]);

  // ── Fetch listings ────────────────────────────────────────────────────────
  useEffect(() => {
    const controller = new AbortController();

    const fetchResults = async () => {
      if (isFetchingRef.current) return;
      if (!hasMore && page > 1) return;

      const isFirstPage = page === 1;
      isFetchingRef.current = true;
      setLoading(true);
      setLoadingMore(!isFirstPage);

      try {
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

        const sortMap = {
          'price-low': 'price_low',
          'price-high': 'price_high',
          'rating': 'rating',
          'newest': 'newest',
        };
        baseParams.set('sortBy', sortMap[sortBy] || 'newest');
        baseParams.set('page', String(page));
        baseParams.set('limit', String(PAGE_LIMIT));

        const d = await fetchWithFallback(baseParams, city, controller.signal);

        if (d.success) {
          const resultList = d.data?.listings || [];
          const pagination = d.data?.pagination;

          setListings((prev) => (isFirstPage ? resultList : [...prev, ...resultList]));
          setTotalResults((prev) => pagination?.total ?? (isFirstPage ? resultList.length : prev));

          const canLoadMore = pagination?.hasNextPage ?? resultList.length === PAGE_LIMIT;
          setHasMore(canLoadMore && resultList.length > 0);

          if (isFirstPage) {
            if (city && resultList.length > 0) {
              const exactMatch = resultList.some(
                (l) => l.location?.city?.toLowerCase() === city.toLowerCase()
              );
              setNoExactMatch(!exactMatch);
            } else {
              setNoExactMatch(false);
            }
          }
        } else {
          setHasMore(false);
        }
      } catch (e) {
        if (e.name !== 'AbortError') {
          console.error(e);
          setHasMore(false);
        }
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false);
          setLoadingMore(false);
          setInitialLoading(false);
          isFetchingRef.current = false;
        }
      }
    };

    fetchResults();
    return () => controller.abort();
  }, [page, city, checkInDate, checkOutDate, guestsParam, filters, sortBy]);

  // ── Infinite scroll observer ──────────────────────────────────────────────
  // FIX: use root:null (viewport) instead of listContainerRef so the sentinel
  // is observed correctly regardless of the inner-scroll container timing.
  useEffect(() => {
    if (observerRef.current) observerRef.current.disconnect();
    if (!loaderRef.current || !hasMore) return;

    observerRef.current = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && !loading && !isFetchingRef.current && hasMore) {
          setPage((prev) => prev + 1);
        }
      },
      {
        root: null,            // ← viewport (fixes trigger reliability)
        rootMargin: '400px 0px', // ← pre-load before user hits bottom
        threshold: 0,
      }
    );

    observerRef.current.observe(loaderRef.current);
    return () => observerRef.current?.disconnect();
  }, [hasMore, loading]);

  const clearFilters = () => setFilters(INITIAL_FILTERS);

  const activeFilterCount =
    (filters.priceRange[0] > 0 || filters.priceRange[1] < 2000 ? 1 : 0) +
    filters.propertyTypes.length +
    filters.amenities.length +
    (filters.minRating > 3 ? 1 : 0) +
    (filters.instantBook ? 1 : 0);

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
    <div className="min-h-screen bg-white">

      {/* ─── Sticky Header ──────────────────────────────────────────── */}
      <div className="sticky top-[80px] z-30 bg-white border-b border-[#EBEBEB]">
        <div className="max-w-[2000px] mx-auto px-4 lg:px-6">
          <div className="py-3 flex items-center justify-between gap-4">
            <div className="min-w-0">
              <h1 className="text-lg font-semibold text-[#222222] truncate">
                {city ? `Stays in ${city}` : 'All properties'}
              </h1>
              <p className="text-sm text-[#717171]">
                {initialLoading ? (
                  <span className="inline-flex items-center gap-1.5">
                    <span className="w-3 h-3 rounded-full border-2 border-[#FF385C] border-t-transparent animate-spin" />
                    Searching...
                  </span>
                ) : (
                  <>
                    <span className="font-medium text-[#222222]">{totalResults.toLocaleString()}</span>
                    {' '}propert{totalResults === 1 ? 'y' : 'ies'}
                    {city ? ` in ${city}` : ''}
                  </>
                )}
              </p>
            </div>

            <div className="flex items-center gap-2 flex-shrink-0">
              <button
                onClick={() => { if (window.innerWidth < 1024) setMobileFiltersOpen(true); else setShowFilters(!showFilters); }}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl border transition-all text-sm font-medium ${
                  showFilters || activeFilterCount > 0 ? 'border-[#222222] bg-[#222222] text-white' : 'border-[#DDDDDD] hover:border-[#222222] text-[#222222]'
                }`}
              >
                <FaSlidersH className="w-3.5 h-3.5" />
                Filters
                {activeFilterCount > 0 && (
                  <span className={`w-5 h-5 rounded-full text-xs flex items-center justify-center font-bold ${
                    showFilters || activeFilterCount > 0 ? 'bg-white text-[#222222]' : 'bg-[#FF385C] text-white'
                  }`}>
                    {activeFilterCount}
                  </span>
                )}
              </button>

              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="px-4 py-2.5 rounded-xl border border-[#DDDDDD] hover:border-[#222222] text-sm outline-none transition-colors font-medium bg-white"
              >
                <option value="newest">Newest</option>
                <option value="price-low">Price: Low to High</option>
                <option value="price-high">Price: High to Low</option>
                <option value="rating">Highest Rated</option>
              </select>

              <button
                onClick={() => setShowMap(!showMap)}
                className="hidden lg:flex items-center gap-2 px-4 py-2.5 rounded-xl border border-[#DDDDDD] hover:border-[#222222] transition-all text-sm font-medium"
              >
                {showMap ? <FaThLarge className="w-3.5 h-3.5" /> : <FaMap className="w-3.5 h-3.5" />}
                {showMap ? 'Hide map' : 'Show map'}
              </button>
            </div>
          </div>

          {activeBadges.length > 0 && (
            <div className="pb-3 flex items-center gap-2 flex-wrap">
              {activeBadges.map((badge, i) => (
                <span key={i} className="inline-flex items-center gap-1.5 bg-[#F7F7F7] text-[#222222] text-xs font-medium px-3 py-1.5 rounded-full border border-[#EBEBEB]">
                  {badge.label}
                  <button onClick={badge.clear} className="hover:text-[#FF385C] transition-colors">
                    <FaTimes className="w-2.5 h-2.5" />
                  </button>
                </span>
              ))}
              <button onClick={clearFilters} className="text-xs font-semibold text-[#FF385C] hover:underline ml-1">Clear all</button>
            </div>
          )}
        </div>
      </div>

      {/* ─── No exact match banner ──────────────────────────────────── */}
      <AnimatePresence>
        {noExactMatch && !loading && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden"
          >
            <div className="max-w-[2000px] mx-auto px-4 lg:px-6 pt-4">
              <div className="bg-[#FFF8F0] border border-[#FFD9B3] rounded-xl px-4 py-3 flex items-start gap-3">
                <span className="text-xl">🔍</span>
                <div>
                  <p className="text-sm font-semibold text-[#222222]">No exact results for "{city}"</p>
                  <p className="text-xs text-[#717171] mt-0.5">Showing similar properties from other locations.</p>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ─── Main Split Layout (Airbnb-style) ───────────────────────── */}
      <div className="max-w-[2000px] mx-auto flex" style={{ height: 'calc(100vh - 145px)' }}>

        {/* LEFT: Filters + Listings (scrollable) */}
        <div ref={listContainerRef} className="flex-1 overflow-y-auto" style={{ scrollBehavior: 'smooth' }}>
          <div className="flex">

            {/* Filters sidebar (desktop) */}
            <AnimatePresence>
              {showFilters && (
                <motion.div
                  initial={{ width: 0, opacity: 0 }}
                  animate={{ width: 280, opacity: 1 }}
                  exit={{ width: 0, opacity: 0 }}
                  transition={{ duration: 0.25 }}
                  className="hidden lg:block flex-shrink-0 overflow-hidden"
                >
                  <div className="w-[280px] h-full overflow-y-auto border-r border-[#EBEBEB] p-5">
                    <div className="flex items-center justify-between mb-4">
                      <h2 className="text-base font-semibold text-[#222222]">Filters</h2>
                      <button onClick={() => setShowFilters(false)} className="w-7 h-7 rounded-full hover:bg-[#F7F7F7] flex items-center justify-center transition-colors">
                        <FaTimes className="w-3 h-3 text-[#717171]" />
                      </button>
                    </div>
                    <FiltersPanel filters={filters} setFilters={setFilters} onClear={clearFilters} />
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Listings grid */}
            <div className="flex-1 p-4 lg:p-6">
              {initialLoading ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-6">
                  {Array.from({ length: 12 }).map((_, i) => <SkeletonPropertyCard key={i} />)}
                </div>
              ) : listings.length === 0 ? (
                <EmptyState
                  icon="🏠"
                  title="No properties found"
                  subtitle="We couldn't find properties matching your search. Try a different location or adjust your filters."
                  actionLabel="Explore all homes"
                  onAction={() => navigate('/')}
                />
              ) : (
                <motion.div
                  key={city + sortBy + filters.propertyTypes.join(',')}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.3 }}
                  className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-x-6 gap-y-8"
                >
                  {listings.map((l, i) => (
                    <motion.div
                      key={l._id}
                      initial={{ opacity: 0, y: 12 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.2, delay: Math.min(i * 0.03, 0.4) }}
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

              {/* ── Loading more skeletons ── */}
              {loadingMore && listings.length > 0 && (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-4 gap-6 mt-8">
                  {Array.from({ length: 4 }).map((_, i) => <SkeletonPropertyCard key={`infinite-sk-${i}`} />)}
                </div>
              )}

              {/* ── Sentinel div — IntersectionObserver watches this ── */}
              <div ref={loaderRef} className="h-16 flex items-center justify-center mt-4">
                {loadingMore && (
                  <div className="flex items-center gap-2 text-sm text-[#717171]">
                    <span className="w-4 h-4 rounded-full border-2 border-[#FF385C] border-t-transparent animate-spin" />
                    Loading more homes...
                  </div>
                )}
              </div>

              {/* ── End of results ── */}
              {!hasMore && listings.length > 0 && (
                <div className="flex flex-col items-center py-8 gap-2">
                  <div className="w-8 h-px bg-[#DDDDDD]" />
                  <p className="text-center text-[#717171] text-sm">You've seen all {totalResults.toLocaleString()} properties</p>
                  <div className="w-8 h-px bg-[#DDDDDD]" />
                </div>
              )}
            </div>
          </div>
        </div>

        {/* RIGHT: Sticky Map (desktop) */}
        {showMap && (
          <div className="hidden lg:block w-[45%] xl:w-[50%] 2xl:w-[55%] flex-shrink-0 border-l border-[#EBEBEB]">
            <Suspense fallback={<div className="w-full h-full bg-[#F7F7F7] animate-pulse" />}>
              <div className="w-full h-full">
                <MapView listings={listings} city={city} />
              </div>
            </Suspense>
          </div>
        )}
      </div>

      {/* ─── Mobile: Floating Map Button ────────────────────────────── */}
      <div className="lg:hidden fixed bottom-6 left-1/2 -translate-x-1/2 z-40">
        <button
          onClick={() => setShowMap(!showMap)}
          className="flex items-center gap-2 bg-[#222222] text-white px-5 py-3 rounded-full shadow-xl hover:bg-black transition-colors text-sm font-semibold"
        >
          {showMap ? <FaThLarge size={14} /> : <FaMap size={14} />}
          {showMap ? 'Show list' : 'Map'}
        </button>
      </div>

      {/* ─── Mobile Map Overlay ─────────────────────────────────────── */}
      <AnimatePresence>
        {showMap && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="lg:hidden fixed inset-0 z-30 bg-white"
            style={{ top: '80px' }}
          >
            <Suspense fallback={<div className="w-full h-full bg-[#F7F7F7] animate-pulse" />}>
              <MapView listings={listings} city={city} className="h-full" />
            </Suspense>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ─── Mobile Filters Modal ───────────────────────────────────── */}
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
                  className="w-full bg-[#222222] text-white font-semibold py-3 rounded-xl hover:bg-black transition-colors"
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