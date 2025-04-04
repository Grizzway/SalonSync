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
  const { salonId } = useParams();
  const { user } = useAuth();
  const [salon, setSalon] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [averageRating, setAverageRating] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

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

        const reviewsArray = Array.isArray(reviewsData.reviews) ? reviewsData.reviews : [];
        setSalon(salonData);
        setReviews(reviewsArray);

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
  }, [salonId]);

  const renderStars = (rating) => {
    return Array.from({ length: 5 }, (_, i) =>
      i < rating ? <FaStar key={i} className="text-yellow-500" /> : <FaRegStar key={i} className="text-gray-400" />
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-b from-violet-100 via-purple-50 to-white dark:from-gray-900 dark:to-gray-800">
        <Navbar />
        <p className="text-lg text-purple-600 dark:text-purple-300">Loading...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-b from-violet-100 via-purple-50 to-white dark:from-gray-900 dark:to-gray-800">
        <Navbar />
        <p className="text-lg text-red-500">{error}</p>
      </div>
    );
  }

  const isSalonUser = user?.type === 'business';
  const isCurrentSalon = isSalonUser && user?.businessName === salon.name;

  return (
    <div className="min-h-screen bg-gradient-to-b from-violet-100 via-purple-50 to-white dark:from-gray-900 dark:to-gray-800">
      <Navbar />

      <div className="w-full h-64 relative bg-gray-300 flex justify-center items-center shadow-md">
        {salon.banner ? (
          <Image src={salon.banner} alt="Salon Banner" layout="fill" objectFit="cover" className="opacity-90 rounded-md" />
        ) : (
          <p className="text-white text-2xl font-semibold">Salon Banner</p>
        )}
      </div>

      <div className="max-w-4xl mx-auto mt-8 p-6 bg-white dark:bg-gray-800 shadow-xl rounded-3xl text-center border border-purple-200 dark:border-purple-700">
        <Card className="p-6">
          <div className="flex flex-col items-center">
            {salon.logo ? (
              <Image src={salon.logo} alt="Salon Logo" width={120} height={120} className="rounded-full shadow-md" />
            ) : (
              <div className="w-28 h-28 bg-gray-400 dark:bg-gray-600 rounded-full flex justify-center items-center text-white text-lg font-semibold">No Logo</div>
            )}
            <h2 className="text-3xl font-extrabold mt-4 text-purple-700 dark:text-purple-300">{salon.name}</h2>
            <p className="text-gray-600 dark:text-gray-300 mt-2">{salon.address || "Location not available"}</p>
            <div className="flex justify-center space-x-1 mt-2">{renderStars(Math.round(averageRating))}</div>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              {reviews.length > 0 ? `Average Rating: ${averageRating.toFixed(1)} / 5` : "No Ratings Yet"}
            </p>

            {!isCurrentSalon && !isSalonUser && (
              <Link href={`/salons/${salonId}/review`}>
                <Button className="mt-4 bg-gradient-to-r from-purple-500 to-fuchsia-500 hover:from-purple-600 hover:to-fuchsia-600 text-white py-2 px-6 rounded-lg shadow-md">
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

      <div className="max-w-4xl mx-auto mt-12 p-6 bg-white dark:bg-gray-800 shadow-lg rounded-3xl border border-purple-200 dark:border-purple-700">
        <h2 className="text-2xl font-semibold text-center text-purple-700 dark:text-purple-300 mb-6">Our Stylists</h2>
        <div className="flex flex-col space-y-6">
          {stylists.map((stylist) => (
            <Card key={stylist.id} className="flex flex-col items-center p-6 bg-purple-50 dark:bg-gray-900 rounded-xl shadow-md hover:shadow-lg">
              <div className="w-24 h-24 bg-gray-400 dark:bg-gray-600 rounded-full flex justify-center items-center shadow-md"></div>
              <h3 className="text-xl font-semibold mt-3 text-gray-800 dark:text-white">{stylist.name}</h3>
              <p className="text-gray-600 dark:text-gray-400 mt-1">{stylist.specialty}</p>
              <Button className="mt-4 bg-gradient-to-r from-purple-500 to-fuchsia-500 hover:from-purple-600 hover:to-fuchsia-600 text-white py-2 px-4 rounded-lg shadow-md">
                Book Appointment
              </Button>
            </Card>
          ))}
        </div>
      </div>

      <div className="max-w-4xl mx-auto mt-12 p-6 bg-white dark:bg-gray-800 shadow-lg rounded-3xl border border-purple-200 dark:border-purple-700">
        <h2 className="text-2xl font-semibold text-center text-purple-700 dark:text-purple-300 mb-6">Customer Reviews</h2>
        <div className="space-y-6">
          {reviews.map((review, index) => (
            <div key={review._id || index} className="bg-purple-50 dark:bg-gray-700 p-4 rounded-xl shadow-md">
              <div className="flex items-center space-x-3">
                <p className="font-semibold text-gray-800 dark:text-white">{review.customerName}</p>
                <div className="flex items-center space-x-1">{renderStars(review.rating)}</div>
              </div>
              <p className="mt-2 text-gray-600 dark:text-gray-300">{review.review}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}