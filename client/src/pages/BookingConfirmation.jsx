import { useState, useEffect } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
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
      <div className="min-h-screen bg-[#f8f7f5] flex items-center justify-center" style={{ fontFamily: "'DM Sans', sans-serif" }}>
        <div className="max-w-lg w-full mx-4 space-y-4">
          <Skeleton className="h-10 w-2/3" />
          <Skeleton className="h-64" />
          <Skeleton className="h-48" />
        </div>
      </div>
    );
  }

  if (error || !booking) {
    return (
      <div className="min-h-screen bg-[#f8f7f5] flex items-center justify-center" style={{ fontFamily: "'DM Sans', sans-serif" }}>
        <div className="text-center">
          <p className="text-5xl mb-4">😕</p>
          <p className="text-lg font-semibold text-gray-800 mb-2">Booking not found</p>
          <p className="text-sm text-gray-500 mb-4">{error}</p>
          <Link to="/dashboard" className="text-sm font-semibold text-[#FF385C] hover:underline">Go to Dashboard</Link>
        </div>
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

  return (
    <div className="min-h-screen bg-[#f8f7f5]" style={{ fontFamily: "'DM Sans', sans-serif" }}>
      <div className="max-w-2xl mx-auto px-6 py-12">

        {/* Success header */}
        <div className="text-center mb-10">
          <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2" style={{ fontFamily: "Fraunces, serif" }}>
            Booking {booking.status === 'confirmed' ? 'Confirmed' : 'Submitted'}!
          </h1>
          <p className="text-gray-500">
            {booking.status === 'pending'
              ? 'Your request has been sent to the host. You\'ll be notified once they respond.'
              : 'Your reservation is confirmed. Get ready for your trip!'}
          </p>
        </div>

        {/* Booking card */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden mb-6">
          {/* Listing image & title */}
          <div className="flex gap-4 p-6 border-b border-gray-100">
            <div className="w-24 h-24 rounded-xl overflow-hidden bg-gray-100 flex-shrink-0">
              {img ? (
                <img src={img} alt={listing.title} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full bg-gradient-to-br from-rose-100 to-pink-200 flex items-center justify-center text-3xl">🏠</div>
              )}
            </div>
            <div className="min-w-0">
              <p className="font-bold text-gray-900 truncate">{listing.title || 'Property'}</p>
              <p className="text-sm text-gray-500">{locationStr}</p>
              <div className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border mt-2 ${statusClass}`}>
                {booking.status}
              </div>
            </div>
          </div>

          {/* Booking details */}
          <div className="p-6 space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-xs text-gray-400 uppercase tracking-wide">Check-in</p>
                <p className="text-sm font-semibold text-gray-900">{formatDate(booking.checkInDate)}</p>
              </div>
              <div>
                <p className="text-xs text-gray-400 uppercase tracking-wide">Check-out</p>
                <p className="text-sm font-semibold text-gray-900">{formatDate(booking.checkOutDate)}</p>
              </div>
              <div>
                <p className="text-xs text-gray-400 uppercase tracking-wide">Guests</p>
                <p className="text-sm font-semibold text-gray-900">{booking.guests || 1} guest{(booking.guests || 1) > 1 ? 's' : ''}</p>
              </div>
              <div>
                <p className="text-xs text-gray-400 uppercase tracking-wide">Nights</p>
                <p className="text-sm font-semibold text-gray-900">{nights}</p>
              </div>
            </div>

            <div className="border-t border-gray-100 pt-4">
              <p className="text-xs text-gray-400 uppercase tracking-wide mb-1">Booking Reference</p>
              <p className="text-lg font-bold text-gray-900 tracking-wider">#{ref}</p>
            </div>
          </div>

          {/* Price breakdown */}
          <div className="p-6 bg-gray-50 border-t border-gray-100 space-y-2">
            <h3 className="text-sm font-bold text-gray-800 mb-3">Price Breakdown</h3>
            {pricing.basePrice && (
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">${pricing.basePrice} x {nights} night{nights > 1 ? 's' : ''}</span>
                <span className="text-gray-900 font-medium">${(pricing.basePrice * nights).toLocaleString()}</span>
              </div>
            )}
            {pricing.cleaningFee > 0 && (
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Cleaning fee</span>
                <span className="text-gray-900 font-medium">${pricing.cleaningFee.toLocaleString()}</span>
              </div>
            )}
            {pricing.serviceFee > 0 && (
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Service fee</span>
                <span className="text-gray-900 font-medium">${pricing.serviceFee.toLocaleString()}</span>
              </div>
            )}
            {pricing.taxes > 0 && (
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Taxes (12%)</span>
                <span className="text-gray-900 font-medium">${pricing.taxes.toLocaleString()}</span>
              </div>
            )}
            <div className="flex justify-between text-base font-bold pt-3 border-t border-gray-200">
              <span className="text-gray-900">Total</span>
              <span className="text-gray-900">${(pricing.total || booking.totalPrice || 0).toLocaleString()}</span>
            </div>
          </div>
        </div>

        {/* Action buttons */}
        <div className="flex flex-col sm:flex-row gap-3">
          <Link
            to="/dashboard"
            className="flex-1 text-center bg-[#FF385C] text-white text-sm font-semibold px-6 py-3 rounded-xl hover:bg-rose-600 transition-colors"
          >
            Go to My Bookings
          </Link>
          <Link
            to={`/listing/${listing._id || booking.listing}`}
            className="flex-1 text-center bg-white text-gray-700 text-sm font-semibold px-6 py-3 rounded-xl border border-gray-200 hover:bg-gray-50 transition-colors"
          >
            View Listing
          </Link>
        </div>
      </div>
    </div>
  );
}
