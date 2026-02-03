import { Link } from 'react-router-dom';

export default function Dashboard() {
	return (
		<div className="p-6">
			<h1 className="text-2xl font-bold mb-2">Dashboard</h1>
			<p className="text-gray-600">Dashboard placeholder</p>
			<Link to="/" className="text-blue-600">Back home</Link>
		</div>
	);
}

