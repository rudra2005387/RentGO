// Example: How to use Toast Notifications

import { useToast } from '../hooks/useNotification';

export default function ToastExample() {
	const toast = useToast();

	return (
		<div className="space-y-4">
			{/* Success Toast */}
			<button
				onClick={() => toast.success('Property created successfully!')}
				className="px-4 py-2 bg-green-600 text-white rounded-lg"
			>
				Show Success Toast
			</button>

			{/* Error Toast */}
			<button
				onClick={() => toast.error('Failed to save listing. Please try again.')}
				className="px-4 py-2 bg-red-600 text-white rounded-lg"
			>
				Show Error Toast
			</button>

			{/* Info Toast */}
			<button
				onClick={() => toast.info('Your booking has been confirmed!')}
				className="px-4 py-2 bg-blue-600 text-white rounded-lg"
			>
				Show Info Toast
			</button>

			{/* Warning Toast */}
			<button
				onClick={() => toast.warning('This action cannot be undone')}
				className="px-4 py-2 bg-yellow-600 text-white rounded-lg"
			>
				Show Warning Toast
			</button>
		</div>
	);
}
