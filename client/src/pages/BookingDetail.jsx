import { useState, useEffect } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
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

const P = '#FF385C';
const PD = '#E31C5F';
const HF = "'Fraunces', Georgia, serif";
const BF = "'DM Sans', system-ui, sans-serif";

let _fonts = false;
function loadFonts() {
  if (_fonts || typeof document === 'undefined') return;
  _fonts = true;
  const l = document.createElement('link');
  l.rel = 'stylesheet';
  l.href = 'https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,400;9..144,600;9..144,700&family=DM+Sans:wght@300;400;500;600;700&display=swap';
  document.head.appendChild(l);
}

const formatDate = (d, fmt = { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' }) =>
  d ? new Date(d).toLocaleDateString('en-US', fmt) : '—';

const STATUS_CFG = {
  confirmed: { bg: 'linear-gradient(135deg,#DCFCE7,#BBF7D0)', fg: '#15803D', dot: '#22C55E', icon: '✅', label: 'Confirmed' },
  pending:   { bg: 'linear-gradient(135deg,#FEF9C3,#FDE68A)', fg: '#A16207', dot: '#EAB308', icon: '⏳', label: 'Pending' },
  cancelled: { bg: 'linear-gradient(135deg,#FFE4E6,#FECDD3)', fg: '#BE123C', dot: '#F43F5E', icon: '❌', label: 'Cancelled' },
  completed: { bg: 'linear-gradient(135deg,#DBEAFE,#BFDBFE)', fg: '#1D4ED8', dot: '#3B82F6', icon: '🏁', label: 'Completed' },
};
const getStatus = (s) => STATUS_CFG[s?.toLowerCase()] || { bg: '#F3F4F6', fg: '#6B7280', dot: '#9CA3AF', icon: '•', label: s || 'Unknown' };

const Shimmer = ({ h = 16, r = 8, style = {} }) => (
  <div style={{
    height: h, borderRadius: r,
    background: 'linear-gradient(90deg,#f0f0f0 25%,#e8e8e8 50%,#f0f0f0 75%)',
    backgroundSize: '200% 100%', animation: 'shimmer 1.6s infinite', ...style,
  }} />
);

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

  useEffect(() => { loadFonts(); }, []);

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
    } catch { /* silently fail */ }
    finally { setCancelling(false); }
  };

  /* ── Loading skeleton ── */
  if (loading) return (
    <div style={{ minHeight: '100vh', background: '#F8F7F5', fontFamily: BF }}>
      <style>{`@keyframes shimmer{0%{background-position:200% 0}100%{background-position:-200% 0}}`}</style>
      <div style={{ maxWidth: 760, margin: '0 auto', padding: '32px 24px' }}>
        <Shimmer h={14} r={6} style={{ width: 120, marginBottom: 32 }} />
        <Shimmer h={320} r={24} style={{ marginBottom: 24 }} />
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}>
          {[0,1].map(i => <Shimmer key={i} h={140} r={20} />)}
        </div>
        <Shimmer h={220} r={20} />
      </div>
    </div>
  );

  /* ── Error state ── */
  if (error || !booking) return (
    <div style={{ minHeight: '100vh', background: '#F8F7F5', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: BF }}>
      <div style={{ textAlign: 'center' }}>
        <p style={{ fontSize: 56, marginBottom: 16 }}>😕</p>
        <p style={{ fontFamily: HF, fontSize: 22, fontWeight: 600, color: '#111', marginBottom: 8 }}>Booking not found</p>
        <p style={{ color: '#888', fontSize: 14, marginBottom: 20 }}>{error}</p>
        <Link to="/dashboard" style={{ fontFamily: BF, fontSize: 13, fontWeight: 700, color: P, textDecoration: 'underline' }}>← Back to Dashboard</Link>
      </div>
    </div>
  );

  const listing = booking.listing || {};
  const img = listing.images?.[0]?.url;
  const allImgs = (listing.images || []).map(i => i.url || i).filter(Boolean);
  const city = listing.location?.city || '';
  const state = listing.location?.state || '';
  const country = listing.location?.country || '';
  const locationStr = [city, state, country].filter(Boolean).join(', ');
  const nights = booking.pricing?.nights ||
    (booking.checkInDate && booking.checkOutDate
      ? Math.ceil((new Date(booking.checkOutDate) - new Date(booking.checkInDate)) / 86400000)
      : 1);
  const pricing = booking.pricing || {};
  const ref = booking.bookingReference || booking._id?.slice(-8).toUpperCase();
  const canCancel = ['pending', 'confirmed'].includes(booking.status?.toLowerCase());
  const host = listing.host || booking.host || {};
  const hostName = [host.firstName, host.lastName].filter(Boolean).join(' ') || 'Host';
  const statusCfg = getStatus(booking.status);

  return (
    <div style={{ minHeight: '100vh', background: '#F8F7F5', fontFamily: BF }}>
      <style>{`@keyframes shimmer{0%{background-position:200% 0}100%{background-position:-200% 0}} *{box-sizing:border-box}`}</style>

      {/* ── Sticky top bar ── */}
      <header style={{
        position: 'sticky', top: 0, zIndex: 50,
        background: 'rgba(255,255,255,.92)', backdropFilter: 'blur(12px)',
        borderBottom: '1px solid #F0F0F0',
        boxShadow: '0 1px 0 rgba(0,0,0,.04)',
      }}>
        <div style={{ maxWidth: 760, margin: '0 auto', padding: '0 24px', height: 60, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Link to="/dashboard" style={{ display: 'flex', alignItems: 'center', gap: 6, fontFamily: BF, fontSize: 13, fontWeight: 600, color: '#555', textDecoration: 'none', transition: 'color .15s' }}
            onMouseOver={e => e.currentTarget.style.color = '#111'}
            onMouseOut={e => e.currentTarget.style.color = '#555'}>
            ← My Bookings
          </Link>
          <Link to="/" style={{ fontFamily: HF, fontSize: 20, fontWeight: 700, color: P, textDecoration: 'none' }}>RentGo</Link>
          <div style={{ width: 100 }} />
        </div>
      </header>

      <div style={{ maxWidth: 760, margin: '0 auto', padding: '32px 24px 80px' }}>

        {/* ── Hero image ── */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45 }}
          style={{ borderRadius: 24, overflow: 'hidden', marginBottom: 24, position: 'relative', height: 300 }}
        >
          {allImgs.length > 0 ? (
            <img src={allImgs[0]} alt={listing.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          ) : (
            <div style={{ width: '100%', height: '100%', background: 'linear-gradient(135deg,#FFE4E6,#FDE8D8,#FEF9C3)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 80 }}>🏠</div>
          )}
          {/* Gradient overlay */}
          <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(0,0,0,.6) 0%, rgba(0,0,0,.1) 50%, transparent 100%)' }} />
          {/* Info overlay */}
          <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, padding: '24px 28px' }}>
            <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between' }}>
              <div>
                <p style={{ fontFamily: BF, fontSize: 11, fontWeight: 600, color: 'rgba(255,255,255,.7)', textTransform: 'uppercase', letterSpacing: '.1em', marginBottom: 4 }}>
                  {listing.propertyType || 'Property'}
                </p>
                <h1 style={{ fontFamily: HF, fontSize: 24, fontWeight: 700, color: '#fff', lineHeight: 1.2, margin: 0 }}>
                  {listing.title || 'Property'}
                </h1>
                <p style={{ fontFamily: BF, fontSize: 13, color: 'rgba(255,255,255,.75)', marginTop: 4 }}>📍 {locationStr}</p>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, background: statusCfg.bg, padding: '8px 14px', borderRadius: 99, flexShrink: 0 }}>
                <span style={{ fontSize: 14 }}>{statusCfg.icon}</span>
                <span style={{ fontFamily: BF, fontSize: 12, fontWeight: 700, color: statusCfg.fg }}>{statusCfg.label}</span>
              </div>
            </div>
          </div>
          {/* Ref badge */}
          <div style={{ position: 'absolute', top: 16, right: 16, background: 'rgba(0,0,0,.4)', backdropFilter: 'blur(8px)', borderRadius: 8, padding: '6px 12px' }}>
            <p style={{ fontFamily: BF, fontSize: 11, fontWeight: 600, color: 'rgba(255,255,255,.7)', letterSpacing: '.05em' }}>REF</p>
            <p style={{ fontFamily: BF, fontSize: 12, fontWeight: 700, color: '#fff', fontVariant: 'monospace' }}>#{ref}</p>
          </div>
        </motion.div>

        {/* ── Host card ── */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.08, duration: 0.4 }}
          style={{ background: '#fff', borderRadius: 20, border: '1px solid #F0F0F0', boxShadow: '0 2px 12px rgba(0,0,0,.05)', padding: '16px 20px', marginBottom: 16, display: 'flex', alignItems: 'center', gap: 14 }}
        >
          <div style={{
            width: 48, height: 48, borderRadius: '50%',
            background: `linear-gradient(135deg, ${P}, ${PD})`,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: '#fff', fontFamily: BF, fontWeight: 700, fontSize: 18, flexShrink: 0,
          }}>
            {host.profileImage
              ? <img src={host.profileImage} alt={hostName} style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover' }} />
              : hostName.charAt(0).toUpperCase()
            }
          </div>
          <div style={{ flex: 1 }}>
            <p style={{ fontFamily: BF, fontSize: 12, color: '#888', marginBottom: 1 }}>Hosted by</p>
            <p style={{ fontFamily: BF, fontSize: 15, fontWeight: 700, color: '#111' }}>{hostName}</p>
          </div>
          <Link
            to={`/listing/${listing._id || booking.listing}`}
            style={{ fontFamily: BF, fontSize: 12, fontWeight: 700, color: P, border: `1.5px solid ${P}`, textDecoration: 'none', padding: '8px 16px', borderRadius: 10, transition: 'background .15s' }}
            onMouseOver={e => e.currentTarget.style.background = '#FFF1F2'}
            onMouseOut={e => e.currentTarget.style.background = 'transparent'}
          >
            View Listing
          </Link>
        </motion.div>

        {/* ── Trip Details ── */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.14, duration: 0.4 }}
          style={{ background: '#fff', borderRadius: 20, border: '1px solid #F0F0F0', boxShadow: '0 2px 12px rgba(0,0,0,.05)', padding: '22px 24px', marginBottom: 16 }}
        >
          <h2 style={{ fontFamily: HF, fontSize: 18, fontWeight: 600, color: '#111', marginBottom: 20 }}>Trip Details</h2>

          {/* Date range visual */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr auto 1fr', alignItems: 'center', gap: 12, marginBottom: 20 }}>
            {/* Check-in */}
            <div style={{ background: '#F8F7F5', borderRadius: 16, padding: '16px 18px' }}>
              <p style={{ fontFamily: BF, fontSize: 10, fontWeight: 800, color: '#aaa', textTransform: 'uppercase', letterSpacing: '.1em', marginBottom: 6 }}>Check-in</p>
              <p style={{ fontFamily: HF, fontSize: 18, fontWeight: 600, color: '#111', marginBottom: 3 }}>
                {formatDate(booking.checkInDate, { month: 'short', day: 'numeric' })}
              </p>
              <p style={{ fontFamily: BF, fontSize: 12, color: '#888' }}>
                {formatDate(booking.checkInDate, { weekday: 'long', year: 'numeric' })}
              </p>
              <p style={{ fontFamily: BF, fontSize: 11, color: '#aaa', marginTop: 4 }}>After 3:00 PM</p>
            </div>
            {/* Nights pill */}
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
              <div style={{ width: 1, height: 20, background: '#E5E7EB' }} />
              <div style={{ background: '#111', color: '#fff', fontFamily: BF, fontSize: 11, fontWeight: 700, padding: '6px 12px', borderRadius: 99, whiteSpace: 'nowrap' }}>
                {nights} night{nights > 1 ? 's' : ''}
              </div>
              <div style={{ width: 1, height: 20, background: '#E5E7EB' }} />
            </div>
            {/* Check-out */}
            <div style={{ background: '#F8F7F5', borderRadius: 16, padding: '16px 18px' }}>
              <p style={{ fontFamily: BF, fontSize: 10, fontWeight: 800, color: '#aaa', textTransform: 'uppercase', letterSpacing: '.1em', marginBottom: 6 }}>Check-out</p>
              <p style={{ fontFamily: HF, fontSize: 18, fontWeight: 600, color: '#111', marginBottom: 3 }}>
                {formatDate(booking.checkOutDate, { month: 'short', day: 'numeric' })}
              </p>
              <p style={{ fontFamily: BF, fontSize: 12, color: '#888' }}>
                {formatDate(booking.checkOutDate, { weekday: 'long', year: 'numeric' })}
              </p>
              <p style={{ fontFamily: BF, fontSize: 11, color: '#aaa', marginTop: 4 }}>Before 11:00 AM</p>
            </div>
          </div>

          {/* Guests row */}
          <div style={{ display: 'flex', gap: 12 }}>
            <div style={{ flex: 1, background: '#F8F7F5', borderRadius: 14, padding: '14px 16px', display: 'flex', alignItems: 'center', gap: 10 }}>
              <span style={{ fontSize: 22 }}>👤</span>
              <div>
                <p style={{ fontFamily: BF, fontSize: 10, fontWeight: 800, color: '#aaa', textTransform: 'uppercase', letterSpacing: '.1em', marginBottom: 2 }}>Guests</p>
                <p style={{ fontFamily: BF, fontSize: 15, fontWeight: 600, color: '#111' }}>{booking.guests || booking.numberOfGuests || 1} guest{(booking.guests || 1) > 1 ? 's' : ''}</p>
              </div>
            </div>
            {booking.guests > 1 && (
              <div style={{ flex: 1, background: '#F8F7F5', borderRadius: 14, padding: '14px 16px', display: 'flex', alignItems: 'center', gap: 10 }}>
                <span style={{ fontSize: 22 }}>🏡</span>
                <div>
                  <p style={{ fontFamily: BF, fontSize: 10, fontWeight: 800, color: '#aaa', textTransform: 'uppercase', letterSpacing: '.1em', marginBottom: 2 }}>Property</p>
                  <p style={{ fontFamily: BF, fontSize: 15, fontWeight: 600, color: '#111', textTransform: 'capitalize' }}>{listing.propertyType || 'Property'}</p>
                </div>
              </div>
            )}
          </div>
        </motion.div>

        {/* ── Price Breakdown ── */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.4 }}
          style={{ background: '#fff', borderRadius: 20, border: '1px solid #F0F0F0', boxShadow: '0 2px 12px rgba(0,0,0,.05)', padding: '22px 24px', marginBottom: 16 }}
        >
          <h2 style={{ fontFamily: HF, fontSize: 18, fontWeight: 600, color: '#111', marginBottom: 20 }}>Price Breakdown</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {pricing.basePrice && (
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontFamily: BF, fontSize: 14, color: '#555' }}>
                  ${Number(pricing.basePrice).toLocaleString()} × {nights} night{nights > 1 ? 's' : ''}
                </span>
                <span style={{ fontFamily: BF, fontSize: 14, fontWeight: 600, color: '#111' }}>
                  ${(Number(pricing.basePrice) * nights).toLocaleString()}
                </span>
              </div>
            )}
            {pricing.cleaningFee > 0 && (
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontFamily: BF, fontSize: 14, color: '#555' }}>Cleaning fee</span>
                <span style={{ fontFamily: BF, fontSize: 14, fontWeight: 600, color: '#111' }}>${Number(pricing.cleaningFee).toLocaleString()}</span>
              </div>
            )}
            {pricing.serviceFee > 0 && (
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontFamily: BF, fontSize: 14, color: '#555' }}>Service fee</span>
                <span style={{ fontFamily: BF, fontSize: 14, fontWeight: 600, color: '#111' }}>${Number(pricing.serviceFee).toLocaleString()}</span>
              </div>
            )}
            {pricing.taxes > 0 && (
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontFamily: BF, fontSize: 14, color: '#555' }}>Taxes (12%)</span>
                <span style={{ fontFamily: BF, fontSize: 14, fontWeight: 600, color: '#111' }}>${Number(pricing.taxes).toLocaleString()}</span>
              </div>
            )}
            <div style={{ height: 1, background: '#F0F0F0', margin: '4px 0' }} />
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontFamily: HF, fontSize: 17, fontWeight: 700, color: '#111' }}>Total</span>
              <span style={{ fontFamily: HF, fontSize: 22, fontWeight: 700, color: '#111' }}>
                ${Number(pricing.total || booking.totalPrice || 0).toLocaleString()}
              </span>
            </div>
          </div>
        </motion.div>

        {/* ── Cancellation ── */}
        {canCancel && (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.26, duration: 0.4 }}
            style={{ background: '#FFF7F7', borderRadius: 20, border: '1px solid #FFE4E6', padding: '20px 24px', marginBottom: 24 }}
          >
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: 14 }}>
              <span style={{ fontSize: 28, flexShrink: 0 }}>🚫</span>
              <div style={{ flex: 1 }}>
                <p style={{ fontFamily: HF, fontSize: 17, fontWeight: 600, color: '#111', marginBottom: 4 }}>Need to cancel?</p>
                <p style={{ fontFamily: BF, fontSize: 13, color: '#888', marginBottom: 14 }}>Free cancellation up to 7 days before check-in.</p>
                <button
                  onClick={() => setShowCancelModal(true)}
                  style={{ fontFamily: BF, fontSize: 13, fontWeight: 700, color: '#BE123C', border: '1.5px solid #FECDD3', background: '#fff', padding: '10px 20px', borderRadius: 10, cursor: 'pointer', transition: 'all .15s' }}
                  onMouseOver={e => { e.currentTarget.style.background = '#FFE4E6'; }}
                  onMouseOut={e => { e.currentTarget.style.background = '#fff'; }}
                >
                  Cancel Booking
                </button>
              </div>
            </div>
          </motion.div>
        )}

        {/* ── CTAs ── */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.4 }}
          style={{ display: 'flex', gap: 12 }}
        >
          <Link
            to="/dashboard"
            style={{
              flex: 1, textAlign: 'center', textDecoration: 'none',
              background: `linear-gradient(135deg, ${P}, ${PD})`,
              color: '#fff', fontFamily: BF, fontWeight: 700, fontSize: 14,
              padding: '15px', borderRadius: 14,
              boxShadow: '0 4px 16px rgba(255,56,92,.3)',
              transition: 'opacity .15s',
            }}
            onMouseOver={e => e.currentTarget.style.opacity = '.9'}
            onMouseOut={e => e.currentTarget.style.opacity = '1'}
          >
            ← Back to My Bookings
          </Link>
        </motion.div>
      </div>

      {/* ── Cancel Modal ── */}
      <AnimatePresence>
        {showCancelModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,.5)', zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24, backdropFilter: 'blur(4px)' }}
            onClick={() => setShowCancelModal(false)}
          >
            <motion.div
              initial={{ opacity: 0, scale: .92, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: .92, y: 20 }}
              onClick={e => e.stopPropagation()}
              style={{ background: '#fff', borderRadius: 24, padding: '32px 28px', maxWidth: 440, width: '100%', boxShadow: '0 32px 80px rgba(0,0,0,.2)', fontFamily: BF }}
            >
              <p style={{ fontSize: 40, marginBottom: 16, textAlign: 'center' }}>🚫</p>
              <h3 style={{ fontFamily: HF, fontSize: 22, fontWeight: 700, color: '#111', marginBottom: 8, textAlign: 'center' }}>Cancel Booking?</h3>
              <p style={{ fontSize: 14, color: '#888', marginBottom: 20, textAlign: 'center', lineHeight: 1.6 }}>
                Are you sure you want to cancel this booking? This action cannot be undone.
              </p>
              <textarea
                value={cancelReason}
                onChange={(e) => setCancelReason(e.target.value)}
                placeholder="Reason for cancellation (optional)"
                style={{
                  width: '100%', border: '1.5px solid #E5E7EB', borderRadius: 14,
                  padding: '12px 14px', fontFamily: BF, fontSize: 13, resize: 'none',
                  height: 90, outline: 'none', marginBottom: 20, color: '#111',
                  transition: 'border-color .15s',
                }}
                onFocus={e => e.currentTarget.style.borderColor = P}
                onBlur={e => e.currentTarget.style.borderColor = '#E5E7EB'}
              />
              <div style={{ display: 'flex', gap: 10 }}>
                <button
                  onClick={handleCancel}
                  disabled={cancelling}
                  style={{
                    flex: 1, padding: '13px', background: '#BE123C', color: '#fff',
                    fontFamily: BF, fontWeight: 700, fontSize: 14, border: 'none',
                    borderRadius: 12, cursor: cancelling ? 'not-allowed' : 'pointer', opacity: cancelling ? .7 : 1,
                  }}
                >
                  {cancelling ? 'Cancelling...' : 'Yes, Cancel'}
                </button>
                <button
                  onClick={() => setShowCancelModal(false)}
                  style={{
                    flex: 1, padding: '13px', background: '#F3F4F6', color: '#555',
                    fontFamily: BF, fontWeight: 700, fontSize: 14, border: 'none',
                    borderRadius: 12, cursor: 'pointer',
                  }}
                >
                  Keep Booking
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}