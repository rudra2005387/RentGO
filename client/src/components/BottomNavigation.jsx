import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
	FaHome,
	FaSearch,
	FaHeart,
	FaBell,
	FaUser,
} from 'react-icons/fa';

const BottomNavigation = () => {
	const location = useLocation();

	const isActive = (path) => location.pathname === path;

	const navItems = [
		{ path: '/', icon: FaHome, label: 'Home', ariaLabel: 'Navigate to home' },
		{ path: '/advanced-search', icon: FaSearch, label: 'Search', ariaLabel: 'Open search' },
		{ path: '/saved', icon: FaHeart, label: 'Saved', ariaLabel: 'View saved properties' },
		{ path: '/notifications', icon: FaBell, label: 'Alerts', ariaLabel: 'View notifications' },
		{ path: '/profile', icon: FaUser, label: 'Profile', ariaLabel: 'View profile' },
	];

	return (
		<nav
			className="fixed bottom-0 left-0 right-0 md:hidden bg-white border-t border-gray-200 shadow-lg z-40"
			role="navigation"
			aria-label="Mobile bottom navigation"
		>
			<div className="flex items-center justify-around h-16 w-full max-h-16">
				{navItems.map((item) => {
					const Icon = item.icon;
					const active = isActive(item.path);

					return (
						<Link
							key={item.path}
							to={item.path}
							className={`flex flex-col items-center justify-center flex-1 h-full transition-all ${
								active
									? 'text-blue-600 border-t-2 border-blue-600'
									: 'text-gray-600 hover:text-blue-600'
							}`}
							aria-label={item.ariaLabel}
							aria-current={active ? 'page' : undefined}
							title={item.label}
						>
							<Icon
								className="text-xl mb-1"
								aria-hidden="true"
							/>
							<span className="text-xs font-medium whitespace-nowrap">
								{item.label}
							</span>
						</Link>
					);
				})}
			</div>
		</nav>
	);
};

export default BottomNavigation;
