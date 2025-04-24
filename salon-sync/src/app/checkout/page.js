'use client';

import { useSearchParams, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import Navbar from '@/components/Navbar';
import { Loader2 } from 'lucide-react';

export default function CheckoutPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const appointmentId = searchParams.get('appointmentId');

  const [appointment, setAppointment] = useState(null);
  const [payment, setPayment] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!appointmentId) return;

    async function fetchAppointmentAndPayment() {
      try {
        const appointmentRes = await fetch(`/api/appointments/view?appointmentId=${appointmentId}`);
        const appointmentData = await appointmentRes.json();

        if (!appointmentRes.ok) {
          alert(appointmentData.message || 'Failed to load appointment');
          return;
        }

        setAppointment(appointmentData.appointment);

        const salonId = appointmentData.appointment.salonId;
        const paymentRes = await fetch(`/api/payment?salonId=${salonId}`);
        const paymentData = await paymentRes.json();

        if (paymentRes.ok) {
          console.log('Available payments:', paymentData.payments);
          console.log('Looking for appointmentId:', appointmentData.appointment.appointmentId);
        
          const match = paymentData.payments.find(
            (p) => Number(p.appointmentId) === Number(appointmentData.appointment.appointmentId)
          );
        
          console.log('Matched payment:', match);
          setPayment(match);
        }
      } catch (err) {
        console.error('Error loading data:', err);
      } finally {
        setLoading(false);
      }
    }

    fetchAppointmentAndPayment();
  }, [appointmentId]);

  const handlePayment = async () => {
    alert('Payment processed successfully!');
    router.push('/dashboard/customer');
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
              <strong>Payment Option:</strong> {payment?.paymentMethod || 'Unknown'}<br />
              <strong>Amount to be Paid:</strong> {payment?.paid || 'Unknown'}<br />
              <strong>Total:</strong> ${appointment.price}<br />
            </p>

            <Button onClick={handlePayment} className="w-full bg-purple-600 text-white hover:bg-purple-700">
              Complete Payment
            </Button>
          </>
        )}
      </div>
    </div>
  );
}
