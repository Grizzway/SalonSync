"use client";
export const dynamic = "force-dynamic";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/app/context/AuthContext";
import Navbar from "@/components/Navbar";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { Star } from "lucide-react";
import Image from "next/image";

export default function Home() {
  const { user } = useAuth();
  const router = useRouter();
  const [topSalons, setTopSalons] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [salonList, setSalonList] = useState([]);

  useEffect(() => {
    if (user?.type === "employee") {
      router.push("/dashboard");
    }
  }, [user, router]);

  useEffect(() => {
    async function fetchTopSalons() {
      try {
        const response = await fetch("/api/salon/top-rated");
        if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);
        const data = await response.json();
        setTopSalons(data.salons.slice(0, 10));
      } catch (error) {
        console.error("Error fetching top-rated salons:", error);
      }
    }
    fetchTopSalons();
  }, []);

  useEffect(() => {
    const timeout = setTimeout(() => {
      async function fetchAllSalons() {
        try {
          const response = await fetch("/api/salon");
          if (!response.ok) throw new Error("Failed to fetch salons");
          const data = await response.json();
          setSalonList(data);
        } catch (err) {
          console.error("Error fetching all salons:", err);
        }
      }
      fetchAllSalons();
    }, 300);
    return () => clearTimeout(timeout);
  }, []);

  const filteredSalons = useMemo(() => {
    if (searchQuery.trim() === "") return [];
    return salonList.filter((salon) =>
      salon.name.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [searchQuery, salonList]);

  const handleSearchSelect = (salon) => {
    router.push(`/salons/${salon.id}`);
  };

  const handleEnter = (e) => {
    if (e.key === "Enter" && filteredSalons.length > 0) {
      router.push(`/salons/${filteredSalons[0].id}`);
    }
  };

  return (
    <div className="relative min-h-screen bg-gradient-to-b from-violet-100 via-purple-50 to-white dark:from-gray-900 dark:to-gray-800 text-gray-900 dark:text-white overflow-hidden font-sans">
      <Navbar />

      <motion.section
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="text-center py-28 px-4"
      >
        <motion.h1
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.7, ease: "easeOut" }}
          className="text-5xl md:text-6xl font-extrabold text-fuchsia-700 dark:text-fuchsia-300 mb-6"
        >
          Discover & Book Beautiful Salons
        </motion.h1>

        <div className="relative max-w-md mx-auto mt-6">
          <input
            type="text"
            placeholder="Search for a salon"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyDown={handleEnter}
            className="w-full px-4 py-3 border border-purple-300 rounded-lg shadow focus:outline-none focus:ring-2 focus:ring-purple-400 text-gray-900"
          />
          {filteredSalons.length > 0 && (
            <div className="absolute z-10 w-full bg-white dark:bg-gray-800 mt-1 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 max-h-60 overflow-auto">
              {filteredSalons.map((salon, idx) => (
                <div
                  key={idx}
                  onClick={() => handleSearchSelect(salon)}
                  className="px-4 py-3 hover:bg-purple-100 dark:hover:bg-gray-700 cursor-pointer text-left"
                >
                  {salon.name}
                </div>
              ))}
            </div>
          )}
        </div>

        {!user && (
          <div className="mt-8">
            <Link
              href="/register"
              className="inline-block text-white bg-gradient-to-r from-purple-500 to-fuchsia-500 px-8 py-3 rounded-full text-md font-semibold shadow-lg hover:shadow-xl transition"
            >
              ✨ Create a Customer Account
            </Link>
          </div>
        )}

        {!user && (
          <p className="mt-6 text-sm text-gray-500 dark:text-gray-400">
            Are you a salon owner?{' '}
            <Link href="/register" className="underline hover:text-fuchsia-600">
              Register your salon here.
            </Link>
          </p>
        )}

        {user && (
          <div className="mt-8">
            <Link
              href="/dashboard"
              className="inline-block text-white bg-gradient-to-r from-fuchsia-500 to-purple-500 px-8 py-3 rounded-full text-md font-semibold shadow-lg hover:shadow-xl transition"
            >
              👤 My Account
            </Link>
          </div>
        )}
      </motion.section>

      <section className="px-6 py-16 md:px-16 lg:px-24">
        <h2 className="text-4xl font-extrabold text-center mb-14 text-fuchsia-700 dark:text-rose-200">
          💫 Top Rated Salons
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-10">
          {topSalons.map((salon, index) => (
            <motion.div
              key={salon._id || index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1, duration: 0.5 }}
              viewport={{ once: true }}
              className="transition-transform transform hover:scale-105"
            >
              
              <Link href={`/salons/${salon.salonId || salon._id}`} className="block h-full">
                <div className="bg-white dark:bg-gray-800 p-6 rounded-3xl shadow-2xl border border-gray-100 dark:border-rose-900 h-full flex flex-col justify-between">
                  <div className="w-full h-52 relative rounded-2xl overflow-hidden mb-4">
                    <Image
                      src={salon.imageUrl || "https://res.cloudinary.com/dxftncwhj/image/upload/v1744217062/placeholder_skpuau.png"}
                      alt={salon.businessName || "Salon image"}
                      layout="fill"
                      objectFit="cover"
                      className="rounded-2xl"
                      priority={index < 2}
                    />
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold text-purple-700 dark:text-fuchsia-200 mb-2">
                      {salon.businessName || "Unnamed Salon"}
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                      {salon.address}
                    </p>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mb-3">
                      Services: {salon.services?.slice(0, 3).join(", ") || "N/A"}
                    </p>
                    <div className="flex items-center gap-1 text-yellow-500">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          size={18}
                          fill={i < Math.round(salon.rating || 0) ? "currentColor" : "none"}
                          strokeWidth={1.5}
                        />
                      ))}
                      <span className="text-sm text-gray-700 dark:text-gray-300 ml-2">
                        {salon.rating?.toFixed(1) || "0.0"}
                      </span>
                    </div>
                  </div>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      </section>
    </div>
  );
}