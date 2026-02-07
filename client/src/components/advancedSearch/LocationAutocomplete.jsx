import React, { useState, useRef, useEffect } from 'react';

export default function LocationAutocomplete({ value, onChange, placeholder = "Enter location" }) {
	const [suggestions, setSuggestions] = useState([]);
	const [showSuggestions, setShowSuggestions] = useState(false);
	const inputRef = useRef(null);

	// Mock Google Places API - can be replaced with real API
	const mockPlaces = [
		'New York, NY',
		'Los Angeles, CA',
		'Chicago, IL',
		'Houston, TX',
		'Phoenix, AZ',
		'Philadelphia, PA',
		'San Antonio, TX',
		'San Diego, CA',
		'Dallas, TX',
		'San Jose, CA',
		'Miami, FL',
		'Austin, TX',
		'Denver, CO',
		'Boston, MA',
		'Seattle, WA',
		'Las Vegas, NV'
	];

	const handleInputChange = (e) => {
		const inputValue = e.target.value;
		onChange(inputValue);

		if (inputValue.length > 0) {
			const filtered = mockPlaces.filter(place =>
				place.toLowerCase().includes(inputValue.toLowerCase())
			);
			setSuggestions(filtered);
			setShowSuggestions(true);
		} else {
			setSuggestions([]);
			setShowSuggestions(false);
		}
	};

	const handleSelectSuggestion = (place) => {
		onChange(place);
		setShowSuggestions(false);
	};

	useEffect(() => {
		const handleClickOutside = (e) => {
			if (inputRef.current && !inputRef.current.contains(e.target)) {
				setShowSuggestions(false);
			}
		};

		document.addEventListener('mousedown', handleClickOutside);
		return () => document.removeEventListener('mousedown', handleClickOutside);
	}, []);

	return (
		<div className="relative w-full" ref={inputRef}>
			<label className="block text-sm font-medium text-gray-700 mb-2">
				📍 Location
			</label>
			<input
				type="text"
				value={value}
				onChange={handleInputChange}
				onFocus={() => value && suggestions.length > 0 && setShowSuggestions(true)}
				placeholder={placeholder}
				className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
			/>

			{showSuggestions && suggestions.length > 0 && (
				<div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-y-auto">
					{suggestions.map((place, idx) => (
						<button
							key={idx}
							onClick={() => handleSelectSuggestion(place)}
							className="w-full text-left px-4 py-2 hover:bg-blue-50 transition-colors border-b border-gray-100 last:border-b-0"
						>
							<div className="text-sm">
								📍 {place}
							</div>
						</button>
					))}
				</div>
			)}
		</div>
	);
}
