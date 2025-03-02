// src/app/context/AuthContext.js

'use client';

import { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext();

export const useAuth = () => {
  return useContext(AuthContext);
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);

  // This effect will run only once on mount and check for cookies
  useEffect(() => {
    const cookies = document.cookie.split('; ');
    const userCookie = cookies.find(cookie => cookie.startsWith('user='));

    if (userCookie) {
      try {
        // Safely parse the cookie value
        const userData = JSON.parse(userCookie.split('=')[1]);
        setUser(userData);  // Set the user state if parsing is successful
      } catch (error) {
        console.error('Error parsing user cookie:', error);
      }
    }
  }, []); // Run once on mount

  const logout = () => {
    document.cookie = 'user=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/';
    setUser(null);
  };

  const login = (userData) => {
    setUser(userData);
    document.cookie = `user=${JSON.stringify(userData)}; path=/; secure; SameSite=Strict`;
  };

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
