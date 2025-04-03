"use client";
export const dynamic = "force-dynamic";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/app/context/AuthContext";
import Navbar from "@/components/Navbar";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { ChevronLeft, ChevronRight } from "lucide-react";
import TopRatedSalonsCarousel from "@/components/ui/TopRatedSalonsCarousel";

export default function Home() {
  const { user } = useAuth();
  const router = useRouter();
  const [topSalons, setTopSalons] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    if (user?.type === "employee") {
      router.push("/dashboard");
    }
  }, [user, router]);

  useEffect(() => {
    async function fetchTopSalons() {
      try {
        const response = await fetch("/api/salon/top-rated");
        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }
        const data = await response.json();
        console.log("Fetched Top Salons:", data); // Debugging log
        setTopSalons(data.salons.slice(0, 10)); // Show only top 10 in the carousel
      } catch (error) {
        console.error("Error fetching top-rated salons:", error);
      }
    }
    fetchTopSalons();
  }, []);

  const salonsPerPage = 4;

  const handleNext = () => {
    if (currentIndex + 1 <= topSalons.length - salonsPerPage) {
      setCurrentIndex(currentIndex + 1);
    }
  };

  const handlePrev = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
    }
  };

  return (
    <div className="relative min-h-screen bg-gradient-to-b from-blue-50 to-blue-200 dark:from-gray-900 dark:to-gray-800 text-gray-900 dark:text-white overflow-hidden">
      <Navbar />

      {/* Hero Section */}
      <motion.section
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="flex flex-col items-center justify-center text-center py-20 px-4 relative z-10"
      >
        <motion.h1
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.7, ease: "easeOut" }}
          className="text-4xl md:text-6xl lg:text-7xl font-extrabold leading-tight text-gray-800 dark:text-gray-200 drop-shadow-lg hover:scale-105 transition-all duration-300 ease-in-out"
        >
          Find & Book the Best Salons Near You
        </motion.h1>
        <motion.p
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.6 }}
          className="mt-4 text-lg text-gray-600 dark:text-gray-400"
        >
          Book your next appointment with ease and convenience.
        </motion.p>

        {/* Call-to-Action Buttons */}
        <div className="mt-8 flex flex-col md:flex-row space-y-4 md:space-y-0 md:space-x-6">
          <Link href="/salons">
            <Button className="bg-blue-600 hover:bg-blue-700 transition-all transform hover:scale-105 shadow-lg dark:shadow-blue-900">
              Browse Salons
            </Button>
          </Link>
          <Link href="/register">
            <Button className="bg-green-600 hover:bg-green-700 transition-all transform hover:scale-105 shadow-lg dark:shadow-green-900">
              Register Your Salon
            </Button>
          </Link>
        </div>
      </motion.section>

      {/* Top Rated Salons Carousel */}
      <TopRatedSalonsCarousel topSalons={topSalons} />
      </div>
)};
