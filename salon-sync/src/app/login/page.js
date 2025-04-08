// src/app/login/page.js

'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../context/AuthContext';
import Link from 'next/link';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');
  const router = useRouter();
  const { login } = useAuth();

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/login/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();
      if (data.success) {
        login(data.user);
        setMessage('Login successful!');
        router.push('/');
      } else {
        setMessage(data.message || 'Login failed');
      }
    } catch (error) {
      console.error('Login error:', error);
      setMessage('An error occurred. Please try again.');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-violet-100 via-purple-50 to-white dark:from-gray-900 dark:to-gray-800 text-gray-900 dark:text-white flex items-center justify-center p-4">
      <div className="max-w-md w-full p-6 bg-white dark:bg-gray-800 rounded-3xl shadow-xl border border-purple-200 dark:border-purple-700">
        <h2 className="text-3xl font-extrabold mb-6 text-purple-700 dark:text-purple-300 text-center">Login</h2>
        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Email</label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="mt-1 w-full px-4 py-2 border border-purple-300 dark:border-purple-600 rounded-lg shadow-sm text-gray-900 dark:text-white dark:bg-gray-700 focus:ring-2 focus:ring-purple-400"
              required
            />
          </div>
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Password</label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="mt-1 w-full px-4 py-2 border border-purple-300 dark:border-purple-600 rounded-lg shadow-sm text-gray-900 dark:text-white dark:bg-gray-700 focus:ring-2 focus:ring-purple-400"
              required
            />
          </div>
          <button type="submit" className="w-full py-2 bg-gradient-to-r from-purple-500 to-fuchsia-500 hover:from-purple-600 hover:to-fuchsia-600 text-white rounded-lg font-bold shadow-md transition-all">
            Login
          </button>
        </form>

        {message && <p className="mt-4 text-center text-sm text-red-500">{message}</p>}

        <div className="mt-6 text-center text-sm text-gray-500 dark:text-gray-400">
          Business owner?{' '}
          <Link href="/login/business" className="underline text-gray-600 hover:text-purple-600">
            Log in here
          </Link>
        </div>
      </div>
    </div>
  );
}