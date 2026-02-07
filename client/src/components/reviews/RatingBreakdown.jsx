import React from 'react';
import StarRating from './StarRating';

export default function RatingBreakdown({ reviews = [] }) {
	const calculateStats = () => {
		if (reviews.length === 0) return null;

		const totalRating = reviews.reduce((sum, r) => sum + (r.rating || 0), 0);
		const averageRating = (totalRating / reviews.length).toFixed(1);

		const ratingCounts = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
		reviews.forEach(review => {
			const rating = Math.round(review.rating);
			if (ratingCounts.hasOwnProperty(rating)) {
				ratingCounts[rating]++;
			}
		});

		const aspectAverages = {};
		['cleanliness', 'communication', 'accuracy', 'location', 'checkInProcess', 'value'].forEach(aspect => {
			const aspectRatings = reviews
				.map(r => r.aspects?.[aspect] || 0)
				.filter(r => r > 0);
			if (aspectRatings.length > 0) {
				aspectAverages[aspect] = (
					aspectRatings.reduce((a, b) => a + b, 0) / aspectRatings.length
				).toFixed(1);
			}
		});

		return { averageRating, ratingCounts, aspectAverages };
	};

	const stats = calculateStats();

	if (!stats) {
		return (
			<div className="text-center py-8 text-gray-600">
				<p>No reviews yet</p>
			</div>
		);
	}

	const aspectLabels = {
		cleanliness: '🧹 Cleanliness',
		communication: '💬 Communication',
		accuracy: '✓ Accuracy',
		location: '📍 Location',
		checkInProcess: '🔑 Check-in',
		value: '💰 Value'
	};

	return (
		<div className="space-y-6">
			
			<div className="text-center py-6 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg">
				<div className="text-5xl font-bold text-gray-900 mb-2">{stats.averageRating}</div>
				<div className="mb-3">
					<StarRating rating={Math.round(stats.averageRating)} interactive={false} size="lg" />
				</div>
				<p className="text-sm text-gray-600">Based on {reviews.length} review{reviews.length !== 1 ? 's' : ''}</p>
			</div>

			
			<div className="space-y-2">
				<h3 className="font-semibold text-gray-900 mb-3">Rating Distribution</h3>
				{[5, 4, 3, 2, 1].map(rating => {
					const count = stats.ratingCounts[rating];
					const percentage = (count / reviews.length) * 100;
					return (
						<div key={rating} className="flex items-center gap-3">
							<div className="flex items-center gap-1 w-12">
								<span className="text-sm font-medium">{rating}⭐</span>
							</div>
							<div className="flex-1 bg-gray-200 rounded-full h-2">
								<div
									className="bg-yellow-400 h-2 rounded-full transition-all"
									style={{ width: `${percentage}%` }}
								></div>
							</div>
							<span className="text-xs text-gray-600 w-8 text-right">{count}</span>
						</div>
					);
				})}
			</div>

		
			{Object.keys(stats.aspectAverages).length > 0 && (
				<div className="space-y-2">
					<h3 className="font-semibold text-gray-900 mb-3">Aspect Ratings</h3>
					{Object.entries(stats.aspectAverages).map(([aspect, rating]) => (
						<div key={aspect} className="flex items-center justify-between p-2 border rounded-lg">
							<span className="text-sm text-gray-700">{aspectLabels[aspect]}</span>
							<div className="flex items-center gap-2">
								<StarRating rating={Math.round(rating)} interactive={false} size="sm" />
								<span className="text-xs text-gray-600 w-6 text-right">{rating}</span>
							</div>
						</div>
					))}
				</div>
			)}
		</div>
	);
}
