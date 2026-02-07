import React from 'react';

const SkipNavigation = () => {
	const handleSkip = () => {
		const mainContent = document.getElementById('main-content');
		if (mainContent) {
			mainContent.tabIndex = -1;
			mainContent.focus();
			mainContent.scrollIntoView({ behavior: 'smooth' });
		}
	};

	return (
		<a
			href="#main-content"
			onClick={(e) => {
				if (window.location.hash !== '#main-content') {
					e.preventDefault();
					handleSkip();
				}
			}}
			className="sr-only focus:not-sr-only focus:fixed focus:top-0 focus:left-0 focus:z-50 focus:px-4 focus:py-2 focus:bg-blue-600 focus:text-white focus:rounded-b-lg focus:block focus:font-semibold"
			aria-label="Skip to main content"
		>
			Skip to main content
		</a>
	);
};

export default SkipNavigation;
