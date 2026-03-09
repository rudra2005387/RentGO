import React, { useMemo, useState, useEffect, useCallback } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import {
  FaShareAlt, FaMapMarkerAlt, FaStar, FaWifi, FaUtensils, FaParking,
  FaTv, FaHeart, FaTh, FaChevronLeft, FaChevronRight, FaTimes,
  FaSwimmingPool, FaDumbbell, FaSnowflake, FaBath, FaTree, FaShower
} from 'react-icons/fa';
import { motion, AnimatePresence } from 'framer-motion';
import HostInfo from '../components/HostInfo.jsx';
import BookingCalendar from '../components/BookingCalendar.jsx';
import ReviewList from '../components/ReviewList.jsx';
import { useAuth } from '../hooks/useAuth';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

// ─── Google Fonts injection ──────────────────────────────────────────────────
const FontLink = () => {
  useEffect(() => {
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = 'https://fonts.googleapis.com/css2?family=Fraunces:ital,opsz,wght@0,9..144,300;0,9..144,400;0,9..144,500;0,9..144,600;0,9..144,700;1,9..144,300;1,9..144,400&family=DM+Sans:wght@300;400;500;600&display=swap';
    document.head.appendChild(link);
    return () => document.head.removeChild(link);
  }, []);
  return null;
};

// ─── Amenity config ──────────────────────────────────────────────────────────
const AMENITY_ICONS = {
  'WiFi': { icon: FaWifi, color: '#0070f3' },
  'Kitchen': { icon: FaUtensils, color: '#f97316' },
  'Parking': { icon: FaParking, color: '#8b5cf6' },
  'TV': { icon: FaTv, color: '#14b8a6' },
  'Pool': { icon: FaSwimmingPool, color: '#0ea5e9' },
  'Gym': { icon: FaDumbbell, color: '#ef4444' },
  'Air conditioning': { icon: FaSnowflake, color: '#06b6d4' },
  'Hot tub': { icon: FaBath, color: '#ec4899' },
  'Garden': { icon: FaTree, color: '#22c55e' },
  'Washer': { icon: FaShower, color: '#a855f7' },
};

// ─── IMAGE GRID ──────────────────────────────────────────────────────────────
function ImageGrid({ images = [], title = '' }) {
  const [showAll, setShowAll] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);

  const displayImages = images.length > 0
    ? images
    : ['https://images.unsplash.com/photo-1568605114967-8130f3a36994?w=900'];

  const mainImg = displayImages[0];
  const sideImgs = displayImages.slice(1, 5);

  return (
    <>
      {/* ── Mosaic grid ── */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
        className="relative rounded-2xl overflow-hidden cursor-pointer group"
        style={{ borderRadius: '16px' }}
        onClick={() => setShowAll(true)}
      >
        {displayImages.length === 1 ? (
          <div className="aspect-[16/9]">
            <img src={mainImg} alt={title} className="w-full h-full object-cover" />
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gridTemplateRows: 'repeat(2,1fr)', gap: '4px', aspectRatio: '2.2/1' }}>
            {/* Main large image */}
            <div style={{ gridColumn: 'span 2', gridRow: 'span 2', overflow: 'hidden' }}>
              <img
                src={mainImg} alt={title}
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-[1.03]"
              />
            </div>
            {/* Side images */}
            {sideImgs.map((img, i) => (
              <div key={i} style={{ overflow: 'hidden', position: 'relative' }}>
                <img
                  src={img} alt={`${title} ${i + 2}`}
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-[1.03]"
                  onError={e => { e.target.src = 'https://images.unsplash.com/photo-1568605114967-8130f3a36994?w=400'; }}
                />
              </div>
            ))}
            {Array.from({ length: Math.max(0, 4 - sideImgs.length) }).map((_, i) => (
              <div key={`e${i}`} style={{ background: '#f0ece8' }} />
            ))}
          </div>
        )}

        {/* Show all photos pill */}
        {displayImages.length > 1 && (
          <button
            onClick={e => { e.stopPropagation(); setShowAll(true); }}
            className="absolute bottom-4 right-4 flex items-center gap-2 bg-white text-[#222] text-sm font-semibold px-4 py-2.5 rounded-xl border border-[#222] hover:bg-[#f7f7f7] transition-all shadow-md"
            style={{ fontFamily: "'DM Sans', sans-serif" }}
          >
            <FaTh size={12} /> Show all photos
          </button>
        )}
      </motion.div>

      {/* ── Fullscreen lightbox ── */}
      <AnimatePresence>
        {showAll && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            style={{ position: 'fixed', inset: 0, background: '#0a0a0a', zIndex: 9999, display: 'flex', flexDirection: 'column' }}
          >
            {/* Header */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 24px', borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
              <button
                onClick={() => setShowAll(false)}
                style={{ color: '#fff', background: 'rgba(255,255,255,0.1)', border: 'none', borderRadius: '50%', width: 40, height: 40, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', transition: 'background 0.2s' }}
                onMouseOver={e => e.currentTarget.style.background = 'rgba(255,255,255,0.2)'}
                onMouseOut={e => e.currentTarget.style.background = 'rgba(255,255,255,0.1)'}
              >
                <FaTimes size={16} />
              </button>
              <span style={{ color: 'rgba(255,255,255,0.7)', fontSize: 14, fontFamily: "'DM Sans', sans-serif" }}>
                {activeIndex + 1} / {displayImages.length}
              </span>
              <div style={{ width: 40 }} />
            </div>

            {/* Main image */}
            <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px', position: 'relative' }}>
              <motion.img
                key={activeIndex}
                initial={{ opacity: 0, scale: 0.97 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.2 }}
                src={displayImages[activeIndex]}
                alt={`${title} ${activeIndex + 1}`}
                style={{ maxHeight: '100%', maxWidth: '100%', objectFit: 'contain', borderRadius: 12 }}
              />
              {displayImages.length > 1 && (
                <>
                  <button
                    onClick={() => setActiveIndex(p => (p - 1 + displayImages.length) % displayImages.length)}
                    style={{ position: 'absolute', left: 16, top: '50%', transform: 'translateY(-50%)', background: 'rgba(255,255,255,0.15)', border: 'none', borderRadius: '50%', width: 48, height: 48, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: '#fff', transition: 'background 0.2s' }}
                    onMouseOver={e => e.currentTarget.style.background = 'rgba(255,255,255,0.3)'}
                    onMouseOut={e => e.currentTarget.style.background = 'rgba(255,255,255,0.15)'}
                  >
                    <FaChevronLeft />
                  </button>
                  <button
                    onClick={() => setActiveIndex(p => (p + 1) % displayImages.length)}
                    style={{ position: 'absolute', right: 16, top: '50%', transform: 'translateY(-50%)', background: 'rgba(255,255,255,0.15)', border: 'none', borderRadius: '50%', width: 48, height: 48, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: '#fff', transition: 'background 0.2s' }}
                    onMouseOver={e => e.currentTarget.style.background = 'rgba(255,255,255,0.3)'}
                    onMouseOut={e => e.currentTarget.style.background = 'rgba(255,255,255,0.15)'}
                  >
                    <FaChevronRight />
                  </button>
                </>
              )}
            </div>

            {/* Thumbnail strip */}
            {displayImages.length > 1 && (
              <div style={{ display: 'flex', gap: 6, padding: '12px 24px', overflowX: 'auto', justifyContent: 'center', borderTop: '1px solid rgba(255,255,255,0.08)' }}>
                {displayImages.map((img, i) => (
                  <button
                    key={i}
                    onClick={() => setActiveIndex(i)}
                    style={{ flexShrink: 0, width: 64, height: 48, borderRadius: 8, overflow: 'hidden', border: `2px solid ${activeIndex === i ? '#fff' : 'transparent'}`, opacity: activeIndex === i ? 1 : 0.45, cursor: 'pointer', transition: 'all 0.2s', padding: 0 }}
                  >
                    <img src={img} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  </button>
                ))}
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

// ─── AMENITIES GRID ──────────────────────────────────────────────────────────
function AmenitiesGrid({ amenities = [] }) {
  const [showAll, setShowAll] = useState(false);
  const visible = showAll ? amenities : amenities.slice(0, 10);

  return (
    <div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2,1fr)', gap: 12 }}>
        {visible.map(a => {
          const cfg = AMENITY_ICONS[a] || {};
          const IconComp = cfg.icon;
          return (
            <div
              key={a}
              style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '14px 16px', background: '#fafafa', borderRadius: 12, border: '1px solid #ebebeb', transition: 'border-color 0.2s, box-shadow 0.2s', cursor: 'default' }}
              onMouseOver={e => { e.currentTarget.style.borderColor = '#d0d0d0'; e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.06)'; }}
              onMouseOut={e => { e.currentTarget.style.borderColor = '#ebebeb'; e.currentTarget.style.boxShadow = 'none'; }}
            >
              <div style={{ width: 36, height: 36, borderRadius: 10, background: cfg.color ? `${cfg.color}14` : '#f0f0f0', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                {IconComp
                  ? <IconComp style={{ color: cfg.color || '#555', fontSize: 16 }} />
                  : <span style={{ fontSize: 16 }}>✓</span>
                }
              </div>
              <span style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 14, fontWeight: 500, color: '#222' }}>{a}</span>
            </div>
          );
        })}
      </div>
      {amenities.length > 10 && (
        <button
          onClick={() => setShowAll(s => !s)}
          style={{ marginTop: 16, fontFamily: "'DM Sans', sans-serif", fontSize: 14, fontWeight: 600, color: '#222', textDecoration: 'underline', background: 'none', border: '1px solid #222', borderRadius: 10, padding: '10px 20px', cursor: 'pointer', transition: 'background 0.15s' }}
          onMouseOver={e => e.currentTarget.style.background = '#f7f7f7'}
          onMouseOut={e => e.currentTarget.style.background = 'none'}
        >
          {showAll ? 'Show less' : `Show all ${amenities.length} amenities`}
        </button>
      )}
    </div>
  );
}

// ─── REVIEWS SECTION ─────────────────────────────────────────────────────────
function ReviewsSection({ reviews = [], averageRating = 0 }) {
  const [showAll, setShowAll] = useState(false);
  const visible = showAll ? reviews : reviews.slice(0, 4);

  const breakdown = useMemo(() => {
    const map = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
    reviews.forEach(r => {
      const rounded = Math.round(r.overallRating || r.rating || 0);
      if (rounded >= 1 && rounded <= 5) map[rounded]++;
    });
    return map;
  }, [reviews]);

  const avg = averageRating || (reviews.length > 0
    ? (reviews.reduce((s, r) => s + (r.overallRating || r.rating || 0), 0) / reviews.length).toFixed(1)
    : 0);

  if (reviews.length === 0) {
    return (
      <div style={{ textAlign: 'center', padding: '32px 0' }}>
        <p style={{ fontSize: 40, marginBottom: 12 }}>✨</p>
        <p style={{ fontFamily: "'Fraunces', serif", fontSize: 20, fontWeight: 600, color: '#222', marginBottom: 6 }}>No reviews yet</p>
        <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 14, color: '#717171' }}>Be the first to leave a review after your stay.</p>
      </div>
    );
  }

  return (
    <div>
      {/* Rating headline */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 24 }}>
        <FaStar style={{ color: '#222', fontSize: 20 }} />
        <span style={{ fontFamily: "'Fraunces', serif", fontSize: 26, fontWeight: 700, color: '#222' }}>{Number(avg).toFixed(1)}</span>
        <span style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 16, color: '#717171' }}>·</span>
        <span style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 16, color: '#717171', textDecoration: 'underline', cursor: 'pointer' }}>
          {reviews.length} review{reviews.length !== 1 ? 's' : ''}
        </span>
      </div>

      {/* Rating bars */}
      <div style={{ marginBottom: 32 }}>
        {[5, 4, 3, 2, 1].map(star => (
          <div key={star} style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8 }}>
            <span style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 13, color: '#717171', width: 8, textAlign: 'right' }}>{star}</span>
            <div style={{ flex: 1, height: 4, background: '#ebebeb', borderRadius: 4, overflow: 'hidden' }}>
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${(breakdown[star] / Math.max(1, reviews.length)) * 100}%` }}
                transition={{ duration: 0.6, delay: (5 - star) * 0.08, ease: 'easeOut' }}
                style={{ height: '100%', background: '#222', borderRadius: 4 }}
              />
            </div>
            <span style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 12, color: '#aaa', width: 16 }}>{breakdown[star]}</span>
          </div>
        ))}
      </div>

      {/* Review cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2,1fr)', gap: 24 }}>
        {visible.map((r, idx) => {
          const authorName = typeof r.author === 'object'
            ? [r.author?.firstName, r.author?.lastName].filter(Boolean).join(' ')
            : r.author || 'Guest';
          const rating = r.overallRating || r.rating || 0;
          const date = r.createdAt
            ? new Date(r.createdAt).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
            : 'Recent';
          const initials = authorName.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
          const avatarColors = ['#FF385C', '#0070f3', '#00a699', '#f97316', '#8b5cf6'];
          const avatarColor = avatarColors[idx % avatarColors.length];

          return (
            <motion.div
              key={r._id || idx}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.06 }}
              style={{ padding: 0 }}
            >
              {/* Author */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
                <div style={{ width: 44, height: 44, borderRadius: '50%', background: avatarColor, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  {r.author?.profileImage
                    ? <img src={r.author.profileImage} alt={authorName} style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover' }} />
                    : <span style={{ color: '#fff', fontFamily: "'DM Sans', sans-serif", fontWeight: 700, fontSize: 15 }}>{initials}</span>
                  }
                </div>
                <div>
                  <p style={{ fontFamily: "'DM Sans', sans-serif", fontWeight: 600, fontSize: 14, color: '#222', marginBottom: 2 }}>{authorName}</p>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <div style={{ display: 'flex', gap: 2 }}>
                      {[...Array(5)].map((_, i) => (
                        <FaStar key={i} style={{ fontSize: 10, color: i < rating ? '#FF385C' : '#ddd' }} />
                      ))}
                    </div>
                    <span style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 12, color: '#aaa' }}>·</span>
                    <span style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 12, color: '#aaa' }}>{date}</span>
                  </div>
                </div>
              </div>
              {/* Comment */}
              <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 14, lineHeight: 1.65, color: '#484848', margin: 0 }}>
                {r.comment?.length > 180 ? r.comment.slice(0, 180) + '...' : r.comment}
              </p>
            </motion.div>
          );
        })}
      </div>

      {reviews.length > 4 && (
        <button
          onClick={() => setShowAll(s => !s)}
          style={{ marginTop: 28, fontFamily: "'DM Sans', sans-serif", fontSize: 14, fontWeight: 600, color: '#222', background: 'none', border: '1px solid #222', borderRadius: 10, padding: '12px 24px', cursor: 'pointer', transition: 'background 0.15s' }}
          onMouseOver={e => e.currentTarget.style.background = '#f7f7f7'}
          onMouseOut={e => e.currentTarget.style.background = 'none'}
        >
          {showAll ? 'Show less' : `Show all ${reviews.length} reviews`}
        </button>
      )}
    </div>
  );
}

// ─── BOOKING WIDGET ──────────────────────────────────────────────────────────
function BookingWidget({ listing, checkInDate, checkOutDate, guests, setGuests, onBook, bookingLoading }) {
  const pricing = listing.pricing || {};
  const basePrice = pricing.basePrice || 0;
  const cleaningFee = pricing.cleaningFee || 0;
  const serviceFee = pricing.serviceFee || 0;
  const maxGuests = listing.accommodates || listing.maxGuests || 10;

  const nights = useMemo(() => {
    if (!checkInDate || !checkOutDate) return 0;
    return Math.ceil((checkOutDate - checkInDate) / (1000 * 60 * 60 * 24));
  }, [checkInDate, checkOutDate]);

  const subtotal = basePrice * nights;
  const taxes = Math.round((subtotal + cleaningFee + serviceFee) * 0.12);
  const total = subtotal + cleaningFee + serviceFee + taxes;
  const canBook = checkInDate && checkOutDate && nights > 0 && !bookingLoading;

  const fmtDate = d => d ? d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : 'Add date';

  return (
    <div style={{ fontFamily: "'DM Sans', sans-serif" }}>
      {/* Price + rating */}
      <div style={{ marginBottom: 20 }}>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: 6 }}>
          <span style={{ fontFamily: "'Fraunces', serif", fontSize: 26, fontWeight: 700, color: '#222' }}>
            ${basePrice.toLocaleString()}
          </span>
          <span style={{ fontSize: 15, color: '#717171', fontWeight: 400 }}>/night</span>
        </div>
        {listing.averageRating > 0 && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 5, marginTop: 4 }}>
            <FaStar style={{ color: '#FF385C', fontSize: 12 }} />
            <span style={{ fontSize: 13, fontWeight: 600, color: '#222' }}>{listing.averageRating.toFixed(1)}</span>
            {listing.totalReviews > 0 && (
              <span style={{ fontSize: 13, color: '#717171' }}>· {listing.totalReviews} review{listing.totalReviews !== 1 ? 's' : ''}</span>
            )}
          </div>
        )}
      </div>

      {/* Date inputs */}
      <div style={{ border: '1.5px solid #ddd', borderRadius: 12, overflow: 'hidden', marginBottom: 12 }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr' }}>
          <div style={{ padding: '12px 14px', borderRight: '1px solid #ddd' }}>
            <p style={{ fontSize: 10, fontWeight: 700, color: '#222', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 3 }}>Check-in</p>
            <p style={{ fontSize: 14, color: checkInDate ? '#222' : '#aaa' }}>{fmtDate(checkInDate)}</p>
          </div>
          <div style={{ padding: '12px 14px' }}>
            <p style={{ fontSize: 10, fontWeight: 700, color: '#222', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 3 }}>Check-out</p>
            <p style={{ fontSize: 14, color: checkOutDate ? '#222' : '#aaa' }}>{fmtDate(checkOutDate)}</p>
          </div>
        </div>
        {/* Guest counter */}
        <div style={{ borderTop: '1px solid #ddd', padding: '12px 14px' }}>
          <p style={{ fontSize: 10, fontWeight: 700, color: '#222', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 6 }}>Guests</p>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontSize: 14, color: '#222' }}>{guests} guest{guests !== 1 ? 's' : ''}</span>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <button
                onClick={() => setGuests(Math.max(1, guests - 1))}
                disabled={guests <= 1}
                style={{ width: 30, height: 30, borderRadius: '50%', border: '1.5px solid', borderColor: guests <= 1 ? '#ddd' : '#888', background: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: guests <= 1 ? 'not-allowed' : 'pointer', color: guests <= 1 ? '#ddd' : '#222', fontSize: 18, fontWeight: 300, transition: 'all 0.15s' }}
              >−</button>
              <span style={{ fontSize: 14, fontWeight: 600, minWidth: 16, textAlign: 'center', color: '#222' }}>{guests}</span>
              <button
                onClick={() => setGuests(Math.min(maxGuests, guests + 1))}
                disabled={guests >= maxGuests}
                style={{ width: 30, height: 30, borderRadius: '50%', border: '1.5px solid', borderColor: guests >= maxGuests ? '#ddd' : '#888', background: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: guests >= maxGuests ? 'not-allowed' : 'pointer', color: guests >= maxGuests ? '#ddd' : '#222', fontSize: 18, fontWeight: 300, transition: 'all 0.15s' }}
              >+</button>
            </div>
          </div>
        </div>
      </div>

      {/* Reserve button */}
      <button
        onClick={onBook}
        disabled={!canBook}
        style={{
          width: '100%', padding: '15px', borderRadius: 12, border: 'none',
          fontFamily: "'DM Sans', sans-serif", fontSize: 16, fontWeight: 700,
          color: '#fff', cursor: canBook ? 'pointer' : 'not-allowed',
          background: canBook
            ? 'linear-gradient(135deg, #FF385C 0%, #E31C5F 100%)'
            : '#ddd',
          transition: 'opacity 0.2s, transform 0.15s',
          transform: 'scale(1)',
          boxShadow: canBook ? '0 4px 16px rgba(255,56,92,0.35)' : 'none',
        }}
        onMouseOver={e => { if (canBook) { e.currentTarget.style.opacity = '0.92'; e.currentTarget.style.transform = 'scale(1.01)'; } }}
        onMouseOut={e => { e.currentTarget.style.opacity = '1'; e.currentTarget.style.transform = 'scale(1)'; }}
      >
        {bookingLoading ? 'Reserving...' : nights > 0 ? `Reserve · $${total.toLocaleString()}` : 'Reserve'}
      </button>

      {nights > 0 && (
        <p style={{ textAlign: 'center', fontSize: 13, color: '#717171', marginTop: 10 }}>You won't be charged yet</p>
      )}

      {/* Price breakdown */}
      {nights > 0 && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          style={{ marginTop: 20, paddingTop: 20, borderTop: '1px solid #ebebeb' }}
        >
          {[
            { label: `$${basePrice} × ${nights} night${nights !== 1 ? 's' : ''}`, value: subtotal },
            cleaningFee > 0 && { label: 'Cleaning fee', value: cleaningFee },
            serviceFee > 0 && { label: 'Service fee', value: serviceFee },
            { label: 'Taxes (12%)', value: taxes },
          ].filter(Boolean).map((row, i) => (
            <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
              <span style={{ fontSize: 14, color: '#484848', textDecoration: 'underline', textDecorationColor: '#aaa', textUnderlineOffset: 3 }}>{row.label}</span>
              <span style={{ fontSize: 14, color: '#222', fontWeight: 500 }}>${row.value.toLocaleString()}</span>
            </div>
          ))}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: 14, borderTop: '1.5px solid #222', marginTop: 4 }}>
            <span style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 15, fontWeight: 700, color: '#222' }}>Total before taxes</span>
            <span style={{ fontFamily: "'Fraunces', serif", fontSize: 17, fontWeight: 700, color: '#222' }}>${total.toLocaleString()}</span>
          </div>
        </motion.div>
      )}
    </div>
  );
}

// ─── SKELETON ────────────────────────────────────────────────────────────────
const Shimmer = ({ style }) => (
  <div style={{ background: 'linear-gradient(90deg,#f0f0f0 25%,#e8e8e8 50%,#f0f0f0 75%)', backgroundSize: '200% 100%', animation: 'shimmer 1.5s infinite', borderRadius: 8, ...style }} />
);

function ListingSkeleton() {
  return (
    <div style={{ minHeight: '100vh', background: '#fff', fontFamily: "'DM Sans', sans-serif" }}>
      <style>{`@keyframes shimmer { 0%{background-position:200% 0} 100%{background-position:-200% 0} }`}</style>
      <div style={{ maxWidth: 1120, margin: '0 auto', padding: '24px 24px 0' }}>
        <Shimmer style={{ height: 420, borderRadius: 16, width: '100%' }} />
      </div>
      <div style={{ maxWidth: 1120, margin: '0 auto', padding: 24 }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 380px', gap: 64 }}>
          <div>
            <Shimmer style={{ height: 36, width: '70%', marginBottom: 12 }} />
            <Shimmer style={{ height: 18, width: '40%', marginBottom: 28 }} />
            <Shimmer style={{ height: 1, marginBottom: 28 }} />
            <Shimmer style={{ height: 80, borderRadius: 12, marginBottom: 28 }} />
            <Shimmer style={{ height: 1, marginBottom: 28 }} />
            <Shimmer style={{ height: 16, marginBottom: 10 }} />
            <Shimmer style={{ height: 16, width: '90%', marginBottom: 10 }} />
            <Shimmer style={{ height: 16, width: '75%' }} />
          </div>
          <div>
            <Shimmer style={{ height: 360, borderRadius: 16 }} />
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── MAIN COMPONENT ──────────────────────────────────────────────────────────
export default function ListingDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, token } = useAuth();

  const [listing, setListing] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [unavailableDates, setUnavailableDates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [checkInDate, setCheckInDate] = useState(null);
  const [checkOutDate, setCheckOutDate] = useState(null);
  const [guests, setGuests] = useState(1);
  const [bookingLoading, setBookingLoading] = useState(false);
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [showMobileBooking, setShowMobileBooking] = useState(false);

  useEffect(() => {
    setLoading(true);
    Promise.all([
      fetch(`${API_BASE}/listings/${id}`).then(r => r.json()),
      fetch(`${API_BASE}/reviews/listing/${id}`).then(r => r.json()).catch(() => ({ success: false })),
      fetch(`${API_BASE}/listings/${id}/availability`).then(r => r.json()).catch(() => ({ success: false })),
    ]).then(([listingRes, reviewsRes, availRes]) => {
      if (listingRes.success) {
        setListing(listingRes.data?.listing || listingRes.data);
      } else {
        setError('Listing not found');
      }
      if (reviewsRes.success) setReviews(reviewsRes.data?.reviews || []);
      if (availRes.success) setUnavailableDates(availRes.data?.blockedDates || availRes.data?.unavailableDates || []);
    }).catch(() => setError('Network error')).finally(() => setLoading(false));
  }, [id]);

  const nights = useMemo(() => {
    if (!checkInDate || !checkOutDate) return 0;
    return Math.ceil((checkOutDate - checkInDate) / (1000 * 60 * 60 * 24));
  }, [checkInDate, checkOutDate]);

  const handleBook = useCallback(async () => {
    if (!token) { navigate('/login'); return; }
    if (!checkInDate || !checkOutDate || nights === 0) return;
    const pricing = listing.pricing || {};
    const basePrice = pricing.basePrice || 0;
    const cleaningFee = pricing.cleaningFee || 0;
    const serviceFee = pricing.serviceFee || 0;
    const subtotal = basePrice * nights;
    const taxes = Math.round((subtotal + cleaningFee + serviceFee) * 0.12);
    const total = subtotal + cleaningFee + serviceFee + taxes;
    setBookingLoading(true);
    try {
      const res = await fetch(`${API_BASE}/bookings`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ listingId: id, checkIn: checkInDate.toISOString(), checkOut: checkOutDate.toISOString(), guests, totalPrice: total }),
      });
      const d = await res.json();
      if (d.success) {
        navigate(`/payment/${d.data?.booking?._id || d.data?._id}`);
      } else {
        alert(d.message || 'Booking failed. Please try again.');
      }
    } catch { alert('Network error. Please try again.'); }
    finally { setBookingLoading(false); }
  }, [token, checkInDate, checkOutDate, nights, guests, listing, id, navigate]);

  function handleShare() {
    const url = window.location.href;
    if (navigator.share) navigator.share({ title: listing?.title, url });
    else { navigator.clipboard.writeText(url); }
  }

  if (loading) return <><FontLink /><ListingSkeleton /></>;

  if (error || !listing) {
    return (
      <div style={{ minHeight: '100vh', background: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: "'DM Sans', sans-serif" }}>
        <div style={{ textAlign: 'center' }}>
          <p style={{ fontSize: 56, marginBottom: 16 }}>🏠</p>
          <p style={{ fontFamily: "'Fraunces', serif", fontSize: 22, fontWeight: 600, color: '#222', marginBottom: 8 }}>Listing not found</p>
          <p style={{ fontSize: 14, color: '#717171', marginBottom: 20 }}>{error}</p>
          <Link to="/" style={{ fontSize: 14, fontWeight: 600, color: '#FF385C', textDecoration: 'underline' }}>Back to Home</Link>
        </div>
      </div>
    );
  }

  const images = (listing.images || []).map(i => i.url || i).filter(Boolean);
  const location = listing.location || {};
  const locationStr = [location.city, location.state, location.country].filter(Boolean).join(', ');
  const hostData = listing.host || {};
  const hostObj = {
    name: [hostData.firstName, hostData.lastName].filter(Boolean).join(' ') || 'Host',
    avatar: hostData.profileImage,
    isSuperhost: hostData.isSuperhost,
    responseRate: hostData.responseRate ? `${hostData.responseRate}%` : undefined,
    bio: hostData.bio,
    rating: hostData.averageRating,
  };

  // Flatten amenities from nested object
  const amenitiesList = listing.amenities && typeof listing.amenities === 'object' && !Array.isArray(listing.amenities)
    ? [
        listing.amenities.basics?.wifi && 'WiFi',
        listing.amenities.basics?.kitchen && 'Kitchen',
        listing.amenities.basics?.airConditioning && 'Air conditioning',
        listing.amenities.basics?.heating && 'Heating',
        listing.amenities.features?.pool && 'Pool',
        listing.amenities.features?.gym && 'Gym',
        listing.amenities.features?.tv && 'TV',
        listing.amenities.features?.washer && 'Washer',
        listing.amenities.features?.hotTub && 'Hot tub',
        listing.amenities.features?.parking && 'Parking',
        listing.amenities.outdoor?.garden && 'Garden',
      ].filter(Boolean)
    : (Array.isArray(listing.amenities) ? listing.amenities : []);

  const divider = <div style={{ height: 1, background: '#ebebeb', margin: '0' }} />;

  return (
    <div style={{ minHeight: '100vh', background: '#fff', fontFamily: "'DM Sans', sans-serif" }}>
      <FontLink />

      {/* ── Breadcrumb ── */}
      <div style={{ maxWidth: 1120, margin: '0 auto', padding: '16px 24px 0', display: 'flex', alignItems: 'center', gap: 6 }}>
        <Link to="/" style={{ fontSize: 13, color: '#717171', textDecoration: 'underline', textDecorationColor: '#ccc', textUnderlineOffset: 2 }}>Home</Link>
        <span style={{ color: '#ccc', fontSize: 12 }}>›</span>
        {location.city && (
          <>
            <Link to={`/search?city=${location.city}`} style={{ fontSize: 13, color: '#717171', textDecoration: 'underline', textDecorationColor: '#ccc', textUnderlineOffset: 2 }}>{location.city}</Link>
            <span style={{ color: '#ccc', fontSize: 12 }}>›</span>
          </>
        )}
        <span style={{ fontSize: 13, color: '#222', fontWeight: 500 }}>{listing.title}</span>
      </div>

      {/* ── Title + Actions row ── */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        style={{ maxWidth: 1120, margin: '0 auto', padding: '12px 24px 16px', display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 16 }}
      >
        <h1 style={{ fontFamily: "'Fraunces', serif", fontSize: 'clamp(22px, 3vw, 32px)', fontWeight: 700, color: '#222', lineHeight: 1.25, margin: 0, maxWidth: '75%' }}>
          {listing.title}
        </h1>
        <div style={{ display: 'flex', alignItems: 'center', gap: 4, flexShrink: 0 }}>
          <button
            onClick={handleShare}
            style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '8px 12px', borderRadius: 8, border: 'none', background: 'none', cursor: 'pointer', fontFamily: "'DM Sans', sans-serif", fontSize: 13, fontWeight: 600, color: '#222', textDecoration: 'underline', transition: 'background 0.15s' }}
            onMouseOver={e => e.currentTarget.style.background = '#f7f7f7'}
            onMouseOut={e => e.currentTarget.style.background = 'none'}
          >
            <FaShareAlt size={13} /> Share
          </button>
          <button
            onClick={() => setIsWishlisted(w => !w)}
            style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '8px 12px', borderRadius: 8, border: 'none', background: 'none', cursor: 'pointer', fontFamily: "'DM Sans', sans-serif", fontSize: 13, fontWeight: 600, color: '#222', textDecoration: 'underline', transition: 'background 0.15s' }}
            onMouseOver={e => e.currentTarget.style.background = '#f7f7f7'}
            onMouseOut={e => e.currentTarget.style.background = 'none'}
          >
            <FaHeart size={13} style={{ color: isWishlisted ? '#FF385C' : '#222', transition: 'color 0.2s' }} />
            {isWishlisted ? 'Saved' : 'Save'}
          </button>
        </div>
      </motion.div>

      {/* ── Image grid ── */}
      <div style={{ maxWidth: 1120, margin: '0 auto', padding: '0 24px' }}>
        <ImageGrid images={images} title={listing.title} />
      </div>

      {/* ── Main content ── */}
      <div style={{ maxWidth: 1120, margin: '0 auto', padding: '40px 24px 80px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 380px', columnGap: 80, alignItems: 'start' }}>

          {/* ═══ LEFT COLUMN ═══════════════════════════════════════════ */}
          <div>

            {/* Property type + host + quick stats */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              style={{ paddingBottom: 28, borderBottom: '1px solid #ebebeb' }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div>
                  <h2 style={{ fontFamily: "'Fraunces', serif", fontSize: 22, fontWeight: 600, color: '#222', marginBottom: 4 }}>
                    {listing.propertyType
                      ? listing.propertyType.replace('_', ' ').replace(/\b\w/g, c => c.toUpperCase())
                      : 'Property'
                    } hosted by {hostObj.name}
                  </h2>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
                    {[
                      listing.accommodates && `${listing.accommodates} guest${listing.accommodates > 1 ? 's' : ''}`,
                      listing.bedrooms && `${listing.bedrooms} bedroom${listing.bedrooms > 1 ? 's' : ''}`,
                      listing.beds && `${listing.beds} bed${listing.beds > 1 ? 's' : ''}`,
                      listing.bathrooms && `${listing.bathrooms} bath${listing.bathrooms > 1 ? 's' : ''}`,
                    ].filter(Boolean).map((stat, i, arr) => (
                      <React.Fragment key={i}>
                        <span style={{ fontSize: 15, color: '#717171' }}>{stat}</span>
                        {i < arr.length - 1 && <span style={{ color: '#ccc', fontSize: 12 }}>·</span>}
                      </React.Fragment>
                    ))}
                  </div>
                </div>
                {/* Host avatar */}
                <div style={{ width: 56, height: 56, borderRadius: '50%', overflow: 'hidden', flexShrink: 0, border: '2px solid #ebebeb', position: 'relative' }}>
                  {hostData.profileImage
                    ? <img src={hostData.profileImage} alt={hostObj.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    : (
                      <div style={{ width: '100%', height: '100%', background: '#FF385C', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <span style={{ color: '#fff', fontWeight: 700, fontSize: 20 }}>
                          {hostObj.name[0]?.toUpperCase()}
                        </span>
                      </div>
                    )
                  }
                  {hostData.isSuperhost && (
                    <div style={{ position: 'absolute', bottom: -2, right: -2, width: 18, height: 18, background: '#FF385C', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '2px solid #fff' }}>
                      <span style={{ color: '#fff', fontSize: 9 }}>★</span>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>

            {/* Highlight badges */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15 }}
              style={{ padding: '28px 0', borderBottom: '1px solid #ebebeb' }}
            >
              <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                {hostData.isSuperhost && (
                  <div style={{ display: 'flex', gap: 16 }}>
                    <span style={{ fontSize: 26, flexShrink: 0 }}>🏅</span>
                    <div>
                      <p style={{ fontWeight: 600, fontSize: 15, color: '#222', marginBottom: 2 }}>{hostObj.name} is a Superhost</p>
                      <p style={{ fontSize: 14, color: '#717171', lineHeight: 1.5 }}>Superhosts are experienced, highly rated hosts.</p>
                    </div>
                  </div>
                )}
                <div style={{ display: 'flex', gap: 16 }}>
                  <span style={{ fontSize: 26, flexShrink: 0 }}>📍</span>
                  <div>
                    <p style={{ fontWeight: 600, fontSize: 15, color: '#222', marginBottom: 2 }}>Great location</p>
                    <p style={{ fontSize: 14, color: '#717171', lineHeight: 1.5 }}>
                      {locationStr || 'Centrally located with easy access to local attractions.'}
                    </p>
                  </div>
                </div>
                <div style={{ display: 'flex', gap: 16 }}>
                  <span style={{ fontSize: 26, flexShrink: 0 }}>🔑</span>
                  <div>
                    <p style={{ fontWeight: 600, fontSize: 15, color: '#222', marginBottom: 2 }}>Self check-in</p>
                    <p style={{ fontSize: 14, color: '#717171', lineHeight: 1.5 }}>Check yourself in with the lockbox.</p>
                  </div>
                </div>
                {hostData.responseRate >= 90 && (
                  <div style={{ display: 'flex', gap: 16 }}>
                    <span style={{ fontSize: 26, flexShrink: 0 }}>💬</span>
                    <div>
                      <p style={{ fontWeight: 600, fontSize: 15, color: '#222', marginBottom: 2 }}>Fast responses</p>
                      <p style={{ fontSize: 14, color: '#717171', lineHeight: 1.5 }}>
                        {hostObj.responseRate} response rate · typically responds within an hour.
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </motion.div>

            {/* Description */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              style={{ padding: '28px 0', borderBottom: '1px solid #ebebeb' }}
            >
              <p style={{ fontSize: 16, lineHeight: 1.75, color: '#484848', whiteSpace: 'pre-line', margin: 0 }}>
                {listing.description}
              </p>
            </motion.div>

            {/* Amenities */}
            {amenitiesList.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.25 }}
                style={{ padding: '28px 0', borderBottom: '1px solid #ebebeb' }}
              >
                <h2 style={{ fontFamily: "'Fraunces', serif", fontSize: 22, fontWeight: 600, color: '#222', marginBottom: 20 }}>
                  What this place offers
                </h2>
                <AmenitiesGrid amenities={amenitiesList} />
              </motion.div>
            )}

            {/* Calendar */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              style={{ padding: '28px 0', borderBottom: '1px solid #ebebeb' }}
            >
              <h2 style={{ fontFamily: "'Fraunces', serif", fontSize: 22, fontWeight: 600, color: '#222', marginBottom: 4 }}>
                {nights > 0 ? `${nights} night${nights > 1 ? 's' : ''} in ${location.city || 'this property'}` : 'Select check-in date'}
              </h2>
              {checkInDate && checkOutDate ? (
                <p style={{ fontSize: 14, color: '#717171', marginBottom: 20 }}>
                  {checkInDate.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })} – {checkOutDate.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                </p>
              ) : (
                <p style={{ fontSize: 14, color: '#717171', marginBottom: 20 }}>Add your travel dates for exact pricing</p>
              )}
              <div style={{ background: '#fafafa', borderRadius: 14, padding: '20px', border: '1px solid #ebebeb' }}>
                <BookingCalendar
                  unavailableDates={unavailableDates}
                  onDatesSelected={({ checkIn, checkOut }) => { setCheckInDate(checkIn); setCheckOutDate(checkOut); }}
                />
              </div>
            </motion.div>

            {/* Host section */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.35 }}
              style={{ padding: '28px 0', borderBottom: '1px solid #ebebeb' }}
            >
              <h2 style={{ fontFamily: "'Fraunces', serif", fontSize: 22, fontWeight: 600, color: '#222', marginBottom: 20 }}>
                Meet your host
              </h2>
              <HostInfo host={hostObj} />
            </motion.div>

            {/* Reviews */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              style={{ padding: '28px 0' }}
            >
              <ReviewsSection reviews={reviews} averageRating={listing.averageRating} />
            </motion.div>

          </div>

          {/* ═══ RIGHT COLUMN — Booking card ═══════════════════════════ */}
          <div style={{ position: 'sticky', top: 100 }}>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.4 }}
              style={{
                background: '#fff',
                borderRadius: 16,
                border: '1px solid #ddd',
                padding: 28,
                boxShadow: '0 8px 32px rgba(0,0,0,0.10), 0 2px 8px rgba(0,0,0,0.06)',
              }}
            >
              <BookingWidget
                listing={listing}
                checkInDate={checkInDate}
                checkOutDate={checkOutDate}
                guests={guests}
                setGuests={setGuests}
                onBook={handleBook}
                bookingLoading={bookingLoading}
              />
            </motion.div>

            {/* Rating summary under card */}
            {listing.averageRating > 0 && (
              <div style={{ marginTop: 16, display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 8 }}>
                <FaStar style={{ color: '#FF385C', fontSize: 14 }} />
                <span style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 14, fontWeight: 600, color: '#222' }}>
                  {listing.averageRating.toFixed(1)}
                </span>
                <span style={{ color: '#ccc' }}>·</span>
                <span style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 14, color: '#717171' }}>
                  {listing.totalReviews || reviews.length} review{(listing.totalReviews || reviews.length) !== 1 ? 's' : ''}
                </span>
              </div>
            )}

            {/* Report */}
            <div style={{ marginTop: 20, textAlign: 'center' }}>
              <button style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 13, color: '#717171', textDecoration: 'underline', textDecorationColor: '#ccc', background: 'none', border: 'none', cursor: 'pointer', textUnderlineOffset: 2 }}>
                Report this listing
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* ── Mobile sticky booking bar ── */}
      <div style={{ position: 'fixed', bottom: 0, left: 0, right: 0, background: '#fff', borderTop: '1px solid #ebebeb', padding: '14px 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', zIndex: 100, boxShadow: '0 -4px 20px rgba(0,0,0,0.08)' }}
        className="lg:hidden"
      >
        <div>
          <span style={{ fontFamily: "'Fraunces', serif", fontSize: 18, fontWeight: 700, color: '#222' }}>
            ${(listing.pricing?.basePrice || 0).toLocaleString()}
          </span>
          <span style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 14, color: '#717171' }}> /night</span>
          {listing.averageRating > 0 && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginTop: 2 }}>
              <FaStar style={{ color: '#FF385C', fontSize: 11 }} />
              <span style={{ fontSize: 13, fontWeight: 600, color: '#222' }}>{listing.averageRating.toFixed(1)}</span>
            </div>
          )}
        </div>
        <button
          onClick={handleBook}
          style={{ padding: '12px 28px', background: 'linear-gradient(135deg,#FF385C,#E31C5F)', color: '#fff', fontFamily: "'DM Sans', sans-serif", fontWeight: 700, fontSize: 15, border: 'none', borderRadius: 10, cursor: 'pointer', boxShadow: '0 4px 14px rgba(255,56,92,0.35)' }}
        >
          Reserve
        </button>
      </div>
    </div>
  );
}