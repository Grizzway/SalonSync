"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Image from "next/image";
import { Card } from "@/components/ui/card";
import Navbar from "@/components/Navbar.jsx";
import { FaStar, FaRegStar } from "react-icons/fa";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function SalonPage() {
  const { salonname } = useParams();
  const [salon, setSalon] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [averageRating, setAverageRating] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // 🔹 Placeholder stylists (Replace with real API data later)
  const stylists = [
    {
      id: 1,
      name: "Alex Johnson",
      specialty: "Balayage & Hair Coloring",
      image: "",
    },
    {
      id: 2,
      name: "Taylor Smith",
      specialty: "Men's Haircuts & Styling",
      image: "",
    },
    {
      id: 3,
      name: "Jamie Lee",
      specialty: "Bridal & Event Styling",
      image: "",
    },
  ];

  useEffect(() => {
    async function getSalonAndReviews() {
      try {
        const salonRes = await fetch(`/api/salon/${salonname}`);
        if (!salonRes.ok) throw new Error("Failed to load salon data");
        const salonData = await salonRes.json();

        const reviewsRes = await fetch(`/api/reviews/${salonname}`);
        const reviewsData = await reviewsRes.json();

        setSalon(salonData);
        setReviews(reviewsData.reviews || []);

        if (reviewsData.reviews.length > 0) {
          const totalRating = reviewsData.reviews.reduce((sum, review) => sum + review.rating, 0);
          const avgRating = totalRating / reviewsData.reviews.length;
          setAverageRating(avgRating);
        } else {
          setAverageRating(0);
        }
      } catch (err) {
        console.error("Fetch error:", err);
        setError("An unexpected error occurred");
      } finally {
        setLoading(false);
      }
    }
    getSalonAndReviews();
  }, [salonname]);

  const renderStars = (rating) => {
    return Array.from({ length: 5 }, (_, i) =>
      i < rating ? <FaStar key={i} className="text-yellow-500" /> : <FaRegStar key={i} className="text-gray-400" />
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-b from-blue-50 to-blue-200 dark:from-gray-900 dark:to-gray-800">
        <Navbar />
        <p className="text-lg text-gray-900 dark:text-white">Loading...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-b from-blue-50 to-blue-200 dark:from-gray-900 dark:to-gray-800">
        <Navbar />
        <p className="text-lg text-red-500">{error}</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-blue-200 dark:from-gray-900 dark:to-gray-800">
      <Navbar />

      {/* Salon Banner */}
      <div className="w-full h-64 relative bg-gray-300 flex justify-center items-center shadow-lg">
        {salon.banner ? (
          <Image src={salon.banner} alt="Salon Banner" layout="fill" objectFit="cover" className="opacity-90 rounded-md" />
        ) : (
          <p className="text-white text-2xl font-semibold">Salon Banner</p>
        )}
      </div>

      {/* 🔥 Salon Info Section (Now Above Stylists) */}
      <div className="max-w-4xl mx-auto mt-8 p-6 bg-white dark:bg-gray-800 shadow-xl rounded-2xl text-center border border-gray-300 dark:border-gray-700">
        <Card className="p-6">
          <div className="flex flex-col items-center">
            {salon.logo ? (
              <Image src={salon.logo} alt="Salon Logo" width={120} height={120} className="rounded-full shadow-md" />
            ) : (
              <div className="w-28 h-28 bg-gray-400 dark:bg-gray-600 rounded-full flex justify-center items-center text-white text-lg font-semibold">No Logo</div>
            )}
            <h2 className="text-3xl font-semibold mt-4 text-gray-800 dark:text-white">{salon.name}</h2>
            <p className="text-gray-600 dark:text-gray-300 mt-2">{salon.location || "Location not available"}</p>

            {/* ⭐ Dynamic Star Rating */}
            <div className="flex justify-center space-x-1 mt-2">{renderStars(Math.round(averageRating))}</div>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              {reviews.length > 0 ? `Average Rating: ${averageRating.toFixed(1)} / 5` : "No Ratings Yet"}
            </p>

            {/* Review Button */}
            <Link href={`/salons/${salonname}/review`}>
              <Button className="mt-4 bg-green-600 hover:bg-green-700 text-white py-2 px-6 rounded-lg shadow-md">
                Leave a Review
              </Button>
            </Link>
          </div>
        </Card>
      </div>

      {/* 🔹 Our Stylists Section (Below Salon Info) */}
      <div className="max-w-4xl mx-auto mt-12 p-6 bg-white dark:bg-gray-800 shadow-lg rounded-xl border border-gray-300 dark:border-gray-700">
        <h2 className="text-2xl font-semibold text-center text-gray-800 dark:text-white mb-6">Our Stylists</h2>
        <div className="flex flex-col space-y-6">
          {stylists.map((stylist) => (
            <Card key={stylist.id} className="flex flex-col items-center p-6 bg-gray-100 dark:bg-gray-900 rounded-lg shadow-md hover:shadow-lg">
              {/* Placeholder Image Box */}
              <div className="w-24 h-24 bg-gray-400 dark:bg-gray-600 rounded-full flex justify-center items-center shadow-md">
                {/* No text inside, just an empty box */}
              </div>
              <h3 className="text-xl font-semibold mt-3 text-gray-800 dark:text-white">{stylist.name}</h3>
              <p className="text-gray-600 dark:text-gray-400 mt-1">{stylist.specialty}</p>
              <Button className="mt-4 bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-lg shadow-md">
                Book Appointment
              </Button>
            </Card>
          ))}
        </div>
      </div>

      {/* Reviews Section */}
      <div className="max-w-4xl mx-auto mt-12 p-6 bg-white dark:bg-gray-800 shadow-lg rounded-xl border border-gray-300 dark:border-gray-700">
        <h2 className="text-2xl font-semibold text-center text-gray-800 dark:text-white mb-6">Customer Reviews</h2>
        {reviews.length === 0 ? (
          <p className="text-center text-gray-600 dark:text-gray-300">No reviews yet.</p>
        ) : (
          <div className="space-y-6">
            {reviews.map((review, index) => (
              <div key={index} className="p-4 border-b border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-900 rounded-lg shadow">
                <div className="flex items-center space-x-2">{renderStars(review.rating)}</div>
                <p className="mt-2 text-gray-900 dark:text-white">{review.review}</p>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">- Anonymous</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
