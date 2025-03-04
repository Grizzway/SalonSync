"use client";

import { useState } from "react";

export default function RegisterCustomerPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");

  const handleRegister = async () => {
    const response = await fetch("/api/register/customer", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, email, password }),
    });

    const data = await response.json();
    setMessage(data.message);
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-b from-blue-50 to-blue-200 dark:from-gray-900 dark:to-gray-800 text-gray-900 dark:text-white px-6">
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-8 max-w-md text-center border border-gray-200 dark:border-gray-700">
        <h1 className="text-3xl md:text-4xl font-extrabold text-gray-800 dark:text-gray-200">
          Register as a Customer
        </h1>
        <p className="mt-2 text-gray-600 dark:text-gray-400">Fill out your details to create an account.</p>

        <input
          type="text"
          placeholder="Name"
          className="w-full px-4 py-2 rounded-md border mt-4"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
        <input
          type="email"
          placeholder="Email"
          className="w-full px-4 py-2 rounded-md border mt-4"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <input
          type="password"
          placeholder="Password"
          className="w-full px-4 py-2 rounded-md border mt-4"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        <button
          onClick={handleRegister}
          className="mt-4 w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
        >
          Register
        </button>

        {message && <p className="mt-4 text-red-500">{message}</p>}
      </div>
    </div>
  );
}
