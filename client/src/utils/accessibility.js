// Accessibility utilities and helpers

// Color contrast checker
export const checkContrast = (backgroundColor, textColor) => {
	// Simple WCAG contrast ratio checker
	const getLuminance = (color) => {
		const rgb = parseInt(color.replace('#', ''), 16);
		const r = (rgb >> 16) & 0xff;
		const g = (rgb >> 8) & 0xff;
		const b = (rgb >> 0) & 0xff;

		const luminance =
			(0.2126 * r + 0.7152 * g + 0.0722 * b) / 255;

		return luminance <= 0.03928
			? luminance / 12.92
			: Math.pow((luminance + 0.055) / 1.055, 2.4);
	};

	const l1 = getLuminance(backgroundColor);
	const l2 = getLuminance(textColor);

	const lighter = Math.max(l1, l2);
	const darker = Math.min(l1, l2);

	const contrast = (lighter + 0.05) / (darker + 0.05);

	// WCAG AA requires 4.5:1 for normal text, 3:1 for large text
	// WCAG AAA requires 7:1 for normal text, 4.5:1 for large text
	return {
		ratio: contrast.toFixed(2),
		aa: contrast >= 4.5,
		aaa: contrast >= 7,
	};
};

// ARIA label builder
export const buildAriaLabel = (base, ...additions) => {
	return [base, ...additions.filter(Boolean)].join(', ');
};

// Keyboard event handler
export const handleKeyboardEvent = (event, callbacks) => {
	const { Enter, Space, Escape, ArrowUp, ArrowDown, ArrowLeft, ArrowRight } =
		callbacks;

	switch (event.key) {
		case 'Enter':
			if (Enter) {
				event.preventDefault();
				Enter();
			}
			break;
		case ' ':
			if (Space) {
				event.preventDefault();
				Space();
			}
			break;
		case 'Escape':
			if (Escape) {
				event.preventDefault();
				Escape();
			}
			break;
		case 'ArrowUp':
			if (ArrowUp) {
				event.preventDefault();
				ArrowUp();
			}
			break;
		case 'ArrowDown':
			if (ArrowDown) {
				event.preventDefault();
				ArrowDown();
			}
			break;
		case 'ArrowLeft':
			if (ArrowLeft) {
				event.preventDefault();
				ArrowLeft();
			}
			break;
		case 'ArrowRight':
			if (ArrowRight) {
				event.preventDefault();
				ArrowRight();
			}
			break;
		default:
			break;
	}
};

// Focus management
export class FocusManager {
	static focusElement(element) {
		if (element) {
			element.focus();
			return true;
		}
		return false;
	}

	static focusFirstFocusable(container) {
		const focusable = container?.querySelectorAll(
			'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
		);
		if (focusable?.length > 0) {
			focusable[0].focus();
			return true;
		}
		return false;
	}

	static focusLastFocusable(container) {
		const focusable = container?.querySelectorAll(
			'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
		);
		if (focusable?.length > 0) {
			focusable[focusable.length - 1].focus();
			return true;
		}
		return false;
	}

	static trapFocus(event, container) {
		if (event.key !== 'Tab') return;

		const focusable = Array.from(
			container?.querySelectorAll(
				'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
			) || []
		);

		if (focusable.length === 0) return;

		const firstFocusable = focusable[0];
		const lastFocusable = focusable[focusable.length - 1];
		const activeElement = document.activeElement;

		if (event.shiftKey) {
			if (activeElement === firstFocusable) {
				lastFocusable.focus();
				event.preventDefault();
			}
		} else {
			if (activeElement === lastFocusable) {
				firstFocusable.focus();
				event.preventDefault();
			}
		}
	}
}

// Mobile keyboard detection
export const isMobileKeyboardVisible = () => {
	return window.innerHeight < window.innerHeight - 100;
};

// Announcement helper for screen readers
export class Announcer {
	static announce(message, priority = 'polite') {
		const div = document.createElement('div');
		div.setAttribute('role', 'status');
		div.setAttribute('aria-live', priority);
		div.setAttribute('aria-atomic', 'true');
		div.className = 'sr-only';
		div.textContent = message;
		document.body.appendChild(div);

		setTimeout(() => {
			document.body.removeChild(div);
		}, 1000);
	}
}
