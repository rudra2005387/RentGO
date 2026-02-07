import { Link } from 'react-router-dom';
import React, { useEffect, useMemo, useState } from 'react';
import { listBookings } from '../services/booking.service';

function formatDate(d) {
	if (!d) return '-';
	const dt = new Date(d);
	return dt.toLocaleDateString();
}

export default function Dashboard() {
	const [tab, setTab] = useState('bookings');
	const [bookings, setBookings] = useState([]);
	const [wishlist, setWishlist] = useState([]);
	const [messages, setMessages] = useState([]);
	const [reviews, setReviews] = useState([]);

	useEffect(() => {
		setBookings(listBookings());
		try {
			setWishlist(JSON.parse(localStorage.getItem('rg_wishlist')||'[]'));
			setMessages(JSON.parse(localStorage.getItem('rg_messages')||'[]'));
			setReviews(JSON.parse(localStorage.getItem('rg_reviews')||'[]'));
		} catch (e) {
			setWishlist([]); setMessages([]); setReviews([]);
		}
	}, []);

	const today = useMemo(() => new Date(), []);
	const upcoming = bookings.filter(b => new Date(b.checkIn) >= today && b.status !== 'cancelled');
	const past = bookings.filter(b => new Date(b.checkOut) < today || b.status === 'cancelled');
	const unreadCount = messages.filter(m => !m.read).length;

	function toggleSaved(item) {
		const exists = wishlist.find(w => w.id === item.id);
		let next = [];
		if (exists) next = wishlist.filter(w => w.id !== item.id);
		else next = [...wishlist, item];
		setWishlist(next);
		localStorage.setItem('rg_wishlist', JSON.stringify(next));
	}

	return (
		<div className="p-6">
			<div className="flex items-center justify-between mb-4">
				<h1 className="text-2xl font-bold">Dashboard</h1>
				<Link to="/" className="text-blue-600">Back home</Link>
			</div>

			<div className="flex gap-2 mb-6">
				<button onClick={()=>setTab('bookings')} className={`px-3 py-2 rounded ${tab==='bookings'?'bg-blue-600 text-white':'border'}`}>My Bookings</button>
				<button onClick={()=>setTab('saved')} className={`px-3 py-2 rounded ${tab==='saved'?'bg-blue-600 text-white':'border'}`}>Saved / Wishlist</button>
				<button onClick={()=>setTab('messages')} className={`px-3 py-2 rounded ${tab==='messages'?'bg-blue-600 text-white':'border'}`}>Messages {unreadCount>0 && <span className="ml-2 inline-block bg-red-600 text-white text-xs px-2 rounded">{unreadCount}</span>}</button>
				<button onClick={()=>setTab('reviews')} className={`px-3 py-2 rounded ${tab==='reviews'?'bg-blue-600 text-white':'border'}`}>Reviews</button>
				<button onClick={()=>setTab('actions')} className={`px-3 py-2 rounded ${tab==='actions'?'bg-blue-600 text-white':'border'}`}>Quick Actions</button>
			</div>

			{tab==='bookings' && (
				<div>
					<h2 className="text-lg font-semibold mb-2">Upcoming bookings</h2>
					{upcoming.length? upcoming.map(b => (
						<div key={b.ref} className="border rounded p-3 mb-2 flex justify-between items-center">
							<div>
								<div className="font-semibold">{b.listingId || 'Listing'}</div>
								<div className="text-sm text-gray-600">{formatDate(b.checkIn)} — {formatDate(b.checkOut)}</div>
								<div className="text-sm text-gray-600">Guests: {b.guests}</div>
							</div>
							<div className="text-right">
								<div className={`px-2 py-1 rounded text-sm ${b.status==='confirmed'?'bg-green-100 text-green-800':'bg-gray-100 text-gray-800'}`}>{b.status}</div>
								<div className="text-xs text-gray-500 mt-1">Ref: <span className="font-mono">{b.ref}</span></div>
							</div>
						</div>
					)) : <div className="text-sm text-gray-600">No upcoming bookings</div>}

					<h2 className="text-lg font-semibold mt-4 mb-2">Past / Cancelled bookings</h2>
					{past.length? past.map(b => (
						<div key={b.ref} className="border rounded p-3 mb-2 flex justify-between items-center">
							<div>
								<div className="font-semibold">{b.listingId || 'Listing'}</div>
								<div className="text-sm text-gray-600">{formatDate(b.checkIn)} — {formatDate(b.checkOut)}</div>
							</div>
							<div className="text-right">
								<div className={`px-2 py-1 rounded text-sm ${b.status==='cancelled'?'bg-red-100 text-red-800':'bg-gray-100 text-gray-800'}`}>{b.status}</div>
								<div className="text-xs text-gray-500 mt-1">Ref: <span className="font-mono">{b.ref}</span></div>
							</div>
						</div>
					)) : <div className="text-sm text-gray-600">No past bookings</div>}
				</div>
			)}

			{tab==='saved' && (
				<div>
					<h2 className="text-lg font-semibold mb-2">Saved / Wishlist</h2>
					{wishlist.length? (
						<div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
							{wishlist.map(item => (
								<div key={item.id} className="border rounded overflow-hidden">
									<div className="p-3">
										<div className="font-medium">{item.title||'Saved listing'}</div>
										<div className="text-sm text-gray-600">{item.price||''}</div>
										<div className="mt-2 flex gap-2">
											<button onClick={()=>toggleSaved(item)} className="px-3 py-1 border rounded">Remove</button>
										</div>
									</div>
								</div>
							))}
						</div>
					) : <div className="text-sm text-gray-600">No saved items</div>}
				</div>
			)}

			{tab==='messages' && (
				<div>
					<h2 className="text-lg font-semibold mb-2">Messages</h2>
					{messages.length? messages.map(m => (
						<div key={m.id} className={`border rounded p-3 mb-2 ${!m.read? 'bg-white' : 'bg-gray-50'}`}>
							<div className="flex justify-between">
								<div className="font-semibold">{m.from}</div>
								{!m.read && <div className="text-xs bg-red-600 text-white px-2 rounded">unread</div>}
							</div>
							<div className="text-sm text-gray-700 mt-1">{m.text}</div>
						</div>
					)) : <div className="text-sm text-gray-600">No messages</div>}
				</div>
			)}

			{tab==='reviews' && (
				<div>
					<h2 className="text-lg font-semibold mb-2">Reviews</h2>
					{reviews.length? reviews.map(r => (
						<div key={r.id} className="border rounded p-3 mb-2">
							<div className="font-semibold">{r.author} — {r.rating}★</div>
							<div className="text-sm text-gray-700">{r.text}</div>
						</div>
					)) : <div className="text-sm text-gray-600">No reviews yet</div>}
				</div>
			)}

			{tab==='actions' && (
				<div>
					<h2 className="text-lg font-semibold mb-2">Quick Actions</h2>
					<div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
						<Link to="/bookings" className="p-3 border rounded text-center">View all bookings</Link>
						<Link to="/listings" className="p-3 border rounded text-center">Create new listing</Link>
						<Link to="/profile" className="p-3 border rounded text-center">Edit profile</Link>
					</div>
				</div>
			)}

		</div>
	);
}

