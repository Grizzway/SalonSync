"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/app/context/AuthContext';
import { Card, CardHeader, CardTitle } from '@/components/ui/card';
import Navbar from '@/components/Navbar';

export default function Payments() {
  const { user } = useAuth();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [payments, setPayments] = useState([]);
  const [error, setError] = useState(null);

  const fetchPayments = async (salonId) => {
    try {
      const res = await fetch(`/api/payment?salonId=${salonId}`);
      if (!res.ok) {
        throw new Error('Failed to fetch payments');
      }

      const data = await res.json();
      setPayments(data.payments || []);
    } catch (err) {
      console.error('Error fetching payments:', err);
      setError('Failed to load payments.');
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
      fetchPayments(user.salonId); 
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
    <div className="min-h-screen bg-gradient-to-b from-violet-100 via-purple-50 to-white dark:from-gray-900 dark:to-gray-800">
      <Navbar />
      <div className="max-w-3xl mx-auto mt-6 p-6 bg-white dark:bg-gray-800 shadow-xl rounded-3xl border border-purple-200 dark:border-purple-700">
        <h2 className="text-3xl font-extrabold text-purple-700 dark:text-purple-300 text-center mb-6">
          Payment History
        </h2>
        <div className="flex flex-col space-y-4">
          {payments.length > 0 ? (
            payments.map((payment) => (
              <Card key={payment._id} className="bg-white dark:bg-gray-700 shadow-md hover:shadow-lg transition">
                <CardHeader>
                  <CardTitle>Payment ID: {payment._id}</CardTitle>
                </CardHeader>
                <div className="p-4">
                  <p><strong>Customer Name:</strong> {payment.customerDetails[0]?.name || 'N/A'}</p>
                  <p><strong>Employee Name:</strong> {payment.employeeDetails[0]?.name || 'N/A'}</p>
                  <p><strong>Cost:</strong> ${payment.cost.toFixed(2)}</p>
                  <p><strong>Payment Method:</strong> {payment.paymentMethod}</p>
                </div>
              </Card>
            ))
          ) : (
            <p className="text-center text-gray-500">No payments found for this salon.</p>
          )}
        </div>
      </div>
    </div>
  );
}