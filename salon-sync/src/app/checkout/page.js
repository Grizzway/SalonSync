'use client';

import { useSearchParams, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import Navbar from '@/components/Navbar';
import { Loader2 } from 'lucide-react';

export default function CheckoutPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const appointmentId = searchParams.get('appointmentId');

  const [appointment, setAppointment] = useState(null);
  const [loading, setLoading] = useState(true);
  const [paymentOption, setPaymentOption] = useState('half');

  useEffect(() => {
    if (!appointmentId) return;

    async function fetchAppointment() {
      const res = await fetch(`/api/appointments/view?appointmentId=${appointmentId}`);
      const data = await res.json();
      if (res.ok) setAppointment(data.appointment);
      else alert(data.message || 'Failed to load appointment');
      setLoading(false);
    }

    fetchAppointment();
  }, [appointmentId]);

  const handlePayment = async () => {
    if (!appointmentId || !appointment) return;

    const amount = paymentOption === 'half' ? appointment.price / 2 : appointment.price;

    const res = await fetch('/api/payment/update', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        appointmentId,
        paymentOption,
        amount,
      }),
    });

    if (res.ok) {
      alert('Payment processed successfully!');
      router.push('/dashboard/customer');  
    } else {
      const data = await res.json();
      alert(data.message || 'Failed to process payment');
    }
  };

  return (
    <div className="min-h-screen pt-24 px-6 bg-gradient-to-b from-violet-100 to-white dark:from-gray-900 dark:to-gray-800 text-gray-900 dark:text-white">
      <Navbar />
      <div className="max-w-xl mx-auto bg-white dark:bg-gray-800 p-8 rounded-xl shadow-xl border border-purple-300 dark:border-purple-700">
        <h1 className="text-3xl font-bold text-purple-700 dark:text-purple-300 mb-6 text-center">Checkout</h1>

        {loading ? (
          <div className="flex justify-center py-10">
            <Loader2 className="animate-spin h-8 w-8 text-purple-600" />
          </div>
        ) : (
          <>
            <p className="mb-4 text-gray-700 dark:text-gray-300">
              <strong>Service:</strong> {appointment.service}<br />
              <strong>Date:</strong> {appointment.date}<br />
              <strong>Time:</strong> {appointment.time}<br />
              <strong>Total:</strong> ${appointment.price}
            </p>

            <select
              value={paymentOption}
              onChange={(e) => setPaymentOption(e.target.value)}
              className="w-full p-2 mb-6 border rounded dark:bg-gray-700"
            >
              <option value="half">Pay Half Now</option>
              <option value="full">Pay Full Now</option>
            </select>

            <Button onClick={handlePayment} className="w-full bg-purple-600 text-white hover:bg-purple-700">
              Complete Payment
            </Button>
          </>
        )}
      </div>
    </div>
  );
}
