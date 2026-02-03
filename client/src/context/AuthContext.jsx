(import { createContext, useContext, useState, useEffect } from 'react');

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
	const [user, setUser] = useState(null);

	// Simple initializer: try to load user from localStorage
	useEffect(() => {
		try {
			const raw = localStorage.getItem('rentgo_user');
			if (raw) setUser(JSON.parse(raw));
		} catch (e) {
			// ignore
		}
	}, []);

	const login = (userData) => {
		setUser(userData);
		try {
			localStorage.setItem('rentgo_user', JSON.stringify(userData));
		} catch (e) {}
	};

	const logout = () => {
		setUser(null);
		try {
			localStorage.removeItem('rentgo_user');
		} catch (e) {}
	};

	return (
		<AuthContext.Provider value={{ user, login, logout }}>
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

