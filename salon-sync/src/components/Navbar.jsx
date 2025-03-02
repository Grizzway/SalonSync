'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/app/context/AuthContext';

export default function Navbar() {
  const { user, logout } = useAuth();
  const router = useRouter();
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const handleLogout = () => {
    logout();
    router.push('/login');
  };

  const toggleDropdown = () => {
    setDropdownOpen(!dropdownOpen);
  };

  // Check if user is a business account by examining `type`
  const isBusiness = user?.type === 'business';

  // Generate the salon page URL from the user's name (businessName)
  const getBusinessPageUrl = () => {
    if (user && isBusiness && user.name) {
      // Convert business name to URL-friendly format (lowercase, replace spaces with hyphens)
      return `/salons/${user.name.toLowerCase().replace(/\s+/g, '-')}`;
    }
    return '/business'; // Fallback if something goes wrong
  };

  return (
    <nav className="bg-white shadow-md p-4 flex justify-between items-center">
      <h1 className="text-2xl font-bold text-gray-800 text-black">SalonSync</h1>
      <div className="space-x-4 relative">
        {user ? (
          <div>
            <button onClick={toggleDropdown} className="bg-gray-200 px-4 py-2 rounded-lg text-black">
              {user.name}
            </button>
            {dropdownOpen && (
              <div className="absolute right-0 mt-2 bg-white shadow-lg rounded-lg w-48">
                <button
                  onClick={() => router.push('/dashboard')}
                  className="w-full px-4 py-2 text-left text-black"
                >
                  Dashboard
                </button>
                {isBusiness && (
                  <button
                    onClick={() => router.push(getBusinessPageUrl())}
                    className="w-full px-4 py-2 text-left text-black"
                  >
                    My Business
                  </button>
                )}
                <button onClick={handleLogout} className="w-full px-4 py-2 text-left text-black">
                  Logout
                </button>
              </div>
            )}
          </div>
        ) : (
          <>
            <button
              onClick={() => router.push('/login')}
              className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
            >
              Login
            </button>
            <button
              onClick={() => router.push('/register')}
              className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600"
            >
              Register
            </button>
          </>
        )}
      </div>
    </nav>
  );
}