import React from 'react';

export default function Step1PropertyType({ data, onChange }) {
	const propertyTypes = [
		{ id: 'apartment', label: 'Apartment', icon: '🏢' },
		{ id: 'house', label: 'House', icon: '🏠' },
		{ id: 'villa', label: 'Villa', icon: '🏛️' },
		{ id: 'cabin', label: 'Cabin', icon: '🏔️' },
		{ id: 'condo', label: 'Condo', icon: '🏘️' },
		{ id: 'cottage', label: 'Cottage', icon: '🏘️' },
		{ id: 'townhouse', label: 'Townhouse', icon: '🏛️' },
		{ id: 'loft', label: 'Loft', icon: '🏢' }
	];

	return (
		<div className="space-y-6">
			<div>
				<h2 className="text-2xl font-bold mb-2">What type of property is it?</h2>
				<p className="text-gray-600">This will help guests find your property faster</p>
			</div>

			<div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
				{propertyTypes.map(type => (
					<button
						key={type.id}
						onClick={() => onChange({ ...data, propertyType: type.id })}
						className={`
							p-4 rounded-lg border-2 transition-all
							${data.propertyType === type.id 
								? 'border-blue-600 bg-blue-50' 
								: 'border-gray-200 hover:border-gray-300'}
						`}
					>
						<div className="text-3xl mb-2">{type.icon}</div>
						<div className="text-sm font-medium">{type.label}</div>
					</button>
				))}
			</div>

			<div className="space-y-4">
				<div>
					<label className="block text-sm font-medium text-gray-700 mb-2">
						Property Title
					</label>
					<input
						type="text"
						value={data.title || ''}
						onChange={(e) => onChange({ ...data, title: e.target.value })}
						placeholder="e.g., Cozy Downtown Apartment"
						className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
					/>
				</div>

				<div>
					<label className="block text-sm font-medium text-gray-700 mb-2">
						Address / Location
					</label>
					<input
						type="text"
						value={data.location || ''}
						onChange={(e) => onChange({ ...data, location: e.target.value })}
						placeholder="e.g., 123 Main St, New York, NY"
						className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
					/>
				</div>

				<div>
					<label className="block text-sm font-medium text-gray-700 mb-2">
						Description
					</label>
					<textarea
						value={data.description || ''}
						onChange={(e) => onChange({ ...data, description: e.target.value })}
						placeholder="Tell guests about your property..."
						rows="4"
						className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
					/>
				</div>
			</div>
		</div>
	);
}
