import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FaLock, FaCreditCard, FaArrowLeft, FaShieldAlt, FaCheckCircle } from 'react-icons/fa';
import { Button } from '../components/ui';
import apiClient from '../config/apiClient';
import { useAuth } from '../hooks/useAuth';
import clsx from 'clsx';

function PriceLine({ label, amount, bold = false }) {
  return (
    <div className={clsx('flex justify-between', bold ? 'font-bold text-neutral-900 text-base pt-3 border-t border-neutral-200 mt-3' : 'text-sm text-neutral-700')}>
      <span>{label}</span>
      <span>${Number(amount).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
    </div>
  );
}

export default function PaymentPage() {
  const { bookingId } = useParams();
  const navigate = useNavigate();
  const { token } = useAuth();

  const [booking, setBooking] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [paying, setPaying] = useState(false);
  const [cardData, setCardData] = useState({
    cardNumber: '',
    cardName: '',
    expiryMonth: '',
    expiryYear: '',
    cvv: ''
  });

  useEffect(() => {
    if (!token) {
      navigate('/login');
      return;
    }

    const fetchBooking = async () => {
      try {
        const res = await apiClient.get(`/bookings/${bookingId}`);
        const d = res.data;
        if (d.success) {
          setBooking(d.data?.booking || d.data);
        } else {
          setError(d.message || 'Booking not found');
        }
      } catch (err) {
        setError('Network error');
      } finally {
        setLoading(false);
      }
    };

    fetchBooking();
  }, [bookingId, token, navigate]);

  const handlePay = async () => {
    if (!cardData.cardNumber || !cardData.cardName || !cardData.cvv) {
      setError('Please fill in all payment details');
      return;
    }

    setPaying(true);
    setError(null);

    try {
      const res = await apiClient.post(`/payments/checkout`, { bookingId });
      const d = res.data;

      if (d.success) {
        if (d.data?.sessionUrl) {
          window.location.href = d.data.sessionUrl;
        } else if (d.data?.url) {
          window.location.href = d.data.url;
        } else {
          navigate(`/booking-confirmation/${bookingId}`);
        }
      } else {
        navigate(`/booking-confirmation/${bookingId}`);
      }
    } catch (err) {
      setError(err.message || 'Payment failed');
      setPaying(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-neutral-50 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-airbnb-500 mb-4" />
          <p className="text-neutral-600">Loading checkout...</p>
        </div>
      </div>
    );
  }

  if (!booking) {
    return (
      <div className="min-h-screen bg-neutral-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-neutral-900 mb-2">Booking not found</h1>
          <p className="text-neutral-600 mb-4">{error}</p>
          <Button onClick={() => navigate('/')} variant="primary">
            Back to home
          </Button>
        </div>
      </div>
    );
  }

  const nights = booking.nights || 1;
  const basePrice = booking.pricing?.basePrice || 0;
  const subtotal = basePrice * nights;
  const serviceFee = Math.round(subtotal * 0.08 * 100) / 100;
  const tax = Math.round(subtotal * 0.1 * 100) / 100;
  const total = subtotal + serviceFee + tax;

  return (
    <div className="min-h-screen bg-neutral-50">
      <div className="bg-white border-b border-neutral-200 sticky top-0 z-40">
        <div className="max-w-6xl mx-auto px-4 md:px-6 py-4">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-neutral-700 hover:text-neutral-900 transition-colors"
          >
            <FaArrowLeft size={16} />
            <span className="font-medium">Back</span>
          </button>
        </div>
      </div>

      <div className="h-20" />

      <div className="max-w-6xl mx-auto px-4 md:px-6 py-8 md:py-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="lg:col-span-2"
          >
            <div className="bg-white rounded-2xl shadow-sm border border-neutral-200 p-8">
              <h2 className="text-2xl font-bold text-neutral-900 mb-6">Payment details</h2>

              {error && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm flex items-start gap-3"
                >
                  <span className="text-lg mt-0.5">⚠️</span>
                  <span>{error}</span>
                </motion.div>
              )}

              <div className="space-y-6 mb-8">
                <div>
                  <label className="block text-sm font-semibold text-neutral-900 mb-2">
                    Cardholder name
                  </label>
                  <input
                    type="text"
                    placeholder="Full name as shown on card"
                    value={cardData.cardName}
                    onChange={(e) => setCardData({ ...cardData, cardName: e.target.value })}
                    className="w-full px-4 py-3 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-airbnb-500 focus:border-transparent transition-all"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-neutral-900 mb-2">
                    Card number
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      placeholder="1234 5678 9012 3456"
                      value={cardData.cardNumber}
                      onChange={(e) => {
                        let val = e.target.value.replace(/\s/g, '');
                        val = val.replace(/(\d{4})/g, '$1 ').trim();
                        setCardData({ ...cardData, cardNumber: val });
                      }}
                      maxLength="19"
                      className="w-full px-4 py-3 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-airbnb-500 focus:border-transparent transition-all pl-12"
                    />
                    <FaCreditCard className="absolute left-4 top-3.5 text-neutral-400" />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-neutral-900 mb-2">
                      Expiry date
                    </label>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        placeholder="MM"
                        maxLength="2"
                        value={cardData.expiryMonth}
                        onChange={(e) => setCardData({ ...cardData, expiryMonth: e.target.value.slice(0, 2) })}
                        className="flex-1 px-3 py-3 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-airbnb-500 text-center"
                      />
                      <span className="text-neutral-400 text-2xl">/</span>
                      <input
                        type="text"
                        placeholder="YY"
                        maxLength="2"
                        value={cardData.expiryYear}
                        onChange={(e) => setCardData({ ...cardData, expiryYear: e.target.value.slice(0, 2) })}
                        className="flex-1 px-3 py-3 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-airbnb-500 text-center"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-neutral-900 mb-2">
                      CVV
                    </label>
                    <input
                      type="text"
                      placeholder="123"
                      maxLength="3"
                      value={cardData.cvv}
                      onChange={(e) => setCardData({ ...cardData, cvv: e.target.value.replace(/\D/g, '').slice(0, 3) })}
                      className="w-full px-3 py-3 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-airbnb-500 text-center"
                    />
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2 p-4 bg-blue-50 rounded-xl text-blue-900 text-sm mb-8">
                <FaShieldAlt className="flex-shrink-0" />
                <span>Your payment information is encrypted and secure</span>
              </div>

              <p className="text-xs text-neutral-600 mb-6">
                By proceeding, you agree to RentGo's Terms of Service and confirm you've read our Cancellation Policy.
              </p>

              <Button
                fullWidth
                variant="primary"
                size="lg"
                isLoading={paying}
                onClick={handlePay}
                className="flex items-center justify-center gap-2"
              >
                <FaLock size={14} />
                Pay ${total.toFixed(2)}
              </Button>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="lg:col-span-1"
          >
            <div className="sticky top-28 bg-white rounded-2xl shadow-sm border border-neutral-200 p-6">
              {booking.listing && (
                <div className="mb-6 pb-6 border-b border-neutral-200">
                  <div className="flex gap-3">
                    {booking.listing.images?.[0] && (
                      <img
                        src={booking.listing.images[0].url || booking.listing.images[0]}
                        alt=""
                        className="w-16 h-16 rounded-lg object-cover flex-shrink-0"
                      />
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-neutral-900 text-sm truncate">
                        {booking.listing.title}
                      </p>
                      <p className="text-xs text-neutral-600">
                        {booking.listing.location?.city}
                      </p>
                      {booking.listing.averageRating && (
                        <div className="flex items-center gap-1 mt-1">
                          <span className="text-yellow-400">★</span>
                          <span className="text-xs font-semibold text-neutral-900">
                            {booking.listing.averageRating.toFixed(2)}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}

              <div className="mb-6 pb-6 border-b border-neutral-200">
                <p className="text-xs font-semibold text-neutral-600 uppercase tracking-wide mb-2">Trip dates</p>
                <p className="text-sm text-neutral-900 font-medium">
                  {booking.checkInDate ? new Date(booking.checkInDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : 'N/A'} – {booking.checkOutDate ? new Date(booking.checkOutDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : 'N/A'}
                </p>
                <p className="text-sm text-neutral-600 mt-1">{nights} night{nights !== 1 ? 's' : ''}</p>
              </div>

              <div className="mb-6 space-y-3">
                <PriceLine label={`$${basePrice} × ${nights} night${nights !== 1 ? 's' : ''}`} amount={subtotal} />
                <PriceLine label="Service fee" amount={serviceFee} />
                <PriceLine label="Taxes" amount={tax} />
                <PriceLine label="Total" amount={total} bold />
              </div>

              <div className="flex items-start gap-2 p-3 bg-green-50 rounded-lg text-green-900 text-xs">
                <FaCheckCircle className="flex-shrink-0 mt-0.5" />
                <span>
                  <strong>Free cancellation</strong> for 48 hours. You're protected by our Host Guarantee.
                </span>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
