import React from 'react';
import StarRating from './StarRating';

export default function AspectRating({ aspects, onAspectChange }) {
	const aspectsList = [
		{ id: 'cleanliness', label: 'Cleanliness', icon: '🧹' },
		{ id: 'communication', label: 'Host Communication', icon: '💬' },
		{ id: 'accuracy', label: 'Accuracy of Listing', icon: '✓' },
		{ id: 'location', label: 'Location', icon: '📍' },
		{ id: 'checkInProcess', label: 'Check-in Process', icon: '🔑' },
		{ id: 'value', label: 'Value for Money', icon: '💰' }
	];

	return (
		<div className="space-y-4">
			<h3 className="font-semibold text-gray-900">Rate these aspects</h3>
			<div className="space-y-3">
				{aspectsList.map(aspect => (
					<div key={aspect.id} className="flex items-center justify-between p-3 border rounded-lg bg-gray-50">
						<div className="flex items-center gap-2">
							<span className="text-xl">{aspect.icon}</span>
							<label className="text-sm font-medium text-gray-700">
								{aspect.label}
							</label>
						</div>
						<StarRating
							rating={aspects[aspect.id] || 0}
							onRatingChange={(rating) => onAspectChange(aspect.id, rating)}
							interactive={true}
							size="sm"
						/>
					</div>
				))}
			</div>
		</div>
	);
}
