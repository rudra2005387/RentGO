import React, { useState } from 'react';

export default function CalendarView({ bookings = [] }) {
	const [currentDate, setCurrentDate] = useState(new Date());

	const year = currentDate.getFullYear();
	const month = currentDate.getMonth();

	const firstDay = new Date(year, month, 1);
	const lastDay = new Date(year, month + 1, 0);
	const daysInMonth = lastDay.getDate();
	const startingDayOfWeek = firstDay.getDay();

	const monthNames = [
		'January', 'February', 'March', 'April', 'May', 'June',
		'July', 'August', 'September', 'October', 'November', 'December'
	];

	const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

	const bookedDates = new Set();
	bookings.forEach(booking => {
		const checkIn = new Date(booking.checkIn);
		const checkOut = new Date(booking.checkOut);
		for (let d = new Date(checkIn); d <= checkOut; d.setDate(d.getDate() + 1)) {
			if (d.getFullYear() === year && d.getMonth() === month) {
				bookedDates.add(d.getDate());
			}
		}
	});

	const days = [];
	for (let i = 0; i < startingDayOfWeek; i++) {
		days.push(null);
	}
	for (let i = 1; i <= daysInMonth; i++) {
		days.push(i);
	}

	const previousMonth = () => {
		setCurrentDate(new Date(year, month - 1));
	};

	const nextMonth = () => {
		setCurrentDate(new Date(year, month + 1));
	};

	const goToToday = () => {
		setCurrentDate(new Date());
	};

	return (
		<div className="border rounded-lg p-6 bg-white">
			<div className="flex items-center justify-between mb-6">
				<h2 className="text-lg font-bold">Booking Calendar</h2>
				<button
					onClick={goToToday}
					className="text-sm px-3 py-1 border rounded hover:bg-gray-100"
				>
					Today
				</button>
			</div>

			<div className="flex items-center justify-between mb-4">
				<button
					onClick={previousMonth}
					className="px-3 py-1 border rounded hover:bg-gray-100"
				>
					←
				</button>
				<h3 className="text-lg font-semibold">
					{monthNames[month]} {year}
				</h3>
				<button
					onClick={nextMonth}
					className="px-3 py-1 border rounded hover:bg-gray-100"
				>
					→
				</button>
			</div>

			<div className="grid grid-cols-7 gap-1 mb-4">
				{dayNames.map(day => (
					<div key={day} className="text-center font-semibold text-gray-700 py-2">
						{day}
					</div>
				))}
			</div>

			<div className="grid grid-cols-7 gap-1">
				{days.map((day, idx) => (
					<div
						key={idx}
						className={`aspect-square p-2 rounded text-center text-sm relative ${
							day === null ? 'bg-transparent' :
							bookedDates.has(day) ? 'bg-blue-500 text-white font-semibold' :
							new Date(year, month, day).toDateString() === new Date().toDateString() ? 'bg-green-100 border border-green-400 font-semibold' :
							'bg-gray-50 border border-gray-200 hover:bg-gray-100'
						}`}
					>
						{day}
					</div>
				))}
			</div>

			<div className="mt-6 pt-6 border-t">
				<h3 className="font-semibold mb-3">Legend</h3>
				<div className="flex gap-4 flex-wrap text-sm">
					<div className="flex items-center gap-2">
						<div className="w-4 h-4 bg-blue-500 rounded"></div>
						<span>Booked</span>
					</div>
					<div className="flex items-center gap-2">
						<div className="w-4 h-4 bg-green-100 border border-green-400 rounded"></div>
						<span>Today</span>
					</div>
					<div className="flex items-center gap-2">
						<div className="w-4 h-4 bg-gray-50 border border-gray-200 rounded"></div>
						<span>Available</span>
					</div>
				</div>
			</div>

			<div className="mt-6 p-4 bg-blue-50 rounded border border-blue-200">
				<p className="text-sm font-medium text-blue-900 mb-2">Total Bookings This Month</p>
				<p className="text-2xl font-bold text-blue-600">{bookings.length}</p>
			</div>
		</div>
	);
}
