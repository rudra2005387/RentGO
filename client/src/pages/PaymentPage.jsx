import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { FaLock, FaCreditCard, FaArrowLeft } from 'react-icons/fa';
import { useAuth } from '../hooks/useAuth';
import apiClient from '../config/apiClient';

function PriceLine({ label, amount, bold }) {
  return (
    <div className={`flex justify-between ${bold ? 'font-bold text-[#222222] text-base pt-3 border-t border-gray-200 mt-3' : 'text-sm text-[#484848]'}`}>
      <span>{label}</span>
      <span>${amount.toLocaleString()}</span>
    </div>
  );
}

function Skeleton({ className = '' }) {
  return <div className={`animate-pulse bg-gray-200 rounded-lg ${className}`} />;
}

export default function PaymentPage() {
  const { bookingId } = useParams();
  const navigate = useNavigate();
  const { token } = useAuth();

  const [booking, setBooking] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [paying, setPaying] = useState(false);

  useEffect(() => {
    if (!token) { navigate('/login'); return; }

    const fetchBooking = async () => {
      try {
        const res = await apiClient.get(`/bookings/${bookingId}`);
        const d = res.data;
        if (d.success) {
          setBooking(d.data?.booking || d.data);
        } else {
          setError(d.message || 'Booking not found');
        }
      } catch {
        setError('Network error');
      } finally {
        setLoading(false);
      }
    };
    fetchBooking();
  }, [bookingId, token, navigate]);

  const handlePay = async () => {
    setPaying(true);
    try {
      const res = await apiClient.post(`/payments/checkout`, { bookingId });
      const d = res.data;
      if (d.success && d.data?.sessionUrl) {
        // Redirect to Stripe Checkout
        window.location.href = d.data.sessionUrl;
      } else if (d.success && d.data?.url) {
        window.location.href = d.data.url;
      } else {
        // If no Stripe integration, redirect to confirmation
        navigate(`/booking-confirmation/${bookingId}`);
      }
    } catch {
      // Fallback — redirect to confirmation
      navigate(`/booking-confirmation/${bookingId}`);
    } finally {
      setPaying(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F7F7F7]">
        <div className="max-w-3xl mx-auto px-4 py-12 space-y-6">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-64" />
          <Skeleton className="h-48" />
        </div>
      </div>
    );
  }

  if (error || !booking) {
    return (
      <div className="min-h-screen bg-[#F7F7F7] flex items-center justify-center">
        <div className="text-center">
          <p className="text-5xl mb-4">💳</p>
          <p className="text-lg font-semibold text-gray-800 mb-2">Booking not found</p>
          <p className="text-sm text-gray-500 mb-4">{error}</p>
          <Link to="/dashboard" className="text-sm font-semibold text-[#FF385C] hover:underline">Go to Dashboard</Link>
        </div>
      </div>
    );
  }

  const listing = booking.listing || {};
  const listingImg = listing.images?.[0]?.url || listing.images?.[0];
  const city = listing.location?.city || '';
  const pricing = booking.pricing || {};
  const checkIn = booking.checkIn ? new Date(booking.checkIn) : null;
  const checkOut = booking.checkOut ? new Date(booking.checkOut) : null;
  const nights = checkIn && checkOut ? Math.ceil((checkOut - checkIn) / (1000 * 60 * 60 * 24)) : 0;

  const basePrice = pricing.basePrice || listing.pricing?.basePrice || 0;
  const subtotal = pricing.subtotal || basePrice * nights;
  const cleaningFee = pricing.cleaningFee || listing.pricing?.cleaningFee || 0;
  const serviceFee = pricing.serviceFee || listing.pricing?.serviceFee || 0;
  const taxes = pricing.taxes || Math.round((subtotal + cleaningFee + serviceFee) * 0.12);
  const total = pricing.total || booking.totalPrice || (subtotal + cleaningFee + serviceFee + taxes);

  const formatDate = (d) => d?.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) || '—';

  return (
    <div className="min-h-screen bg-[#F7F7F7]" style={{ fontFamily: "'DM Sans', sans-serif" }}>
      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
        {/* Header */}
        <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-sm font-medium text-[#222222] hover:text-[#FF385C] mb-8 transition-colors">
          <FaArrowLeft size={12} /> Back
        </button>

        <h1 className="text-2xl sm:text-3xl font-bold text-[#222222] mb-8">Confirm and Pay</h1>

        <div className="grid md:grid-cols-5 gap-8">
          {/* Left: Trip details + Pay button */}
          <div className="md:col-span-3 space-y-6">
            {/* Trip details */}
            <div className="bg-white rounded-2xl border border-gray-200 p-6 space-y-5">
              <h2 className="text-lg font-bold text-[#222222]">Your Trip</h2>

              <div className="flex justify-between items-center">
                <div>
                  <p className="text-sm font-semibold text-[#222222]">Dates</p>
                  <p className="text-sm text-[#717171]">{formatDate(checkIn)} — {formatDate(checkOut)}</p>
                </div>
                <span className="text-sm font-medium text-[#717171]">{nights} night{nights !== 1 ? 's' : ''}</span>
              </div>

              <div>
                <p className="text-sm font-semibold text-[#222222]">Guests</p>
                <p className="text-sm text-[#717171]">{booking.guests || 1} guest{(booking.guests || 1) > 1 ? 's' : ''}</p>
              </div>
            </div>

            {/* Payment section */}
            <div className="bg-white rounded-2xl border border-gray-200 p-6 space-y-5">
              <div className="flex items-center gap-2">
                <FaLock className="text-green-600" size={14} />
                <h2 className="text-lg font-bold text-[#222222]">Payment</h2>
              </div>

              <p className="text-sm text-[#717171]">
                You'll be redirected to our secure payment processor to complete your booking.
              </p>

              <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-xl">
                <FaCreditCard className="text-[#717171]" size={20} />
                <div>
                  <p className="text-sm font-semibold text-[#222222]">Secure Payment via Stripe</p>
                  <p className="text-xs text-[#717171]">All transactions are encrypted and secure</p>
                </div>
              </div>
            </div>

            {/* Pay button */}
            <button
              onClick={handlePay}
              disabled={paying}
              className="w-full bg-[#FF385C] text-white font-bold py-4 rounded-xl text-lg hover:bg-rose-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              <FaLock size={14} />
              {paying ? 'Processing...' : `Pay $${total.toLocaleString()}`}
            </button>

            <p className="text-xs text-center text-[#717171]">
              By selecting the button, you agree to the <span className="underline">Cancellation Policy</span> and <span className="underline">Terms of Service</span>.
            </p>
          </div>

          {/* Right: Booking summary card */}
          <div className="md:col-span-2">
            <div className="bg-white rounded-2xl border border-gray-200 p-6 space-y-5 sticky top-24">
              {/* Listing preview */}
              <div className="flex gap-4">
                {listingImg && (
                  <img src={listingImg} alt={listing.title} className="w-28 h-20 rounded-xl object-cover flex-shrink-0" />
                )}
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-[#222222] truncate">{listing.title}</p>
                  <p className="text-xs text-[#717171]">{city}</p>
                  {listing.averageRating && (
                    <p className="text-xs text-[#222222] mt-1">⭐ {listing.averageRating.toFixed(1)}</p>
                  )}
                </div>
              </div>

              <div className="border-t border-gray-200 pt-4">
                <h3 className="text-base font-bold text-[#222222] mb-3">Price Details</h3>
                <div className="space-y-2">
                  <PriceLine label={`$${basePrice} × ${nights} night${nights !== 1 ? 's' : ''}`} amount={subtotal} />
                  {cleaningFee > 0 && <PriceLine label="Cleaning fee" amount={cleaningFee} />}
                  {serviceFee > 0 && <PriceLine label="Service fee" amount={serviceFee} />}
                  <PriceLine label="Taxes" amount={taxes} />
                  <PriceLine label="Total" amount={total} bold />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
