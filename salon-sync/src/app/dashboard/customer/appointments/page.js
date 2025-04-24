'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/app/context/AuthContext';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Trash2 } from 'lucide-react';
import Navbar from '@/components/Navbar';

export default function CustomerAppointmentsPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);

  const [showDialog, setShowDialog] = useState(false);
  const [cancelTargetId, setCancelTargetId] = useState(null);

  const fetchAppointments = async () => {
    try {
      const res = await fetch(`/api/appointments/customer?customerId=${user.id}`);
      const data = await res.json();
      setAppointments(data.appointments || []);
    } catch (err) {
      console.error('Failed to load appointments:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!user || user.type !== 'customer') {
      router.push('/');
    } else {
      fetchAppointments();
    }
  }, [user]);

  const handleCancel = async () => {
    try {
      await fetch(`/api/appointments/customer?appointmentId=${cancelTargetId}`, {
        method: 'DELETE',
      });
      setShowDialog(false);
      fetchAppointments();
    } catch (err) {
      console.error('Failed to cancel appointment:', err);
    }
  };

  if (loading) {
    return (
      <div className="pt-32 text-center text-purple-600 dark:text-purple-300">
        Loading your appointments...
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-24 px-6 bg-gradient-to-b from-violet-100 to-white dark:from-gray-900 dark:to-gray-800 text-gray-900 dark:text-white">
      <Navbar/>
      <div className="max-w-3xl mx-auto">
        <h1 className="text-4xl font-extrabold text-center text-purple-700 dark:text-fuchsia-300 mb-10">
          My Appointments
        </h1>

        {appointments.length === 0 ? (
          <p className="text-center text-gray-500 dark:text-gray-400">You haven't booked any appointments yet.</p>
        ) : (
          <ul className="space-y-6">
            {appointments.map((apt) => (
              <li
                key={apt._id}
                className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow border border-purple-200 dark:border-purple-700 relative"
              >
                <h2 className="text-xl font-bold text-purple-700 dark:text-purple-300">{apt.service}</h2>
                <p className="text-sm text-gray-600 dark:text-gray-400">With {apt.employeeName}</p>
                <p className="mt-2 text-gray-700 dark:text-gray-300">
                  {apt.date} at {apt.time} · {apt.duration} minutes
                </p>
                <p className="text-gray-600 dark:text-gray-400">Price: ${apt.price}</p>
                <p
                  className={`mt-2 text-sm font-semibold ${
                    apt.status === 'Confirmed' ? 'text-green-600' : 'text-yellow-600'
                  }`}
                >
                  Status: {apt.status}
                </p>

                {/* Cancel Button */}
                <button
                  onClick={() => {
                    setCancelTargetId(apt.appointmentId);
                    setShowDialog(true);
                  }}
                  className="absolute top-4 right-4 text-red-600 hover:text-red-800"
                  title="Cancel Appointment"
                >
                  <Trash2 className="w-6 h-6" />
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Cancel Confirmation Dialog */}
      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent className="max-w-md text-center animate-fade-in">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold text-red-600">Cancel Appointment?</DialogTitle>
            <p className="text-sm mt-2 text-gray-700 dark:text-gray-300">
              Are you sure you want to cancel this appointment?<br />
              If you paid half, this will be kept as a cancellation fee.<br />
              If you paid in full, you will be refunded 50%.
            </p>
          </DialogHeader>

          <div className="mt-6 flex justify-center gap-4">
            <Button onClick={handleCancel}>Yes</Button>
            <Button
              onClick={() => setShowDialog(false)}
              className="bg-red-600 text-white hover:bg-red-700"
            >
              No
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
