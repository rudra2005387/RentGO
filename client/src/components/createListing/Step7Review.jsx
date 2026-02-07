import React from 'react';

export default function Step7Review({ data, onSubmit }) {
	const [rules, setRules] = React.useState(data.rules || '');
	const [agreeTerms, setAgreeTerms] = React.useState(false);

	const handleSubmit = () => {
		if (!agreeTerms) {
			alert('Please agree to the terms before submitting');
			return;
		}
		onSubmit({ ...data, rules });
	};

	return (
		<div className="space-y-6">
			<div>
				<h2 className="text-2xl font-bold mb-2">Review your listing</h2>
				<p className="text-gray-600">Make sure everything looks good before publishing</p>
			</div>

			<div className="border rounded-lg p-6 space-y-4">
				<div className="grid grid-cols-2 gap-4">
					<div>
						<p className="text-sm text-gray-600">Property Type</p>
						<p className="font-semibold capitalize">{data.propertyType}</p>
					</div>
					<div>
						<p className="text-sm text-gray-600">Max Guests</p>
						<p className="font-semibold">{data.guests}</p>
					</div>
					<div>
						<p className="text-sm text-gray-600">Bedrooms</p>
						<p className="font-semibold">{data.bedrooms}</p>
					</div>
					<div>
						<p className="text-sm text-gray-600">Bathrooms</p>
						<p className="font-semibold">{data.bathrooms}</p>
					</div>
					<div>
						<p className="text-sm text-gray-600">Nightly Price</p>
						<p className="font-semibold">${data.pricePerNight}</p>
					</div>
					<div>
						<p className="text-sm text-gray-600">Cleaning Fee</p>
						<p className="font-semibold">${data.cleaningFee || 0}</p>
					</div>
				</div>
			</div>

			<div className="border rounded-lg p-6">
				<h3 className="font-bold mb-3">📍 Location</h3>
				<p className="font-semibold">{data.title}</p>
				<p className="text-gray-600">{data.location}</p>
			</div>

			<div className="border rounded-lg p-6">
				<h3 className="font-bold mb-3">📝 Description</h3>
				<p className="text-gray-700">{data.description}</p>
			</div>

			{data.photos && data.photos.length > 0 && (
				<div className="border rounded-lg p-6">
					<h3 className="font-bold mb-3">📸 Photos ({data.photos.length})</h3>
					<div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
						{data.photos.slice(0, 4).map((photo, idx) => (
							<img
								key={idx}
								src={photo}
								alt={`Preview ${idx + 1}`}
								className="w-full h-24 object-cover rounded"
							/>
						))}
						{data.photos.length > 4 && (
							<div className="w-full h-24 bg-gray-200 rounded flex items-center justify-center">
								<span className="text-gray-600 font-semibold">+{data.photos.length - 4} more</span>
							</div>
						)}
					</div>
				</div>
			)}

			{data.amenities && data.amenities.length > 0 && (
				<div className="border rounded-lg p-6">
					<h3 className="font-bold mb-3">✨ Amenities</h3>
					<div className="flex flex-wrap gap-2">
						{data.amenities.map(amenity => (
							<span key={amenity} className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium capitalize">
								{amenity.replace('_', ' ')}
							</span>
						))}
					</div>
				</div>
			)}

			<div className="border rounded-lg p-6">
				<h3 className="font-bold mb-3">📋 House Rules</h3>
				<textarea
					value={rules}
					onChange={(e) => setRules(e.target.value)}
					placeholder="e.g., No smoking, No pets, No loud music after 10pm, etc."
					rows="4"
					className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
				/>
			</div>

			<div className="border rounded-lg p-6">
				<h3 className="font-bold mb-3">⏰ Check-in/Check-out</h3>
				<div className="grid grid-cols-2 gap-4">
					<div>
						<p className="text-sm text-gray-600">Check-in</p>
						<p className="font-semibold">{data.checkInTime || '14:00'}</p>
					</div>
					<div>
						<p className="text-sm text-gray-600">Check-out</p>
						<p className="font-semibold">{data.checkOutTime || '11:00'}</p>
					</div>
					<div className="col-span-2">
						<p className="text-sm text-gray-600">Minimum Stay</p>
						<p className="font-semibold">{data.minStayNights || 1} night(s)</p>
					</div>
				</div>
			</div>

			<div className="space-y-3">
				<div className="flex items-start gap-3">
					<input
						type="checkbox"
						id="terms"
						checked={agreeTerms}
						onChange={(e) => setAgreeTerms(e.target.checked)}
						className="mt-1"
					/>
					<label htmlFor="terms" className="text-sm text-gray-700">
						I confirm that my listing information is accurate and complete. I agree to RentGo's terms of service and accommodation standards.
					</label>
				</div>
			</div>

			<div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
				<p className="text-sm text-blue-900">
					✅ <strong>Ready to publish!</strong> Your listing will be visible to guests once published. You can edit it anytime.
				</p>
			</div>

			<button
				onClick={handleSubmit}
				disabled={!agreeTerms}
				className={`
					w-full py-3 rounded-lg font-semibold text-white transition-colors
					${agreeTerms 
						? 'bg-green-600 hover:bg-green-700 cursor-pointer' 
						: 'bg-gray-400 cursor-not-allowed'}
				`}
			>
				✓ Publish Listing
			</button>
		</div>
	);
}
