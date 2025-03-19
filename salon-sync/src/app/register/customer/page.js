"use client";

import { useState } from "react";
import Navbar from "@/components/Navbar";

export default function RegisterCustomerPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");

  const handleRegister = async (e) => {
    e.preventDefault(); // Prevent page refresh

    const response = await fetch("/api/register/customer", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, email, password }),
    });

    const data = await response.json();
    setMessage(data.message);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-blue-200 dark:from-gray-900 dark:to-gray-800 text-gray-900 dark:text-white">
      {/* Navbar with padding fix */}
      <Navbar />
      <div className="pt-24 flex items-center justify-center p-6">
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-8 max-w-md text-center border border-gray-200 dark:border-gray-700">
          <h1 className="text-3xl md:text-4xl font-extrabold text-gray-800 dark:text-gray-200">
            Register as a Customer
          </h1>
          <p className="mt-2 text-gray-600 dark:text-gray-400">Fill out your details to create an account.</p>

          <form onSubmit={handleRegister} className="space-y-4">
            <input
              type="text"
              placeholder="Name"
              className="w-full px-4 py-2 rounded-md border dark:border-gray-600 dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-indigo-500"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
            <input
              type="email"
              placeholder="Email"
              className="w-full px-4 py-2 rounded-md border dark:border-gray-600 dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-indigo-500"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            <input
              type="password"
              placeholder="Password"
              className="w-full px-4 py-2 rounded-md border dark:border-gray-600 dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-indigo-500"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />

            <button
              type="submit"
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
            >
              Register
            </button>
          </form>

          {message && <p className="mt-4 text-red-500">{message}</p>}
        </div>
      </div>
    </div>
  );
}
