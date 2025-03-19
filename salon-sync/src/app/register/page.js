"use client";

import Link from "next/link";
import Navbar from "@/components/Navbar";

export default function RegisterSelectionPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-blue-200 dark:from-gray-900 dark:to-gray-800 p-6 text-gray-900 dark:text-white">
      <Navbar />
      <div className="max-w-2xl mx-auto bg-white dark:bg-gray-800 shadow-lg rounded-2xl p-8 border border-gray-300 dark:border-gray-700 text-center">
        <h1 className="text-3xl font-bold text-gray-800 dark:text-white mb-6">
          Choose Registration Type
        </h1>
        <p className="text-gray-600 dark:text-gray-300 mb-6">
          Select whether you want to register as a business owner or as a customer.
        </p>
        <div className="flex flex-col space-y-4">
          <Link
            href="/register/business"
            className="block w-full px-6 py-3 bg-green-600 text-white font-medium rounded-lg hover:bg-green-700 transition-all"
          >
            Register as a Business
          </Link>
          <Link
            href="/register/customer"
            className="block w-full px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-all"
          >
            Register as a Customer
          </Link>
        </div>
      </div>
    </div>
  );
}
