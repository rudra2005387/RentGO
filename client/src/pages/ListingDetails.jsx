import React, { useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { FaShareAlt, FaMapMarkerAlt, FaStar, FaWifi, FaUtensilsSpoon, FaParking, FaTv } from 'react-icons/fa';
import { motion } from 'framer-motion';
import PropertyGallery from '../components/PropertyGallery/PropertyGallery.jsx';
import HostInfo from '../components/HostInfo/HostInfo.jsx';
import BookingCalendar from '../components/BookingCalendar/BookingCalendar.jsx';
import CheckoutSummary from '../components/CheckoutSummary/CheckoutSummary.jsx';


function AmenitiesGrid({ amenities = [] }) {
	const [showAll, setShowAll] = useState(false);
	const visible = showAll ? amenities : amenities.slice(0, 8);

	const amenityIcons = {
		'WiFi': <FaWifi className="text-blue-600" />,
		'Kitchen': <FaUtensilsSpoon className="text-blue-600" />,
		'Parking': <FaParking className="text-blue-600" />,
		'TV': <FaTv className="text-blue-600" />,
	};

	return (
		<div>
			<div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
				{visible.map((a) => (
					<motion.div
						key={a}
						initial={{ opacity: 0, y: 10 }}
						whileInView={{ opacity: 1, y: 0 }}
						whileHover={{ x: 4 }}
						className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg border border-gray-200 hover:border-gray-300"
					>
						<div className="text-xl">
							{amenityIcons[a] || '✓'}
						</div>
						<span className="text-sm font-medium">{a}</span>
					</motion.div>
				))}
			</div>
			{amenities.length > 8 && (
				<motion.button
					whileHover={{ scale: 1.05 }}
					whileTap={{ scale: 0.95 }}
					onClick={() => setShowAll((s) => !s)}
					className="mt-4 text-blue-600 font-medium hover:text-blue-700"
				>
					{showAll ? '✕ Show less' : `+ Show all (${amenities.length})`}
				</motion.button>
			)}
		</div>
	);
}



function ReviewsSection({ reviews = [] }) {
	const [showAll, setShowAll] = useState(false);
	const visible = showAll ? reviews : reviews.slice(0, 3);

	const breakdown = useMemo(() => {
		const map = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
		reviews.forEach(r => map[r.rating] = (map[r.rating] || 0) + 1);
		return map;
	}, [reviews]);

	const average = useMemo(() => {
		if (!reviews.length) return 0;
		return (reviews.reduce((s, r) => s + r.rating, 0) / reviews.length).toFixed(1);
	}, [reviews]);

	return (
		<motion.div
			initial={{ opacity: 0, y: 20 }}
			whileInView={{ opacity: 1, y: 0 }}
			className="mt-8"
		>
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
									<motion.div
										initial={{ width: 0 }}
										whileInView={{ width: `${(breakdown[star] || 0) / Math.max(1, reviews.length) * 100}%` }}
										className="bg-yellow-400 h-2"
									/>
								</div>
								<div className="w-8 text-right text-sm text-gray-600">{breakdown[star] || 0}</div>
							</div>
						))}
				</div>

				<div className="space-y-4">
					{visible.map((r, idx) => (
						<motion.div
							key={idx}
							initial={{ opacity: 0, x: 20 }}
							whileInView={{ opacity: 1, x: 0 }}
							transition={{ delay: idx * 0.1 }}
							className="pb-4 border-b border-gray-200 last:border-b-0"
						>
							<div className="flex items-start justify-between gap-3 mb-2">
								<div>
									<div className="font-semibold text-gray-900">{r.author}</div>
									<div className="flex gap-1 mt-1">{[...Array(5)].map((_, i) => 
										<FaStar key={i} className={i < r.rating ? 'text-yellow-400 text-xs' : 'text-gray-300 text-xs'} />
									)}</div>
								</div>
								<span className="text-xs text-gray-500">{r.date || 'Recent'}</span>
							</div>
							<p className="text-gray-700 text-sm">{r.comment}</p>
						</motion.div>
					))}
				</div>
			</div>

			{reviews.length > 3 && (
				<motion.button
					whileHover={{ scale: 1.05 }}
					whileTap={{ scale: 0.95 }}
					onClick={() => setShowAll(s => !s)}
					className="mt-6 text-blue-600 font-medium hover:text-blue-700"
				>
					{showAll ? '✕ Show less reviews' : `+ Show all reviews (${reviews.length})`}
				</motion.button>
			)}
		</motion.div>
	);
}



function SimilarListings({ items = [] }) {
	return (
		<motion.div
			initial={{ opacity: 0, y: 20 }}
			whileInView={{ opacity: 1, y: 0 }}
			className="mt-12"
		>
			<h3 className="text-2xl font-bold mb-6">Similar Listings</h3>
			<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
				{items.map((prop, idx) => (
					<motion.div
						key={idx}
						whileHover={{ y: -8 }}
						className="rounded-2xl overflow-hidden bg-white border border-gray-200 hover:border-gray-300 hover:shadow-xl transition-all"
					>
						<div className="relative h-48 overflow-hidden bg-gray-200">
							<motion.img
								src={prop.image}
								alt={prop.title}
								className="w-full h-full object-cover"
								whileHover={{ scale: 1.1 }}
								transition={{ duration: 0.3 }}
							/>
						</div>
						<div className="p-4">
							<h4 className="font-bold text-gray-900 line-clamp-2">{prop.title}</h4>
							<div className="flex items-center justify-between mt-3">
								<div className="text-lg font-bold text-gray-900">{prop.price}</div>
								<span className="text-xs text-gray-500">/month</span>
							</div>
							<motion.button
								whileHover={{ scale: 1.02 }}
								whileTap={{ scale: 0.98 }}
								className="w-full mt-4 bg-blue-600 text-white py-2 rounded-lg font-medium hover:bg-blue-700"
							>
								View Property
							</motion.button>
						</div>
					</motion.div>
				))}
			</div>
		</motion.div>
	);
}


export default function ListingDetails() {
	const { id } = useParams();
	const [checkInDate, setCheckInDate] = useState(null);
	const [checkOutDate, setCheckOutDate] = useState(null);

	// Sample data — in real app fetch by id
	const sample = {
		id,
		title: 'Stunning Beachfront Villa with Ocean Views',
		location: 'Malibu, California',
		address: '456 Coastal Drive, Malibu, CA 90265',
		rating: 4.87,
		reviews: 156,
		images: [
			'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=900&h=600&fit=crop',
			'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=900&h=600&fit=crop',
			'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=900&h=600&fit=crop',
			'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=900&h=600&fit=crop',
		],
		pricePerNight: 485,
		cleaningFee: 120,
		serviceFee: 65,
		taxes: 95,
		discount: 0,
		bedrooms: 4,
		bathrooms: 3,
		guests: 8,
		host: {
			name: 'Alexandra Morgan',
			avatar: 'https://i.pravatar.cc/150?img=5',
			isSuperhost: true,
			yearsHosting: 7,
			responseRate: '98%',
			responseTime: '< 1 hour',
			bio: 'We love hosting and making sure our guests have an amazing stay. Thank you for choosing our beautiful villa!',
			languages: ['English', 'Spanish', 'French'],
			rating: 4.9,
			reviewCount: 312,
		},
		amenities: ['WiFi', 'Kitchen', 'Parking', 'TV', 'Pool', 'Hot Tub', 'Gym', 'Washer', 'Dryer', 'Air conditioning'],
		description: 'This spectacular beachfront villa offers breathtaking ocean views, luxury amenities, and direct beach access. Perfect for families or groups looking for an unforgettable coastal getaway.',
		reviews: [
			{ author: 'Sarah Johnson', rating: 5, comment: 'Absolutely stunning property! The views are incredible and the amenities are top-notch. We felt like we were in paradise.', date: '2 weeks ago' },
			{ author: 'Mark Chen', rating: 5, comment: 'Best vacation ever! The host was incredibly helpful and responsive. Highly recommend!', date: '1 month ago' },
			{ author: 'Emma Williams', rating: 4, comment: 'Beautiful villa with great location. The beach access is perfect. Minor issues with WiFi but overall amazing.', date: '6 weeks ago' },
			{ author: 'James Rodriguez', rating: 5, comment: 'The villa exceeded our expectations. Everything was clean, well-maintained, and very comfortable.', date: '2 months ago' },
		],
		similar: [
			{ title: 'Luxury Cliff House', price: '$520', image: 'https://images.unsplash.com/photo-1512917774080-9264f475a626?w=400&h=300&fit=crop' },
			{ title: 'Modern Beach Home', price: '$420', image: 'https://images.unsplash.com/photo-1570129477492-45a003537e1f?w=400&h=300&fit=crop' },
			{ title: 'Oceanview Penthouse', price: '$595', image: 'https://images.unsplash.com/photo-1568605114967-8130f3a36994?w=400&h=300&fit=crop' },
		]
	};

	const nights = useMemo(() => {
		if (!checkInDate || !checkOutDate) return 0;
		const diffTime = checkOutDate - checkInDate;
		return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
	}, [checkInDate, checkOutDate]);

	const subtotal = nights > 0 ? nights * sample.pricePerNight : 0;
	const total = subtotal + sample.cleaningFee + sample.serviceFee + sample.taxes - sample.discount;

	function handleShare() {
		const url = window.location.href;
		if (navigator.share) {
			navigator.share({ title: sample.title, text: sample.location, url });
		} else {
			navigator.clipboard.writeText(url);
		}
	}

	return (
		<div className="min-h-screen bg-white">
			{/* Header */}
			<motion.div
				initial={{ opacity: 0, y: -10 }}
				animate={{ opacity: 1, y: 0 }}
				className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-gray-200"
			>
				<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
					<Link to="/search" className="text-blue-600 font-medium hover:text-blue-700">← Back to Results</Link>
					<motion.button
						whileHover={{ scale: 1.05 }}
						whileTap={{ scale: 0.95 }}
						onClick={handleShare}
						className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
					>
						<FaShareAlt className="text-gray-600" />
						<span className="text-sm font-medium">Share</span>
					</motion.button>
				</div>
			</motion.div>

			{/* Main Content */}
			<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
				{/* Title & Rating */}
				<motion.div
					initial={{ opacity: 0, y: 10 }}
					animate={{ opacity: 1, y: 0 }}
					className="mb-6 sm:mb-8"
				>
					<h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-2">{sample.title}</h1>
					<div className="flex items-center gap-3 flex-wrap">
						<div className="flex items-center gap-1">
							<div className="flex gap-0.5">
								{[...Array(5)].map((_, i) => (
									<FaStar key={i} className={i < Math.round(sample.rating) ? 'text-yellow-400' : 'text-gray-300'} size={16} />
								))}
							</div>
							<span className="font-semibold text-gray-900">{sample.rating}</span>
							<span className="text-gray-600">({sample.reviews} reviews)</span>
						</div>
						<span className="text-gray-600 flex items-center gap-2">
							<FaMapMarkerAlt size={16} /> {sample.location}
						</span>
					</div>
				</motion.div>

				{/* Gallery & Sidebar Layout */}
				<div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
					{/* Left Column - Gallery & Details */}
					<div className="lg:col-span-2 space-y-8 sm:space-y-12">
						{/* Gallery */}
						<motion.div
							initial={{ opacity: 0 }}
							animate={{ opacity: 1 }}
							className="rounded-2xl overflow-hidden"
						>
							<PropertyGallery images={sample.images} />
						</motion.div>

						{/* Property Info */}
						<motion.div
							initial={{ opacity: 0, y: 20 }}
							whileInView={{ opacity: 1, y: 0 }}
							className="space-y-4"
						>
							<div className="grid grid-cols-3 gap-4 pt-6 border-t border-gray-200">
								<div>
									<div className="text-3xl font-bold text-gray-900">{sample.bedrooms}</div>
									<div className="text-gray-600">Bedrooms</div>
								</div>
								<div>
									<div className="text-3xl font-bold text-gray-900">{sample.bathrooms}</div>
									<div className="text-gray-600">Bathrooms</div>
								</div>
								<div>
									<div className="text-3xl font-bold text-gray-900">{sample.guests}</div>
									<div className="text-gray-600">Guests</div>
								</div>
							</div>

							<div className="pt-6 border-t border-gray-200">
								<h2 className="text-2xl font-bold mb-3">About this place</h2>
								<p className="text-gray-700 leading-relaxed">{sample.description}</p>
							</div>
						</motion.div>

						{/* Amenities */}
						<motion.div
							initial={{ opacity: 0, y: 20 }}
							whileInView={{ opacity: 1, y: 0 }}
							className="pt-6 border-t border-gray-200"
						>
							<h2 className="text-2xl font-bold mb-6">Amenities</h2>
							<AmenitiesGrid amenities={sample.amenities} />
						</motion.div>

						{/* Calendar */}
						<motion.div
							initial={{ opacity: 0, y: 20 }}
							whileInView={{ opacity: 1, y: 0 }}
							className="pt-6 border-t border-gray-200"
						>
							<h2 className="text-2xl font-bold mb-6">Select Dates</h2>
							<div className="bg-gray-50 p-6 rounded-2xl border border-gray-200">
								<BookingCalendar
									onDatesSelected={(checkIn, checkOut) => {
										setCheckInDate(checkIn);
										setCheckOutDate(checkOut);
									}}
								/>
							</div>
						</motion.div>

						{/* Host Info */}
						<motion.div
							initial={{ opacity: 0, y: 20 }}
							whileInView={{ opacity: 1, y: 0 }}
							className="pt-6 border-t border-gray-200"
						>
							<h2 className="text-2xl font-bold mb-6">Your Host</h2>
							<HostInfo host={sample.host} />
						</motion.div>

						{/* Reviews */}
						<motion.div
							initial={{ opacity: 0, y: 20 }}
							whileInView={{ opacity: 1, y: 0 }}
							className="pt-6 border-t border-gray-200"
						>
							<ReviewsSection reviews={sample.reviews} />
						</motion.div>

						{/* Similar Listings */}
						<motion.div
							initial={{ opacity: 0, y: 20 }}
							whileInView={{ opacity: 1, y: 0 }}
							className="pt-6 border-t border-gray-200"
						>
							<SimilarListings items={sample.similar} />
						</motion.div>
					</div>

					{/* Right Column - Pricing Sticky */}
					<div className="lg:col-span-1">
						<motion.div
							initial={{ opacity: 0, x: 20 }}
							animate={{ opacity: 1, x: 0 }}
							className="sticky top-24"
						>
							<CheckoutSummary
								propertyTitle={sample.title}
								pricePerNight={sample.pricePerNight}
								nights={nights}
								checkInDate={checkInDate}
								checkOutDate={checkOutDate}
								cleaningFee={sample.cleaningFee}
								serviceFee={sample.serviceFee}
								taxes={sample.taxes}
								discount={sample.discount}
								onBook={() => {
									// Handle booking
									console.log('Booking initiated:', { checkInDate, checkOutDate, nights });
								}}
								isLoading={false}
							/>
						</motion.div>
					</div>
				</div>
			</div>
		</div>
	);
}

