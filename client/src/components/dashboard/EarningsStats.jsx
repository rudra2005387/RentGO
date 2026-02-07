import React from 'react';

export default function EarningsStats({ stats = {} }) {
	const {
		totalEarnings = 0,
		monthlyEarnings = 0,
		pendingPayment = 0,
		occupancyRate = 75,
		totalBookings = 0
	} = stats;

	const statCards = [
		{
			label: 'Total Earnings',
			value: `$${totalEarnings.toLocaleString()}`,
			icon: '💰',
			color: 'bg-green-50 border-green-200'
		},
		{
			label: 'This Month',
			value: `$${monthlyEarnings.toLocaleString()}`,
			icon: '📈',
			color: 'bg-blue-50 border-blue-200'
		},
		{
			label: 'Pending Payment',
			value: `$${pendingPayment.toLocaleString()}`,
			icon: '⏳',
			color: 'bg-yellow-50 border-yellow-200'
		},
		{
			label: 'Occupancy Rate',
			value: `${occupancyRate}%`,
			icon: '📊',
			color: 'bg-purple-50 border-purple-200'
		},
		{
			label: 'Total Bookings',
			value: totalBookings,
			icon: '🏠',
			color: 'bg-orange-50 border-orange-200'
		}
	];

	return (
		<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
			{statCards.map((card, idx) => (
				<div key={idx} className={`border ${card.color} rounded-lg p-4`}>
					<div className="flex items-start justify-between">
						<div>
							<p className="text-sm text-gray-600 mb-1">{card.label}</p>
							<p className="text-2xl font-bold text-gray-900">{card.value}</p>
						</div>
						<span className="text-2xl">{card.icon}</span>
					</div>
				</div>
			))}
		</div>
	);
}
