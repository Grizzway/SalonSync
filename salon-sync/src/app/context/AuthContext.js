'use client';

import { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext();

export const useAuth = () => {
  return useContext(AuthContext);
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const cookies = document.cookie.split('; ');
    const userCookie = cookies.find(cookie => cookie.startsWith('user='));

    if (userCookie) {
      try {
        const raw = userCookie.split('=')[1];
        const decoded = decodeURIComponent(raw);
        const userData = JSON.parse(decoded);
        console.log('🔍 AuthContext loaded user:', userData);
        setUser(userData);
      } catch (error) {
        console.error('Error parsing user cookie:', error);
      }
    }
  }, []);

  const logout = () => {
    document.cookie = 'user=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/';
    setUser(null);
  };

  const login = (userData) => {
    setUser(userData);
    document.cookie = `user=${encodeURIComponent(JSON.stringify(userData))}; path=/; secure; SameSite=Strict`;
  };

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
