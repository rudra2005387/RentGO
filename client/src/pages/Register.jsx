import { Link } from 'react-router-dom';

export default function Register() {
	return (
		<div className="min-h-screen flex items-center justify-center p-6">
			<div className="max-w-md w-full bg-white rounded-2xl shadow-lg p-8 text-center">
				<h1 className="text-2xl font-bold mb-4">Register</h1>
				<p className="text-gray-600 mb-6">Registration page placeholder</p>
				<Link to="/" className="text-blue-600">Back home</Link>
			</div>
		</div>
	);
}

