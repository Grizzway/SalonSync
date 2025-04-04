"use client";

import Link from "next/link";
import Navbar from "@/components/Navbar";

export default function RegisterSelectionPage() {
  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-violet-100 via-purple-50 to-white dark:from-gray-900 dark:to-gray-800 text-gray-900 dark:text-white">
      <Navbar />

      <div className="flex flex-grow items-center justify-center px-6">
        <div className="w-full max-w-xl bg-white dark:bg-gray-800 shadow-xl rounded-3xl p-8 border border-purple-200 dark:border-purple-700 text-center">
          <h1 className="text-3xl font-bold text-purple-700 dark:text-purple-300 mb-6">
            Get Started with SalonSync
          </h1>
          <p className="text-gray-600 dark:text-gray-300 mb-6">
            Create an account to book appointments and manage your profile.
          </p>

          {/* Primary: Sign Up (Customer) */}
          <Link
            href="/register/customer"
            className="block w-full px-6 py-4 bg-gradient-to-r from-purple-500 to-fuchsia-500 text-white font-bold text-lg rounded-lg hover:from-purple-600 hover:to-fuchsia-600 transition-all shadow-md"
          >
            Sign Up
          </Link>

          {/* Secondary: Register as a Business */}
          <div className="mt-4 text-gray-700 dark:text-gray-300 text-sm">
            <p>Are you a business owner?</p>
            <Link
              href="/register/business"
              className="text-fuchsia-600 font-medium hover:underline"
            >
              Register Your Business
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}