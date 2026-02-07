import React from 'react';

export default function Step3Details({ data, onChange }) {
	const increment = (field) => {
		onChange({ ...data, [field]: (data[field] || 0) + 1 });
	};

	const decrement = (field) => {
		const newValue = Math.max(0, (data[field] || 0) - 1);
		onChange({ ...data, [field]: newValue });
	};

	return (
		<div className="space-y-6">
			<div>
				<h2 className="text-2xl font-bold mb-2">Tell us about your property</h2>
				<p className="text-gray-600">Guests want to know the basic amenities</p>
			</div>

			<div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
				<div className="border rounded-lg p-6">
					<h3 className="text-2xl mb-4">🛏️ Bedrooms</h3>
					<div className="flex items-center gap-4">
						<button
							onClick={() => decrement('bedrooms')}
							className="w-10 h-10 rounded-lg border-2 border-gray-300 flex items-center justify-center hover:bg-gray-100"
						>
							−
						</button>
						<span className="text-4xl font-bold w-12 text-center">{data.bedrooms || 0}</span>
						<button
							onClick={() => increment('bedrooms')}
							className="w-10 h-10 rounded-lg border-2 border-blue-600 flex items-center justify-center hover:bg-blue-50 text-blue-600"
						>
							+
						</button>
					</div>
				</div>

				<div className="border rounded-lg p-6">
					<h3 className="text-2xl mb-4">🚿 Bathrooms</h3>
					<div className="flex items-center gap-4">
						<button
							onClick={() => decrement('bathrooms')}
							className="w-10 h-10 rounded-lg border-2 border-gray-300 flex items-center justify-center hover:bg-gray-100"
						>
							−
						</button>
						<span className="text-4xl font-bold w-12 text-center">{data.bathrooms || 0}</span>
						<button
							onClick={() => increment('bathrooms')}
							className="w-10 h-10 rounded-lg border-2 border-blue-600 flex items-center justify-center hover:bg-blue-50 text-blue-600"
						>
							+
						</button>
					</div>
				</div>

				<div className="border rounded-lg p-6">
					<h3 className="text-2xl mb-4">👥 Max Guests</h3>
					<div className="flex items-center gap-4">
						<button
							onClick={() => decrement('guests')}
							className="w-10 h-10 rounded-lg border-2 border-gray-300 flex items-center justify-center hover:bg-gray-100"
						>
							−
						</button>
						<span className="text-4xl font-bold w-12 text-center">{data.guests || 0}</span>
						<button
							onClick={() => increment('guests')}
							className="w-10 h-10 rounded-lg border-2 border-blue-600 flex items-center justify-center hover:bg-blue-50 text-blue-600"
						>
							+
						</button>
					</div>
				</div>
			</div>

			<div className="space-y-4">
				<div>
					<label className="block text-sm font-medium text-gray-700 mb-2">
						Square Feet (optional)
					</label>
					<input
						type="number"
						value={data.squareFeet || ''}
						onChange={(e) => onChange({ ...data, squareFeet: e.target.value })}
						placeholder="e.g., 1500"
						className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
					/>
				</div>

				<div>
					<label className="block text-sm font-medium text-gray-700 mb-2">
						Building Type
					</label>
					<select
						value={data.buildingType || ''}
						onChange={(e) => onChange({ ...data, buildingType: e.target.value })}
						className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
					>
						<option value="">Select building type</option>
						<option value="standalone">Standalone building</option>
						<option value="apartment">Apartment complex</option>
						<option value="townhouse">Townhouse complex</option>
						<option value="other">Other</option>
					</select>
				</div>
			</div>
		</div>
	);
}
