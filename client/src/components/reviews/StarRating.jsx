import React from 'react';

export default function StarRating({ rating, onRatingChange, interactive = true, size = 'md' }) {
	const sizeClasses = {
		sm: 'text-lg',
		md: 'text-2xl',
		lg: 'text-4xl'
	};

	const sizeClass = sizeClasses[size] || sizeClasses.md;

	return (
		<div className="flex gap-2">
			{[1, 2, 3, 4, 5].map(star => (
				<button
					key={star}
					onClick={() => interactive && onRatingChange && onRatingChange(star)}
					disabled={!interactive}
					className={`
						${sizeClass} transition-transform
						${interactive ? 'cursor-pointer hover:scale-110' : 'cursor-default'}
					`}
				>
					{star <= rating ? '⭐' : '☆'}
				</button>
			))}
			{interactive && (
				<span className="ml-2 text-gray-600 self-center">
					{rating > 0 && `${rating}.0`}
				</span>
			)}
		</div>
	);
}
