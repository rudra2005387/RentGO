import React, { useState, useRef, useEffect } from 'react';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export default function LocationAutocomplete({ value, onChange, placeholder = "Enter location" }) {
	const [suggestions, setSuggestions] = useState([]);
	const [showSuggestions, setShowSuggestions] = useState(false);
	const [loading, setLoading] = useState(false);
	const inputRef = useRef(null);

	const handleInputChange = (e) => {
		const inputValue = e.target.value;
		onChange(inputValue);

		if (inputValue.length < 2) {
			setSuggestions([]);
			setShowSuggestions(false);
			return;
		}

		setShowSuggestions(true);
	};

	useEffect(() => {
		const query = value?.trim();
		if (!query || query.length < 2) return;

		const t = setTimeout(async () => {
			setLoading(true);
			try {
				const res = await fetch(`${API_BASE}/listings/suggestions?q=${encodeURIComponent(query)}&limit=7`);
				const data = await res.json();
				if (data.success) {
					setSuggestions(data.data?.suggestions || []);
				}
			} catch {
				setSuggestions([]);
			} finally {
				setLoading(false);
			}
		}, 300);

		return () => clearTimeout(t);
	}, [value]);

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

			{showSuggestions && (
				<div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-y-auto">
					{loading && (
						<div className="px-4 py-2 text-sm text-gray-500">Searching...</div>
					)}
					{!loading && suggestions.length === 0 && (
						<div className="px-4 py-2 text-sm text-gray-500">No suggestions</div>
					)}
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
