"use client";
export const dynamic = "force-dynamic";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/app/context/AuthContext";
import Navbar from "@/components/Navbar";
import Link from "next/link";
import { motion } from "framer-motion";
import { Star } from "lucide-react";
import Image from "next/image";

function getDistanceFromLatLonInKm(lat1, lon1, lat2, lon2) {
  if (!lat1 || !lon1 || !lat2 || !lon2) return Infinity;
  const R = 6371; // Radius of the Earth in km
  const dLat = deg2rad(lat2 - lat1);
  const dLon = deg2rad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(deg2rad(lat1)) *
      Math.cos(deg2rad(lat2)) *
      Math.sin(dLon / 2) ** 2;
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}
function deg2rad(deg) {
  return deg * (Math.PI / 180);
}

export default function Home() {
  const { user } = useAuth();
  const router = useRouter();
  const [topSalons, setTopSalons] = useState([]);

  useEffect(() => {
    if (user?.type === "employee") {
      router.push("/dashboard");
    }
  }, [user, router]);

  useEffect(() => {
    async function fetchTopSalons() {
      try {
        const res = await fetch("/api/salon/top-rated");
        const data = await res.json();

        if (navigator.geolocation) {
          navigator.geolocation.getCurrentPosition(
            (position) => {
              const userLat = position.coords.latitude;
              const userLng = position.coords.longitude;

              const sorted = data.salons
                .map((salon) => {
                  const distance = getDistanceFromLatLonInKm(
                    userLat,
                    userLng,
                    salon.latitude,
                    salon.longitude
                  );
                  return { ...salon, distance };
                })
                .sort((a, b) => a.distance - b.distance);

              setTopSalons(sorted.slice(0, 10));
            },
            (err) => {
              console.warn("Location permission denied, defaulting to rating.");
              setTopSalons(data.salons.slice(0, 10));
            }
          );
        } else {
          setTopSalons(data.salons.slice(0, 10));
        }
      } catch (error) {
        console.error("Error fetching top-rated salons:", error);
      }
    }

    fetchTopSalons();
  }, []);

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
        <motion.p
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.6 }}
          className="text-lg text-gray-600 dark:text-gray-300 max-w-xl mx-auto"
        >
          Your next beauty experience is just a few clicks away. Browse our top-rated salons and treat yourself today.
        </motion.p>

        {user ? (
          <div className="mt-8">
            <Link
              href={user.type === "business" ? "/dashboard/business" : `/${user.id}/profile`}
              className="inline-block text-white bg-gradient-to-r from-purple-600 to-fuchsia-600 px-8 py-3 rounded-full text-md font-semibold shadow-lg hover:shadow-xl transition"
            >
              👤 My Account
            </Link>
          </div>
        ) : (
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
            Are you a salon owner?{" "}
            <Link href="/register" className="underline hover:text-fuchsia-600">
              Register your salon here.
            </Link>
          </p>
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
              transition={{
                duration: 0.4,
                ease: "easeOut",
                delay: index * 0.1,
              }}
              viewport={{ once: true }}
              className="transition-transform transform hover:scale-105"
            >
              <Link href={`/salons/${salon.salonId || salon._id}`} className="block h-full">
                <div className="bg-white dark:bg-gray-800 p-6 rounded-3xl shadow-2xl border border-gray-100 dark:border-rose-900 h-full flex flex-col justify-between">
                  <div className="w-full h-52 relative rounded-2xl overflow-hidden mb-4">
                    <Image
                      src={salon.imageUrl || "/placeholder-salon.jpg"}
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
