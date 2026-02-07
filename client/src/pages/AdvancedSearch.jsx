import React, { useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import {
	LocationAutocomplete,
	DateRangePicker,
	SmartFilters,
	RecentSearches
} from '../components/advancedSearch';

export default function AdvancedSearch() {
	const [searchData, setSearchData] = useState({
		location: '',
		startDate: '',
		endDate: '',
		guests: '',
		filters: {}
	});

	const [searchResults, setSearchResults] = useState([]);
	const [hasSearched, setHasSearched] = useState(false);
	const recentSearchesRef = useRef();

	const handleLocationChange = (location) => {
		setSearchData(prev => ({ ...prev, location }));
	};

	const handleDatesChange = (startDate, endDate) => {
		setSearchData(prev => ({ ...prev, startDate, endDate }));
	};

	const handleFiltersChange = (filterType, value) => {
		if (filterType === 'clearAll') {
			setSearchData(prev => ({ ...prev, filters: {} }));
		} else {
			setSearchData(prev => ({
				...prev,
				filters: {
					...prev.filters,
					[filterType]: value
				}
			}));
		}
	};

	const handleGuestsChange = (e) => {
		setSearchData(prev => ({ ...prev, guests: e.target.value }));
	};

	const handleSearch = () => {
		if (!searchData.location && !searchData.startDate) {
			alert('Please enter at least a location or date');
			return;
		}

		// Save to recent searches
		if (recentSearchesRef.current) {
			const recentSearches = JSON.parse(localStorage.getItem('rg_recent_searches') || '[]');
			const newSearch = {
				id: Date.now(),
				location: searchData.location,
				startDate: searchData.startDate,
				endDate: searchData.endDate,
				guests: searchData.guests,
				filters: searchData.filters,
				timestamp: new Date().toISOString()
			};

			let updated = [newSearch, ...recentSearches];
			updated = updated.filter((search, idx) => {
				const duplicate = updated.findIndex(
					s => s.location === search.location &&
						s.startDate === search.startDate &&
						s.endDate === search.endDate
				);
				return duplicate === idx;
			});
			updated = updated.slice(0, 10);
			localStorage.setItem('rg_recent_searches', JSON.stringify(updated));
		}

		// Mock search results
		const mockResults = [
			{
				id: 1,
				title: 'Beautiful Modern Downtown Apartment',
				location: searchData.location || 'Downtown',
				price: 120,
				rating: 4.8,
				reviews: 245,
				image: '🏢',
				bedrooms: 2,
				bathrooms: 1.5,
				guests: 4
			},
			{
				id: 2,
				title: 'Cozy Beach House with Ocean View',
				location: searchData.location || 'Beach',
				price: 180,
				rating: 4.9,
				reviews: 189,
				image: '🏠',
				bedrooms: 3,
				bathrooms: 2,
				guests: 6
			},
			{
				id: 3,
				title: 'Luxury Villa in the Hills',
				location: searchData.location || 'Hills',
				price: 250,
				rating: 5.0,
				reviews: 87,
				image: '🏛️',
				bedrooms: 4,
				bathrooms: 3,
				guests: 8
			},
			{
				id: 4,
				title: 'Mountain Cabin Retreat',
				location: searchData.location || 'Mountain',
				price: 95,
				rating: 4.7,
				reviews: 112,
				image: '🏔️',
				bedrooms: 2,
				bathrooms: 1,
				guests: 4
			},
			{
				id: 5,
				title: 'Urban Loft with Rooftop Access',
				location: searchData.location || 'Downtown',
				price: 140,
				rating: 4.6,
				reviews: 158,
				image: '🏢',
				bedrooms: 1,
				bathrooms: 1,
				guests: 2
			},
			{
				id: 6,
				title: 'Waterfront Condo with Pool',
				location: searchData.location || 'Waterfront',
				price: 200,
				rating: 4.8,
				reviews: 203,
				image: '🏘️',
				bedrooms: 3,
				bathrooms: 2,
				guests: 6
			}
		];

		setSearchResults(mockResults);
		setHasSearched(true);
	};

	const handleSelectRecentSearch = (recentSearch) => {
		setSearchData({
			location: recentSearch.location,
			startDate: recentSearch.startDate,
			endDate: recentSearch.endDate,
			guests: recentSearch.guests,
			filters: recentSearch.filters
		});
	};

	return (
		<div className="min-h-screen bg-gray-50">
			{/* Header */}
			<div className="bg-white border-b border-gray-200 sticky top-0 z-10">
				<div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
					<Link to="/" className="text-blue-600 text-sm hover:underline">
						← Back Home
					</Link>
					<h1 className="text-2xl font-bold">🔍 Advanced Search</h1>
					<div className="w-20"></div>
				</div>
			</div>

			<div className="max-w-7xl mx-auto px-4 py-8">
				<div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
					{/* Sidebar - Search Filters */}
					<div className="lg:col-span-1 space-y-6">
						{/* Search Box */}
						<div className="bg-white rounded-lg border border-gray-200 p-4">
							<h2 className="font-bold text-lg mb-4">🔎 Search</h2>

							<div className="space-y-4">
								<LocationAutocomplete
									value={searchData.location}
									onChange={handleLocationChange}
									placeholder="Which city?"
								/>

								<DateRangePicker
									startDate={searchData.startDate}
									endDate={searchData.endDate}
									onDatesChange={handleDatesChange}
								/>

								<div>
									<label className="block text-sm font-medium text-gray-700 mb-2">
										👥 Guests
									</label>
									<select
										value={searchData.guests}
										onChange={handleGuestsChange}
										className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
									>
										<option value="">Any number of guests</option>
										<option value="1">1 Guest</option>
										<option value="2">2 Guests</option>
										<option value="3-4">3-4 Guests</option>
										<option value="5-6">5-6 Guests</option>
										<option value="7+">7+ Guests</option>
									</select>
								</div>

								<button
									onClick={handleSearch}
									className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 font-semibold transition-colors"
								>
									Search
								</button>
							</div>
						</div>

						{/* Smart Filters */}
						<SmartFilters
							filters={searchData.filters}
							onChange={handleFiltersChange}
						/>

						{/* Recent Searches */}
						<RecentSearches
							ref={recentSearchesRef}
							onSelectSearch={handleSelectRecentSearch}
						/>
					</div>

					{/* Main Content - Results */}
					<div className="lg:col-span-3">
						{!hasSearched ? (
							<div className="bg-white rounded-lg border border-gray-200 p-16 text-center">
								<p className="text-4xl mb-4">🔍</p>
								<h2 className="text-2xl font-bold text-gray-900 mb-2">Start Your Search</h2>
								<p className="text-gray-600">
									Use the search filters on the left to find your perfect accommodation
								</p>
							</div>
						) : (
							<div>
								<div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
									<p className="text-sm">
										<strong>Found {searchResults.length} properties</strong>
										{searchData.location && ` in ${searchData.location}`}
										{searchData.startDate && ` from ${new Date(searchData.startDate).toLocaleDateString()}`}
									</p>
								</div>

								<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
									{searchResults.map(property => (
										<Link
											key={property.id}
											to={`/listing/${property.id}`}
											className="bg-white rounded-lg border border-gray-200 overflow-hidden hover:shadow-lg transition-shadow"
										>
											<div className="flex items-center justify-center h-48 bg-gray-100 text-6xl">
												{property.image}
											</div>

											<div className="p-4">
												<h3 className="font-bold text-gray-900 mb-2 line-clamp-2">
													{property.title}
												</h3>

												<p className="text-sm text-gray-600 mb-3">
													📍 {property.location}
												</p>

												<div className="grid grid-cols-3 gap-2 mb-3 text-sm text-gray-700">
													<div>
														<div className="font-semibold">{property.bedrooms}</div>
														<div className="text-xs text-gray-500">Beds</div>
													</div>
													<div>
														<div className="font-semibold">{property.bathrooms}</div>
														<div className="text-xs text-gray-500">Baths</div>
													</div>
													<div>
														<div className="font-semibold">{property.guests}</div>
														<div className="text-xs text-gray-500">Guests</div>
													</div>
												</div>

												<div className="flex items-center justify-between">
													<div>
														<div className="font-bold text-lg text-gray-900">
															${property.price}
															<span className="text-sm text-gray-600 font-normal">/night</span>
														</div>
													</div>
													<div className="text-right">
														<div className="flex items-center gap-1">
															<span className="text-yellow-400">⭐</span>
															<span className="font-semibold text-gray-900">{property.rating}</span>
														</div>
														<div className="text-xs text-gray-500">({property.reviews})</div>
													</div>
												</div>
											</div>
										</Link>
									))}
								</div>
							</div>
						)}
					</div>
				</div>
			</div>
		</div>
	);
}
