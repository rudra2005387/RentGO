import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FaHeart, FaShareAlt, FaStar, FaMapMarkerAlt, FaWifi, FaUtensils, FaParking,
  FaChevronLeft, FaChevronRight, FaTimes, FaSwimmingPool, FaDumbbell, FaSnowflake,
  FaBath, FaTree, FaShower, FaCheck, FaUsers
} from 'react-icons/fa';
import { Button, Badge } from '../components/ui';
import apiClient from '../config/apiClient';
import { useAuth } from '../hooks/useAuth';
import clsx from 'clsx';

const AMENITIES = {
  'WiFi': { Icon: FaWifi, color: 'text-blue-500' },
  'Kitchen': { Icon: FaUtensils, color: 'text-orange-500' },
  'Parking': { Icon: FaParking, color: 'text-purple-500' },
  'Pool': { Icon: FaSwimmingPool, color: 'text-cyan-500' },
  'Gym': { Icon: FaDumbbell, color: 'text-red-500' },
  'Air conditioning': { Icon: FaSnowflake, color: 'text-cyan-400' },
  'Hot tub': { Icon: FaBath, color: 'text-pink-500' },
  'Garden': { Icon: FaTree, color: 'text-green-500' },
};

function ImageGallery({ images = [] }) {
  const [selectedIdx, setSelectedIdx] = useState(0);
  const [showModal, setShowModal] = useState(false);

  const displayImages = images.length > 0 ? images : [
    'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=1200&q=80'
  ];

  const handlePrevious = () => {
    setSelectedIdx((prev) => (prev - 1 + displayImages.length) % displayImages.length);
  };

  const handleNext = () => {
    setSelectedIdx((prev) => (prev + 1) % displayImages.length);
  };

  return (
    <>
      <div className="relative w-full h-96 md:h-[500px] rounded-2xl overflow-hidden bg-neutral-100 group">
        <motion.img
          key={selectedIdx}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3 }}
          src={displayImages[selectedIdx]}
          alt="Property"
          className="w-full h-full object-cover"
        />

        {displayImages.length > 1 && (
          <>
            <button
              onClick={handlePrevious}
              className="absolute left-4 top-1/2 -translate-y-1/2 z-30 bg-white rounded-full p-2.5 hover:bg-neutral-100 transition-all shadow-lg"
            >
              <FaChevronLeft className="text-neutral-900" />
            </button>
            <button
              onClick={handleNext}
              className="absolute right-4 top-1/2 -translate-y-1/2 z-30 bg-white rounded-full p-2.5 hover:bg-neutral-100 transition-all shadow-lg"
            >
              <FaChevronRight className="text-neutral-900" />
            </button>
          </>
        )}

        <div className="absolute bottom-4 right-4 z-20 flex items-center gap-3">
          <span className="bg-neutral-900 text-white px-3 py-1.5 rounded-lg text-sm font-medium">
            {selectedIdx + 1} / {displayImages.length}
          </span>
          <button
            onClick={() => setShowModal(true)}
            className="bg-white px-4 py-2.5 rounded-lg font-semibold text-sm hover:bg-neutral-50 transition-all shadow-lg"
          >
            Show all
          </button>
        </div>
      </div>

      <AnimatePresence>
        {showModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-neutral-950 z-50 flex flex-col"
            onClick={() => setShowModal(false)}
          >
            <div className="flex items-center justify-between px-6 py-4 border-b border-neutral-800">
              <div className="text-white text-sm font-medium">
                {selectedIdx + 1} / {displayImages.length}
              </div>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setShowModal(false);
                }}
                className="text-white hover:text-neutral-300 p-2"
              >
                <FaTimes size={20} />
              </button>
            </div>

            <div className="flex-1 flex items-center justify-center px-6" onClick={(e) => e.stopPropagation()}>
              <motion.img
                key={`modal-${selectedIdx}`}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                src={displayImages[selectedIdx]}
                alt="Property"
                className="max-h-[80vh] max-w-[90vw] object-contain"
              />

              {displayImages.length > 1 && (
                <>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handlePrevious();
                    }}
                    className="absolute left-6 top-1/2 -translate-y-1/2 text-white hover:text-neutral-300 p-3"
                  >
                    <FaChevronLeft size={24} />
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleNext();
                    }}
                    className="absolute right-6 top-1/2 -translate-y-1/2 text-white hover:text-neutral-300 p-3"
                  >
                    <FaChevronRight size={24} />
                  </button>
                </>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

export default function ListingDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { userId, token } = useAuth();
  const [listing, setListing] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [checkIn, setCheckIn] = useState(null);
  const [checkOut, setCheckOut] = useState(null);
  const [guests, setGuests] = useState(1);

  useEffect(() => {
    const fetchListing = async () => {
      try {
        const response = await apiClient.get(`/listings/${id}`);
        setListing(response.data);
      } catch (error) {
        console.error('Failed to fetch listing:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchListing();
  }, [id]);

  useEffect(() => {
    if (userId && token) {
      checkWishlist();
    }
  }, [userId, token, id]);

  const checkWishlist = async () => {
    try {
      const response = await apiClient.get(`/users/${userId}/wishlist`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setIsWishlisted(response.data.some(item => item._id === id));
    } catch (error) {
      console.error('Failed to check wishlist:', error);
    }
  };

  const handleWishlistToggle = async () => {
    if (!userId || !token) {
      navigate('/login');
      return;
    }

    try {
      if (isWishlisted) {
        await apiClient.delete(`/users/${userId}/wishlist/${id}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
      } else {
        await apiClient.post(`/users/${userId}/wishlist`, { listingId: id }, {
          headers: { Authorization: `Bearer ${token}` }
        });
      }
      setIsWishlisted(!isWishlisted);
    } catch (error) {
      console.error('Failed to toggle wishlist:', error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-airbnb-500" />
      </div>
    );
  }

  if (!listing) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-neutral-900 mb-2">Listing not found</h2>
          <Button onClick={() => navigate('/')} variant="primary">
            Back to home
          </Button>
        </div>
      </div>
    );
  }

  const nights = checkIn && checkOut ? Math.ceil((checkOut - checkIn) / (1000 * 60 * 60 * 24)) : 0;
  const totalPrice = nights * (listing?.pricing?.basePrice || 0);
  const displayImages = listing?.images?.length > 0 
    ? listing.images.map(img => img.url || img)
    : ['https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=1200&q=80'];

  return (
    <div className="min-h-screen bg-white">
      <div className="h-20" />

      <div className="max-w-7xl mx-auto px-4 md:px-6 py-8">
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.5 }} className="mb-8">
          <ImageGallery images={displayImages} />
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <h1 className="text-3xl md:text-4xl font-bold text-neutral-900 mb-2">
                    {listing?.title || 'Property'}
                  </h1>
                  <div className="flex items-center gap-6 flex-wrap">
                    <div className="flex items-center gap-2 text-neutral-700">
                      <FaStar className="text-yellow-400" />
                      <span className="font-semibold">{listing?.averageRating?.toFixed(2) || 'N/A'}</span>
                      <span className="text-neutral-600">({listing?.totalReviews || 0})</span>
                    </div>
                    {listing?.location && (
                      <div className="flex items-center gap-2 text-neutral-700">
                        <FaMapMarkerAlt size={14} />
                        <span>{listing.location.city}, {listing.location.state}</span>
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex gap-2 ml-4">
                  <button className="p-3 rounded-full border border-neutral-300 hover:bg-neutral-50 transition-all">
                    <FaShareAlt className="text-neutral-700" />
                  </button>
                  <button
                    onClick={handleWishlistToggle}
                    className={clsx(
                      'p-3 rounded-full border transition-all',
                      isWishlisted
                        ? 'bg-red-50 border-red-300'
                        : 'border-neutral-300 hover:bg-neutral-50'
                    )}
                  >
                    <FaHeart className={clsx('text-xl', isWishlisted ? 'text-red-500' : 'text-neutral-700')} />
                  </button>
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15 }}
              className="py-6 border-b border-neutral-200"
            >
              <p className="text-neutral-700 mb-4">
                <span className="font-semibold text-neutral-900">{listing?.propertyType || 'Property'}</span>
                {' • '}
                <span>{listing?.bedrooms || 0} bedrooms</span>
                {' • '}
                <span>{listing?.bathrooms || 0} bathrooms</span>
                {' • '}
                <span>{listing?.maxGuests || 0} guests</span>
              </p>
              <p className="text-neutral-700 leading-relaxed">
                {listing?.description || 'No description available'}
              </p>
            </motion.div>

            {listing?.amenities && listing.amenities.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="py-8 border-b border-neutral-200"
              >
                <h2 className="text-2xl font-bold text-neutral-900 mb-6">What this place offers</h2>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {listing.amenities.slice(0, 8).map((amenity, idx) => {
                    const amenityInfo = AMENITIES[amenity];
                    return (
                      <motion.div
                        key={idx}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 + idx * 0.05 }}
                        className="flex items-center gap-3 p-3 rounded-lg hover:bg-neutral-50 transition-colors"
                      >
                        {amenityInfo ? (
                          <amenityInfo.Icon className={clsx('text-lg flex-shrink-0', amenityInfo.color)} />
                        ) : (
                          <FaCheck className="text-neutral-400" />
                        )}
                        <span className="font-medium text-neutral-900">{amenity}</span>
                      </motion.div>
                    );
                  })}
                </div>
              </motion.div>
            )}

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="py-8"
            >
              <h2 className="text-2xl font-bold text-neutral-900 mb-6">Reviews</h2>
              {listing?.reviews && listing.reviews.length > 0 ? (
                <div className="space-y-4">
                  {listing.reviews.slice(0, 3).map((review, idx) => (
                    <div key={idx} className="pb-4 border-b border-neutral-200">
                      <div className="flex items-center gap-2 mb-2">
                        <div className="flex text-yellow-400">
                          {[...Array(review.rating || 5)].map((_, i) => (
                            <FaStar key={i} size={14} />
                          ))}
                        </div>
                        <span className="font-semibold text-neutral-900">{review.author || 'Guest'}</span>
                      </div>
                      <p className="text-neutral-700">{review.comment || ''}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-neutral-600">No reviews yet</p>
              )}
            </motion.div>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="lg:col-span-1"
          >
            <div className="sticky top-28 bg-white border border-neutral-300 rounded-2xl p-6 shadow-lg">
              <div className="mb-6">
                <div className="flex items-baseline gap-2 mb-1">
                  <span className="text-3xl font-bold text-neutral-900">
                    ${listing?.pricing?.basePrice || 0}
                  </span>
                  <span className="text-neutral-700">/night</span>
                </div>
                {totalPrice > 0 && (
                  <p className="text-sm text-neutral-600">
                    ${totalPrice.toFixed(2)} total
                  </p>
                )}
              </div>

              <div className="space-y-4 mb-6">
                <input
                  type="date"
                  value={checkIn ? checkIn.toISOString().split('T')[0] : ''}
                  onChange={(e) => setCheckIn(e.target.value ? new Date(e.target.value) : null)}
                  className="w-full px-3 py-2 border border-neutral-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-airbnb-500"
                />
                <input
                  type="date"
                  value={checkOut ? checkOut.toISOString().split('T')[0] : ''}
                  onChange={(e) => setCheckOut(e.target.value ? new Date(e.target.value) : null)}
                  className="w-full px-3 py-2 border border-neutral-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-airbnb-500"
                />
                <input
                  type="number"
                  min="1"
                  max={listing?.maxGuests || 8}
                  value={guests}
                  onChange={(e) => setGuests(Math.max(1, parseInt(e.target.value) || 1))}
                  className="w-full px-3 py-2 border border-neutral-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-airbnb-500"
                />
              </div>

              <Button
                fullWidth
                variant="primary"
                className="mb-3"
                onClick={() => {
                  if (checkIn && checkOut) {
                    navigate('/booking', {
                      state: { listingId: id, checkIn, checkOut, guests }
                    });
                  }
                }}
              >
                Reserve
              </Button>

              <div className="pt-4 border-t border-neutral-200 space-y-2 text-sm text-neutral-700">
                <p>✓ Free cancellation for 48 hours</p>
                <p>✓ Instant booking</p>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
