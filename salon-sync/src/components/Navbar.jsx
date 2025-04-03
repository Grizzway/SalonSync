"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/app/context/AuthContext";
import Link from "next/link";

export default function Navbar() {
  const { user, logout } = useAuth();
  const router = useRouter();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  
  // Debugging to check if customerId is available
  useEffect(() => {
    console.log("User data in Navbar:", user);
  }, [user]);

  const handleLogout = () => {
    logout();
    router.push("/");
  };

  const handleNavigation = (path) => {
    setDropdownOpen(false); // Close dropdown after clicking
    router.push(path);
  };

  return (
    <nav className="bg-white dark:bg-gray-900 shadow-md p-4 flex justify-between items-center relative z-50">
      <Link href="/" className="text-2xl font-bold text-gray-800 dark:text-white">
        SalonSync
      </Link>

      <div className="relative">
        {user ? (
          <div className="relative inline-block text-left">
            <button
              onClick={() => setDropdownOpen(!dropdownOpen)}
              className="bg-gray-200 dark:bg-gray-700 px-4 py-2 rounded-lg w-full focus:outline-none"
            >
              {user.businessName || "My Account"} ▼
            </button>

            {dropdownOpen && (
              <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 shadow-lg rounded-lg overflow-hidden border border-gray-200 dark:border-gray-700 z-50">
                {user.type === "business" ? (
                  <button
                    onClick={() => handleNavigation("/dashboard/business")}
                    className="block w-full text-left px-4 py-3 hover:bg-gray-100 dark:hover:bg-gray-700"
                  >
                    My Business
                  </button>
                ) : (
                  <button
                    onClick={() =>
                      handleNavigation(user.id ? `/${user.id}/profile` : "/dashboard/profile")
                    }
                    className="block w-full text-left px-4 py-3 hover:bg-gray-100 dark:hover:bg-gray-700"
                  >
                    My Profile
                  </button>
                )}
                <button
                  onClick={() => handleNavigation("/dashboard")}
                  className="block w-full text-left px-4 py-3 hover:bg-gray-100 dark:hover:bg-gray-700"
                >
                  Dashboard
                </button>
                <button
                  onClick={() => handleNavigation("/")}
                  className="block w-full text-left px-4 py-3 hover:bg-gray-100 dark:hover:bg-gray-700"
                >
                  Homepage
                </button>
                <button
                  onClick={handleLogout}
                  className="block w-full text-left px-4 py-3 hover:bg-red-500 hover:text-white dark:hover:bg-red-600"
                >
                  Logout
                </button>
              </div>
            )}
          </div>
        ) : (
          <div className="space-x-4">
            <Link href="/login" className="px-4 py-2 bg-blue-600 text-white rounded-lg">
              Login
            </Link>
            <Link href="/register" className="px-4 py-2 bg-green-600 text-white rounded-lg">
              Register
            </Link>
          </div>
        )}
      </div>
    </nav>
  );
}
