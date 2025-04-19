'use client';

import { useSearchParams, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Loader2 } from 'lucide-react';
import Navbar from '@/components/Navbar';
import { Button } from '@/components/ui/button';

export default function CheckoutPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const appointmentId = searchParams.get('appointmentId');

  const [appointment, setAppointment] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const fetchAppointment = async () => {
      if (!appointmentId) return;
      const res = await fetch(`/api/appointments/view?appointmentId=${appointmentId}`);
      const data = await res.json();
      setAppointment(data.appointment);
      setLoading(false);
    };
    fetchAppointment();
  }, [appointmentId]);

  const handlePayment = async () => {
    setSubmitting(true);
    const res = await fetch('/api/payments/update', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        appointmentId,
        amount: appointment.price,
        paymentOption: 'Paid', // Assume full payment on checkout
      }),
    });

    const data = await res.json();
    setSubmitting(false);

    if (res.ok) {
      alert('Payment complete! 🎉');
      router.push('/dashboard'); // You can adjust this as needed
    } else {
      alert(data.message || 'Payment failed');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-violet-100 to-white dark:from-gray-900 dark:to-gray-800">
        <Navbar />
        <Loader2 className="animate-spin h-10 w-10 text-purple-600" />
      </div>
    );
  }

  if (!appointment) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-violet-100 to-white dark:from-gray-900 dark:to-gray-800 text-red-500">
        <Navbar />
        <p>Appointment not found.</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-24 px-6 bg-gradient-to-b from-violet-100 to-white dark:from-gray-900 dark:to-gray-800 text-gray-900 dark:text-white">
      <Navbar />
      <div className="max-w-2xl mx-auto bg-white dark:bg-gray-800 p-8 rounded-xl shadow-xl border border-purple-300 dark:border-purple-700">
        <h1 className="text-3xl font-bold text-center text-purple-700 dark:text-purple-300 mb-6">
          Checkout
        </h1>

        <div className="space-y-4">
          <p><strong>Service:</strong> {appointment.service}</p>
          <p><strong>Date:</strong> {appointment.date}</p>
          <p><strong>Time:</strong> {appointment.time}</p>
          <p><strong>Amount Due:</strong> ${appointment.price}</p>
        </div>

        <Button
          onClick={handlePayment}
          disabled={submitting}
          className="mt-8 w-full bg-green-600 text-white hover:bg-green-700"
        >
          {submitting ? <Loader2 className="animate-spin h-5 w-5" /> : 'Pay Now'}
        </Button>
      </div>
    </div>
  );
}
