import React, { useState } from 'react';

export default function Step6Availability({ data, onChange }) {
	const [selectedMonth, setSelectedMonth] = useState(new Date());

	const year = selectedMonth.getFullYear();
	const month = selectedMonth.getMonth();

	const firstDay = new Date(year, month, 1);
	const lastDay = new Date(year, month + 1, 0);
	const daysInMonth = lastDay.getDate();
	const startingDayOfWeek = firstDay.getDay();

	const monthNames = [
		'January', 'February', 'March', 'April', 'May', 'June',
		'July', 'August', 'September', 'October', 'November', 'December'
	];

	const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

	const blockedDates = data.blockedDates || [];
	const minStayNights = data.minStayNights || 1;

	const dateString = (d) => `${year}-${month + 1}-${d}`;

	const toggleBlockedDate = (day) => {
		const dateStr = dateString(day);
		const newBlocked = blockedDates.includes(dateStr)
			? blockedDates.filter(d => d !== dateStr)
			: [...blockedDates, dateStr];
		onChange({ ...data, blockedDates: newBlocked });
	};

	const previousMonth = () => {
		setSelectedMonth(new Date(year, month - 1));
	};

	const nextMonth = () => {
		setSelectedMonth(new Date(year, month + 1));
	};

	const days = [];
	for (let i = 0; i < startingDayOfWeek; i++) {
		days.push(null);
	}
	for (let i = 1; i <= daysInMonth; i++) {
		days.push(i);
	}

	return (
		<div className="space-y-6">
			<div>
				<h2 className="text-2xl font-bold mb-2">Set your availability</h2>
				<p className="text-gray-600">Click dates to block them. Blocked dates won't be available for booking.</p>
			</div>

			<div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
				<div className="flex items-center justify-between mb-4">
					<button
						onClick={previousMonth}
						className="px-3 py-1 border rounded hover:bg-white"
					>
						←
					</button>
					<h3 className="text-lg font-semibold">
						{monthNames[month]} {year}
					</h3>
					<button
						onClick={nextMonth}
						className="px-3 py-1 border rounded hover:bg-white"
					>
						→
					</button>
				</div>

				<div className="grid grid-cols-7 gap-1 mb-4">
					{dayNames.map(day => (
						<div key={day} className="text-center font-semibold text-gray-700 py-2 text-sm">
							{day}
						</div>
					))}
				</div>

				<div className="grid grid-cols-7 gap-1">
					{days.map((day, idx) => (
						<button
							key={idx}
							onClick={() => day && toggleBlockedDate(day)}
							disabled={day === null}
							className={`
								aspect-square p-1 rounded text-xs font-medium transition-colors
								${day === null ? 'bg-transparent cursor-default' :
								  blockedDates.includes(dateString(day)) ? 'bg-red-500 text-white' :
								  'bg-green-50 border border-green-200 hover:bg-green-100 cursor-pointer'}
							`}
						>
							{day}
						</button>
					))}
				</div>

				<div className="mt-4 flex gap-4 text-sm">
					<div className="flex items-center gap-2">
						<div className="w-4 h-4 bg-green-100 border border-green-200 rounded"></div>
						<span>Available</span>
					</div>
					<div className="flex items-center gap-2">
						<div className="w-4 h-4 bg-red-500 rounded"></div>
						<span>Blocked</span>
					</div>
				</div>
			</div>

			<div className="space-y-4">
				<div>
					<label className="block text-sm font-medium text-gray-700 mb-2">
						Minimum Stay (nights)
					</label>
					<select
						value={minStayNights}
						onChange={(e) => onChange({ ...data, minStayNights: parseInt(e.target.value) })}
						className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
					>
						<option value="1">1 night (any stay length)</option>
						<option value="2">2 nights minimum</option>
						<option value="3">3 nights minimum</option>
						<option value="7">1 week minimum</option>
						<option value="30">1 month minimum</option>
					</select>
				</div>

				<div>
					<label className="block text-sm font-medium text-gray-700 mb-2">
						Check-in Time (optional)
					</label>
					<input
						type="time"
						value={data.checkInTime || '14:00'}
						onChange={(e) => onChange({ ...data, checkInTime: e.target.value })}
						className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
					/>
				</div>

				<div>
					<label className="block text-sm font-medium text-gray-700 mb-2">
						Check-out Time (optional)
					</label>
					<input
						type="time"
						value={data.checkOutTime || '11:00'}
						onChange={(e) => onChange({ ...data, checkOutTime: e.target.value })}
						className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
					/>
				</div>
			</div>
		</div>
	);
}
