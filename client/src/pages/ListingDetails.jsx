import { Link, useParams } from 'react-router-dom';

export default function ListingDetails() {
	const { id } = useParams();
	return (
		<div className="p-6">
			<h1 className="text-2xl font-bold mb-2">Listing Details</h1>
			<p className="text-gray-600">Placeholder for listing id: {id}</p>
			<Link to="/search" className="text-blue-600">Back to search</Link>
		</div>
	);
}

