import { Link } from 'react-router-dom';

export default function NotFound() {
	return (
		<div className="min-h-screen flex items-center justify-center p-6">
			<div className="text-center">
				<h1 className="text-4xl font-bold mb-4">404 — Not Found</h1>
				<p className="text-gray-600 mb-6">The page you requested could not be found.</p>
				<Link to="/" className="text-blue-600">Return home</Link>
			</div>
		</div>
	);
}

