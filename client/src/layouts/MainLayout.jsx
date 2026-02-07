import { Outlet } from 'react-router-dom';
import Navbar from '../components/navbar/Navbar';

export default function MainLayout() {
	return (
		<div className="min-h-screen bg-slate-50">
			<Navbar />
			<main
				id="main-content"
				className="max-w-6xl mx-auto px-4 py-6 focus:outline-none"
				role="main"
			>
				<Outlet />
				{/* Mobile Bottom Navigation Padding */}
				<div className="h-20 md:h-0" aria-hidden="true" />
			</main>
		</div>
	);
}

