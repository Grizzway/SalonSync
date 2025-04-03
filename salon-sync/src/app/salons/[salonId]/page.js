"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Image from "next/image";
import { Card } from "@/components/ui/card";
import Navbar from "@/components/Navbar.jsx";
import { FaStar, FaRegStar } from "react-icons/fa";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { useAuth } from "@/app/context/AuthContext";

export default function SalonPage() {
  const { salonId } = useParams();  // Use salonId here
  const { user } = useAuth(); // Get the logged-in user info
  const [salon, setSalon] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [averageRating, setAverageRating] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Placeholder stylists (Replace with real API data later)
  const stylists = [
    { id: 1, name: "Alex Johnson", specialty: "Balayage & Hair Coloring" },
    { id: 2, name: "Taylor Smith", specialty: "Men's Haircuts & Styling" },
    { id: 3, name: "Jamie Lee", specialty: "Bridal & Event Styling" },
  ];

  useEffect(() => {
    async function getSalonAndReviews() {
      try {
        const salonRes = await fetch(`/api/salon/${salonId}`);
        if (!salonRes.ok) throw new Error("Failed to load salon data");
        const salonData = await salonRes.json();
  
        const reviewsRes = await fetch(`/api/reviews/${salonId}`);
        if (!reviewsRes.ok) throw new Error("Failed to load reviews data");
        const reviewsData = await reviewsRes.json();
  
        console.log("Fetched reviews data:", reviewsData);
  
        // Ensure reviewsData.reviews is an array
        const reviewsArray = Array.isArray(reviewsData.reviews) ? reviewsData.reviews : [];
        setSalon(salonData);
        setReviews(reviewsArray);
  
        // Only calculate the rating if reviewsArray is not empty
        if (reviewsArray.length > 0) {
          const totalRating = reviewsArray.reduce((sum, review) => sum + review.rating, 0);
          const avgRating = totalRating / reviewsArray.length;
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
  }, [salonId]);  // Now using 'salonId'

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

  // Check if the logged-in user is a salon and if the salon matches the logged-in user's salon
  const isSalonUser = user?.type === 'business';
  const isCurrentSalon = isSalonUser && user?.businessName === salon.name;

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

      {/* Salon Info Section */}
      <div className="max-w-4xl mx-auto mt-8 p-6 bg-white dark:bg-gray-800 shadow-xl rounded-2xl text-center border border-gray-300 dark:border-gray-700">
        <Card className="p-6">
          <div className="flex flex-col items-center">
            {salon.logo ? (
              <Image src={salon.logo} alt="Salon Logo" width={120} height={120} className="rounded-full shadow-md" />
            ) : (
              <div className="w-28 h-28 bg-gray-400 dark:bg-gray-600 rounded-full flex justify-center items-center text-white text-lg font-semibold">No Logo</div>
            )}
            <h2 className="text-3xl font-semibold mt-4 text-gray-800 dark:text-white">{salon.name}</h2>
            <p className="text-gray-600 dark:text-gray-300 mt-2">{salon.address || "Location not available"}</p>

            {/* ⭐ Dynamic Star Rating */}
            <div className="flex justify-center space-x-1 mt-2">{renderStars(Math.round(averageRating))}</div>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              {reviews.length > 0 ? `Average Rating: ${averageRating.toFixed(1)} / 5` : "No Ratings Yet"}
            </p>

            {/* Review Button */}
            {!isCurrentSalon && !isSalonUser && (
              <Link href={`/salons/${salonId}/review`}>
                <Button className="mt-4 bg-green-600 hover:bg-green-700 text-white py-2 px-6 rounded-lg shadow-md">
                  Leave a Review
                </Button>
              </Link>
            )}
            {isSalonUser && isCurrentSalon && (
              <p className="mt-4 text-gray-500 dark:text-gray-400">Salon owners cannot leave reviews for their own salon.</p>
            )}
          </div>
        </Card>
      </div>

      {/* Stylists Section */}
      <div className="max-w-4xl mx-auto mt-12 p-6 bg-white dark:bg-gray-800 shadow-lg rounded-xl border border-gray-300 dark:border-gray-700">
        <h2 className="text-2xl font-semibold text-center text-gray-800 dark:text-white mb-6">Our Stylists</h2>
        <div className="flex flex-col space-y-6">
          {stylists.map((stylist) => (
            <Card key={stylist.id} className="flex flex-col items-center p-6 bg-gray-100 dark:bg-gray-900 rounded-lg shadow-md hover:shadow-lg">
              <div className="w-24 h-24 bg-gray-400 dark:bg-gray-600 rounded-full flex justify-center items-center shadow-md"></div>
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
        <div className="space-y-6">
          {reviews.map((review, index) => (
            <div key={review._id || index} className="bg-gray-100 dark:bg-gray-700 p-4 rounded-lg shadow-md">
              <div className="flex items-center space-x-3">
                <p className="font-semibold text-gray-800 dark:text-white">{review.customerName}</p> {/* Display customer name */}
                <div className="flex items-center space-x-1">{renderStars(review.rating)}</div>
              </div>
              <p className="mt-2 text-gray-600 dark:text-gray-300">{review.review}</p> {/* Display review */}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
