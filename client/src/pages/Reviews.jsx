import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
	ReviewFormModal,
	RatingBreakdown,
	ReviewCard
} from '../components/reviews';

export default function Reviews() {
	const [showReviewForm, setShowReviewForm] = useState(false);
	const [reviews, setReviews] = useState([
		{
			id: 1,
			guestName: 'Sarah Johnson',
			rating: 5,
			title: 'Amazing place! Perfect for our vacation',
			text: 'We had an absolutely wonderful stay. The property is clean, well-maintained, and the host was very responsive to all our needs. The location is perfect for exploring the city, and we would definitely come back.',
			date: new Date(2024, 0, 15).toISOString(),
			verified: true,
			helpfulCount: 24,
			aspects: {
				cleanliness: 5,
				communication: 5,
				accuracy: 5,
				location: 4,
				checkInProcess: 5,
				value: 4
			}
		},
		{
			id: 2,
			guestName: 'Michael Chen',
			rating: 4,
			title: 'Great location, very comfortable',
			text: 'Overall great experience. The apartment is spacious and comfortable. Only minor issue was that the WiFi could have been faster, but it was still acceptable.',
			date: new Date(2024, 1, 20).toISOString(),
			verified: true,
			helpfulCount: 15,
			aspects: {
				cleanliness: 4,
				communication: 5,
				accuracy: 4,
				location: 5,
				checkInProcess: 4,
				value: 4
			},
			hostResponse: 'Thank you for staying with us! We appreciate the feedback and will work on improving our WiFi speed.'
		},
		{
			id: 3,
			guestName: 'Emma Williams',
			rating: 5,
			title: 'Perfect home away from home',
			text: 'Exceeded all expectations. The host provided clear instructions and was very helpful. Everything in the listing was accurate. Would recommend to anyone visiting the area.',
			date: new Date(2024, 2, 10).toISOString(),
			verified: true,
			helpfulCount: 32,
			aspects: {
				cleanliness: 5,
				communication: 5,
				accuracy: 5,
				location: 4,
				checkInProcess: 5,
				value: 5
			}
		}
	]);

	const handleReviewSubmit = (newReview) => {
		setReviews([
			{
				...newReview,
				id: reviews.length + 1,
				guestName: 'You',
				verified: true,
				helpfulCount: 0,
				hostResponse: null
			},
			...reviews
		]);
	};

	const handleHelpfulClick = (reviewId) => {
		setReviews(reviews.map(review =>
			review.id === reviewId
				? { ...review, helpfulCount: review.helpfulCount + 1 }
				: review
		));
	};

	return (
		<div className="min-h-screen bg-gray-50">
			<div className="max-w-4xl mx-auto px-4 py-8">
				{/* Header */}
				<div className="flex items-center justify-between mb-8">
					<div>
						<Link to="/" className="text-blue-600 text-sm hover:underline mb-4 inline-block">
							← Back
						</Link>
						<h1 className="text-3xl font-bold text-gray-900">Guest Reviews</h1>
					</div>
					<button
						onClick={() => setShowReviewForm(true)}
						className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-semibold"
					>
						Write a Review
					</button>
				</div>

				{/* Two Column Layout */}
				<div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
					{/* Left Column - Rating Breakdown */}
					<div className="lg:col-span-1">
						<div className="bg-white rounded-lg shadow-md p-6 sticky top-8">
							<RatingBreakdown reviews={reviews} />
						</div>
					</div>

					{/* Right Column - Review Cards */}
					<div className="lg:col-span-2 space-y-4">
						{reviews.length > 0 ? (
							reviews.map(review => (
								<ReviewCard
									key={review.id}
									review={review}
									onHelpfulClick={handleHelpfulClick}
								/>
							))
						) : (
							<div className="text-center py-12 bg-white rounded-lg">
								<p className="text-gray-600 text-lg">No reviews yet</p>
								<p className="text-gray-500 text-sm mt-2">Be the first to review this property</p>
							</div>
						)}
					</div>
				</div>

				{/* Review Form Modal */}
				{showReviewForm && (
					<ReviewFormModal
						listingId="listing-1"
						onClose={() => setShowReviewForm(false)}
						onSubmit={handleReviewSubmit}
					/>
				)}
			</div>
		</div>
	);
}
