import { useContext } from 'react';
import { ToastContext } from '../context/ToastContext';
import { NotificationContext } from '../context/NotificationContext';

export const useToast = () => {
	const context = useContext(ToastContext);
	if (!context) {
		throw new Error('useToast must be used within ToastProvider');
	}

	return {
		success: (message, duration = 3000) =>
			context.showToast(message, 'success', duration),
		error: (message, duration = 4000) =>
			context.showToast(message, 'error', duration),
		info: (message, duration = 3000) =>
			context.showToast(message, 'info', duration),
		warning: (message, duration = 3500) =>
			context.showToast(message, 'warning', duration),
		remove: context.removeToast,
	};
};

export const useNotification = () => {
	const context = useContext(NotificationContext);
	if (!context) {
		throw new Error('useNotification must be used within NotificationProvider');
	}

	return context;
};
