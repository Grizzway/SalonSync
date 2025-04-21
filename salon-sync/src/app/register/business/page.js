'use client';

import { useState } from "react";
import { useRouter } from "next/navigation";
import Navbar from "@/components/Navbar";

export default function BusinessRegisterPage() {
  const [businessName, setBusinessName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [address, setAddress] = useState("");
  const [message, setMessage] = useState("");

  const [businessHours, setBusinessHours] = useState({
    monday: { open: '', close: '' },
    tuesday: { open: '', close: '' },
    wednesday: { open: '', close: '' },
    thursday: { open: '', close: '' },
    friday: { open: '', close: '' },
    saturday: { open: '', close: '' },
    sunday: { open: '', close: '' },
  });

  const timeOptions = Array.from({ length: 24 }, (_, i) => {
    const hour = i % 12 === 0 ? 12 : i % 12;
    const suffix = i < 12 ? "AM" : "PM";
    return `${hour.toString().padStart(2, "0")}:00 ${suffix}`;
  });

  const handleTimeChange = (day, field, value) => {
    setBusinessHours(prev => ({
      ...prev,
      [day]: {
        ...prev[day],
        [field]: value === 'closed' ? null : value
      }
    }));
  };

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
      body: JSON.stringify({
        businessName,
        email,
        password,
        address,
        businessHours,
      }),
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
              <label className="block text-gray-700 dark:text-gray-300 text-sm font-medium mb-2">
                Business Name
              </label>
              <input
                type="text"
                value={businessName}
                onChange={(e) => setBusinessName(e.target.value)}
                className="w-full p-3 border border-purple-300 dark:border-purple-600 rounded-lg focus:ring-2 focus:ring-purple-400 dark:bg-gray-700 dark:text-white"
                required
              />
            </div>
            <div>
              <label className="block text-gray-700 dark:text-gray-300 text-sm font-medium mb-2">
                Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full p-3 border border-purple-300 dark:border-purple-600 rounded-lg focus:ring-2 focus:ring-purple-400 dark:bg-gray-700 dark:text-white"
                required
              />
            </div>
            <div>
              <label className="block text-gray-700 dark:text-gray-300 text-sm font-medium mb-2">
                Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full p-3 border border-purple-300 dark:border-purple-600 rounded-lg focus:ring-2 focus:ring-purple-400 dark:bg-gray-700 dark:text-white"
                required
              />
            </div>
            <div>
              <label className="block text-gray-700 dark:text-gray-300 text-sm font-medium mb-2">
                Business Address
              </label>
              <input
                type="text"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                className="w-full p-3 border border-purple-300 dark:border-purple-600 rounded-lg focus:ring-2 focus:ring-purple-400 dark:bg-gray-700 dark:text-white"
                required
              />
            </div>

            {/* Business Hours Section */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-purple-700 dark:text-purple-300">Business Hours</h3>
              {Object.entries(businessHours).map(([day, times]) => (
                <div key={day} className="flex flex-col md:flex-row items-center justify-between gap-4">
                  <span className="capitalize w-24 text-gray-700 dark:text-gray-300">{day}</span>
                  <select
                    value={times.open === null ? 'closed' : times.open || ''}
                    onChange={(e) => handleTimeChange(day, 'open', e.target.value)}
                    className="w-full md:w-40 p-2 border border-gray-300 rounded"
                  >
                    <option value="">Open</option>
                    <option value="closed">Closed</option>
                    {timeOptions.map(time => (
                      <option key={time} value={time}>{time}</option>
                    ))}
                  </select>
                  <span className="text-gray-600 dark:text-gray-400 hidden md:inline">to</span>
                  <select
                    value={times.close === null ? 'closed' : times.close || ''}
                    onChange={(e) => handleTimeChange(day, 'close', e.target.value)}
                    className="w-full md:w-40 p-2 border border-gray-300 rounded"
                  >
                    <option value="">Close</option>
                    <option value="closed">Closed</option>
                    {timeOptions.map(time => (
                      <option key={time} value={time}>{time}</option>
                    ))}
                  </select>
                </div>
              ))}
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
