import React, { useState, useEffect } from 'react';

export default function RecentSearches({ onSelectSearch }) {
	const [recentSearches, setRecentSearches] = useState([]);
	const STORAGE_KEY = 'rg_recent_searches';
	const MAX_SEARCHES = 10;

	useEffect(() => {
		const loaded = localStorage.getItem(STORAGE_KEY);
		if (loaded) {
			try {
				setRecentSearches(JSON.parse(loaded));
			} catch (error) {
				console.error('Failed to load recent searches:', error);
			}
		}
	}, []);

	const saveSearch = (searchData) => {
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

		updated = updated.slice(0, MAX_SEARCHES);
		setRecentSearches(updated);

		try {
			localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
		} catch (error) {
			console.error('Failed to save searches:', error);
		}
	};

	const removeSearch = (id) => {
		const updated = recentSearches.filter(s => s.id !== id);
		setRecentSearches(updated);
		localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
	};

	const clearAllSearches = () => {
		setRecentSearches([]);
		localStorage.removeItem(STORAGE_KEY);
	};

	const formatDate = (dateStr) => {
		if (!dateStr) return '';
		const date = new Date(dateStr);
		return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
	};

	const getTimeAgo = (timestamp) => {
		const now = new Date();
		const searchDate = new Date(timestamp);
		const diffMs = now - searchDate;
		const diffMins = Math.floor(diffMs / 60000);
		const diffHours = Math.floor(diffMs / 3600000);
		const diffDays = Math.floor(diffMs / 86400000);

		if (diffMins < 1) return 'Just now';
		if (diffMins < 60) return `${diffMins}m ago`;
		if (diffHours < 24) return `${diffHours}h ago`;
		if (diffDays < 7) return `${diffDays}d ago`;
		return searchDate.toLocaleDateString();
	};

	if (recentSearches.length === 0) {
		return (
			<div className="p-6 text-center text-gray-500">
				<p className="text-sm">No recent searches yet. Start exploring!</p>
			</div>
		);
	}

	return (
		<div className="bg-white rounded-lg border border-gray-200">
			<div className="p-4 border-b border-gray-200 flex items-center justify-between">
				<h3 className="font-bold text-lg flex items-center gap-2">
					🕐 Recent Searches
				</h3>
				<button
					onClick={clearAllSearches}
					className="text-xs text-red-600 hover:underline"
				>
					Clear all
				</button>
			</div>

			<div className="space-y-0 max-h-96 overflow-y-auto">
				{recentSearches.map((search) => (
					<div key={search.id} className="border-b border-gray-100 last:border-b-0 hover:bg-gray-50 transition-colors">
						<button
							onClick={() => onSelectSearch(search)}
							className="w-full px-4 py-3 text-left"
						>
							<div className="flex items-start justify-between gap-3">
								<div className="flex-1">
									<div className="font-medium text-gray-900">
										📍 {search.location || 'Anywhere'}
									</div>
									<div className="text-sm text-gray-600 mt-1">
										<span className="inline-block mr-3">
											📅 {formatDate(search.startDate)} - {formatDate(search.endDate)}
										</span>
										<span className="inline-block">
											👥 {search.guests || 'Any'} guests
										</span>
									</div>
								</div>
								<div className="text-right">
									<div className="text-xs text-gray-500">
										{getTimeAgo(search.timestamp)}
									</div>
									<button
										onClick={(e) => {
											e.stopPropagation();
											removeSearch(search.id);
										}}
										className="text-red-500 text-xs mt-1 hover:underline"
									>
										Remove
									</button>
								</div>
							</div>
						</button>
					</div>
				))}
			</div>
		</div>
	);
}
