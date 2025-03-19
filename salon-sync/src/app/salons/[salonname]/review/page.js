"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Navbar from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { FaStar } from "react-icons/fa";

export default function LeaveReviewPage() {
  const { salonname } = useParams();
  const router = useRouter();
  const [rating, setRating] = useState(0);
  const [review, setReview] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleRating = (selectedRating) => {
    setRating(selectedRating);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/reviews/${salonname}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ rating, review }),
      });

      if (!response.ok) {
        throw new Error("Failed to submit review");
      }

      router.push(`/salons/${salonname}`);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-blue-200 dark:from-gray-900 dark:to-gray-800 p-6">
      <Navbar />
      <div className="max-w-2xl mx-auto mt-12 bg-white dark:bg-gray-800 shadow-lg rounded-xl p-6 border border-gray-300 dark:border-gray-700">
        <h2 className="text-3xl font-semibold text-gray-800 dark:text-white text-center mb-6">
          Leave a Review for {salonname.replace(/-/g, " ")}
        </h2>

        {error && <p className="text-red-500 text-center mb-4">{error}</p>}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Star Rating */}
          <div className="flex justify-center space-x-2">
            {[1, 2, 3, 4, 5].map((star) => (
              <FaStar
                key={star}
                className={`cursor-pointer text-3xl ${star <= rating ? "text-yellow-500" : "text-gray-400"}`}
                onClick={() => handleRating(star)}
              />
            ))}
          </div>

          {/* Review Textarea */}
          <Textarea
            value={review}
            onChange={(e) => setReview(e.target.value)}
            placeholder="Write your review here..."
            className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:text-white"
            required
          />

          {/* Submit Button */}
          <Button
            type="submit"
            className="w-full bg-green-600 hover:bg-green-700 text-white py-3 rounded-lg transition-all"
            disabled={loading}
          >
            {loading ? "Submitting..." : "Submit Review"}
          </Button>
        </form>
      </div>
    </div>
  );
}
