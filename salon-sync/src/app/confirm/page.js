'use client';

import { Suspense, useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Navbar from '@/components/Navbar';
import { Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';

// Default export wrapped in Suspense
export default function ConfirmPageWrapper() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-violet-100 to-white dark:from-gray-900 dark:to-gray-800">
        <Navbar />
        <Loader2 className="h-10 w-10 animate-spin text-purple-600" />
      </div>
    }>
      <ConfirmPage />
    </Suspense>
  );
}

// Main page logic in its own component
export function ConfirmPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const appointmentId = searchParams.get('appointmentId');

  const [appointment, setAppointment] = useState(null);
  const [loading, setLoading] = useState(true);

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

  const handleContinue = () => {
    router.push(`/checkout?appointmentId=${appointmentId}`);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-violet-100 to-white dark:from-gray-900 dark:to-gray-800">
        <Navbar />
        <Loader2 className="h-10 w-10 animate-spin text-purple-600" />
      </div>
    );
  }

  if (!appointment) {
    return (
      <div className="min-h-screen flex items-center justify-center text-red-500 bg-gradient-to-b from-violet-100 to-white dark:from-gray-900 dark:to-gray-800">
        <Navbar />
        <p>Appointment not found.</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-24 px-6 bg-gradient-to-b from-violet-100 to-white dark:from-gray-900 dark:to-gray-800 text-gray-900 dark:text-white">
      <Navbar />
      <div className="max-w-2xl mx-auto bg-white dark:bg-gray-800 p-8 rounded-xl shadow-xl border border-purple-300 dark:border-purple-700">
        <h1 className="text-3xl font-bold text-purple-700 dark:text-purple-300 mb-6 text-center">Confirm Appointment</h1>

        <div className="space-y-4">
          <p><strong>Service:</strong> {appointment.service}</p>
          <p><strong>Date:</strong> {appointment.date}</p>
          <p><strong>Time:</strong> {appointment.time}</p>
          <p><strong>Duration:</strong> {appointment.duration} minutes</p>
          <p><strong>Total:</strong> ${appointment.price}</p>
          <p><strong>Payment:</strong> {appointment.status === 'Booked' ? 'Pending' : appointment.status}</p>
        </div>

        <Button onClick={handleContinue} className="mt-8 w-full bg-purple-600 text-white hover:bg-purple-700">
          Proceed to Payment
        </Button>
      </div>
    </div>
  );
}
