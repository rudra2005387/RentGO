import { useState, useEffect } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const authFetch = (path, token, opts = {}) =>
  fetch(`${API_BASE}${path}`, {
    ...opts,
    headers: {
      Authorization: `Bearer ${token}`,
      ...(opts.body ? { 'Content-Type': 'application/json' } : {}),
    },
  }).then((r) => r.json());

const formatDate = (d) =>
  d ? new Date(d).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' }) : '—';

const Badge = ({ children, color = 'gray' }) => {
  const colors = {
    green: 'bg-emerald-50 text-emerald-700 ring-emerald-200',
    yellow: 'bg-amber-50 text-amber-700 ring-amber-200',
    red: 'bg-rose-50 text-rose-700 ring-rose-200',
    blue: 'bg-sky-50 text-sky-700 ring-sky-200',
    gray: 'bg-gray-100 text-gray-600 ring-gray-200',
  };
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ring-1 ${colors[color]}`}>
      {children}
    </span>
  );
};

const statusColor = (s) => {
  if (!s) return 'gray';
  const m = { confirmed: 'green', pending: 'yellow', cancelled: 'red', completed: 'blue' };
  return m[s.toLowerCase()] || 'gray';
};

export default function BookingDetail() {
  const { bookingId } = useParams();
  const { user, token } = useAuth();
  const navigate = useNavigate();

  const [booking, setBooking] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [cancelling, setCancelling] = useState(false);
  const [cancelReason, setCancelReason] = useState('');
  const [showCancelModal, setShowCancelModal] = useState(false);

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

  const handleCancel = async () => {
    setCancelling(true);
    try {
      const d = await authFetch(`/bookings/${bookingId}/cancel`, token, {
        method: 'POST',
        body: JSON.stringify({ reason: cancelReason }),
      });
      if (d.success) {
        setBooking((prev) => ({ ...prev, status: 'cancelled' }));
        setShowCancelModal(false);
      }
    } catch {
      // silently fail
    } finally {
      setCancelling(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#f8f7f5] flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#FF385C]" />
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
  const canCancel = ['pending', 'confirmed'].includes(booking.status?.toLowerCase());

  const host = listing.host || booking.host || {};
  const hostName = [host.firstName, host.lastName].filter(Boolean).join(' ') || 'Host';

  return (
    <div className="min-h-screen bg-[#f8f7f5]" style={{ fontFamily: "'DM Sans', sans-serif" }}>
      <div className="max-w-3xl mx-auto px-6 py-8">

        {/* Back link */}
        <Link to="/dashboard" className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-gray-800 mb-6 transition-colors">
          ← Back to Dashboard
        </Link>

        {/* Header */}
        <div className="flex items-start justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-gray-900" style={{ fontFamily: "Fraunces, serif" }}>
              Booking Details
            </h1>
            <p className="text-sm text-gray-500 mt-1">Reference #{ref}</p>
          </div>
          <Badge color={statusColor(booking.status)}>{booking.status}</Badge>
        </div>

        {/* Listing card */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden mb-6">
          <div className="flex gap-4 p-6">
            <Link to={`/listing/${listing._id || booking.listing}`} className="w-28 h-28 rounded-xl overflow-hidden bg-gray-100 flex-shrink-0 block">
              {img ? (
                <img src={img} alt={listing.title} className="w-full h-full object-cover hover:scale-105 transition-transform" />
              ) : (
                <div className="w-full h-full bg-gradient-to-br from-rose-100 to-pink-200 flex items-center justify-center text-4xl">🏠</div>
              )}
            </Link>
            <div className="min-w-0 flex-1">
              <Link to={`/listing/${listing._id || booking.listing}`} className="font-bold text-gray-900 text-lg hover:text-[#FF385C] transition-colors">
                {listing.title || 'Property'}
              </Link>
              <p className="text-sm text-gray-500 mt-1">{locationStr}</p>
              {listing.propertyType && (
                <p className="text-xs text-gray-400 mt-1 capitalize">{listing.propertyType}</p>
              )}
              <div className="flex items-center gap-2 mt-3">
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-rose-400 to-pink-600 flex items-center justify-center text-white text-xs font-bold">
                  {hostName.charAt(0)}
                </div>
                <div>
                  <p className="text-xs font-semibold text-gray-700">Hosted by {hostName}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Trip details */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 mb-6">
          <h2 className="font-bold text-gray-800 mb-4" style={{ fontFamily: "Fraunces, serif" }}>Trip Details</h2>
          <div className="grid grid-cols-2 gap-6">
            <div>
              <p className="text-xs text-gray-400 uppercase tracking-wide mb-1">Check-in</p>
              <p className="text-sm font-semibold text-gray-900">{formatDate(booking.checkInDate)}</p>
              <p className="text-xs text-gray-500">After 3:00 PM</p>
            </div>
            <div>
              <p className="text-xs text-gray-400 uppercase tracking-wide mb-1">Check-out</p>
              <p className="text-sm font-semibold text-gray-900">{formatDate(booking.checkOutDate)}</p>
              <p className="text-xs text-gray-500">Before 11:00 AM</p>
            </div>
            <div>
              <p className="text-xs text-gray-400 uppercase tracking-wide mb-1">Guests</p>
              <p className="text-sm font-semibold text-gray-900">{booking.guests || 1} guest{(booking.guests || 1) > 1 ? 's' : ''}</p>
            </div>
            <div>
              <p className="text-xs text-gray-400 uppercase tracking-wide mb-1">Duration</p>
              <p className="text-sm font-semibold text-gray-900">{nights} night{nights > 1 ? 's' : ''}</p>
            </div>
          </div>
        </div>

        {/* Price breakdown */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 mb-6">
          <h2 className="font-bold text-gray-800 mb-4" style={{ fontFamily: "Fraunces, serif" }}>Price Breakdown</h2>
          <div className="space-y-3">
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
            <div className="flex justify-between text-base font-bold pt-3 border-t border-gray-100">
              <span className="text-gray-900">Total</span>
              <span className="text-gray-900">${(pricing.total || booking.totalPrice || 0).toLocaleString()}</span>
            </div>
          </div>
        </div>

        {/* Cancel booking */}
        {canCancel && (
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 mb-6">
            <h2 className="font-bold text-gray-800 mb-2" style={{ fontFamily: "Fraunces, serif" }}>Need to cancel?</h2>
            <p className="text-sm text-gray-500 mb-4">Free cancellation up to 7 days before check-in.</p>
            <button
              onClick={() => setShowCancelModal(true)}
              className="text-sm font-semibold text-rose-500 border border-rose-200 px-4 py-2 rounded-xl hover:bg-rose-50 transition-colors"
            >
              Cancel Booking
            </button>
          </div>
        )}

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-3">
          <Link
            to="/dashboard"
            className="flex-1 text-center bg-[#FF385C] text-white text-sm font-semibold px-6 py-3 rounded-xl hover:bg-rose-600 transition-colors"
          >
            Back to My Bookings
          </Link>
          <Link
            to={`/listing/${listing._id || booking.listing}`}
            className="flex-1 text-center bg-white text-gray-700 text-sm font-semibold px-6 py-3 rounded-xl border border-gray-200 hover:bg-gray-50 transition-colors"
          >
            View Listing
          </Link>
        </div>
      </div>

      {/* Cancel modal */}
      {showCancelModal && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-2">Cancel Booking</h3>
            <p className="text-sm text-gray-500 mb-4">Are you sure you want to cancel this booking? This action cannot be undone.</p>
            <textarea
              value={cancelReason}
              onChange={(e) => setCancelReason(e.target.value)}
              placeholder="Reason for cancellation (optional)"
              className="w-full border border-gray-200 rounded-xl p-3 text-sm focus:outline-none focus:ring-2 focus:ring-rose-300 resize-none h-24 mb-4"
            />
            <div className="flex gap-3">
              <button
                onClick={handleCancel}
                disabled={cancelling}
                className="flex-1 bg-rose-500 text-white text-sm font-semibold py-2.5 rounded-xl hover:bg-rose-600 transition-colors disabled:opacity-50"
              >
                {cancelling ? 'Cancelling...' : 'Yes, Cancel'}
              </button>
              <button
                onClick={() => setShowCancelModal(false)}
                className="flex-1 bg-gray-100 text-gray-700 text-sm font-semibold py-2.5 rounded-xl hover:bg-gray-200 transition-colors"
              >
                Keep Booking
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
