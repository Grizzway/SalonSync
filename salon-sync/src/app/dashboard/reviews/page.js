'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/app/context/AuthContext';
import Navbar from '@/components/Navbar';

export default function ReviewsPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      router.push('/');
    } else {
      fetchReviews();
    }
  }, [user, router]);

  const fetchReviews = async () => {
    try {
      const res = await fetch(`/api/reviews/${user.businessName}`);
      const data = await res.json();
      setReviews(data.reviews);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching reviews:', error);
      setLoading(false);
    }
  };

  if (loading) return <div className="flex justify-center items-center h-screen text-lg">Loading...</div>;

  return (
    <div>
    <Navbar />
    <div className="min-h-screen bg-gray-100 p-6">
      <h2 className="text-2xl font-semibold text-gray-800 text-center mb-6">Reviews for {user.businessName}</h2>
      <div className="max-w-4xl mx-auto">
        {reviews.length === 0 ? (
          <p className="text-center text-gray-600">No reviews yet.</p>
        ) : (
          reviews.map((review) => (
            <div key={review.id} className="bg-white p-4 rounded-lg shadow-md mb-4">
              <p className="text-gray-800">{review.content}</p>
              <p className="text-gray-600 text-sm">- {review.author}</p>
            </div>
          ))
        )}
      </div>
    </div>
    </div>
  );
}