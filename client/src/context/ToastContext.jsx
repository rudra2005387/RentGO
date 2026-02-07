import React, { createContext, useState, useCallback } from 'react';

export const ToastContext = createContext();

export const ToastProvider = ({ children }) => {
	const [toasts, setToasts] = useState([]);

	const showToast = useCallback((message, type = 'info', duration = 3000) => {
		const id = Date.now();
		const toast = { id, message, type };

		setToasts((prevToasts) => [...prevToasts, toast]);

		if (duration > 0) {
			setTimeout(() => {
				removeToast(id);
			}, duration);
		}

		return id;
	}, []);

	const removeToast = useCallback((id) => {
		setToasts((prevToasts) => prevToasts.filter((toast) => toast.id !== id));
	}, []);

	return (
		<ToastContext.Provider value={{ toasts, showToast, removeToast }}>
			{children}
		</ToastContext.Provider>
	);
};
