import { Link } from 'react-router-dom';

export default function Navbar() {
  return (
    <nav className="w-full bg-white/80 backdrop-blur-sm shadow-sm px-6 py-3">
      <div className="max-w-6xl mx-auto flex items-center justify-between">
        <Link to="/" className="font-bold text-xl text-blue-600">RentGo</Link>
        <div className="space-x-4">
          <Link to="/search" className="text-gray-700 hover:text-blue-600">Search</Link>
          <Link to="/login" className="text-gray-700 hover:text-blue-600">Login</Link>
          <Link to="/register" className="text-gray-700 hover:text-blue-600">Register</Link>
        </div>
      </div>
    </nav>
  );
}
