import React, { useState } from 'react';

export default function SmartFilters({ filters, onChange }) {
	const [expandedFilter, setExpandedFilter] = useState(null);

	const filterOptions = {
		propertyType: {
			label: 'Property Type',
			icon: '🏠',
			options: [
				{ id: 'apartment', label: 'Apartment', count: 245 },
				{ id: 'house', label: 'House', count: 189 },
				{ id: 'villa', label: 'Villa', count: 67 },
				{ id: 'cabin', label: 'Cabin', count: 34 },
				{ id: 'condo', label: 'Condo', count: 56 }
			]
		},
		priceRange: {
			label: 'Price per Night',
			icon: '💰',
			type: 'range',
			min: 0,
			max: 500,
			step: 10
		},
		guests: {
			label: 'Number of Guests',
			icon: '👥',
			options: [
				{ id: '1', label: '1 Guest', count: 128 },
				{ id: '2', label: '2 Guests', count: 312 },
				{ id: '3-4', label: '3-4 Guests', count: 245 },
				{ id: '5-6', label: '5-6 Guests', count: 156 },
				{ id: '7+', label: '7+ Guests', count: 89 }
			]
		},
		bedrooms: {
			label: 'Bedrooms',
			icon: '🛏️',
			options: [
				{ id: '1', label: 'Studio / 1', count: 156 },
				{ id: '2', label: '2 Bedrooms', count: 267 },
				{ id: '3', label: '3 Bedrooms', count: 198 },
				{ id: '4+', label: '4+ Bedrooms', count: 109 }
			]
		},
		amenities: {
			label: 'Amenities',
			icon: '✨',
			options: [
				{ id: 'wifi', label: 'WiFi', count: 412 },
				{ id: 'pool', label: 'Swimming Pool', count: 187 },
				{ id: 'parking', label: 'Free Parking', count: 289 },
				{ id: 'kitchen', label: 'Full Kitchen', count: 401 },
				{ id: 'ac', label: 'Air Conditioning', count: 367 }
			]
		},
		rating: {
			label: 'Rating',
			icon: '⭐',
			options: [
				{ id: '4.8+', label: '4.8+ (Excellent)', count: 234 },
				{ id: '4.5+', label: '4.5+ (Good)', count: 501 },
				{ id: '4.0+', label: '4.0+ (Very Good)', count: 678 },
				{ id: '3.0+', label: '3.0+ (Fair)', count: 812 }
			]
		}
	};

	const handleCheckboxChange = (filterType, optionId) => {
		const currentFilter = filters[filterType] || [];
		const newFilter = currentFilter.includes(optionId)
			? currentFilter.filter(id => id !== optionId)
			: [...currentFilter, optionId];

		onChange(filterType, newFilter);
	};

	const handleRangeChange = (filterType, value) => {
		onChange(filterType, value);
	};

	const clearAllFilters = () => {
		onChange('clearAll', null);
	};

	const activeFilterCount = Object.values(filters).filter(f => f && f.length > 0).length;

	return (
		<div className="bg-white rounded-lg border border-gray-200">
			<div className="p-4 border-b border-gray-200 flex items-center justify-between">
				<h3 className="font-bold text-lg flex items-center gap-2">
					🎯 Smart Filters
				</h3>
				{activeFilterCount > 0 && (
					<button
						onClick={clearAllFilters}
						className="text-sm text-blue-600 hover:underline"
					>
						Clear all ({activeFilterCount})
					</button>
				)}
			</div>

			<div className="space-y-0">
				{Object.entries(filterOptions).map(([filterType, filterData]) => (
					<div key={filterType} className="border-b border-gray-100 last:border-b-0">
						<button
							onClick={() => setExpandedFilter(expandedFilter === filterType ? null : filterType)}
							className="w-full px-4 py-3 hover:bg-gray-50 flex items-center justify-between transition-colors"
						>
							<div className="flex items-center gap-2 font-medium text-gray-700">
								<span>{filterData.icon}</span>
								<span>{filterData.label}</span>
							</div>
							<span className="text-gray-400">
								{expandedFilter === filterType ? '▼' : '▶'}
							</span>
						</button>

						{expandedFilter === filterType && (
							<div className="px-4 py-3 bg-gray-50 space-y-2">
								{filterData.type === 'range' ? (
									<div className="space-y-2">
										<div className="flex items-center gap-3">
											<input
												type="range"
												min={filterData.min}
												max={filterData.max}
												step={filterData.step}
												value={filters[filterType]?.[1] || filterData.max}
												onChange={(e) =>
													handleRangeChange(filterType, [
														filters[filterType]?.[0] || filterData.min,
														parseInt(e.target.value)
													])
												}
												className="flex-1"
											/>
											<span className="font-semibold text-gray-700 min-w-16">
												${filters[filterType]?.[1] || filterData.max}
											</span>
										</div>
										<div className="text-xs text-gray-600">
											${filters[filterType]?.[0] || filterData.min} - ${filters[filterType]?.[1] || filterData.max} per night
										</div>
									</div>
								) : (
									filterData.options.map(option => (
										<label key={option.id} className="flex items-center gap-3 cursor-pointer hover:bg-white p-2 rounded transition-colors">
											<input
												type="checkbox"
												checked={(filters[filterType] || []).includes(option.id)}
												onChange={() => handleCheckboxChange(filterType, option.id)}
												className="w-4 h-4 accent-blue-600"
											/>
											<div className="flex-1 text-sm">
												<div className="text-gray-700">{option.label}</div>
											</div>
											<span className="text-xs text-gray-500">({option.count})</span>
										</label>
									))
								)}
							</div>
						)}
					</div>
				))}
			</div>
		</div>
	);
}
