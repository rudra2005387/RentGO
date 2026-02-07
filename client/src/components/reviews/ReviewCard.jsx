import React, { useState } from 'react';
import StarRating from './StarRating';

export default function ReviewCard({ review, onHelpfulClick }) {
	const [isHelpful, setIsHelpful] = useState(false);
	const [helpfulCount, setHelpfulCount] = useState(review.helpfulCount || 0);

	const handleHelpful = () => {
		if (!isHelpful) {
			setIsHelpful(true);
			setHelpfulCount(helpfulCount + 1);
			onHelpfulClick && onHelpfulClick(review.id);
		}
	};

	const formatDate = (dateString) => {
		const date = new Date(dateString);
		return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
	};

	return (
		<div className="border rounded-lg p-4 bg-white hover:shadow-md transition-shadow">
			{/* Header */}
			<div className="flex items-start justify-between mb-3">
				<div className="flex-1">
					<div className="flex items-center gap-2 mb-1">
						<h4 className="font-semibold text-gray-900">{review.guestName || 'Guest'}</h4>
						<span className="text-xs text-gray-500">•</span>
						<span className="text-xs text-gray-500">{formatDate(review.date)}</span>
					</div>
					<div className="mb-2">
						<StarRating rating={review.rating} interactive={false} size="sm" />
					</div>
				</div>
				{review.verified && (
					<div className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">
						✓ Verified Stay
					</div>
				)}
			</div>

			{/* Title & Review Text */}
			<div className="mb-4">
				{review.title && (
					<h5 className="font-semibold text-gray-900 mb-1">{review.title}</h5>
				)}
				<p className="text-sm text-gray-700 line-clamp-3">{review.text}</p>
				{review.text?.length > 200 && (
					<button className="text-sm text-blue-600 hover:underline mt-1">Show more</button>
				)}
			</div>

			{/* Aspect Ratings (if available) */}
			{review.aspects && Object.keys(review.aspects).length > 0 && (
				<div className="mb-4 p-3 bg-gray-50 rounded space-y-2">
					{Object.entries(review.aspects).map(([aspect, rating]) => (
						rating > 0 && (
							<div key={aspect} className="flex items-center justify-between text-xs">
								<span className="text-gray-700 capitalize">{aspect.replace(/([A-Z])/g, ' $1').trim()}</span>
								<span className="font-medium">{rating}⭐</span>
							</div>
						)
					))}
				</div>
			)}

			{/* Helpful Footer */}
			<div className="flex items-center gap-4 pt-3 border-t">
				<button
					onClick={handleHelpful}
					disabled={isHelpful}
					className={`
						flex items-center gap-2 text-sm transition-colors
						${isHelpful 
							? 'text-gray-600 cursor-default' 
							: 'text-gray-600 hover:text-blue-600 cursor-pointer'}
					`}
				>
					<span>{isHelpful ? '👍' : '👍🤍'}</span>
					<span>Helpful {helpfulCount > 0 && `(${helpfulCount})`}</span>
				</button>

				{review.hostResponse && (
					<div className="ml-auto text-xs text-gray-500">
						<span>Host replied</span>
					</div>
				)}
			</div>

			{/* Host Response */}
			{review.hostResponse && (
				<div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded">
					<div className="flex items-center gap-2 mb-2">
						<span className="text-sm font-semibold text-blue-900">Host Response</span>
					</div>
					<p className="text-sm text-blue-900">{review.hostResponse}</p>
				</div>
			)}
		</div>
	);
}
