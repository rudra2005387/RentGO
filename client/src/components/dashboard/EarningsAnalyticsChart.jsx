import React, { useState } from 'react';

export default function EarningsAnalyticsChart({ data = [] }) {
	const [timeRange, setTimeRange] = useState('month');

	// Sample data if not provided
	const chartData = data.length > 0 ? data : generateSampleData();

	const maxValue = Math.max(...chartData.map(d => d.value), 1);

	return (
		<div className="border rounded-lg p-6 bg-white">
			<div className="flex items-center justify-between mb-6">
				<h2 className="text-lg font-bold">Earnings Analytics</h2>
				<select
					value={timeRange}
					onChange={(e) => setTimeRange(e.target.value)}
					className="px-3 py-1 border rounded text-sm"
				>
					<option value="week">This Week</option>
					<option value="month">This Month</option>
					<option value="year">This Year</option>
				</select>
			</div>

			<div className="space-y-4">
				{chartData.map((item, idx) => (
					<div key={idx} className="flex items-center gap-3">
						<div className="w-16 text-sm font-medium text-gray-700">{item.label}</div>
						<div className="flex-1">
							<div className="bg-gray-100 rounded-full h-8 flex items-center relative overflow-hidden">
								<div
									className="bg-blue-500 h-full rounded-full flex items-center justify-center transition-all"
									style={{ width: `${(item.value / maxValue) * 100}%` }}
								>
									{(item.value / maxValue) * 100 > 15 && (
										<span className="text-white text-xs font-semibold">${item.value}</span>
									)}
								</div>
								{(item.value / maxValue) * 100 <= 15 && (
									<span className="text-gray-700 text-xs font-semibold ml-2">${item.value}</span>
								)}
							</div>
						</div>
					</div>
				))}
			</div>

			<div className="mt-6 pt-6 border-t grid grid-cols-3 gap-4">
				<div>
					<p className="text-sm text-gray-600">Total Earnings</p>
					<p className="text-2xl font-bold text-gray-900">
						${chartData.reduce((sum, item) => sum + item.value, 0).toLocaleString()}
					</p>
				</div>
				<div>
					<p className="text-sm text-gray-600">Average per Day</p>
					<p className="text-2xl font-bold text-gray-900">
						${Math.round(chartData.reduce((sum, item) => sum + item.value, 0) / chartData.length).toLocaleString()}
					</p>
				</div>
				<div>
					<p className="text-sm text-gray-600">Best Day</p>
					<p className="text-2xl font-bold text-gray-900">
						${Math.max(...chartData.map(d => d.value)).toLocaleString()}
					</p>
				</div>
			</div>
		</div>
	);
}

function generateSampleData() {
	return [
		{ label: 'Mon', value: 120 },
		{ label: 'Tue', value: 190 },
		{ label: 'Wed', value: 150 },
		{ label: 'Thu', value: 170 },
		{ label: 'Fri', value: 200 },
		{ label: 'Sat', value: 220 },
		{ label: 'Sun', value: 180 }
	];
}
