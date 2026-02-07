import React, { useState, useRef, useEffect } from 'react';
import BottomSheet from '../BottomSheet';

const MobileBookingSheet = ({ isOpen, onClose, propertyId = '#12345' }) => {
	const [guests, setGuests] = useState(1);
	const [checkIn, setCheckIn] = useState('');
	const [checkOut, setCheckOut] = useState('');
	const [nights, setNights] = useState(0);

	// Calculate nights
	useEffect(() => {
		if (checkIn && checkOut) {
			const start = new Date(checkIn);
			const end = new Date(checkOut);
			const diff = Math.ceil(
				(end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)
			);
			setNights(Math.max(0, diff));
		}
	}, [checkIn, checkOut]);

	const pricePerNight = 250;
	const cleaningFee = 50;
	const totalPrice = pricePerNight * nights + (nights > 0 ? cleaningFee : 0);

	const handleIncrement = (setter, value) => {
		setter(value + 1);
	};

	const handleDecrement = (setter, value) => {
		if (value > 1) setter(value - 1);
	};

	const handleKeyDown = (e, increment, decrement, value) => {
		if (e.key === 'ArrowUp') {
			e.preventDefault();
			increment(value);
		} else if (e.key === 'ArrowDown') {
			e.preventDefault();
			decrement(Math.max(1, value));
		}
	};

	const isComplete = checkIn && checkOut && guests > 0 && nights > 0;

	return (
		<BottomSheet
			isOpen={isOpen}
			onClose={onClose}
			title="Reserve Property"
			height="h-4/5"
		>
			<div className="space-y-4">
				{/* Property ID */}
				<div className="text-sm text-gray-600">
					Property ID: <span className="font-semibold">{propertyId}</span>
				</div>

				{/* Check-in Date */}
				<div>
					<label
						htmlFor="check-in"
						className="block text-sm font-semibold text-gray-700 mb-2"
					>
						Check-in Date
					</label>
					<input
						id="check-in"
						type="date"
						value={checkIn}
						onChange={(e) => setCheckIn(e.target.value)}
						className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
						aria-describedby="date-hint"
					/>
				</div>

				{/* Check-out Date */}
				<div>
					<label
						htmlFor="check-out"
						className="block text-sm font-semibold text-gray-700 mb-2"
					>
						Check-out Date
					</label>
					<input
						id="check-out"
						type="date"
						value={checkOut}
						onChange={(e) => setCheckOut(e.target.value)}
						className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
						aria-describedby="date-hint"
					/>
					<p id="date-hint" className="text-xs text-gray-500 mt-1">
						{nights > 0 && `${nights} night${nights !== 1 ? 's' : ''}`}
					</p>
				</div>

				{/* Guests Counter */}
				<div>
					<label className="block text-sm font-semibold text-gray-700 mb-2">
						Number of Guests
					</label>
					<div className="flex items-center gap-3">
						<button
							onClick={() => handleDecrement(setGuests, guests)}
							onKeyDown={(e) => handleKeyDown(e, setGuests, setGuests, guests)}
							className="px-4 py-2 bg-gray-200 hover:bg-gray-300 rounded-lg font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500"
							aria-label="Decrease number of guests"
						>
							−
						</button>
						<span
							className="text-lg font-semibold min-w-12 text-center"
							aria-live="polite"
							aria-label={`Current number of guests: ${guests}`}
						>
							{guests}
						</span>
						<button
							onClick={() => handleIncrement(setGuests, guests)}
							onKeyDown={(e) => handleKeyDown(e, setGuests, setGuests, guests)}
							className="px-4 py-2 bg-gray-200 hover:bg-gray-300 rounded-lg font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500"
							aria-label="Increase number of guests"
						>
							+
						</button>
					</div>
				</div>

				{/* Price Breakdown */}
				{nights > 0 && (
					<div className="bg-gray-50 p-4 rounded-lg space-y-2">
						<div className="flex justify-between">
							<span className="text-gray-700">
								${pricePerNight} × {nights} night{nights !== 1 ? 's' : ''}
							</span>
							<span className="font-semibold">
								${pricePerNight * nights}
							</span>
						</div>
						<div className="flex justify-between">
							<span className="text-gray-700">Cleaning fee</span>
							<span className="font-semibold">${cleaningFee}</span>
						</div>
						<div className="border-t-2 border-gray-200 pt-2 flex justify-between">
							<span className="font-semibold">Total</span>
							<span className="text-lg font-bold text-blue-600">
								${totalPrice}
							</span>
						</div>
					</div>
				)}

				{/* Reserve Button */}
				<button
					onClick={() => {
						if (isComplete) {
							alert(
								`Booking: ${nights} nights for $${totalPrice}`
							);
							onClose();
						}
					}}
					disabled={!isComplete}
					className={`w-full py-3 rounded-lg font-semibold text-white transition ${
						isComplete
							? 'bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2'
							: 'bg-gray-400 cursor-not-allowed'
					}`}
					aria-label={
						isComplete
							? `Reserve for $${totalPrice}`
							: 'Select dates and guests to reserve'
					}
				>
					{isComplete ? `Reserve for $${totalPrice}` : 'Select Dates to Continue'}
				</button>

				{/* Mobile Keyboard Hint */}
				<p className="text-xs text-gray-500 text-center">
					Use arrow keys to adjust number of guests
				</p>
			</div>
		</BottomSheet>
	);
};

export default MobileBookingSheet;
