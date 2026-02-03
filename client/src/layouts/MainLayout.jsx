import { Outlet } from 'react-router-dom';
import Navbar from '../components/navbar/Navbar';

export default function MainLayout() {
	return (
		<div className="min-h-screen bg-slate-50">
			<Navbar />
			<main className="max-w-6xl mx-auto px-4 py-6">
				<Outlet />
			</main>
		</div>
	);
}

