import React, { useMemo, useState, useEffect, useCallback } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { FaShareAlt, FaMapMarkerAlt, FaStar, FaWifi, FaUtensils, FaParking, FaTv } from 'react-icons/fa';
import { motion } from 'framer-motion';
import PropertyGallery from '../components/PropertyGallery.jsx';
import HostInfo from '../components/HostInfo.jsx';
import BookingCalendar from '../components/BookingCalendar.jsx';
import ReviewList from '../components/ReviewList.jsx';
import { useAuth } from '../hooks/useAuth';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

function AmenitiesGrid({ amenities = [] }) {
	const [showAll, setShowAll] = useState(false);
	const visible = showAll ? amenities : amenities.slice(0, 8);

	const amenityIcons = {
		'WiFi': <FaWifi className="text-blue-600" />,
		'Kitchen': <FaUtensils className="text-blue-600" />,
		'Parking': <FaParking className="text-blue-600" />,
		'TV': <FaTv className="text-blue-600" />,
	};

	return (
		<div>
			<div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
				{visible.map((a) => (
					<div
						key={a}
						className="flex items-center gap-3 p-3 bg-gray-soft rounded-xl border border-gray-border hover:border-gray-300 transition-colors"
					>
						<div className="text-xl">
							{amenityIcons[a] || '✓'}
						</div>
						<span className="text-sm font-medium">{a}</span>
					</div>
				))}
			</div>
			{amenities.length > 8 && (
				<button
					onClick={() => setShowAll((s) => !s)}
					className="mt-4 text-primary font-medium hover:text-primary-hover"
				>
					{showAll ? '✕ Show less' : `+ Show all (${amenities.length})`}
				</button>
			)}
		</div>
	);
}

function ReviewsSection({ reviews = [], averageRating = 0 }) {
	const [showAll, setShowAll] = useState(false);
	const visible = showAll ? reviews : reviews.slice(0, 3);

	const breakdown = useMemo(() => {
		const map = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
		reviews.forEach(r => {
			const rating = r.overallRating || r.rating || 0;
			const rounded = Math.round(rating);
			if (rounded >= 1 && rounded <= 5) map[rounded]++;
		});
		return map;
	}, [reviews]);

	const average = averageRating || (reviews.length > 0
		? (reviews.reduce((s, r) => s + (r.overallRating || r.rating || 0), 0) / reviews.length).toFixed(1)
		: 0);

	return (
		<div className="mt-8">
			<div className="mb-6">
				<h3 className="text-2xl font-bold mb-2">Guest Reviews</h3>
				<div className="flex items-center gap-4 flex-wrap">
					<div className="flex items-baseline gap-2">
						<span className="text-4xl font-bold">{average}</span>
						<div className="flex gap-1">{[...Array(5)].map((_, i) =>
							<FaStar key={i} className={i < Math.round(average) ? 'text-yellow-400' : 'text-gray-300'} />
						)}</div>
					</div>
					<span className="text-gray-600 text-lg">based on {reviews.length} reviews</span>
				</div>
			</div>

			<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
				<div className="space-y-3">
					{Object.keys(breakdown)
						.reverse()
						.map(star => (
							<div key={star} className="flex items-center gap-3">
								<div className="w-12 text-sm font-medium">{star}★</div>
								<div className="flex-1 bg-gray-200 h-2 rounded-full overflow-hidden">
									<div
										style={{ width: `${(breakdown[star] || 0) / Math.max(1, reviews.length) * 100}%` }}
										className="bg-yellow-400 h-2 transition-all duration-500"
									/>
								</div>
								<div className="w-8 text-right text-sm text-gray-600">{breakdown[star] || 0}</div>
							</div>
						))}
				</div>

				<div className="space-y-4">
					{visible.map((r, idx) => {
						const authorName = typeof r.author === 'object'
							? [r.author?.firstName, r.author?.lastName].filter(Boolean).join(' ')
							: r.author || 'Guest';
						const rating = r.overallRating || r.rating || 0;
						const date = r.createdAt ? new Date(r.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : r.date || 'Recent';
						return (
							<div key={r._id || idx} className="pb-4 border-b border-gray-200 last:border-b-0">
								<div className="flex items-start justify-between gap-3 mb-2">
									<div>
										<div className="font-semibold text-gray-900">{authorName}</div>
										<div className="flex gap-1 mt-1">{[...Array(5)].map((_, i) =>
											<FaStar key={i} className={i < rating ? 'text-yellow-400 text-xs' : 'text-gray-300 text-xs'} />
										)}</div>
									</div>
									<span className="text-xs text-gray-500">{date}</span>
								</div>
								<p className="text-gray-700 text-sm">{r.comment}</p>
							</div>
						);
					})}
				</div>
			</div>

			{reviews.length > 3 && (
				<button
					onClick={() => setShowAll(s => !s)}
					className="mt-6 text-primary font-medium hover:text-primary-hover"
				>
					{showAll ? '✕ Show less reviews' : `+ Show all reviews (${reviews.length})`}
				</button>
			)}
		</div>
	);
}

// ─── Booking Widget (right sidebar) ──────────────────────────────────────────
function BookingWidget({ listing, checkInDate, checkOutDate, guests, setGuests, onDatesSelected, onBook, bookingLoading }) {
	const pricing = listing.pricing || {};
	const basePrice = pricing.basePrice || 0;
	const cleaningFee = pricing.cleaningFee || 0;
	const serviceFee = pricing.serviceFee || 0;

	const nights = useMemo(() => {
		if (!checkInDate || !checkOutDate) return 0;
		return Math.ceil((checkOutDate - checkInDate) / (1000 * 60 * 60 * 24));
	}, [checkInDate, checkOutDate]);

	const subtotal = basePrice * nights;
	const taxes = Math.round((subtotal + cleaningFee + serviceFee) * 0.12);
	const total = subtotal + cleaningFee + serviceFee + taxes;

	const maxGuests = listing.accommodates || listing.maxGuests || 10;

	return (
		<div className="bg-white border border-gray-200 rounded-2xl p-6 space-y-5">
			{/* Price header */}
			<div className="border-b border-gray-200 pb-4">
				<p className="text-2xl font-bold text-gray-900">
					${basePrice.toLocaleString()} <span className="text-base font-normal text-gray-500">/night</span>
				</p>
				{listing.averageRating && (
					<div className="flex items-center gap-1 mt-1">
						<FaStar className="text-yellow-400 w-3 h-3" />
						<span className="text-sm font-semibold">{listing.averageRating.toFixed(1)}</span>
						{listing.totalReviews > 0 && <span className="text-sm text-gray-500">({listing.totalReviews} reviews)</span>}
					</div>
				)}
			</div>

			{/* Date inputs */}
			<div className="grid grid-cols-2 border border-gray-300 rounded-xl overflow-hidden">
				<div className="p-3 border-r border-gray-300">
					<p className="text-[10px] font-bold text-gray-800 uppercase">Check-in</p>
					<p className="text-sm text-gray-600">
						{checkInDate ? checkInDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : 'Add date'}
					</p>
				</div>
				<div className="p-3">
					<p className="text-[10px] font-bold text-gray-800 uppercase">Check-out</p>
					<p className="text-sm text-gray-600">
						{checkOutDate ? checkOutDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : 'Add date'}
					</p>
				</div>
			</div>

			{/* Guest counter */}
			<div className="border border-gray-300 rounded-xl p-3">
				<p className="text-[10px] font-bold text-gray-800 uppercase mb-1">Guests</p>
				<div className="flex items-center justify-between">
					<span className="text-sm text-gray-600">{guests} guest{guests > 1 ? 's' : ''}</span>
					<div className="flex items-center gap-2">
						<button
							onClick={() => setGuests(Math.max(1, guests - 1))}
							disabled={guests <= 1}
							className="w-7 h-7 rounded-full border border-gray-300 flex items-center justify-center text-gray-600 hover:border-gray-600 disabled:opacity-30 disabled:cursor-not-allowed"
						>−</button>
						<span className="text-sm font-semibold w-4 text-center">{guests}</span>
						<button
							onClick={() => setGuests(Math.min(maxGuests, guests + 1))}
							disabled={guests >= maxGuests}
							className="w-7 h-7 rounded-full border border-gray-300 flex items-center justify-center text-gray-600 hover:border-gray-600 disabled:opacity-30 disabled:cursor-not-allowed"
						>+</button>
					</div>
				</div>
			</div>

			{/* Reserve button */}
			<button
				onClick={onBook}
				disabled={!checkInDate || !checkOutDate || nights === 0 || bookingLoading}
				className={`w-full py-3 rounded-xl font-bold text-white transition-all ${
					!checkInDate || !checkOutDate || nights === 0 || bookingLoading
						? 'bg-gray-300 cursor-not-allowed'
						: 'bg-gradient-to-r from-[#E61E4D] to-[#D70466] hover:opacity-90 cursor-pointer'
				}`}
			>
				{bookingLoading ? 'Reserving...' : 'Reserve'}
			</button>

			{nights > 0 && <p className="text-center text-sm text-gray-500">You won't be charged yet</p>}

			{/* Price breakdown */}
			{nights > 0 && (
				<div className="space-y-3 pt-4 border-t border-gray-200">
					<div className="flex justify-between text-sm">
						<span className="text-gray-600 underline">${basePrice} x {nights} night{nights > 1 ? 's' : ''}</span>
						<span className="text-gray-900">${subtotal.toLocaleString()}</span>
					</div>
					{cleaningFee > 0 && (
						<div className="flex justify-between text-sm">
							<span className="text-gray-600 underline">Cleaning fee</span>
							<span className="text-gray-900">${cleaningFee.toLocaleString()}</span>
						</div>
					)}
					{serviceFee > 0 && (
						<div className="flex justify-between text-sm">
							<span className="text-gray-600 underline">Service fee</span>
							<span className="text-gray-900">${serviceFee.toLocaleString()}</span>
						</div>
					)}
					<div className="flex justify-between text-sm">
						<span className="text-gray-600 underline">Taxes (12%)</span>
						<span className="text-gray-900">${taxes.toLocaleString()}</span>
					</div>
					<div className="flex justify-between font-bold text-base pt-3 border-t border-gray-200">
						<span>Total</span>
						<span>${total.toLocaleString()}</span>
					</div>
				</div>
			)}
		</div>
	);
}

// ─── Skeleton loader ─────────────────────────────────────────────────────────
function ListingSkeleton() {
	return (
		<div className="min-h-screen bg-white">
			<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
				<div className="space-y-6">
					<div className="h-8 skeleton rounded w-2/3" />
					<div className="h-4 skeleton rounded w-1/3" />
					<div className="aspect-[16/9] skeleton rounded-2xl" />
					<div className="grid grid-cols-3 gap-4">
						<div className="h-20 skeleton rounded-xl" />
						<div className="h-20 skeleton rounded-xl" />
						<div className="h-20 skeleton rounded-xl" />
					</div>
					<div className="h-48 skeleton rounded-2xl" />
				</div>
			</div>
		</div>
	);
}

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

	// Fetch listing data
	useEffect(() => {
		setLoading(true);
		Promise.all([
			fetch(`${API_BASE}/listings/${id}`).then(r => r.json()),
			fetch(`${API_BASE}/listings/${id}/reviews`).then(r => r.json()).catch(() => ({ success: false })),
			fetch(`${API_BASE}/listings/${id}/availability`).then(r => r.json()).catch(() => ({ success: false })),
		]).then(([listingRes, reviewsRes, availRes]) => {
			if (listingRes.success) {
				setListing(listingRes.data?.listing || listingRes.data);
			} else {
				setError('Listing not found');
			}
			if (reviewsRes.success) {
				setReviews(reviewsRes.data?.reviews || []);
			}
			if (availRes.success) {
				setUnavailableDates(availRes.data?.blockedDates || availRes.data?.unavailableDates || []);
			}
		}).catch(() => setError('Network error'))
		  .finally(() => setLoading(false));
	}, [id]);

	const nights = useMemo(() => {
		if (!checkInDate || !checkOutDate) return 0;
		return Math.ceil((checkOutDate - checkInDate) / (1000 * 60 * 60 * 24));
	}, [checkInDate, checkOutDate]);

	// Book handler — POST /bookings
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
				headers: {
					'Content-Type': 'application/json',
					Authorization: `Bearer ${token}`,
				},
				body: JSON.stringify({
					listingId: id,
					checkIn: checkInDate.toISOString(),
					checkOut: checkOutDate.toISOString(),
					guests,
					totalPrice: total,
				}),
			});
			const d = await res.json();
			if (d.success) {
				const bookingId = d.data?.booking?._id || d.data?._id;
				navigate(`/payment/${bookingId}`);
			} else {
				alert(d.message || 'Booking failed. Please try again.');
			}
		} catch {
			alert('Network error. Please try again.');
		} finally {
			setBookingLoading(false);
		}
	}, [token, checkInDate, checkOutDate, nights, guests, listing, id, navigate]);

	function handleShare() {
		const url = window.location.href;
		if (navigator.share) {
			navigator.share({ title: listing?.title, text: listing?.location?.city, url });
		} else {
			navigator.clipboard.writeText(url);
		}
	}

	if (loading) return <ListingSkeleton />;

	if (error || !listing) {
		return (
			<div className="min-h-screen bg-white flex items-center justify-center">
				<div className="text-center">
					<p className="text-5xl mb-4">🏠</p>
					<p className="text-lg font-semibold text-gray-800 mb-2">Listing not found</p>
					<p className="text-sm text-gray-500 mb-4">{error}</p>
					<Link to="/" className="text-sm font-semibold text-[#FF385C] hover:underline">Back to Home</Link>
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

	return (
		<div className="min-h-screen bg-white">
			{/* Header */}
			<div className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-gray-200">
				<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
					<button onClick={() => navigate(-1)} className="text-primary font-medium hover:text-primary-hover">← Back</button>
					<button
						onClick={handleShare}
						className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
					>
						<FaShareAlt className="text-gray-600" />
						<span className="text-sm font-medium">Share</span>
					</button>
				</div>
			</div>

			{/* Main Content */}
			<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
				{/* Title & Rating */}
				<div className="mb-6 sm:mb-8">
					<h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-2">{listing.title}</h1>
					<div className="flex items-center gap-3 flex-wrap">
						{listing.averageRating && (
							<div className="flex items-center gap-1">
								<div className="flex gap-0.5">
									{[...Array(5)].map((_, i) => (
										<FaStar key={i} className={i < Math.round(listing.averageRating) ? 'text-yellow-400' : 'text-gray-300'} size={16} />
									))}
								</div>
								<span className="font-semibold text-gray-900">{listing.averageRating.toFixed(1)}</span>
								<span className="text-gray-600">({listing.totalReviews || 0} reviews)</span>
							</div>
						)}
						<span className="text-gray-600 flex items-center gap-2">
							<FaMapMarkerAlt size={16} /> {locationStr}
						</span>
					</div>
				</div>

				{/* Gallery & Sidebar Layout */}
				<div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
					{/* Left Column */}
					<div className="lg:col-span-2 space-y-8 sm:space-y-12">
						{/* Gallery */}
						<div className="rounded-2xl overflow-hidden">
							<PropertyGallery images={images.length > 0 ? images : ['https://images.unsplash.com/photo-1568605114967-8130f3a36994?w=900']} />
						</div>

						{/* Property Info */}
						<div className="space-y-4">
							<div className="grid grid-cols-3 gap-4 pt-6 border-t border-gray-200">
								<div>
									<div className="text-3xl font-bold text-gray-900">{listing.bedrooms || '—'}</div>
									<div className="text-gray-600">Bedrooms</div>
								</div>
								<div>
									<div className="text-3xl font-bold text-gray-900">{listing.bathrooms || '—'}</div>
									<div className="text-gray-600">Bathrooms</div>
								</div>
								<div>
									<div className="text-3xl font-bold text-gray-900">{listing.accommodates || listing.maxGuests || '—'}</div>
									<div className="text-gray-600">Guests</div>
								</div>
							</div>

							<div className="pt-6 border-t border-gray-200">
								<h2 className="text-2xl font-bold mb-3">About this place</h2>
								<p className="text-gray-700 leading-relaxed">{listing.description}</p>
							</div>
						</div>

						{/* Amenities */}
						{listing.amenities?.length > 0 && (
							<div className="pt-6 border-t border-gray-200">
								<h2 className="text-2xl font-bold mb-6">Amenities</h2>
								<AmenitiesGrid amenities={listing.amenities} />
							</div>
						)}

						{/* Calendar */}
						<div className="pt-6 border-t border-gray-200">
							<h2 className="text-2xl font-bold mb-6">Select Dates</h2>
							<div className="bg-gray-50 p-6 rounded-2xl border border-gray-200">
								<BookingCalendar
									unavailableDates={unavailableDates}
									onDatesSelected={({ checkIn, checkOut }) => {
										setCheckInDate(checkIn);
										setCheckOutDate(checkOut);
									}}
								/>
							</div>
						</div>

						{/* Host Info */}
						<div className="pt-6 border-t border-gray-200">
							<h2 className="text-2xl font-bold mb-6">Your Host</h2>
							<HostInfo host={hostObj} />
						</div>

						{/* Reviews */}
						{reviews.length > 0 && (
							<div className="pt-6 border-t border-gray-200">
								<h2 className="text-2xl font-bold mb-6">Reviews</h2>
								<ReviewList reviews={reviews} averageRating={listing.averageRating} token={token} />
							</div>
						)}
					</div>

					{/* Right Column - Booking Widget */}
					<div className="lg:col-span-1">
						<div className="sticky top-28">
							<div className="shadow-card-hover rounded-2xl">
								<BookingWidget
									listing={listing}
									checkInDate={checkInDate}
									checkOutDate={checkOutDate}
									guests={guests}
									setGuests={setGuests}
									onBook={handleBook}
									bookingLoading={bookingLoading}
								/>
							</div>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
}

