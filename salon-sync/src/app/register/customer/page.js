"use client";

import { useState } from "react";
import Navbar from "@/components/Navbar";

export default function RegisterCustomerPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");

  const handleRegister = async (e) => {
    e.preventDefault();

    const response = await fetch("/api/register/customer", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, email, password }),
    });

    const data = await response.json();
    setMessage(data.message);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-violet-100 via-purple-50 to-white dark:from-gray-900 dark:to-gray-800 text-gray-900 dark:text-white">
      <Navbar />
      <div className="pt-24 flex items-center justify-center p-6">
        <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-xl p-8 max-w-md w-full text-center border border-purple-200 dark:border-purple-700">
          <h1 className="text-3xl md:text-4xl font-extrabold text-purple-700 dark:text-purple-300">
            Register as a Customer
          </h1>
          <p className="mt-2 text-gray-600 dark:text-gray-400">
            Fill out your details to create an account.
          </p>

          <form onSubmit={handleRegister} className="space-y-4 mt-6">
            <input
              type="text"
              placeholder="Name"
              className="w-full px-4 py-2 rounded-md border border-purple-300 dark:border-purple-600 dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-purple-400"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
            <input
              type="email"
              placeholder="Email"
              className="w-full px-4 py-2 rounded-md border border-purple-300 dark:border-purple-600 dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-purple-400"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            <input
              type="password"
              placeholder="Password"
              className="w-full px-4 py-2 rounded-md border border-purple-300 dark:border-purple-600 dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-purple-400"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />

            <button
              type="submit"
              className="w-full bg-gradient-to-r from-purple-500 to-fuchsia-500 hover:from-purple-600 hover:to-fuchsia-600 text-white font-bold py-2 px-4 rounded-lg shadow-md"
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
