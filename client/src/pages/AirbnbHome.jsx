import { useContext, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import AirbnbSearchBar from '../components/search/AirbnbSearchBar';
import PropertyCard from '../components/PropertyCard/PropertyCard';
import PropertyCardSkeleton from '../components/PropertyCard/PropertyCardSkeleton';
import CategoryFilter from '../components/CategoryFilter/CategoryFilter';
import { ToastContext } from '../context/ToastContext';
import { FaMapMarkerAlt } from 'react-icons/fa';

const WISHLIST_KEY = 'rentgo:wishlist';

const featuredListings = [
  {
    id: 1,
    title: 'Modern Apartment with Skyline View',
    location: 'New York, NY',
    price: '$2,500',
    rating: 4.97,
    category: 'apartments',
    isGuestFavourite: true,
    image: 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800&h=800&fit=crop',
    images: [
      'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800&h=800&fit=crop',
      'https://images.unsplash.com/photo-1493663284031-b7e3aefcae8e?w=800&h=800&fit=crop',
      'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800&h=800&fit=crop'
    ]
  },
  {
    id: 2,
    title: 'Cozy Beach Cottage',
    location: 'Santa Monica, CA',
    price: '$3,100',
    rating: 4.92,
    category: 'beach',
    image: 'https://images.unsplash.com/photo-1499793983690-e29da59ef1c2?w=800&h=800&fit=crop',
    images: [
      'https://images.unsplash.com/photo-1499793983690-e29da59ef1c2?w=800&h=800&fit=crop',
      'https://images.unsplash.com/photo-1430285561322-7808604715df?w=800&h=800&fit=crop',
      'https://images.unsplash.com/photo-1560185008-b033106af5c3?w=800&h=800&fit=crop'
    ]
  },
  {
    id: 3,
    title: 'Quiet Mountain Chalet',
    location: 'Aspen, CO',
    price: '$4,250',
    rating: 4.85,
    category: 'mountain',
    isGuestFavourite: true,
    image: 'https://images.unsplash.com/photo-1580587771525-78b9dba3b914?w=800&h=800&fit=crop',
    images: [
      'https://images.unsplash.com/photo-1580587771525-78b9dba3b914?w=800&h=800&fit=crop',
      'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800&h=800&fit=crop',
      'https://images.unsplash.com/photo-1572120360610-d971b9d7767c?w=800&h=800&fit=crop'
    ]
  },
  {
    id: 4,
    title: 'Family Home with Garden',
    location: 'Austin, TX',
    price: '$3,800',
    rating: 4.91,
    category: 'houses',
    image: 'https://images.unsplash.com/photo-1613977257362-707ba9348227?w=800&h=800&fit=crop',
    images: [
      'https://images.unsplash.com/photo-1613977257362-707ba9348227?w=800&h=800&fit=crop',
      'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=800&h=800&fit=crop',
      'https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?w=800&h=800&fit=crop'
    ]
  },
  {
    id: 5,
    title: 'Compact City Studio',
    location: 'Seattle, WA',
    price: '$2,000',
    rating: 4.78,
    category: 'studios',
    image: 'https://images.unsplash.com/photo-1484154218962-a197022b5858?w=800&h=800&fit=crop',
    images: [
      'https://images.unsplash.com/photo-1484154218962-a197022b5858?w=800&h=800&fit=crop',
      'https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?w=800&h=800&fit=crop'
    ]
  },
  {
    id: 6,
    title: 'Lakefront Room with Patio',
    location: 'Lake Tahoe, NV',
    price: '$2,650',
    rating: 4.88,
    category: 'rooms',
    image: 'https://images.unsplash.com/photo-1598928506311-c55ded91a20c?w=800&h=800&fit=crop',
    images: [
      'https://images.unsplash.com/photo-1598928506311-c55ded91a20c?w=800&h=800&fit=crop',
      'https://images.unsplash.com/photo-1564078516393-cf04bd966897?w=800&h=800&fit=crop'
    ]
  },
  {
    id: 7,
    title: 'Designer Loft in Arts District',
    location: 'Los Angeles, CA',
    price: '$2,950',
    rating: 4.82,
    category: 'apartments',
    image: 'https://images.unsplash.com/photo-1505691938895-1758d7feb511?w=800&h=800&fit=crop',
    images: [
      'https://images.unsplash.com/photo-1505691938895-1758d7feb511?w=800&h=800&fit=crop',
      'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=800&h=800&fit=crop'
    ]
  },
  {
    id: 8,
    title: 'Rustic Camping Cabin',
    location: 'Bend, OR',
    price: '$1,900',
    rating: 4.73,
    category: 'camping',
    image: 'https://images.unsplash.com/photo-1472224371017-08207f84aaae?w=800&h=800&fit=crop',
    images: [
      'https://images.unsplash.com/photo-1472224371017-08207f84aaae?w=800&h=800&fit=crop',
      'https://images.unsplash.com/photo-1449157291145-7efd050a4d0e?w=800&h=800&fit=crop'
    ]
  },
  {
    id: 9,
    title: 'Penthouse Suite Downtown',
    location: 'Chicago, IL',
    price: '$5,200',
    rating: 4.95,
    category: 'apartments',
    isGuestFavourite: true,
    image: 'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=800&h=800&fit=crop',
    images: [
      'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=800&h=800&fit=crop',
      'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800&h=800&fit=crop',
      'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800&h=800&fit=crop'
    ]
  },
  {
    id: 10,
    title: 'Beachfront Villa with Pool',
    location: 'Miami, FL',
    price: '$6,800',
    rating: 4.98,
    category: 'beach',
    isGuestFavourite: true,
    image: 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=800&h=800&fit=crop',
    images: [
      'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=800&h=800&fit=crop',
      'https://images.unsplash.com/photo-1499793983690-e29da59ef1c2?w=800&h=800&fit=crop',
      'https://images.unsplash.com/photo-1613977257362-707ba9348227?w=800&h=800&fit=crop'
    ]
  },
  {
    id: 11,
    title: 'Mountain View A-Frame',
    location: 'Park City, UT',
    price: '$3,400',
    rating: 4.86,
    category: 'mountain',
    image: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800&h=800&fit=crop',
    images: [
      'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800&h=800&fit=crop',
      'https://images.unsplash.com/photo-1572120360610-d971b9d7767c?w=800&h=800&fit=crop'
    ]
  },
  {
    id: 12,
    title: 'Charming Townhouse',
    location: 'San Francisco, CA',
    price: '$4,100',
    rating: 4.89,
    category: 'houses',
    image: 'https://images.unsplash.com/photo-1572120360610-d971b9d7767c?w=800&h=800&fit=crop',
    images: [
      'https://images.unsplash.com/photo-1572120360610-d971b9d7767c?w=800&h=800&fit=crop',
      'https://images.unsplash.com/photo-1580587771525-78b9dba3b914?w=800&h=800&fit=crop'
    ]
  },
  {
    id: 13,
    title: 'Bright Minimalist Studio',
    location: 'Portland, OR',
    price: '$1,750',
    rating: 4.71,
    category: 'studios',
    image: 'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800&h=800&fit=crop',
    images: [
      'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800&h=800&fit=crop',
      'https://images.unsplash.com/photo-1484154218962-a197022b5858?w=800&h=800&fit=crop'
    ]
  },
  {
    id: 14,
    title: 'Private Guest Room',
    location: 'Nashville, TN',
    price: '$1,200',
    rating: 4.81,
    category: 'rooms',
    image: 'https://images.unsplash.com/photo-1564078516393-cf04bd966897?w=800&h=800&fit=crop',
    images: [
      'https://images.unsplash.com/photo-1564078516393-cf04bd966897?w=800&h=800&fit=crop',
      'https://images.unsplash.com/photo-1598928506311-c55ded91a20c?w=800&h=800&fit=crop'
    ]
  },
  {
    id: 15,
    title: 'Glamping Tent by the River',
    location: 'Sedona, AZ',
    price: '$1,500',
    rating: 4.76,
    category: 'camping',
    image: 'https://images.unsplash.com/photo-1449157291145-7efd050a4d0e?w=800&h=800&fit=crop',
    images: [
      'https://images.unsplash.com/photo-1449157291145-7efd050a4d0e?w=800&h=800&fit=crop',
      'https://images.unsplash.com/photo-1472224371017-08207f84aaae?w=800&h=800&fit=crop'
    ]
  },
  {
    id: 16,
    title: 'Luxury Condo with Terrace',
    location: 'San Diego, CA',
    price: '$3,600',
    rating: 4.93,
    category: 'apartments',
    image: 'https://images.unsplash.com/photo-1493663284031-b7e3aefcae8e?w=800&h=800&fit=crop',
    images: [
      'https://images.unsplash.com/photo-1493663284031-b7e3aefcae8e?w=800&h=800&fit=crop',
      'https://images.unsplash.com/photo-1505691938895-1758d7feb511?w=800&h=800&fit=crop',
      'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800&h=800&fit=crop'
    ]
  },
  {
    id: 17,
    title: 'Oceanside Bungalow',
    location: 'Maui, HI',
    price: '$5,500',
    rating: 4.96,
    category: 'beach',
    isGuestFavourite: true,
    image: 'https://images.unsplash.com/photo-1430285561322-7808604715df?w=800&h=800&fit=crop',
    images: [
      'https://images.unsplash.com/photo-1430285561322-7808604715df?w=800&h=800&fit=crop',
      'https://images.unsplash.com/photo-1499793983690-e29da59ef1c2?w=800&h=800&fit=crop'
    ]
  },
  {
    id: 18,
    title: 'Suburban Family Retreat',
    location: 'Denver, CO',
    price: '$2,800',
    rating: 4.84,
    category: 'houses',
    image: 'https://images.unsplash.com/photo-1560185008-b033106af5c3?w=800&h=800&fit=crop',
    images: [
      'https://images.unsplash.com/photo-1560185008-b033106af5c3?w=800&h=800&fit=crop',
      'https://images.unsplash.com/photo-1613977257362-707ba9348227?w=800&h=800&fit=crop'
    ]
  },
  {
    id: 19,
    title: 'Cozy Ski Lodge Room',
    location: 'Jackson Hole, WY',
    price: '$3,200',
    rating: 4.87,
    category: 'mountain',
    image: 'https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?w=800&h=800&fit=crop',
    images: [
      'https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?w=800&h=800&fit=crop',
      'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800&h=800&fit=crop'
    ]
  },
  {
    id: 20,
    title: 'Downtown Micro-Loft',
    location: 'Boston, MA',
    price: '$2,300',
    rating: 4.74,
    category: 'studios',
    image: 'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800&h=800&fit=crop',
    images: [
      'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800&h=800&fit=crop',
      'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=800&h=800&fit=crop',
      'https://images.unsplash.com/photo-1484154218962-a197022b5858?w=800&h=800&fit=crop'
    ]
  }
];

const AirbnbHome = () => {
  const navigate = useNavigate();
  const { showToast } = useContext(ToastContext);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [loading, setLoading] = useState(true);
  const [wishlistIds, setWishlistIds] = useState(() => {
    const stored = localStorage.getItem(WISHLIST_KEY);
    return stored ? JSON.parse(stored) : [];
  });

  useEffect(() => {
    const timeout = setTimeout(() => setLoading(false), 800);
    return () => clearTimeout(timeout);
  }, []);

  useEffect(() => {
    localStorage.setItem(WISHLIST_KEY, JSON.stringify(wishlistIds));
  }, [wishlistIds]);

  const handleSearch = (searchParams) => {
    const query = new URLSearchParams({
      location: searchParams.location || '',
      checkIn: searchParams.checkIn || '',
      checkOut: searchParams.checkOut || '',
      guests: searchParams.guests || 1
    }).toString();
    showToast('Searching homes based on your preferences', 'info', 2500);
    navigate(`/search?${query}`);
  };

  const handleToggleWishlist = (listing) => {
    const isSaved = wishlistIds.includes(listing.id);
    const next = isSaved
      ? wishlistIds.filter((id) => id !== listing.id)
      : [...wishlistIds, listing.id];
    setWishlistIds(next);
    showToast(
      isSaved ? 'Removed from wishlist' : 'Added to wishlist',
      isSaved ? 'warning' : 'success',
      2200
    );
  };

  const visibleListings = selectedCategory === 'all'
    ? featuredListings
    : featuredListings.filter((l) => l.category === selectedCategory);

  return (
    <div className="bg-white min-h-screen">
      {/* Search bar */}
      <div className="flex justify-center px-6 pt-6 pb-3">
        <AirbnbSearchBar onSearch={handleSearch} />
      </div>

      {/* Category filter — sticky below navbar */}
      <div className="sticky top-[80px] z-30 bg-white">
        <CategoryFilter onChange={setSelectedCategory} />
      </div>

      {/* Responsive Property Grid */}
      <section className="max-w-[2520px] mx-auto px-6 sm:px-8 md:px-10 lg:px-20 pt-6 pb-12">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-x-6 gap-y-10">
          {loading
            ? Array.from({ length: 20 }).map((_, i) => (
                <PropertyCardSkeleton key={`skeleton-${i}`} />
              ))
            : visibleListings.map((listing) => (
                <PropertyCard
                  key={listing.id}
                  listing={listing}
                  isWishlisted={wishlistIds.includes(listing.id)}
                  onWishlistToggle={handleToggleWishlist}
                />
              ))
          }
        </div>

        {!loading && visibleListings.length === 0 && (
          <div className="text-center py-20">
            <p className="text-lg text-[#717171]">No homes found in this category.</p>
            <p className="text-sm text-[#717171] mt-1">Try selecting a different category above.</p>
          </div>
        )}
      </section>

      {/* Floating "Show map" button */}
      <div className="fixed bottom-24 left-1/2 -translate-x-1/2 z-40">
        <button
          onClick={() => navigate('/search')}
          className="flex items-center gap-2 px-5 py-3 bg-[#222222] text-white text-sm font-semibold rounded-full shadow-lg hover:bg-[#000000] transition-colors hover:scale-105 active:scale-95"
        >
          Show map
          <FaMapMarkerAlt className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Footer */}
      <footer className="border-t border-[#DDDDDD] bg-[#F7F7F7]">
        <div className="max-w-[2520px] mx-auto px-6 sm:px-8 md:px-10 lg:px-20 py-12">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
            <div>
              <h4 className="text-sm font-semibold text-[#222222] mb-4">About</h4>
              <div className="flex flex-col gap-3">
                <a href="#" className="text-sm text-[#717171] hover:underline">How RentGo works</a>
                <a href="#" className="text-sm text-[#717171] hover:underline">Newsroom</a>
                <a href="#" className="text-sm text-[#717171] hover:underline">Investors</a>
                <a href="#" className="text-sm text-[#717171] hover:underline">Careers</a>
              </div>
            </div>
            <div>
              <h4 className="text-sm font-semibold text-[#222222] mb-4">Hosting</h4>
              <div className="flex flex-col gap-3">
                <a href="#" className="text-sm text-[#717171] hover:underline">RentGo your home</a>
                <a href="#" className="text-sm text-[#717171] hover:underline">RentGo for Hosts</a>
                <a href="#" className="text-sm text-[#717171] hover:underline">Hosting resources</a>
                <a href="#" className="text-sm text-[#717171] hover:underline">Community forum</a>
              </div>
            </div>
            <div>
              <h4 className="text-sm font-semibold text-[#222222] mb-4">Support</h4>
              <div className="flex flex-col gap-3">
                <a href="#" className="text-sm text-[#717171] hover:underline">Help Center</a>
                <a href="#" className="text-sm text-[#717171] hover:underline">Get help with a safety issue</a>
                <a href="#" className="text-sm text-[#717171] hover:underline">Cancellation options</a>
                <a href="#" className="text-sm text-[#717171] hover:underline">Report a concern</a>
              </div>
            </div>
            <div>
              <h4 className="text-sm font-semibold text-[#222222] mb-4">RentGo</h4>
              <div className="flex flex-col gap-3">
                <a href="#" className="text-sm text-[#717171] hover:underline">Privacy</a>
                <a href="#" className="text-sm text-[#717171] hover:underline">Terms</a>
                <a href="#" className="text-sm text-[#717171] hover:underline">Sitemap</a>
                <a href="#" className="text-sm text-[#717171] hover:underline">Company details</a>
              </div>
            </div>
          </div>
        </div>
        <div className="border-t border-[#DDDDDD]">
          <div className="max-w-[2520px] mx-auto px-6 sm:px-8 md:px-10 lg:px-20 py-6 flex flex-col md:flex-row justify-between items-center gap-2">
            <div className="flex flex-wrap items-center gap-2 text-sm text-[#717171]">
              <span>&copy; 2026 RentGo, Inc.</span>
              <span>&middot;</span>
              <a href="#" className="hover:underline">Privacy</a>
              <span>&middot;</span>
              <a href="#" className="hover:underline">Terms</a>
              <span>&middot;</span>
              <a href="#" className="hover:underline">Sitemap</a>
            </div>
            <div className="flex items-center gap-4 text-sm text-[#222222] font-semibold">
              <span>English (US)</span>
              <span>$ USD</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default AirbnbHome;
