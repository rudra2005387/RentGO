// Tailwind CSS Custom Configuration - Centralized Design System
// This file ensures UI/UX consistency across the entire application

const designSystem = {
	// Colors - Consistent palette
	colors: {
		primary: {
			50: '#eff6ff',
			100: '#dbeafe',
			200: '#bfdbfe',
			500: '#3b82f6',
			600: '#2563eb',
			700: '#1d4ed8',
			800: '#1e40af',
			900: '#1e3a8a',
		},
		secondary: {
			50: '#f5f3ff',
			500: '#a78bfa',
			600: '#9333ea',
		},
		success: {
			50: '#f0fdf4',
			500: '#22c55e',
			600: '#16a34a',
		},
		danger: {
			50: '#fef2f2',
			500: '#ef4444',
			600: '#dc2626',
		},
		warning: {
			50: '#fffbeb',
			500: '#f59e0b',
			600: '#d97706',
		},
		neutral: {
			50: '#f9fafb',
			100: '#f3f4f6',
			200: '#e5e7eb',
			300: '#d1d5db',
			400: '#9ca3af',
			500: '#6b7280',
			600: '#4b5563',
			700: '#374151',
			800: '#1f2937',
			900: '#111827',
		},
	},

	// Spacing - 4px base unit
	spacing: {
		xs: '0.5rem', // 8px
		sm: '1rem', // 16px
		md: '1.5rem', // 24px
		lg: '2rem', // 32px
		xl: '3rem', // 48px
		'2xl': '4rem', // 64px
	},

	// Typography
	typography: {
		h1: {
			fontSize: '2.5rem', // 40px
			fontWeight: 'bold',
			lineHeight: '1.2',
			letterSpacing: '-0.02em',
		},
		h2: {
			fontSize: '2rem', // 32px
			fontWeight: 'bold',
			lineHeight: '1.3',
			letterSpacing: '-0.01em',
		},
		h3: {
			fontSize: '1.5rem', // 24px
			fontWeight: '600',
			lineHeight: '1.4',
		},
		h4: {
			fontSize: '1.25rem', // 20px
			fontWeight: '600',
			lineHeight: '1.5',
		},
		body: {
			fontSize: '1rem', // 16px
			fontWeight: '400',
			lineHeight: '1.6',
		},
		small: {
			fontSize: '0.875rem', // 14px
			fontWeight: '400',
			lineHeight: '1.5',
		},
		caption: {
			fontSize: '0.75rem', // 12px
			fontWeight: '400',
			lineHeight: '1.4',
		},
	},

	// Border radius - Hierarchy: sm < md < lg < xl
	borderRadius: {
		sm: '0.375rem', // 6px - Small elements
		md: '0.5rem', // 8px - Used widely
		lg: '0.75rem', // 12px - Cards, boxes
		xl: '1rem', // 16px - Large containers
		full: '9999px', // Circles, pills
	},

	// Shadows - Elevation hierarchy
	shadows: {
		none: 'none',
		xs: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
		sm: '0 1px 3px 0 rgba(0, 0, 0, 0.1)',
		md: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
		lg: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
		xl: '0 20px 25px -5px rgba(0, 0, 0, 0.1)',
		'2xl': '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
	},

	// Transitions
	transitions: {
		fast: '150ms ease-in-out',
		base: '200ms ease-in-out',
		slow: '300ms ease-in-out',
	},

	// Z-index hierarchy
	zIndex: {
		auto: 'auto',
		base: '0',
		dropdown: '1000',
		sticky: '1100',
		fixed: '1200',
		modal: '1300',
		popover: '1400',
		tooltip: '1500',
	},
};

export default designSystem;
