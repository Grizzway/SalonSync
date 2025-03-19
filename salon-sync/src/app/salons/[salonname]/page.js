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
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

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
      <div className="min-h-screen flex flex-col items-center justify-center">
        <Navbar />
        <p className="text-lg">Loading...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center">
        <Navbar />
        <p className="text-lg text-red-500">{error}</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <Navbar />
      {/* Salon Banner */}
      <div className="w-full h-56 relative bg-gray-300 flex justify-center items-center">
        {salon.banner ? (
          <Image src={salon.banner} alt="Salon Banner" layout="fill" objectFit="cover" className="opacity-90" />
        ) : (
          <p className="text-white text-2xl">Default Banner</p>
        )}
      </div>

      {/* Salon Info */}
      <div className="max-w-4xl mx-auto mt-8 p-6 bg-white shadow-xl rounded-2xl text-center">
        <Card className="p-6">
          <div className="flex flex-col items-center">
            {salon.logo ? (
              <Image src={salon.logo} alt="Salon Logo" width={120} height={120} className="rounded-full shadow-md" />
            ) : (
              <div className="w-28 h-28 bg-gray-400 rounded-full flex justify-center items-center text-white text-lg font-semibold">No Logo</div>
            )}
            <h2 className="text-3xl font-semibold mt-4">{salon.name}</h2>
            <p className="text-gray-600 mt-2">{salon.location || "Location not available"}</p>

            {/* Review Button */}
            <Link href={`/salons/${salonname}/review`}>
  <Button className="mt-4 bg-green-600 hover:bg-green-700 text-white py-2 px-4 rounded-lg">
    Leave a Review
  </Button>
</Link>
          </div>
        </Card>
      </div>

      {/* Reviews Section */}
      <div className="max-w-4xl mx-auto mt-12 p-6 bg-white shadow-lg rounded-xl">
        <h2 className="text-2xl font-semibold text-center mb-6">Customer Reviews</h2>
        {reviews.length === 0 ? (
          <p className="text-center text-gray-600">No reviews yet.</p>
        ) : (
          reviews.map((review, index) => (
            <div key={index} className="p-4 border-b border-gray-300">
              <div className="flex items-center space-x-2">{renderStars(review.rating)}</div>
              <p className="mt-2">{review.review}</p>
              <p className="text-sm text-gray-600 mt-1">- Anonymous</p>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
