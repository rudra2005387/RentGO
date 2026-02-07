import React, { useState } from 'react';
import StarRating from './StarRating';
import AspectRating from './AspectRating';

export default function ReviewFormModal({ listingId, onClose, onSubmit }) {
	const [formData, setFormData] = useState({
		rating: 0,
		title: '',
		text: '',
		aspects: {
			cleanliness: 0,
			communication: 0,
			accuracy: 0,
			location: 0,
			checkInProcess: 0,
			value: 0
		}
	});

	const [errors, setErrors] = useState({});

	const handleRatingChange = (rating) => {
		setFormData({ ...formData, rating });
		if (errors.rating) {
			setErrors({ ...errors, rating: null });
		}
	};

	const handleAspectChange = (aspect, rating) => {
		setFormData({
			...formData,
			aspects: { ...formData.aspects, [aspect]: rating }
		});
	};

	const handleTextChange = (field, value) => {
		setFormData({ ...formData, [field]: value });
		if (errors[field]) {
			setErrors({ ...errors, [field]: null });
		}
	};

	const validateForm = () => {
		const newErrors = {};
		if (formData.rating === 0) newErrors.rating = 'Please select a rating';
		if (!formData.title.trim()) newErrors.title = 'Title is required';
		if (!formData.text.trim()) newErrors.text = 'Review text is required';
		if (formData.text.length < 20) newErrors.text = 'Review must be at least 20 characters';
		return newErrors;
	};

	const handleSubmit = (e) => {
		e.preventDefault();
		const newErrors = validateForm();
		if (Object.keys(newErrors).length > 0) {
			setErrors(newErrors);
			return;
		}

		onSubmit({
			...formData,
			listingId,
			date: new Date().toISOString(),
			verified: true
		});

		onClose();
	};

	return (
		<div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
			<div className="bg-white rounded-lg shadow-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
				{/* Header */}
				<div className="sticky top-0 bg-white border-b p-6 flex items-center justify-between z-10">
					<h2 className="text-2xl font-bold text-gray-900">Share Your Experience</h2>
					<button
						onClick={onClose}
						className="text-gray-500 hover:text-gray-700 text-2xl font-bold"
					>
						✕
					</button>
				</div>

				{/* Form Content */}
				<form onSubmit={handleSubmit} className="p-6 space-y-6">
					{/* Overall Rating */}
					<div>
						<label className="block text-sm font-semibold text-gray-900 mb-3">
							How would you rate your stay?
						</label>
						<div className="flex items-center gap-4">
							<StarRating
								rating={formData.rating}
								onRatingChange={handleRatingChange}
								interactive={true}
								size="lg"
							/>
							<span className="text-sm text-gray-600">
								{formData.rating > 0 && `${formData.rating} out of 5 stars`}
							</span>
						</div>
						{errors.rating && (
							<p className="text-xs text-red-600 mt-2">{errors.rating}</p>
						)}
					</div>

					{/* Review Title */}
					<div>
						<label className="block text-sm font-semibold text-gray-900 mb-2">
							Title of your review
						</label>
						<input
							type="text"
							value={formData.title}
							onChange={(e) => handleTextChange('title', e.target.value)}
							placeholder="Summarize your experience in a few words"
							maxLength="100"
							className={`
								w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent
								${errors.title ? 'border-red-500' : 'border-gray-300'}
							`}
						/>
						<div className="flex justify-between items-center mt-1">
							<p className="text-xs text-gray-600">{formData.title.length}/100</p>
							{errors.title && (
								<p className="text-xs text-red-600">{errors.title}</p>
							)}
						</div>
					</div>

					{/* Review Text */}
					<div>
						<label className="block text-sm font-semibold text-gray-900 mb-2">
							Tell us about your stay
						</label>
						<textarea
							value={formData.text}
							onChange={(e) => handleTextChange('text', e.target.value)}
							placeholder="Share what you liked, what could be improved, and any other details that might help other guests..."
							rows="5"
							maxLength="1000"
							className={`
								w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none
								${errors.text ? 'border-red-500' : 'border-gray-300'}
							`}
						/>
						<div className="flex justify-between items-center mt-1">
							<p className="text-xs text-gray-600">{formData.text.length}/1000</p>
							{errors.text && (
								<p className="text-xs text-red-600">{errors.text}</p>
							)}
						</div>
					</div>

					{/* Aspect Ratings */}
					<div className="border-t pt-6">
						<AspectRating
							aspects={formData.aspects}
							onAspectChange={handleAspectChange}
						/>
					</div>

					{/* Info Box */}
					<div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
						<p className="text-sm text-blue-900">
							💡 <strong>Tip:</strong> Detailed reviews help other travelers make informed decisions and help hosts improve their properties.
						</p>
					</div>

					{/* Buttons */}
					<div className="flex gap-3 pt-4 border-t">
						<button
							type="button"
							onClick={onClose}
							className="flex-1 px-4 py-2 border border-gray-300 rounded-lg font-semibold text-gray-700 hover:bg-gray-50 transition-colors"
						>
							Cancel
						</button>
						<button
							type="submit"
							className={`
								flex-1 px-4 py-2 rounded-lg font-semibold text-white transition-colors
								${Object.keys(validateForm()).length === 0
									? 'bg-blue-600 hover:bg-blue-700 cursor-pointer'
									: 'bg-gray-400 cursor-not-allowed'}
							`}
						>
							Submit Review
						</button>
					</div>
				</form>
			</div>
		</div>
	);
}
