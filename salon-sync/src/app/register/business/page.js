"use client";

import { useState } from "react";
import Link from "next/link";

const RegisterBusiness = () => {
  const [formData, setFormData] = useState({
    businessName: "",
    ownerName: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log("Registering business with: ", formData);
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-b from-blue-50 to-blue-200 dark:from-gray-900 dark:to-gray-800 p-6 text-gray-900 dark:text-white">
      <div className="w-full max-w-lg bg-white dark:bg-gray-800 shadow-lg rounded-2xl p-8 border border-gray-200 dark:border-gray-700">
        <h2 className="text-2xl font-semibold text-center text-gray-800 dark:text-gray-200 mb-6">
          Register Your Business
        </h2>
        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-gray-700 dark:text-gray-300 text-sm font-medium mb-2">
              Business Name
            </label>
            <input
              type="text"
              name="businessName"
              value={formData.businessName}
              onChange={handleChange}
              className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:text-white"
              required
            />
          </div>
          <div>
            <label className="block text-gray-700 dark:text-gray-300 text-sm font-medium mb-2">
              Owner Name
            </label>
            <input
              type="text"
              name="ownerName"
              value={formData.ownerName}
              onChange={handleChange}
              className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:text-white"
              required
            />
          </div>
          <div>
            <label className="block text-gray-700 dark:text-gray-300 text-sm font-medium mb-2">
              Email Address
            </label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:text-white"
              required
            />
          </div>
          <div>
            <label className="block text-gray-700 dark:text-gray-300 text-sm font-medium mb-2">
              Password
            </label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:text-white"
              required
            />
          </div>
          <div>
            <label className="block text-gray-700 dark:text-gray-300 text-sm font-medium mb-2">
              Confirm Password
            </label>
            <input
              type="password"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
              className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:text-white"
              required
            />
          </div>
          <button
            type="submit"
            className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-3 rounded-lg transition-all duration-300 dark:shadow-blue-900"
          >
            Register Business
          </button>
        </form>
        <p className="text-center text-gray-600 dark:text-gray-400 text-sm mt-5">
          Already have an account? <Link href="/login" className="text-indigo-600 hover:underline">Sign in here</Link>
        </p>
      </div>
    </div>
  );
};

export default RegisterBusiness;