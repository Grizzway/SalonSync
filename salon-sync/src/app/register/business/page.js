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

    console.log(`Checking if email ${email} exists...`);
    const res = await fetch("/api/register/business", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email }),
    });

    const emailData = await res.json();
    console.log("Email Check Response:", emailData);

    if (emailData.success === false) {
      setMessage("Email is already in use.");
      return;
    }

    console.log("Email not used, proceeding with registration...");
    const response = await fetch("/api/register/business", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ businessName, email, password, address }),
    });

    const data = await response.json();
    console.log("Registration Response:", data);

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
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-blue-200 dark:from-gray-900 dark:to-gray-800 text-gray-900 dark:text-white">
      {/* Navbar with padding fix */}
      <Navbar />
      <div className="pt-24 flex items-center justify-center p-6">
        <div className="w-full max-w-lg bg-white dark:bg-gray-800 shadow-lg rounded-2xl p-8 border border-gray-200 dark:border-gray-700">
          <h1 className="text-3xl font-bold text-center text-gray-800 dark:text-white mb-6">
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
                className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:text-white"
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
                className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:text-white"
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
                className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:text-white"
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
                className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:text-white"
                required
              />
            </div>
            <button
              type="submit"
              className="w-full bg-green-600 hover:bg-green-700 text-white font-medium py-3 rounded-lg transition-all duration-300 dark:shadow-green-900"
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
