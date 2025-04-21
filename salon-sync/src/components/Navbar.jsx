"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/app/context/AuthContext";
import Link from "next/link";
import { Moon, Sun } from "lucide-react";

export default function Navbar() {
  const { user, logout } = useAuth();
  const router = useRouter();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [darkMode, setDarkMode] = useState(false);

  // Load dark mode preference on mount
  useEffect(() => {
    const savedPreference = localStorage.getItem("darkMode");
    if (savedPreference === "true") {
      setDarkMode(true);
      document.documentElement.classList.add("dark");
    } else {
      setDarkMode(false);
      document.documentElement.classList.remove("dark");
    }
  }, []);

  // Apply dark mode class and store preference when toggled
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add("dark");
      localStorage.setItem("darkMode", "true");
    } else {
      document.documentElement.classList.remove("dark");
      localStorage.setItem("darkMode", "false");
    }
  }, [darkMode]);

  const handleLogout = () => {
    logout();
    router.push("/");
  };

  const handleNavigation = (path) => {
    setDropdownOpen(false);
    router.push(path);
  };

  return (
    <nav className="fixed top-0 left-0 w-full bg-gradient-to-r from-purple-100 via-purple-200 to-white dark:from-gray-900 dark:to-gray-800 shadow-md px-6 py-4 flex justify-between items-center z-50 border-b border-purple-300 dark:border-purple-700">
      <Link
        href="/"
        className="text-3xl font-extrabold text-purple-700 dark:text-purple-300 tracking-tight"
      >
        SalonSync
      </Link>

      <div className="flex items-center space-x-4">
        <button
          onClick={() => setDarkMode(!darkMode)}
          className="p-2 rounded-full bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-white hover:bg-gray-300 dark:hover:bg-gray-600 transition"
          aria-label="Toggle Dark Mode"
        >
          {darkMode ? <Sun size={20} /> : <Moon size={20} />}
        </button>

        <div className="relative">
          {user ? (
            <div className="relative inline-block text-left">
              <button
                onClick={() => setDropdownOpen(!dropdownOpen)}
                className="bg-purple-600 hover:bg-purple-700 text-white px-5 py-2 rounded-full shadow transition-all duration-200"
              >
                {user.businessName || user.name || "My Account"} ▼
              </button>

              {dropdownOpen && (
                <div className="absolute right-0 mt-3 w-56 bg-white dark:bg-gray-800 shadow-xl rounded-xl overflow-hidden border border-purple-200 dark:border-purple-700 z-50">
                  {user.type === "business" && user.salonId && (
                    <button
                      onClick={() => handleNavigation(`/salons/${user.salonId}`)}
                      className="block w-full text-left px-5 py-3 hover:bg-purple-50 dark:hover:bg-gray-700 transition"
                    >
                      My Salon
                    </button>
                  )}

                  {user.type === "business" && (
                    <button
                      onClick={() => handleNavigation("/dashboard/business")}
                      className="block w-full text-left px-5 py-3 hover:bg-purple-50 dark:hover:bg-gray-700 transition"
                    >
                      Business Dashboard
                    </button>
                  )}

                  {user.type === "employee" && (
                    <button
                      onClick={() => handleNavigation("/dashboard/employee")}
                      className="block w-full text-left px-5 py-3 hover:bg-purple-50 dark:hover:bg-gray-700 transition"
                    >
                      Employee Dashboard
                    </button>
                  )}

                  {user.type === "customer" && (
                    <button
                      onClick={() => handleNavigation("/dashboard/customer")}
                      className="block w-full text-left px-5 py-3 hover:bg-purple-50 dark:hover:bg-gray-700 transition"
                    >
                      Customer Dashboard
                    </button>
                  )}

                  <button
                    onClick={() => handleNavigation("/")}
                    className="block w-full text-left px-5 py-3 hover:bg-purple-50 dark:hover:bg-gray-700 transition"
                  >
                    Homepage
                  </button>

                  <button
                    onClick={handleLogout}
                    className="block w-full text-left px-5 py-3 hover:bg-red-500 hover:text-white dark:hover:bg-red-600 transition"
                  >
                    Logout
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="space-x-4">
              <Link
                href="/login"
                className="px-5 py-2 bg-gradient-to-r from-purple-500 to-fuchsia-500 text-white rounded-full font-semibold shadow hover:from-purple-600 hover:to-fuchsia-600 transition"
              >
                Login
              </Link>
              <Link
                href="/register"
                className="px-5 py-2 bg-gradient-to-r from-green-400 to-emerald-500 text-white rounded-full font-semibold shadow hover:from-green-500 hover:to-emerald-600 transition"
              >
                Register
              </Link>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}
