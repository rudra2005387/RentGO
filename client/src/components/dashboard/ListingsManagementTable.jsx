import React, { useState } from 'react';

export default function ListingsManagementTable({ listings = [] }) {
	const [sortBy, setSortBy] = useState('date');

	const sortedListings = [...listings].sort((a, b) => {
		if (sortBy === 'date') return new Date(b.createdAt) - new Date(a.createdAt);
		if (sortBy === 'bookings') return (b.bookingCount || 0) - (a.bookingCount || 0);
		if (sortBy === 'rating') return (b.rating || 0) - (a.rating || 0);
		return 0;
	});

	return (
		<div className="border rounded-lg p-6 bg-white">
			<div className="flex items-center justify-between mb-4">
				<h2 className="text-lg font-bold">Your Listings</h2>
				<select
					value={sortBy}
					onChange={(e) => setSortBy(e.target.value)}
					className="px-3 py-1 border rounded text-sm"
				>
					<option value="date">Newest first</option>
					<option value="bookings">Most booked</option>
					<option value="rating">Highest rated</option>
				</select>
			</div>

			{sortedListings.length > 0 ? (
				<div className="overflow-x-auto">
					<table className="w-full">
						<thead>
							<tr className="border-b text-left text-sm font-semibold text-gray-700">
								<th className="pb-3 px-2">Property</th>
								<th className="pb-3 px-2">Status</th>
								<th className="pb-3 px-2">Bookings</th>
								<th className="pb-3 px-2">Rating</th>
								<th className="pb-3 px-2">Price</th>
								<th className="pb-3 px-2">Actions</th>
							</tr>
						</thead>
						<tbody>
							{sortedListings.map((listing) => (
								<tr key={listing.id} className="border-b hover:bg-gray-50">
									<td className="py-3 px-2">
										<div className="flex gap-2 items-center">
											<div className="w-10 h-10 bg-gray-200 rounded"></div>
											<div>
												<p className="font-medium text-sm">{listing.title || 'Listing'}</p>
												<p className="text-xs text-gray-600">{listing.location || ''}</p>
											</div>
										</div>
									</td>
									<td className="py-3 px-2">
										<span className={`px-2 py-1 text-xs rounded font-medium ${
											listing.status === 'active' ? 'bg-green-100 text-green-800' :
											listing.status === 'draft' ? 'bg-gray-100 text-gray-800' :
											'bg-orange-100 text-orange-800'
										}`}>
											{listing.status || 'active'}
										</span>
									</td>
									<td className="py-3 px-2 text-sm">{listing.bookingCount || 0}</td>
									<td className="py-3 px-2 text-sm font-medium">{(listing.rating || 0).toFixed(1)}⭐</td>
									<td className="py-3 px-2 text-sm font-medium">${listing.price || 0}/night</td>
									<td className="py-3 px-2">
										<div className="flex gap-2">
											<button className="text-blue-600 text-sm hover:underline">Edit</button>
											<button className="text-gray-600 text-sm hover:underline">View</button>
										</div>
									</td>
								</tr>
							))}
						</tbody>
					</table>
				</div>
			) : (
				<div className="text-center py-8 text-gray-600">
					<p className="mb-4">No listings yet. Create your first listing to get started!</p>
				</div>
			)}
		</div>
	);
}
