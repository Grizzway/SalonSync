"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Navbar from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { FaStar } from "react-icons/fa";

export default function LeaveReviewPage() {
  const { salonId } = useParams(); 
  const router = useRouter();
  const [salon, setSalon] = useState(null);
  const [rating, setRating] = useState(0);
  const [review, setReview] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function fetchSalon() {
      try {
        const res = await fetch(`/api/salon/${salonId}`);
        if (!res.ok) throw new Error("Failed to fetch salon data");
        const data = await res.json();
        setSalon(data);
      } catch (err) {
        console.error(err);
        setError("Unable to load salon details.");
      }
    }
    fetchSalon();
  }, [salonId]);

  const handleRating = (selectedRating) => {
    setRating(selectedRating);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const cookies = document.cookie.split('; ');
    const userCookie = cookies.find(cookie => cookie.startsWith('user='));

    if (!userCookie) {
      setError("You must be logged in to leave a review.");
      setLoading(false);
      return;
    }

    const userData = JSON.parse(decodeURIComponent(userCookie.split('=')[1]));
    const customerId = userData?.id;

    if (!customerId) {
      setError("You must be logged in to leave a review.");
      setLoading(false);
      return;
    }

    try {
      const response = await fetch(`/api/reviews/${salonId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ rating, review, customerId }),
      });

      if (!response.ok) throw new Error("Failed to submit review");

      router.push(`/salons/${salonId}`);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-violet-100 via-purple-50 to-white dark:from-gray-900 dark:to-gray-800 p-6">
      <Navbar />
      <div className="max-w-2xl mx-auto mt-12 bg-white dark:bg-gray-800 shadow-xl rounded-3xl p-8 border border-purple-200 dark:border-purple-700">
        <h2 className="text-3xl font-extrabold text-purple-700 dark:text-purple-300 text-center mb-6">
          Leave a Review for {salon?.name || "Loading..."}
        </h2>

        {error && <p className="text-red-500 text-center mb-4">{error}</p>}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="flex justify-center space-x-2">
            {[1, 2, 3, 4, 5].map((star) => (
              <FaStar
                key={star}
                className={`cursor-pointer text-3xl ${star <= rating ? "text-yellow-500" : "text-gray-400"}`}
                onClick={() => handleRating(star)}
              />
            ))}
          </div>

          <Textarea
            value={review}
            onChange={(e) => setReview(e.target.value)}
            placeholder="Write your review here..."
            className="w-full p-3 border border-purple-300 dark:border-purple-600 rounded-lg focus:ring-2 focus:ring-purple-400 focus:border-purple-400 dark:bg-gray-700 dark:text-white"
            required
          />

          <Button
            type="submit"
            className="w-full bg-gradient-to-r from-purple-500 to-fuchsia-500 hover:from-purple-600 hover:to-fuchsia-600 text-white py-3 rounded-lg shadow-md"
            disabled={loading}
          >
            {loading ? "Submitting..." : "Submit Review"}
          </Button>
        </form>
      </div>
    </div>
  );
}