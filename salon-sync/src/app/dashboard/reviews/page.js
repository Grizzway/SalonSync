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
  const [error, setError] = useState(null);

  const fetchReviews = async (salonId) => {
    try {
      const res = await fetch(`/api/reviews/${salonId}`);
      if (!res.ok) {
        throw new Error('Failed to fetch reviews');
      }

      const data = await res.json();
      setReviews(data.reviews || []);
    } catch (err) {
      console.error('Error fetching reviews:', err);
      setError('Failed to load reviews.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!user) {
      router.push('/'); 
      return;
    }

    if (user.salonId) {
      fetchReviews(user.salonId); 
    } else {
      setError('No salonId found for the logged-in user.');
      setLoading(false);
    }
  }, [user, router]);

  if (loading) {
    return <div className="flex justify-center items-center h-screen text-lg text-purple-600">Loading...</div>;
  }

  if (error) {
    return (
      <div className="flex justify-center items-center h-screen text-lg text-red-600">
        {error}
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 pt-20">
      <Navbar />
      <h2 className="text-2xl font-semibold text-gray-800 text-center mb-6">
        Reviews for {user.businessName}
      </h2>
      <div className="max-w-4xl mx-auto">
        {reviews.length === 0 ? (
          <p className="text-center text-gray-600">No reviews yet.</p>
        ) : (
          reviews.map((review) => (
            <div key={review._id} className="bg-white p-4 rounded-lg shadow-md mb-4">
              <div className="flex justify-between items-center">
                <p className="text-gray-800 font-semibold">
                  {review.customerDetails[0]?.name || 'Anonymous'}
                </p>
                <p className="text-yellow-500 font-bold">{'⭐'.repeat(review.rating)}</p>
              </div>
              <p className="text-gray-600 mt-2">{review.review}</p>
              <p className="text-gray-400 text-sm mt-2">
                {new Date(review.createdAt).toLocaleDateString()}
              </p>
            </div>
          ))
        )}
      </div>
    </div>
  );
}