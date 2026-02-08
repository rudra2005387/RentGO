import React from 'react';

/**
 * Standardized Button Component - Ensures UI consistency
 */
export const Button = ({
	children,
	variant = 'primary', // primary, secondary, danger, outline
	size = 'md', // sm, md, lg
	disabled = false,
	fullWidth = false,
	className = '',
	...props
}) => {
	const baseStyles = 'font-semibold rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2';

	const variants = {
		primary:
			'bg-blue-600 text-white hover:bg-blue-700 active:bg-blue-800 focus:ring-blue-500',
		secondary:
			'bg-gray-200 text-gray-900 hover:bg-gray-300 active:bg-gray-400 focus:ring-gray-500',
		danger:
			'bg-red-600 text-white hover:bg-red-700 active:bg-red-800 focus:ring-red-500',
		outline:
			'border-2 border-blue-600 text-blue-600 hover:bg-blue-50 focus:ring-blue-500',
	};

	const sizes = {
		sm: 'px-3 py-1.5 text-sm',
		md: 'px-4 py-2 text-base',
		lg: 'px-6 py-3 text-lg',
	};

	return (
		<button
			className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${
				fullWidth ? 'w-full' : ''
			} ${className}`}
			disabled={disabled}
			{...props}
		>
			{children}
		</button>
	);
};

/**
 * Standardized Card Component
 */
export const Card = ({
	children,
	className = '',
	hover = false,
	...props
}) => {
	return (
		<div
			className={`bg-white rounded-lg border border-gray-200 shadow-sm ${
				hover ? 'hover:shadow-md transition-shadow duration-200' : ''
			} ${className}`}
			{...props}
		>
			{children}
		</div>
	);
};

/**
 * Standardized Input Component
 */
export const Input = React.forwardRef(({
	label,
	error,
	required = false,
	className = '',
	...props
}, ref) => {
	return (
		<div className="w-full">
			{label && (
				<label className="block text-sm font-medium text-gray-700 mb-2">
					{label}
					{required && <span className="text-red-600">*</span>}
				</label>
			)}
			<input
				ref={ref}
				className={`w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-100 transition-all duration-200 ${
					error ? 'border-red-600' : ''
				} ${className}`}
				{...props}
			/>
			{error && <p className="text-sm text-red-600 mt-1">{error}</p>}
		</div>
	);
});

Input.displayName = 'Input';

/**
 * Standardized Badge Component
 */
export const Badge = ({
	children,
	variant = 'primary', // primary, success, danger, warning, neutral
	size = 'md',
	className = '',
	...props
}) => {
	const variants = {
		primary: 'bg-blue-100 text-blue-800',
		success: 'bg-green-100 text-green-800',
		danger: 'bg-red-100 text-red-800',
		warning: 'bg-yellow-100 text-yellow-800',
		neutral: 'bg-gray-100 text-gray-800',
	};

	const sizes = {
		sm: 'px-2 py-1 text-xs',
		md: 'px-3 py-1.5 text-sm',
		lg: 'px-4 py-2 text-base',
	};

	return (
		<span
			className={`font-semibold rounded-full ${variants[variant]} ${sizes[size]} inline-block ${className}`}
			{...props}
		>
			{children}
		</span>
	);
};

/**
 * Standardized Alert Component
 */
export const Alert = ({
	variant = 'info', // info, success, warning, danger
	title,
	children,
	onClose,
	className = '',
	...props
}) => {
	const variants = {
		info: 'bg-blue-50 border-blue-200 text-blue-900',
		success: 'bg-green-50 border-green-200 text-green-900',
		warning: 'bg-yellow-50 border-yellow-200 text-yellow-900',
		danger: 'bg-red-50 border-red-200 text-red-900',
	};

	const icons = {
		info: 'ℹ️',
		success: '✓',
		warning: '⚠️',
		danger: '✕',
	};

	return (
		<div
			className={`border-l-4 rounded-r-lg p-4 mb-4 ${variants[variant]} ${className}`}
			role="alert"
			{...props}
		>
			<div className="flex items-start gap-3">
				<span className="text-xl flex-shrink-0">{icons[variant]}</span>
				<div className="flex-1">
					{title && <h4 className="font-semibold mb-1">{title}</h4>}
					<p className="text-sm">{children}</p>
				</div>
				{onClose && (
					<button
						onClick={onClose}
						className="text-lg hover:opacity-70 transition-opacity flex-shrink-0"
						aria-label="Close alert"
					>
						✕
					</button>
				)}
			</div>
		</div>
	);
};

/**
 * Standardized Spinner Component
 */
export const Spinner = ({
	size = 'md',
	className = '',
	label = 'Loading...',
	...props
}) => {
	const sizes = {
		sm: 'w-4 h-4',
		md: 'w-8 h-8',
		lg: 'w-12 h-12',
	};

	return (
		<div className="flex items-center justify-center gap-2" {...props}>
			<div
				className={`${sizes[size]} border-2 border-gray-200 border-t-blue-600 rounded-full animate-spin`}
			/>
			{label && <span className="text-sm text-gray-600">{label}</span>}
		</div>
	);
};

/**
 * Standardized Modal Component
 */
export const Modal = ({
	isOpen,
	onClose,
	title,
	children,
	footer,
	className = '',
	...props
}) => {
	if (!isOpen) return null;

	return (
		<>
			<div
				className="fixed inset-0 bg-black bg-opacity-50 z-40"
				onClick={onClose}
			/>
			<div
				className={`fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-white rounded-lg shadow-xl z-50 max-w-md w-full mx-4 ${className}`}
				{...props}
			>
				{/* Header */}
				{title && (
					<div className="flex items-center justify-between p-6 border-b border-gray-200">
						<h2 className="text-xl font-bold text-gray-900">{title}</h2>
						<button
							onClick={onClose}
							className="text-gray-400 hover:text-gray-600 transition-colors"
							aria-label="Close modal"
						>
							✕
						</button>
					</div>
				)}

				{/* Content */}
				<div className="p-6">{children}</div>

				{/* Footer */}
				{footer && (
					<div className="flex gap-3 p-6 border-t border-gray-200">
						{footer}
					</div>
				)}
			</div>
		</>
	);
};

/**
 * Standardized Skeleton Loader
 */
export const Skeleton = ({
	width = 'w-full',
	height = 'h-4',
	className = '',
	circle = false,
	...props
}) => {
	return (
		<div
			className={`bg-gray-200 animate-pulse ${width} ${height} ${
				circle ? 'rounded-full' : 'rounded-lg'
			} ${className}`}
			{...props}
		/>
	);
};

export default {
	Button,
	Card,
	Input,
	Badge,
	Alert,
	Spinner,
	Modal,
	Skeleton,
};
