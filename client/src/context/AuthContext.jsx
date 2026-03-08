import { createContext, useContext, useState, useEffect } from 'react';

export const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
	const [user, setUser] = useState(null);
	const [token, setToken] = useState(null);
	const [loading, setLoading] = useState(true);

	// On mount: restore session from localStorage
	useEffect(() => {
		try {
			const savedToken = localStorage.getItem('token');
			const savedUser = localStorage.getItem('rentgo_user');
			if (savedToken && savedUser) {
				setToken(savedToken);
				setUser(JSON.parse(savedUser));
			}
		} catch (e) {
			// corrupted data — clear it
			localStorage.removeItem('token');
			localStorage.removeItem('rentgo_user');
		}
		setLoading(false);
	}, []);

	const login = (userData, authToken) => {
		setUser(userData);
		setToken(authToken);
		try {
			localStorage.setItem('token', authToken);
			localStorage.setItem('rentgo_user', JSON.stringify(userData));
		} catch (e) {}
	};

	const logout = () => {
		setUser(null);
		setToken(null);
		try {
			localStorage.removeItem('token');
			localStorage.removeItem('rentgo_user');
		} catch (e) {}
	};

	const isAuthenticated = !!token;

	return (
		<AuthContext.Provider value={{ user, token, loading, isAuthenticated, login, logout }}>
			{children}
		</AuthContext.Provider>
	);
};

export const useAuth = () => {
	const ctx = useContext(AuthContext);
	if (!ctx) throw new Error('useAuth must be used within AuthProvider');
	return ctx;
};

export default AuthContext;

