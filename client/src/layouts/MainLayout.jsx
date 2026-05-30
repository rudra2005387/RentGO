import { Outlet } from 'react-router-dom';
import ModernNavbar from '../components/navbar/ModernNavbar';

export default function MainLayout() {
	return (
		<div className="min-h-screen bg-white">
			<ModernNavbar />
			<main
				id="main-content"
				className="pt-20 focus:outline-none"
				role="main"
			>
				<Outlet />
				{/* Mobile Bottom Navigation Padding */}
				<div className="h-20 md:h-0" aria-hidden="true" />
			</main>
		</div>
	);
}

