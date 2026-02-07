import React, { useState } from 'react';

export default function DateRangePicker({ startDate, endDate, onDatesChange }) {
	const [localStartDate, setLocalStartDate] = useState(startDate || '');
	const [localEndDate, setLocalEndDate] = useState(endDate || '');
	const [showCalendar, setShowCalendar] = useState(false);

	const handleStartDateChange = (e) => {
		const newStart = e.target.value;
		setLocalStartDate(newStart);
		if (newStart && localEndDate && new Date(newStart) <= new Date(localEndDate)) {
			onDatesChange(newStart, localEndDate);
		} else if (!localEndDate) {
			onDatesChange(newStart, localEndDate);
		}
	};

	const handleEndDateChange = (e) => {
		const newEnd = e.target.value;
		setLocalEndDate(newEnd);
		if (localStartDate && newEnd && new Date(localStartDate) <= new Date(newEnd)) {
			onDatesChange(localStartDate, newEnd);
		} else if (!localStartDate) {
			onDatesChange(localStartDate, newEnd);
		}
	};

	const getDaysDifference = () => {
		if (!localStartDate || !localEndDate) return 0;
		const start = new Date(localStartDate);
		const end = new Date(localEndDate);
		return Math.ceil((end - start) / (1000 * 60 * 60 * 24));
	};

	const quickDateRanges = [
		{ label: 'This Weekend', days: 2 },
		{ label: 'Next Week', days: 7 },
		{ label: 'Next 2 Weeks', days: 14 },
		{ label: 'Next Month', days: 30 }
	];

	const setQuickRange = (days) => {
		const start = new Date();
		const end = new Date(start);
		end.setDate(end.getDate() + days);

		const startStr = start.toISOString().split('T')[0];
		const endStr = end.toISOString().split('T')[0];

		setLocalStartDate(startStr);
		setLocalEndDate(endStr);
		onDatesChange(startStr, endStr);
	};

	return (
		<div className="w-full space-y-3">
			<label className="block text-sm font-medium text-gray-700">
				📅 Date Range
			</label>

			<div className="grid grid-cols-2 gap-3">
				<div>
					<label className="block text-xs text-gray-600 mb-1">Check-in</label>
					<input
						type="date"
						value={localStartDate}
						onChange={handleStartDateChange}
						min={new Date().toISOString().split('T')[0]}
						className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
					/>
				</div>
				<div>
					<label className="block text-xs text-gray-600 mb-1">Check-out</label>
					<input
						type="date"
						value={localEndDate}
						onChange={handleEndDateChange}
						min={localStartDate || new Date().toISOString().split('T')[0]}
						className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
					/>
				</div>
			</div>

			{getDaysDifference() > 0 && (
				<div className="bg-blue-50 border border-blue-200 rounded-lg p-2 text-center text-sm font-medium text-blue-700">
					{getDaysDifference()} night{getDaysDifference() !== 1 ? 's' : ''}
				</div>
			)}

			<div>
				<label className="text-xs font-medium text-gray-600 block mb-2">Quick Select</label>
				<div className="grid grid-cols-2 gap-2">
					{quickDateRanges.map((range, idx) => (
						<button
							key={idx}
							onClick={() => setQuickRange(range.days)}
							className="px-3 py-1 text-xs border border-gray-300 rounded hover:bg-blue-50 hover:border-blue-400 transition-colors"
						>
							{range.label}
						</button>
					))}
				</div>
			</div>
		</div>
	);
}
