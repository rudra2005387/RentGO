import React from 'react';

export default function Step4Amenities({ data, onChange }) {
	const amenitiesList = [
		{ id: 'wifi', label: 'WiFi', icon: '📶' },
		{ id: 'parking', label: 'Free Parking', icon: '🅿️' },
		{ id: 'kitchen', label: 'Full Kitchen', icon: '🍳' },
		{ id: 'pool', label: 'Swimming Pool', icon: '🏊' },
		{ id: 'ac', label: 'Air Conditioning', icon: '❄️' },
		{ id: 'heating', label: 'Heating', icon: '🔥' },
		{ id: 'washer', label: 'Washer/Dryer', icon: '🧺' },
		{ id: 'dishwasher', label: 'Dishwasher', icon: '🍽️' },
		{ id: 'tv', label: 'TV', icon: '📺' },
		{ id: 'gym', label: 'Gym', icon: '💪' },
		{ id: 'elevator', label: 'Elevator', icon: '🛗' },
		{ id: 'crib', label: 'Crib', icon: '👶' },
		{ id: 'hot_tub', label: 'Hot Tub', icon: '🛁' },
		{ id: 'BBQ', label: 'BBQ Grill', icon: '🔥' },
		{ id: 'garden', label: 'Garden', icon: '🌳' },
		{ id: 'workspace', label: 'Workspace', icon: '💼' }
	];

	const toggleAmenity = (amenityId) => {
		const selected = data.amenities || [];
		const newAmenities = selected.includes(amenityId)
			? selected.filter(id => id !== amenityId)
			: [...selected, amenityId];
		onChange({ ...data, amenities: newAmenities });
	};

	return (
		<div className="space-y-6">
			<div>
				<h2 className="text-2xl font-bold mb-2">Select amenities at your property</h2>
				<p className="text-gray-600">Guests love knowing what's available</p>
			</div>

			<div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
				{amenitiesList.map(amenity => (
					<button
						key={amenity.id}
						onClick={() => toggleAmenity(amenity.id)}
						className={`
							p-4 rounded-lg border-2 transition-all text-center
							${(data.amenities || []).includes(amenity.id)
								? 'border-blue-600 bg-blue-50'
								: 'border-gray-200 hover:border-gray-300'}
						`}
					>
						<div className="text-2xl mb-1">{amenity.icon}</div>
						<div className="text-xs font-medium">{amenity.label}</div>
					</button>
				))}
			</div>

			<div>
				<label className="block text-sm font-medium text-gray-700 mb-2">
					Additional Amenities (optional)
				</label>
				<textarea
					value={data.additionalAmenities || ''}
					onChange={(e) => onChange({ ...data, additionalAmenities: e.target.value })}
					placeholder="List any other amenities..."
					rows="3"
					className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
				/>
			</div>
		</div>
	);
}
