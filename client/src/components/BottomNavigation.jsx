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
		<nav className="bottom-nav" role="navigation" aria-label="Mobile bottom navigation">
			<div className="flex items-center justify-around h-16 w-full max-h-16">
				{navItems.map((item) => {
					const Icon = item.icon;
					const active = isActive(item.path);

					return (
						<Link
							key={item.path}
							to={item.path}
							className={`bottom-nav-item ${active ? 'active' : ''}`}
							aria-label={item.ariaLabel}
							aria-current={active ? 'page' : undefined}
							title={item.label}
						>
							<Icon className="mb-1" aria-hidden="true" />
							<span className="text-xs font-medium whitespace-nowrap">{item.label}</span>
						</Link>
					);
				})}
			</div>
		</nav>
	);
};

export default BottomNavigation;
