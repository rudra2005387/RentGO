import { useState, useEffect, useRef, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { FaHeart, FaSearch, FaStar } from 'react-icons/fa';
import { useAuth } from '../hooks/useAuth';
import { Badge, Skeleton } from '../components/ui';
import apiClient from '../config/apiClient';
import clsx from 'clsx';

// ─── helpers ─────────────────────────────────────────────────────────────────
const apiFetch = async (path) => {
  const response = await apiClient.get(path);
  return response.data;
};

const authFetch = async (path, token) => {
  const response = await apiClient.get(path);
  return response.data;
};

// ─── Category filter config ───────────────────────────────────────────────────
const CATEGORIES = [
  { label: 'All',          icon: '🏠', value: '' },
  { label: 'Apartments',   icon: '🏢', value: 'apartment' },
  { label: 'Houses',       icon: '🏡', value: 'house' },
  { label: 'Private Room', icon: '🛏️', value: 'private_room' },
  { label: 'Entire Place', icon: '🪴', value: 'entire_place' },
  { label: 'Villas',       icon: '🏖️', value: 'villa' },
  { label: 'Condos',       icon: '🏗️', value: 'condo' },
  { label: 'Townhouses',   icon: '⛰️', value: 'townhouse' },
  { label: 'Hotels',       icon: '🏨', value: 'hotel' },
  { label: 'Hostels',      icon: '⛺', value: 'hostel' },
];

// ─── Modern Property Card Component ───────────────────────────────────────────
const PropertyCard = ({ listing, token, userId, wishlistedIds, onWishlistChange }) => {
  const navigate = useNavigate();
  const [imgIndex, setImgIndex] = useState(0);
  const [isWishlisted, setIsWishlisted] = useState(() => wishlistedIds?.has(listing._id) ?? false);
  const [wishlistLoading, setWishlistLoading] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  const images = listing.images || [];
  const coverImg = images.find((i) => i.isCover)?.url || images[0]?.url;
  const allImgs = images.map((i) => i.url).filter(Boolean);
  const displayImgs = allImgs.length > 0 ? allImgs : [coverImg].filter(Boolean);

  const city = listing.location?.city || '';
  const state = listing.location?.state || '';
  const locationStr = [city, state].filter(Boolean).join(', ');
  const price = listing.pricing?.basePrice;
  const rating = listing.averageRating || 0;
  const reviews = listing.totalReviews || 0;
  const isGuestFav = rating >= 4.8 && reviews >= 5;

  const handleWishlist = async (e) => {
    e.stopPropagation();
    e.preventDefault();
    if (!token || !userId) {
      navigate('/login');
      return;
    }
    setWishlistLoading(true);
    try {
      if (isWishlisted) {
        await apiClient.delete(`/users/${userId}/wishlist/${listing._id}`);
        setIsWishlisted(false);
      } else {
        await apiClient.post(`/users/${userId}/wishlist`, { listingId: listing._id });
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
    <Link
      to={`/listing/${listing._id}`}
      className="group block h-full transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-airbnb-500 focus:ring-offset-2 rounded-xl"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <motion.div
        layout
        className="h-full flex flex-col bg-white rounded-xl overflow-hidden shadow-card hover:shadow-card-hover transition-all duration-300"
      >
        {/* Image Container */}
        <div className="relative aspect-square overflow-hidden bg-neutral-100">
          {displayImgs.length > 0 ? (
            <motion.img
              key={imgIndex}
              src={displayImgs[imgIndex]}
              alt={listing.title}
              className="w-full h-full object-cover"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.2 }}
              onError={(e) => {
                e.target.src = 'https://images.unsplash.com/photo-1568605114967-8130f3a36994?w=400';
              }}
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-airbnb-100 to-airbnb-200 flex items-center justify-center text-6xl">
              🏠
            </div>
          )}

          {/* Guest Favourite Badge */}
          {isGuestFav && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="absolute top-3 left-3"
            >
              <Badge variant="default" size="sm" className="bg-white text-neutral-900 font-semibold">
                ✨ Guest favourite
              </Badge>
            </motion.div>
          )}

          {/* Wishlist Button */}
          <motion.button
            onClick={handleWishlist}
            disabled={wishlistLoading}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
            className={clsx(
              'absolute top-3 right-3 w-10 h-10 rounded-full shadow-md transition-all duration-300',
              'flex items-center justify-center backdrop-blur-sm',
              isWishlisted ? 'bg-airbnb-500 text-white' : 'bg-white/90 text-neutral-900 hover:bg-white',
            )}
          >
            <FaHeart className={clsx('w-4 h-4', isWishlisted ? 'fill-current' : '')} />
          </motion.button>

          {/* Image Counter */}
          {displayImgs.length > 1 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="absolute bottom-3 right-3 bg-black/60 text-white px-2.5 py-1.5 rounded-lg text-xs font-medium backdrop-blur-sm"
            >
              {imgIndex + 1} / {displayImgs.length}
            </motion.div>
          )}

          {/* Image Navigation - Desktop */}
          {displayImgs.length > 1 && isHovered && (
            <div className="absolute inset-0 flex items-center justify-between pointer-events-none">
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
                onClick={(e) => {
                  e.preventDefault();
                  setImgIndex((i) => Math.max(0, i - 1));
                }}
                disabled={imgIndex === 0}
                className={clsx(
                  'pointer-events-auto absolute left-2 w-8 h-8 bg-white/80 hover:bg-white rounded-full',
                  'shadow-md flex items-center justify-center text-neutral-900 font-bold transition-all',
                  'disabled:opacity-40 disabled:cursor-not-allowed',
                )}
              >
                ‹
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
                onClick={(e) => {
                  e.preventDefault();
                  setImgIndex((i) => Math.min(displayImgs.length - 1, i + 1));
                }}
                disabled={imgIndex === displayImgs.length - 1}
                className={clsx(
                  'pointer-events-auto absolute right-2 w-8 h-8 bg-white/80 hover:bg-white rounded-full',
                  'shadow-md flex items-center justify-center text-neutral-900 font-bold transition-all',
                  'disabled:opacity-40 disabled:cursor-not-allowed',
                )}
              >
                ›
              </motion.button>
            </div>
          )}

          {/* Dot Indicators */}
          {displayImgs.length > 1 && (
            <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1 pointer-events-none">
              {displayImgs.map((_, i) => (
                <motion.span
                  key={i}
                  className={clsx(
                    'w-2 h-2 rounded-full transition-all duration-300',
                    i === imgIndex
                      ? 'bg-white scale-125'
                      : 'bg-white/50 hover:bg-white/75',
                  )}
                  whileHover={{ scale: 1.2 }}
                />
              ))}
            </div>
          )}
        </div>

        {/* Content */}
        <div className="flex-1 p-3 flex flex-col gap-2">
          {/* Location & Title */}
          <div className="space-y-0.5">
            <p className="text-xs font-semibold text-neutral-500 uppercase tracking-wider">
              {locationStr || 'Unknown'}
            </p>
            <h3 className="text-sm font-semibold text-neutral-900 line-clamp-2 group-hover:text-airbnb-500 transition-colors">
              {listing.title}
            </h3>
          </div>

          {/* Type & Description */}
          {listing.propertyType && (
            <p className="text-xs text-neutral-600 line-clamp-1">
              {listing.propertyType.charAt(0).toUpperCase() + listing.propertyType.slice(1)}
            </p>
          )}

          <div className="flex-1" />

          {/* Rating */}
          {rating > 0 && (
            <div className="flex items-center gap-1.5 pt-1 border-t border-neutral-100">
              <div className="flex items-center gap-0.5">
                <FaStar className="w-3 h-3 text-yellow-400 fill-current" />
                <span className="text-sm font-semibold text-neutral-900">{rating.toFixed(2)}</span>
              </div>
              {reviews > 0 && (
                <span className="text-xs text-neutral-500">({reviews})</span>
              )}
            </div>
          )}

          {/* Price */}
          {price && (
            <div className="pt-2 border-t border-neutral-100">
              <p className="text-base font-bold text-neutral-900">
                ${price.toLocaleString()}
                <span className="text-xs font-normal text-neutral-600 ml-1">/ night</span>
              </p>
            </div>
          )}
        </div>
      </motion.div>
    </Link>
  );
};

// ─── Section Component ─────────────────────────────────────────────────────────
const ListingSection = ({ title, subtitle, listings, loading, token, userId, wishlistedIds, onWishlistChange }) => {
  if (!loading && listings.length === 0) return null;

  return (
    <section className="mb-12 md:mb-16">
      <div className="mb-6">
        <h2 className="text-2xl md:text-3xl font-bold text-neutral-900 mb-1">{title}</h2>
        {subtitle && <p className="text-neutral-600 text-base">{subtitle}</p>}
      </div>

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
          {Array.from({ length: 8 }).map((_, i) => (
            <Skeleton key={i} className="aspect-square rounded-xl" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
          {listings.map((listing, i) => (
            <motion.div
              key={listing._id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: Math.min(i * 0.05, 0.4) }}
            >
              <PropertyCard
                listing={listing}
                token={token}
                userId={userId}
                wishlistedIds={wishlistedIds}
                onWishlistChange={onWishlistChange}
              />
            </motion.div>
          ))}
        </div>
      )}
    </section>
  );
};

// ─── MAIN HOME PAGE ───────────────────────────────────────────────────────────
export default function AirbnbHome() {
  const navigate = useNavigate();
  const { user, token } = useAuth();
  const userId = user?._id || user?.id;

  const [activeCategory, setActiveCategory] = useState('');
  const [featuredListings, setFeaturedListings] = useState([]);
  const [trendingListings, setTrendingListings] = useState([]);
  const [nearbyListings, setNearbyListings] = useState([]);

  const [loadingFeatured, setLoadingFeatured] = useState(true);
  const [loadingTrending, setLoadingTrending] = useState(true);
  const [loadingNearby, setLoadingNearby] = useState(false);

  const [wishlistedIds, setWishlistedIds] = useState(new Set());

  const CATEGORIES = [
    { label: 'All', icon: '🏠', value: '' },
    { label: 'Apartments', icon: '🏢', value: 'apartment' },
    { label: 'Houses', icon: '🏡', value: 'house' },
    { label: 'Private Room', icon: '🛏️', value: 'private_room' },
    { label: 'Villas', icon: '🏖️', value: 'villa' },
    { label: 'Condos', icon: '🏗️', value: 'condo' },
    { label: 'Townhouses', icon: '⛰️', value: 'townhouse' },
    { label: 'Hotels', icon: '🏨', value: 'hotel' },
  ];

  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        const [featured, trending] = await Promise.all([
          apiClient.get('/listings/featured?limit=20'),
          apiClient.get('/listings/trending?limit=20'),
        ]);

        if (featured.data?.success) {
          setFeaturedListings(featured.data.data?.listings || []);
        }
        if (trending.data?.success) {
          setTrendingListings(trending.data.data?.listings || []);
        }
      } catch (err) {
        console.error('Error fetching initial data:', err);
      } finally {
        setLoadingFeatured(false);
        setLoadingTrending(false);
      }
    };

    fetchInitialData();

    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        ({ coords }) => {
          setLoadingNearby(true);
          apiClient
            .get(
              `/listings/nearby?lat=${coords.latitude}&lng=${coords.longitude}&radius=100&limit=20`,
            )
            .then((res) => {
              if (res.data?.success) {
                setNearbyListings(res.data.data?.listings || []);
              }
            })
            .catch(console.error)
            .finally(() => setLoadingNearby(false));
        },
        () => setLoadingNearby(false),
      );
    }
  }, []);

  const fetchWishlist = useCallback(() => {
    if (!token || !userId) return;
    apiClient
      .get(`/users/${userId}/wishlist`)
      .then((res) => {
        if (res.data?.success && Array.isArray(res.data.data)) {
          setWishlistedIds(new Set(res.data.data.map((item) => item._id)));
        }
      })
      .catch(console.error);
  }, [token, userId]);

  useEffect(() => {
    fetchWishlist();
  }, [fetchWishlist]);

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-airbnb-50 via-white to-neutral-50 pt-8 pb-12 md:pt-12 md:pb-16 px-4 md:px-8">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-center mb-8 md:mb-12"
          >
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-neutral-900 mb-3">
              Find your next stay
            </h1>
            <p className="text-lg text-neutral-600 max-w-2xl mx-auto">
              Explore millions of homes around the world. Your perfect getaway starts here.
            </p>
          </motion.div>

          {/* Search Card */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="bg-white rounded-3xl shadow-lg p-4 md:p-6 mb-8 md:mb-12"
          >
            <button
              onClick={() => navigate('/advanced-search')}
              className="w-full flex items-center gap-3 px-6 py-4 bg-neutral-100 hover:bg-neutral-200 transition-colors rounded-full text-left group"
            >
              <FaSearch className="w-4 h-4 text-neutral-600 group-hover:text-neutral-900" />
              <div className="flex-1 min-w-0">
                <p className="text-sm text-neutral-900 font-medium">Where to?</p>
                <p className="text-xs text-neutral-500">Anywhere • Any week • Add guests</p>
              </div>
              <div className="text-xs font-semibold text-neutral-900 bg-neutral-900 text-white px-4 py-2.5 rounded-full group-hover:bg-neutral-800 transition-colors">
                Search
              </div>
            </button>
          </motion.div>

          {/* Quick Stats */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="grid grid-cols-3 gap-3 md:gap-4"
          >
            {[
              { value: '1M+', label: 'Stays' },
              { value: '220+', label: 'Countries' },
              { value: '4.8★', label: 'Rating' },
            ].map((stat, i) => (
              <div
                key={i}
                className="bg-white/80 backdrop-blur-sm rounded-2xl p-4 text-center shadow-sm hover:shadow-md transition-shadow"
              >
                <p className="text-xl md:text-2xl font-bold text-neutral-900">{stat.value}</p>
                <p className="text-xs md:text-sm text-neutral-600 mt-1">{stat.label}</p>
              </div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Category Filter */}
      <div className="border-b border-neutral-200 bg-white sticky top-20 z-40 py-4">
        <div className="px-4 md:px-8 max-w-7xl mx-auto">
          <div className="overflow-x-auto scrollbar-hide">
            <div className="flex gap-3 min-w-max pb-2">
              {CATEGORIES.map((cat) => (
                <motion.button
                  key={cat.value}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setActiveCategory(cat.value)}
                  className={clsx(
                    'flex items-center gap-2 px-4 py-2 rounded-full whitespace-nowrap transition-all duration-200 font-medium text-sm',
                    activeCategory === cat.value
                      ? 'bg-neutral-900 text-white shadow-sm'
                      : 'bg-neutral-100 text-neutral-900 hover:bg-neutral-200',
                  )}
                >
                  <span className="text-lg">{cat.icon}</span>
                  <span>{cat.label}</span>
                </motion.button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main className="px-4 md:px-8 py-8 md:py-12 max-w-7xl mx-auto">
        {/* Featured Listings */}
        <ListingSection
          title="Featured Stays"
          subtitle="Handpicked properties for the perfect escape"
          listings={featuredListings}
          loading={loadingFeatured}
          token={token}
          userId={userId}
          wishlistedIds={wishlistedIds}
          onWishlistChange={fetchWishlist}
        />

        {/* Trending Listings */}
        <ListingSection
          title="Trending Now"
          subtitle="Most loved destinations right now"
          listings={trendingListings}
          loading={loadingTrending}
          token={token}
          userId={userId}
          wishlistedIds={wishlistedIds}
          onWishlistChange={fetchWishlist}
        />

        {/* Nearby Listings */}
        {nearbyListings.length > 0 && (
          <ListingSection
            title="Nearby Stays"
            subtitle="Great places near you"
            listings={nearbyListings}
            loading={loadingNearby}
            token={token}
            userId={userId}
            wishlistedIds={wishlistedIds}
            onWishlistChange={fetchWishlist}
          />
        )}

        {/* CTA Section */}
        {(featuredListings.length > 0 || trendingListings.length > 0) && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="mt-16 md:mt-20 text-center py-12 md:py-16 bg-gradient-to-r from-airbnb-50 to-airbnb-100/50 rounded-3xl"
          >
            <h2 className="text-2xl md:text-3xl font-bold text-neutral-900 mb-3">
              Become a Host
            </h2>
            <p className="text-neutral-600 mb-6 max-w-md mx-auto">
              Earn money by sharing your home with travelers around the world.
            </p>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => navigate('/become-host')}
              className="inline-flex items-center gap-2 px-8 py-3 bg-neutral-900 text-white font-semibold rounded-full hover:bg-neutral-800 transition-all shadow-lg hover:shadow-xl"
            >
              Get Started
              <span>→</span>
            </motion.button>
          </motion.div>
        )}
      </main>
    </div>
  );
}