'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/app/context/AuthContext';

export default function CustomerAppointmentsPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user || user.type !== 'customer') {
      router.push('/');
    } else {
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
  
      fetchAppointments();
    }
  }, [user]);
  

  if (loading) {
    return (
      <div className="pt-32 text-center text-purple-600 dark:text-purple-300">
        Loading your appointments...
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-24 px-6 bg-gradient-to-b from-violet-100 to-white dark:from-gray-900 dark:to-gray-800 text-gray-900 dark:text-white">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-4xl font-extrabold text-center text-purple-700 dark:text-fuchsia-300 mb-10">
          My Appointments
        </h1>

        {appointments.length === 0 ? (
          <p className="text-center text-gray-500 dark:text-gray-400">You haven’t booked any appointments yet.</p>
        ) : (
          <ul className="space-y-6">
            {appointments.map((apt) => (
              <li
                key={apt._id}
                className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow border border-purple-200 dark:border-purple-700"
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
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
