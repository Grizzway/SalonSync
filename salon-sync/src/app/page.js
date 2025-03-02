'use client';

import { useEffect } from 'react';
import { useAuth } from '@/app/context/AuthContext';
import Navbar from '@/components/Navbar.jsx'; // Import the Navbar component

export default function Home() {
  const { user } = useAuth();

  // Debug: Log the user object to inspect its structure
  useEffect(() => {
    if (user) {
      console.log("Logged in user:", user);
    }
  }, [user]);

  return (
    <div className="min-h-screen bg-gray-100">
      <Navbar /> {/* Replace the inline nav with the Navbar component */}

      {/* Display a Welcome message if user is logged in */}
      <div className="mt-8 text-center">
        {user ? (
          <h2 className="text-xl font-semibold text-gray-800">Welcome, {user.name}!</h2>
        ) : (
          <p className="text-xl text-gray-800">Please log in to access your account.</p>
        )}
      </div>
    </div>
  );
}