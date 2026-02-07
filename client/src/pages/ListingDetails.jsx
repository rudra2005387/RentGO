import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { FaChevronLeft, FaChevronRight, FaShareAlt, FaMapMarkerAlt, FaUserFriends } from 'react-icons/fa';
import BookingModal from '../components/booking/BookingModal.jsx';



function ImageCarousel({ images = [] }) {
	const [index, setIndex] = useState(0);
	const [isOpen, setIsOpen] = useState(false);

	function prev() {
		setIndex((i) => (i - 1 + images.length) % images.length);
	}
	function next() {
		setIndex((i) => (i + 1) % images.length);
	}

	return (
		<div className="w-full max-w-4xl mx-auto">
			<div className="relative">
				<img
					src={images[index]}
					alt={`Image ${index + 1}`}
					className="w-full h-72 sm:h-96 object-cover rounded"
					onClick={() => setIsOpen(true)}
				/>
				<button onClick={prev} className="absolute left-2 top-1/2 transform -translate-y-1/2 bg-white/80 rounded-full p-2">
					<FaChevronLeft />
				</button>
				<button onClick={next} className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-white/80 rounded-full p-2">
					<FaChevronRight />
				</button>
				<div className="absolute left-4 bottom-3 bg-black/60 text-white text-sm px-2 py-1 rounded">{index + 1}/{images.length}</div>
			</div>

			{isOpen && (
				<div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4">
					<div className="relative w-full max-w-5xl">
						<img src={images[index]} alt={`Image ${index + 1}`} className="w-full h-[70vh] object-contain" />
						<button onClick={() => setIsOpen(false)} className="absolute right-2 top-2 bg-white/80 rounded px-3 py-1">Close</button>
						<button onClick={prev} className="absolute left-2 top-1/2 transform -translate-y-1/2 bg-white/80 rounded-full p-2"><FaChevronLeft /></button>
						<button onClick={next} className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-white/80 rounded-full p-2"><FaChevronRight /></button>
						<div className="absolute left-4 bottom-4 text-white bg-black/60 px-3 py-1 rounded">{index + 1}/{images.length} — Click to close</div>
					</div>
				</div>
			)}
		</div>
	);
}

function HostCard({ host = {} }) {
	return (
		<div className="border rounded p-4">
			<div className="flex items-center gap-3">
				<img src={host.avatar} alt={host.name} className="w-16 h-16 rounded-full object-cover" />
				<div>
					<div className="font-semibold">{host.name}</div>
					<div className="text-sm text-gray-500">{host.description}</div>
				</div>
			</div>
		</div>
	);
}

function AmenitiesGrid({ amenities = [] }) {
	const [showAll, setShowAll] = useState(false);
	const visible = showAll ? amenities : amenities.slice(0, 6);
	return (
		<div>
			<div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
				{visible.map((a) => (
					<div key={a} className="border rounded p-2 text-sm">{a}</div>
				))}
			</div>
			{amenities.length > 6 && (
				<button onClick={() => setShowAll((s) => !s)} className="mt-2 text-sm text-blue-600">
					{showAll ? 'Show less' : `Show all (${amenities.length})`}
				</button>
			)}
		</div>
	);
}

function ReviewsSection({ reviews = [] }) {
	const [showAll, setShowAll] = useState(false);
	const visible = showAll ? reviews : reviews.slice(0, 3);
	const breakdown = useMemo(() => {
		const map = { 5:0,4:0,3:0,2:0,1:0 };
		reviews.forEach(r => map[r.rating] = (map[r.rating] || 0) + 1);
		return map;
	}, [reviews]);

	const average = useMemo(() => {
		if (!reviews.length) return 0;
		return (reviews.reduce((s,r)=>s+r.rating,0)/reviews.length).toFixed(1);
	}, [reviews]);

	return (
		<div className="mt-6">
			<div className="flex items-center justify-between">
				<div>
					<div className="text-xl font-semibold">Reviews</div>
					<div className="text-sm text-gray-600">Average: {average} • {reviews.length} reviews</div>
				</div>
			</div>

			<div className="mt-3 grid grid-cols-1 sm:grid-cols-3 gap-4">
				<div className="col-span-1">
					{Object.keys(breakdown).reverse().map(star => (
						<div key={star} className="flex items-center gap-2 text-sm">
							<div className="w-8">{star}★</div>
							<div className="flex-1 bg-gray-200 h-2 rounded" style={{width: '100%'}}>
								<div className="bg-yellow-400 h-2 rounded" style={{width: `${(breakdown[star]||0)/Math.max(1,reviews.length)*100}%`}} />
							</div>
							<div className="w-8 text-right">{breakdown[star]||0}</div>
						</div>
					))}
				</div>

				<div className="col-span-2">
					{visible.map((r, idx) => (
						<div key={idx} className="border-b py-3">
							<div className="flex items-center justify-between">
								<div className="font-semibold">{r.author}</div>
								<div className="text-sm text-gray-600">{r.rating}★</div>
							</div>
							<div className="text-sm text-gray-700 mt-1">{r.comment}</div>
						</div>
					))}
					{reviews.length > 3 && (
						<button onClick={() => setShowAll(s => !s)} className="mt-3 text-sm text-blue-600">
							{showAll ? 'Show less reviews' : `Show more reviews (${reviews.length - 3})`}
						</button>
					)}
				</div>
			</div>
		</div>
	);
}

function SimilarListings({ items = [] }) {
	const [i, setI] = useState(0);
	function prev() { setI((x)=>Math.max(0,x-1)); }
	function next() { setI((x)=>Math.min(items.length-1,x+1)); }
	return (
		<div className="mt-6">
			<div className="flex items-center justify-between">
				<h3 className="font-semibold">Similar listings</h3>
				<div className="flex gap-2">
					<button onClick={prev} className="p-1 bg-white/80 rounded"><FaChevronLeft/></button>
					<button onClick={next} className="p-1 bg-white/80 rounded"><FaChevronRight/></button>
				</div>
			</div>
			<div className="mt-3 grid grid-cols-1 sm:grid-cols-3 gap-3">
				{items.slice(i, i+3).map((it, idx) => (
					<div key={idx} className="border rounded overflow-hidden">
						<img src={it.image} alt={it.title} className="w-full h-40 object-cover" />
						<div className="p-3">
							<div className="font-medium">{it.title}</div>
							<div className="text-sm text-gray-600">{it.price}</div>
						</div>
					</div>
				))}
			</div>
		</div>
	);
}

function BookingWidget({ pricePerNight = 100, onBook }) {
	const [checkIn, setCheckIn] = useState('');
	const [checkOut, setCheckOut] = useState('');
	const [guests, setGuests] = useState(1);

	function nights() {
		if (!checkIn || !checkOut) return 0;
		const d1 = new Date(checkIn);
		const d2 = new Date(checkOut);
		const diff = Math.ceil((d2 - d1) / (1000*60*60*24));
		return Math.max(0, diff);
	}

	const total = nights() * pricePerNight;

	return (
		<div className="w-full sm:w-80 border rounded p-4 bg-white">
			<div className="font-semibold text-lg">{pricePerNight}$ / night</div>
			<div className="mt-3">
				<label className="text-sm">Check-in</label>
				<input type="date" value={checkIn} onChange={e=>setCheckIn(e.target.value)} className="w-full border rounded p-2 mt-1" />
				<label className="text-sm mt-2">Check-out</label>
				<input type="date" value={checkOut} onChange={e=>setCheckOut(e.target.value)} className="w-full border rounded p-2 mt-1" />
			</div>
			<div className="mt-3 flex items-center justify-between">
				<div className="text-sm">Guests</div>
				<div className="flex items-center gap-2">
					<button onClick={()=>setGuests(g=>Math.max(1,g-1))} className="px-2 py-1 border rounded">-</button>
					<div>{guests}</div>
					<button onClick={()=>setGuests(g=>g+1)} className="px-2 py-1 border rounded">+</button>
				</div>
			</div>
			<div className="mt-3 text-sm">
				<div> Nights: {nights()}</div>
				<div>Subtotal: ${total}</div>
			</div>
			<button onClick={() => onBook?.({checkIn, checkOut, guests})} className="mt-3 w-full bg-blue-600 text-white rounded py-2">Reserve</button>
		</div>
	);
}

export default function ListingDetails() {
	const { id } = useParams();

	const [bookingOpen, setBookingOpen] = useState(false);
	const [bookingInitial, setBookingInitial] = useState(null);

	// Sample data — in real app fetch by id
	const sample = {
		id,
		title: 'Beautiful Apartment in City Center',
		address: '123 Main St, City',
		images: [
			'/public/sample1.jpg',
			'/public/sample2.jpg',
			'/public/sample3.jpg'
		],
		host: { name: 'Alice', avatar: 'https://i.pravatar.cc/150?img=3', description: 'Superhost since 2020' },
		amenities: ['Wifi','Kitchen','Washer','Dryer','Air conditioning','Heating','Free parking','TV','Workspace','Hair dryer'],
		pricePerNight: 129,
		reviews: [
			{ author: 'John', rating: 5, comment: 'Amazing stay!' },
			{ author: 'Sara', rating: 4, comment: 'Very comfortable.' },
			{ author: 'Mike', rating: 5, comment: 'Great host.' },
			{ author: 'Lena', rating: 3, comment: 'Ok for short stay.' }
		],
		similar: [
			{ title: 'Cozy Studio', price: '$89', image: '/public/sample1.jpg' },
			{ title: 'Modern Loft', price: '$150', image: '/public/sample2.jpg' },
			{ title: 'Quiet Home', price: '$110', image: '/public/sample3.jpg' }
		]
	};

	function handleShare() {
		const url = window.location.href;
		const data = { title: sample.title, text: sample.address, url };
		if (navigator.share) {
			navigator.share(data).catch(()=>{});
		} else {
			navigator.clipboard.writeText(url).then(()=> alert('Link copied to clipboard')); 
		}
	}

	function handleBook(details) {
		// open booking modal with initial values and listing info
		setBookingInitial({
			...details,
			listingId: sample.id,
			pricePerNight: sample.pricePerNight,
		});
		setBookingOpen(true);
	}

	return (
		<div className="p-6">
			<div className="flex items-start gap-6">
				<div className="flex-1">
						<ImageCarousel images={sample.images} />
						{bookingOpen && (
							<BookingModal open={bookingOpen} initial={bookingInitial || {}} onClose={() => setBookingOpen(false)} />
						)}
					<div className="mt-4 flex items-center justify-between">
						<div>
							<h1 className="text-2xl font-bold">{sample.title}</h1>
							<div className="text-sm text-gray-600 flex items-center gap-2"><FaMapMarkerAlt /> {sample.address}</div>
						</div>
						<div className="flex items-center gap-3">
							<button onClick={handleShare} title="Share" className="p-2 border rounded"><FaShareAlt/></button>
						</div>
					</div>

					<div className="mt-6 grid grid-cols-1 lg:grid-cols-3 gap-6">
						<div className="col-span-2">
							<div className="mb-4">
								<h3 className="font-semibold">Property Info</h3>
								<p className="text-sm text-gray-700">A lovely property with all the amenities you need for a comfortable stay.</p>
							</div>

							<div className="mb-4">
								<h3 className="font-semibold">Host</h3>
								<HostCard host={sample.host} />
							</div>

							<div className="mb-4">
								<h3 className="font-semibold">Amenities</h3>
								<AmenitiesGrid amenities={sample.amenities} />
							</div>

							<ReviewsSection reviews={sample.reviews} />

							<div className="mt-6">
								<h3 className="font-semibold">Location & Nearby</h3>
								<div className="border rounded h-48 mt-2 flex items-center justify-center text-gray-500">Map placeholder (integrate Mapbox/Google Maps)</div>
							</div>

							<SimilarListings items={sample.similar} />
						</div>

						<div className="col-span-1">
							<div className="sticky top-24">
								<BookingWidget pricePerNight={sample.pricePerNight} onBook={handleBook} />
								<div className="mt-3 text-xs text-gray-500">Prices may vary by season. Cleaning fee and taxes not included.</div>
							</div>
						</div>
					</div>
				</div>
			</div>
			<div className="mt-6"><Link to="/search" className="text-blue-600">Back to search</Link></div>
		</div>
	);
}

