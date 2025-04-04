"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Navbar from "@/components/Navbar";

export default function BusinessRegisterPage() {
  const [businessName, setBusinessName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [address, setAddress] = useState("");
  const [message, setMessage] = useState("");
  const router = useRouter();

  const handleSubmit = async (e) => {
    e.preventDefault();

    const res = await fetch("/api/register/business", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email }),
    });

    const emailData = await res.json();

    if (emailData.success === false) {
      setMessage("Email is already in use.");
      return;
    }

    const response = await fetch("/api/register/business", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ businessName, email, password, address }),
    });

    const data = await response.json();

    if (data.success) {
      setMessage("Registration successful!");
      setTimeout(() => {
        router.push("/login");
      }, 3000);
    } else {
      setMessage(data.message || "Error during registration.");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-violet-100 via-purple-50 to-white dark:from-gray-900 dark:to-gray-800 text-gray-900 dark:text-white">
      <Navbar />
      <div className="pt-24 flex items-center justify-center p-6">
        <div className="w-full max-w-lg bg-white dark:bg-gray-800 shadow-xl rounded-3xl p-8 border border-purple-200 dark:border-purple-800">
          <h1 className="text-3xl font-bold text-center text-purple-700 dark:text-purple-300 mb-6">
            Business Registration
          </h1>
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label htmlFor="businessName" className="block text-gray-700 dark:text-gray-300 text-sm font-medium mb-2">
                Business Name
              </label>
              <input
                type="text"
                id="businessName"
                value={businessName}
                onChange={(e) => setBusinessName(e.target.value)}
                className="w-full p-3 border border-purple-300 dark:border-purple-600 rounded-lg focus:ring-2 focus:ring-purple-400 focus:border-purple-400 dark:bg-gray-700 dark:text-white"
                required
              />
            </div>
            <div>
              <label htmlFor="email" className="block text-gray-700 dark:text-gray-300 text-sm font-medium mb-2">
                Email
              </label>
              <input
                type="email"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full p-3 border border-purple-300 dark:border-purple-600 rounded-lg focus:ring-2 focus:ring-purple-400 focus:border-purple-400 dark:bg-gray-700 dark:text-white"
                required
              />
            </div>
            <div>
              <label htmlFor="password" className="block text-gray-700 dark:text-gray-300 text-sm font-medium mb-2">
                Password
              </label>
              <input
                type="password"
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full p-3 border border-purple-300 dark:border-purple-600 rounded-lg focus:ring-2 focus:ring-purple-400 focus:border-purple-400 dark:bg-gray-700 dark:text-white"
                required
              />
            </div>
            <div>
              <label htmlFor="address" className="block text-gray-700 dark:text-gray-300 text-sm font-medium mb-2">
                Business Address
              </label>
              <input
                type="text"
                id="address"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                className="w-full p-3 border border-purple-300 dark:border-purple-600 rounded-lg focus:ring-2 focus:ring-purple-400 focus:border-purple-400 dark:bg-gray-700 dark:text-white"
                required
              />
            </div>
            <button
              type="submit"
              className="w-full bg-gradient-to-r from-purple-500 to-fuchsia-500 hover:from-purple-600 hover:to-fuchsia-600 text-white font-medium py-3 rounded-lg transition-all duration-300 shadow-md dark:shadow-fuchsia-900"
            >
              Register
            </button>
          </form>
          {message && <p className="mt-4 text-center text-sm text-gray-700 dark:text-gray-300">{message}</p>}
        </div>
      </div>
    </div>
  );
}

