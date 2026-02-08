import { Outlet } from 'react-router-dom';
import AirbnbStyleNavbar from '../components/navbar/AirbnbStyleNavbar';

export default function MainLayout() {
	return (
		<div className="min-h-screen bg-slate-50">
			<AirbnbStyleNavbar />
			<main
				id="main-content"
				className="container focus:outline-none"
				role="main"
			>
				<Outlet />
				{/* Mobile Bottom Navigation Padding */}
				<div className="h-20 md:h-0" aria-hidden="true" />
			</main>
		</div>
	);
}

