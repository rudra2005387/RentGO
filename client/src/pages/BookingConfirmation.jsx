import { useState, useEffect } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FaDownload, FaShare2, FaArrowRight, FaCalendar, FaUsers, FaMapMarkerAlt } from 'react-icons/fa';
import { useAuth } from '../hooks/useAuth';
import apiClient from '../config/apiClient';

const authFetch = async (path, token) => {
  const response = await apiClient.get(path);
  return response.data;
};

const formatDate = (d) =>
  d ? new Date(d).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' }) : '—';

const Skeleton = ({ className }) => (
  <div className={`animate-pulse bg-gray-200 rounded-xl ${className}`} />
);

const ConfettiPiece = ({ delay, duration }) => (
  <motion.div
    initial={{ y: 0, opacity: 1, rotate: 0 }}
    animate={{
      y: 300,
      opacity: 0,
      rotate: 360,
    }}
    transition={{
      duration,
      delay,
      ease: 'easeIn',
    }}
    className="absolute w-2 h-2 bg-primary rounded-full"
    style={{
      left: Math.random() * 100 + '%',
      top: 0,
    }}
  />
);

export default function BookingConfirmation() {
  const { bookingId } = useParams();
  const { user, token } = useAuth();
  const navigate = useNavigate();

  const [booking, setBooking] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!token) { navigate('/login'); return; }
    authFetch(`/bookings/${bookingId}`, token)
      .then((d) => {
        if (d.success) setBooking(d.data?.booking || d.data);
        else setError(d.message || 'Failed to load booking');
      })
      .catch(() => setError('Network error'))
      .finally(() => setLoading(false));
  }, [bookingId, token, navigate]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-primary-light flex items-center justify-center p-4">
        <div className="max-w-lg w-full space-y-4">
          <Skeleton className="h-10 w-2/3 mx-auto" />
          <Skeleton className="h-64" />
          <Skeleton className="h-48" />
        </div>
      </div>
    );
  }

  if (error || !booking) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-primary-light flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center"
        >
          <div className="text-6xl mb-4">😕</div>
          <p className="text-2xl font-bold text-gray-800 mb-2">Booking not found</p>
          <p className="text-gray-500 mb-6">{error}</p>
          <Link
            to="/dashboard"
            className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-white rounded-lg font-semibold hover:bg-primary-dark transition-colors"
          >
            Go to Dashboard
            <FaArrowRight />
          </Link>
        </motion.div>
      </div>
    );
  }

  const listing = booking.listing || {};
  const img = listing.images?.[0]?.url;
  const city = listing.location?.city || '';
  const state = listing.location?.state || '';
  const locationStr = [city, state].filter(Boolean).join(', ');
  const nights = booking.pricing?.nights || Math.ceil((new Date(booking.checkOutDate) - new Date(booking.checkInDate)) / (1000 * 60 * 60 * 24));
  const pricing = booking.pricing || {};
  const ref = booking.bookingReference || booking._id?.slice(-8).toUpperCase();

  const statusColors = {
    pending: 'bg-amber-50 text-amber-700 border-amber-200',
    confirmed: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    cancelled: 'bg-rose-50 text-rose-700 border-rose-200',
    completed: 'bg-sky-50 text-sky-700 border-sky-200',
  };
  const statusClass = statusColors[booking.status?.toLowerCase()] || 'bg-gray-50 text-gray-700 border-gray-200';

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1, delayChildren: 0.2 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5 } }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-primary-light">
      {/* Confetti */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        {[...Array(15)].map((_, i) => (
          <ConfettiPiece key={i} delay={i * 0.05} duration={2} />
        ))}
      </div>

      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12"
      >
        {/* Success Header */}
        <motion.div variants={itemVariants} className="text-center mb-12">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.5, type: 'spring' }}
            className="w-20 h-20 bg-gradient-to-br from-emerald-400 to-emerald-600 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg"
          >
            <motion.svg
              className="w-10 h-10 text-white"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
              initial={{ pathLength: 0 }}
              animate={{ pathLength: 1 }}
              transition={{ delay: 1, duration: 0.5 }}
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </motion.svg>
          </motion.div>
          <h1 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-3">
            {booking.status === 'confirmed' ? 'Booking Confirmed! 🎉' : 'Booking Request Submitted'}
          </h1>
          <p className="text-lg text-gray-600">
            {booking.status === 'pending'
              ? 'Your request has been sent to the host. You\'ll be notified once they respond.'
              : 'Your reservation is confirmed. Get ready for your trip!'}
          </p>
        </motion.div>

        {/* Main Booking Card */}
        <motion.div variants={itemVariants} className="bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-100 mb-8">
          {/* Property Preview */}
          <div className="grid md:grid-cols-3 gap-6 p-6 sm:p-8 border-b border-gray-100">
            <div className="md:col-span-1">
              <div className="w-full h-40 rounded-xl overflow-hidden bg-gray-200 flex items-center justify-center flex-shrink-0 shadow-md">
                {img ? (
                  <img src={img} alt={listing.title} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-rose-100 to-pink-200 flex items-center justify-center text-5xl">🏠</div>
                )}
              </div>
            </div>
            <div className="md:col-span-2">
              <p className="text-sm text-gray-500 mb-2">PROPERTY</p>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">{listing.title || 'Property'}</h2>
              <div className="flex items-center gap-2 text-gray-600 mb-4">
                <FaMapMarkerAlt className="text-primary" />
                <span>{locationStr}</span>
              </div>
              <div className={`inline-flex items-center px-4 py-2 rounded-full text-sm font-semibold border ${statusClass}`}>
                {booking.status?.charAt(0).toUpperCase()}{booking.status?.slice(1).toLowerCase()}
              </div>
            </div>
          </div>

          {/* Booking Details Grid */}
          <div className="p-6 sm:p-8 grid sm:grid-cols-4 gap-6 border-b border-gray-100">
            <motion.div variants={itemVariants} className="text-center sm:text-left">
              <p className="text-xs text-gray-400 uppercase tracking-wider font-semibold mb-2">Check-in</p>
              <p className="text-lg font-bold text-gray-900">{formatDate(booking.checkInDate)}</p>
            </motion.div>
            <motion.div variants={itemVariants} className="text-center sm:text-left">
              <p className="text-xs text-gray-400 uppercase tracking-wider font-semibold mb-2">Check-out</p>
              <p className="text-lg font-bold text-gray-900">{formatDate(booking.checkOutDate)}</p>
            </motion.div>
            <motion.div variants={itemVariants} className="text-center sm:text-left">
              <p className="text-xs text-gray-400 uppercase tracking-wider font-semibold mb-2">Guests</p>
              <div className="flex items-center gap-1 justify-center sm:justify-start">
                <FaUsers className="text-primary" />
                <p className="text-lg font-bold text-gray-900">{booking.guests || 1}</p>
              </div>
            </motion.div>
            <motion.div variants={itemVariants} className="text-center sm:text-left">
              <p className="text-xs text-gray-400 uppercase tracking-wider font-semibold mb-2">Duration</p>
              <p className="text-lg font-bold text-gray-900">{nights} night{nights > 1 ? 's' : ''}</p>
            </motion.div>
          </div>

          {/* Booking Reference */}
          <div className="p-6 sm:p-8 bg-gradient-to-r from-primary-light to-transparent border-b border-gray-100">
            <p className="text-xs text-gray-400 uppercase tracking-wider font-semibold mb-2">Booking Reference</p>
            <motion.p
              initial={{ scale: 0.95 }}
              animate={{ scale: 1 }}
              className="text-2xl sm:text-3xl font-bold text-primary tracking-wider"
            >
              #{ref}
            </motion.p>
            <p className="text-sm text-gray-500 mt-2">Save this reference for your records</p>
          </div>

          {/* Price Breakdown */}
          <div className="p-6 sm:p-8 space-y-3">
            <h3 className="text-sm font-bold text-gray-800 mb-4 uppercase">Price Breakdown</h3>
            {pricing.basePrice && (
              <div className="flex justify-between text-sm text-gray-600">
                <span>${pricing.basePrice} × {nights} night{nights > 1 ? 's' : ''}</span>
                <span className="font-semibold text-gray-900">${(pricing.basePrice * nights).toLocaleString()}</span>
              </div>
            )}
            {pricing.cleaningFee > 0 && (
              <div className="flex justify-between text-sm text-gray-600">
                <span>Cleaning fee</span>
                <span className="font-semibold text-gray-900">${pricing.cleaningFee.toLocaleString()}</span>
              </div>
            )}
            {pricing.serviceFee > 0 && (
              <div className="flex justify-between text-sm text-gray-600">
                <span>Service fee</span>
                <span className="font-semibold text-gray-900">${pricing.serviceFee.toLocaleString()}</span>
              </div>
            )}
            {pricing.taxes > 0 && (
              <div className="flex justify-between text-sm text-gray-600">
                <span>Taxes (12%)</span>
                <span className="font-semibold text-gray-900">${pricing.taxes.toLocaleString()}</span>
              </div>
            )}
            <div className="flex justify-between text-lg font-bold pt-3 border-t border-gray-200 mt-4">
              <span>Total Paid</span>
              <span className="text-primary">${(pricing.total || booking.totalPrice || 0).toLocaleString()}</span>
            </div>
          </div>
        </motion.div>

        {/* Action Buttons */}
        <motion.div variants={itemVariants} className="grid sm:grid-cols-2 gap-4 mb-8">
          <Link
            to="/dashboard"
            className="flex items-center justify-center gap-2 bg-primary text-white font-semibold px-6 py-4 rounded-xl hover:bg-primary-dark transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105 active:scale-95"
          >
            <FaArrowRight />
            Go to My Bookings
          </Link>
          <Link
            to={`/listing/${listing._id || booking.listing}`}
            className="flex items-center justify-center gap-2 bg-white text-primary font-semibold px-6 py-4 rounded-xl border-2 border-primary hover:bg-primary-light transition-all duration-200 shadow-md hover:shadow-lg"
          >
            <FaMapMarkerAlt />
            View Property
          </Link>
        </motion.div>

        {/* Additional Info Cards */}
        <motion.div variants={itemVariants} className="grid sm:grid-cols-2 gap-4">
          <div className="bg-white rounded-xl p-6 border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-start gap-4">
              <FaDownload className="text-primary text-xl mt-1 flex-shrink-0" />
              <div>
                <h3 className="font-semibold text-gray-900 mb-1">Download Receipt</h3>
                <p className="text-sm text-gray-600 mb-3">Get your booking confirmation</p>
                <button className="text-primary font-semibold text-sm hover:text-primary-dark">Download PDF</button>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl p-6 border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-start gap-4">
              <FaShare2 className="text-primary text-xl mt-1 flex-shrink-0" />
              <div>
                <h3 className="font-semibold text-gray-900 mb-1">Share Booking</h3>
                <p className="text-sm text-gray-600 mb-3">Tell friends about your trip</p>
                <button className="text-primary font-semibold text-sm hover:text-primary-dark">Share</button>
              </div>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
}
