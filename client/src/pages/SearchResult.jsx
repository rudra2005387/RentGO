import { Link } from 'react-router-dom';

export default function SearchResult() {
	return (
		<div className="p-6">
			<h1 className="text-2xl font-bold mb-2">Search Results</h1>
			<p className="text-gray-600">Search results placeholder</p>
			<Link to="/" className="text-blue-600">Back home</Link>
		</div>
	);
}

