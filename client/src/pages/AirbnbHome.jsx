import { useState, useEffect, useRef, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../hooks/useAuth';
import EmptyState from '../components/ui/EmptyState';
import { SkeletonPropertyCard } from '../components/ui/SkeletonLoaders';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

// ─── helpers ────────────────────────────────────────────────────────────────
const apiFetch = (path) =>
  fetch(`${API_BASE}${path}`).then((r) => r.json());

const authFetch = (path, token) =>
  fetch(`${API_BASE}${path}`, {
    headers: { Authorization: `Bearer ${token}` },
  }).then((r) => r.json());

// ─── Category filter config ──────────────────────────────────────────────────
const CATEGORIES = [
  { label: 'All', icon: '🏠', value: '' },
  { label: 'Apartments', icon: '🏢', value: 'apartment' },
  { label: 'Houses', icon: '🏡', value: 'house' },
  { label: 'Private Room', icon: '🛏️', value: 'private_room' },
  { label: 'Entire Place', icon: '🪴', value: 'entire_place' },
  { label: 'Villas', icon: '🏖️', value: 'villa' },
  { label: 'Condos', icon: '🏗️', value: 'condo' },
  { label: 'Townhouses', icon: '⛰️', value: 'townhouse' },
  { label: 'Hotels', icon: '🏨', value: 'hotel' },
  { label: 'Hostels', icon: '⛺', value: 'hostel' },
];

// ─── Skeleton Card ───────────────────────────────────────────────────────────
const SkeletonCard = () => (
  <div className="space-y-3">
    <div className="aspect-square skeleton rounded-2xl" />
    <div className="h-4 skeleton rounded w-3/4" />
    <div className="h-3 skeleton rounded w-1/2" />
    <div className="h-3 skeleton rounded w-1/3" />
  </div>
);

// ─── Property Card ───────────────────────────────────────────────────────────
const PropertyCard = ({ listing, token, userId, wishlistedIds, onWishlistChange }) => {
  const navigate = useNavigate();
  const [imgIndex, setImgIndex] = useState(0);
  const [isWishlisted, setIsWishlisted] = useState(() => wishlistedIds?.has(listing._id) ?? false);
  const [wishlistLoading, setWishlistLoading] = useState(false);

  const images = listing.images || [];
  const coverImg = images.find((i) => i.isCover)?.url || images[0]?.url;
  const allImgs = images.map((i) => i.url).filter(Boolean);
  const displayImgs = allImgs.length > 0 ? allImgs : [coverImg].filter(Boolean);

  const city = listing.location?.city || '';
  const state = listing.location?.state || '';
  const locationStr = [city, state].filter(Boolean).join(', ');
  const price = listing.pricing?.basePrice;
  const rating = listing.averageRating;
  const reviews = listing.totalReviews;
  const isGuestFav = rating >= 4.8 && reviews >= 5;

  const handleWishlist = async (e) => {
    e.stopPropagation();
    e.preventDefault();
    if (!token || !userId) { navigate('/login'); return; }
    setWishlistLoading(true);
    try {
      if (isWishlisted) {
        await fetch(`${API_BASE}/users/${userId}/wishlist/${listing._id}`, {
          method: 'DELETE',
          headers: { Authorization: `Bearer ${token}` },
        });
        setIsWishlisted(false);
      } else {
        await fetch(`${API_BASE}/users/${userId}/wishlist`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
          body: JSON.stringify({ listingId: listing._id }),
        });
        setIsWishlisted(true);
      }
      onWishlistChange?.();
    } catch (e) {
      console.error(e);
    } finally {
      setWishlistLoading(false);
    }
  };

  return (
    <Link to={`/listing/${listing._id}`} className="group block transition-transform duration-300 hover:-translate-y-1">
      {/* Image carousel */}
      <div className="aspect-square rounded-2xl overflow-hidden bg-gray-100 mb-3 relative shadow-card group-hover:shadow-card-hover transition-shadow duration-300">
        {displayImgs.length > 0 ? (
          <img
            src={displayImgs[imgIndex]}
            alt={listing.title}
            className="w-full h-full object-cover group-hover:scale-[1.02] transition-transform duration-500"
            onError={(e) => { e.target.src = 'https://images.unsplash.com/photo-1568605114967-8130f3a36994?w=400'; }}
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-rose-100 to-orange-100 flex items-center justify-center text-5xl">🏠</div>
        )}

        {/* Guest favourite badge */}
        {isGuestFav && (
          <span className="absolute top-3 left-3 bg-white text-gray-800 text-xs font-semibold px-2.5 py-1 rounded-full shadow-sm">
            Guest favourite
          </span>
        )}

        {/* Wishlist button */}
        <button
          onClick={handleWishlist}
          disabled={wishlistLoading}
          className="absolute top-3 right-3 w-8 h-8 flex items-center justify-center transition-transform hover:scale-110"
        >
          <svg viewBox="0 0 32 32" className="w-6 h-6" fill={isWishlisted ? '#FF385C' : 'rgba(0,0,0,0.5)'} stroke={isWishlisted ? '#FF385C' : 'white'} strokeWidth="2">
            <path d="M16 28c0 0-14-8.35-14-17.5C2 5.58 5.58 2 9.5 2c2.54 0 4.77 1.3 6.5 3.4C17.73 3.3 19.96 2 22.5 2 26.42 2 30 5.58 30 10.5 30 19.65 16 28 16 28z" />
          </svg>
        </button>

        {/* Carousel dots */}
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
            <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1">
              {displayImgs.map((_, i) => (
                <span key={i} className={`w-1.5 h-1.5 rounded-full transition-colors ${i === imgIndex ? 'bg-white' : 'bg-white/50'}`} />
              ))}
            </div>
          </>
        )}
      </div>

      {/* Info */}
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

// ─── Section with horizontal scroll ─────────────────────────────────────────
const ListingSection = ({ title, listings, loading, token, userId, wishlistedIds, onWishlistChange }) => {
  if (!loading && listings.length === 0) return null;
  return (
    <section className="mb-10">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold text-[#222222]">{title} <span className="text-[#717171] font-normal text-base">→</span></h2>
      </div>
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
          {Array.from({ length: 6 }).map((_, i) => <SkeletonPropertyCard key={i} />)}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
          {listings.map((l, i) => (
            <motion.div
              key={l._id}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: Math.min(i * 0.05, 0.4) }}
            >
              <PropertyCard listing={l} token={token} userId={userId} wishlistedIds={wishlistedIds} onWishlistChange={onWishlistChange} />
            </motion.div>
          ))}
        </div>
      )}
    </section>
  );
};

// ─── MAIN HOME PAGE ──────────────────────────────────────────────────────────
export default function AirbnbHome() {
  const navigate = useNavigate();
  const { user, token } = useAuth();
  const userId = user?._id || user?.id;

  const [activeCategory, setActiveCategory] = useState('');
  const [allListings, setAllListings] = useState([]);
  const [featuredListings, setFeaturedListings] = useState([]);
  const [trendingListings, setTrendingListings] = useState([]);
  const [nearbyListings, setNearbyListings] = useState([]);
  const [recentlyViewed, setRecentlyViewed] = useState([]);

  const [loadingAll, setLoadingAll] = useState(true);
  const [loadingFeatured, setLoadingFeatured] = useState(true);
  const [loadingTrending, setLoadingTrending] = useState(true);
  const [loadingNearby, setLoadingNearby] = useState(false);

  const [wishlistedIds, setWishlistedIds] = useState(new Set());

  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [totalListings, setTotalListings] = useState(0);
  const isFetchingRef = useRef(false); // prevent concurrent fetches

  const observerRef = useRef(null);
  const sentinelRef = useRef(null);

  // ── Fetch featured & trending once
  useEffect(() => {
    apiFetch('/listings/featured?limit=12')
      .then((d) => { if (d.success) setFeaturedListings(d.data?.listings || []); })
      .catch(() => {})
      .finally(() => setLoadingFeatured(false));

    apiFetch('/listings/trending?limit=12')
      .then((d) => { if (d.success) setTrendingListings(d.data?.listings || []); })
      .catch(() => {})
      .finally(() => setLoadingTrending(false));

    // Try geolocation for nearby
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        ({ coords }) => {
          setLoadingNearby(true);
          apiFetch(`/listings/nearby?lat=${coords.latitude}&lng=${coords.longitude}&radius=100&limit=12`)
            .then((d) => { if (d.success) setNearbyListings(d.data?.listings || []); })
            .catch(() => {})
            .finally(() => setLoadingNearby(false));
        },
        () => {} // silently fail if denied
      );
    }
  }, []);

  // ── Fetch user's wishlist IDs on mount
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

  useEffect(() => {
    try {
      const recent = JSON.parse(localStorage.getItem('rg_recently_viewed') || '[]');
      setRecentlyViewed(recent);
    } catch {
      setRecentlyViewed([]);
    }
  }, []);

  // ── Fetch paginated listings when category or page changes
  const fetchListings = useCallback(async (cat, pageNum, reset = false) => {
    if (isFetchingRef.current) return; // prevent concurrent calls
    isFetchingRef.current = true;
    setLoadingAll(true);
    try {
      const params = new URLSearchParams({ page: pageNum, limit: 24 });
      if (cat) params.set('propertyType', cat);
      const res = await fetch(`${API_BASE}/listings?${params}`);
      
      // Stop completely on rate limit
      if (res.status === 429) {
        console.warn('Rate limited — stopping pagination');
        setHasMore(false);
        return;
      }
      
      const d = await res.json();
      if (d.success) {
        const newListings = d.data?.listings || [];
        setAllListings((prev) => reset ? newListings : [...prev, ...newListings]);
        const pagination = d.data?.pagination;
        setTotalListings(pagination?.total || 0);
        // Only allow more pages if backend confirms there are more
        setHasMore(pagination?.hasNextPage === true && newListings.length > 0);
      } else {
        setHasMore(false);
      }
    } catch (e) {
      console.error(e);
      setHasMore(false);
    } finally {
      setLoadingAll(false);
      isFetchingRef.current = false;
    }
  }, []);

  // Reset and fetch on category change
  useEffect(() => {
    setPage(1);
    setAllListings([]);
    setHasMore(true);
    fetchListings(activeCategory, 1, true);
  }, [activeCategory, fetchListings]);

  // Infinite scroll: fetch more on page increment
  useEffect(() => {
    if (page > 1) fetchListings(activeCategory, page, false);
  }, [page, activeCategory, fetchListings]);

  // Intersection observer for infinite scroll
  useEffect(() => {
    if (observerRef.current) observerRef.current.disconnect();
    if (!hasMore) return; // don't observe if no more pages
    
    observerRef.current = new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting && hasMore && !loadingAll && !isFetchingRef.current) {
        setPage((p) => p + 1);
      }
    }, { threshold: 1.0 });
    
    if (sentinelRef.current) observerRef.current.observe(sentinelRef.current);
    return () => observerRef.current?.disconnect();
  }, [hasMore, loadingAll]);

  // ── Search handler
  const [searchQuery, setSearchQuery] = useState('');
  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) navigate(`/search?search=${encodeURIComponent(searchQuery)}`);
  };

  return (
    <div className="min-h-screen bg-white">

      {/* ── CATEGORY FILTER BAR */}
      <div className="sticky top-[80px] z-30 bg-white/80 backdrop-blur-md border-b border-gray-divider">
        <div className="container-page">
          {/* Category pills */}
          <div className="flex items-center gap-6 overflow-x-auto scrollbar-hide py-3">
            {CATEGORIES.map((cat) => (
              <button
                key={cat.value}
                onClick={() => setActiveCategory(cat.value)}
                className={`flex flex-col items-center gap-1 flex-shrink-0 pb-1 border-b-2 transition-all duration-150 ${
                  activeCategory === cat.value
                    ? 'border-[#222222] opacity-100'
                    : 'border-transparent opacity-60 hover:opacity-100 hover:border-[#DDDDDD]'
                }`}
              >
                <span className="text-xl">{cat.icon}</span>
                <span className="text-xs font-medium text-[#222222] whitespace-nowrap">{cat.label}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* ── MAIN CONTENT */}
      <div className="container-page py-8">

        {/* Nearby section (only if geolocation granted) */}
        {nearbyListings.length > 0 && (
          <ListingSection
            title="Near you"
            listings={nearbyListings}
            loading={loadingNearby}
            token={token}
            userId={userId}
            wishlistedIds={wishlistedIds}
            onWishlistChange={fetchWishlist}
          />
        )}

        {/* Featured section */}
        {activeCategory === '' && (
          <ListingSection
            title="Featured homes"
            listings={featuredListings}
            loading={loadingFeatured}
            token={token}
            userId={userId}
            wishlistedIds={wishlistedIds}
            onWishlistChange={fetchWishlist}
          />
        )}

        {/* Trending section */}
        {activeCategory === '' && (
          <ListingSection
            title="Trending this week"
            listings={trendingListings}
            loading={loadingTrending}
            token={token}
            userId={userId}
            wishlistedIds={wishlistedIds}
            onWishlistChange={fetchWishlist}
          />
        )}

        {/* Recently viewed homes */}
        {activeCategory === '' && recentlyViewed.length > 0 && (
          <ListingSection
            title="Recently viewed homes"
            listings={recentlyViewed}
            loading={false}
            token={token}
            userId={userId}
            wishlistedIds={wishlistedIds}
            onWishlistChange={fetchWishlist}
          />
        )}

        {/* ── All listings grid with infinite scroll */}
        <section>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-[#222222]">
              {activeCategory
                ? `${CATEGORIES.find((c) => c.value === activeCategory)?.label || ''} homes`
                : 'All homes'}
              {totalListings > 0 && (
                <span className="text-sm font-normal text-[#717171] ml-2">
                  ({totalListings.toLocaleString()} total)
                </span>
              )}
            </h2>
          </div>

          {allListings.length === 0 && loadingAll ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
              {Array.from({ length: 12 }).map((_, i) => <SkeletonPropertyCard key={i} />)}
            </div>
          ) : allListings.length === 0 && !loadingAll ? (
            <EmptyState
              icon="🏠"
              title="No listings found"
              subtitle="Try a different category or check back soon"
              actionLabel="Clear filter"
              onAction={() => setActiveCategory('')}
            />
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
              {allListings.map((l, i) => (
                <motion.div
                  key={l._id}
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: Math.min(i * 0.04, 0.5) }}
                >
                  <PropertyCard listing={l} token={token} userId={userId} wishlistedIds={wishlistedIds} onWishlistChange={fetchWishlist} />
                </motion.div>
              ))}
              {/* Loading more skeletons */}
              {loadingAll && page > 1 && Array.from({ length: 6 }).map((_, i) => <SkeletonPropertyCard key={`sk-${i}`} />)}
            </div>
          )}

          {/* Infinite scroll sentinel */}
          <div ref={sentinelRef} className="h-10 mt-4 flex items-center justify-center">
            {loadingAll && page > 1 && (
              <p className="text-sm text-[#717171]">Loading more homes...</p>
            )}
          </div>

          {/* End of results */}
          {!hasMore && allListings.length > 0 && (
            <p className="text-center text-sm text-[#717171] py-6">
              You've reached the end 🎉
            </p>
          )}
        </section>
      </div>

      {/* ── SHOW MAP floating button */}
      <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40">
        <button
          onClick={() => navigate('/search?view=map')}
          className="flex items-center gap-2 bg-[#222222] text-white text-sm font-semibold px-5 py-3 rounded-full shadow-lg hover:bg-black transition-colors"
        >
          <svg viewBox="0 0 16 16" className="w-4 h-4 fill-current">
            <path d="M10.5 0L6 1.6 1.5 0 0 1v11l1.5.6L6 11l4.5 1.6L12 12V1L10.5 0zM6 9.5L2 8.2V2.5l4 1.3v5.7zm6 .7l-4-1.4V3.5l4 1.3v5.4z" />
          </svg>
          Show map
        </button>
      </div>
    </div>
  );
}