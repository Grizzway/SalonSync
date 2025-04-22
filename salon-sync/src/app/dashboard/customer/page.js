'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/app/context/AuthContext';
import { Button } from '@/components/ui/button';
import Navbar from '@/components/Navbar';

export default function CustomerDashboard() {
  const { user } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!user || user.type !== 'customer') {
      router.push('/');
    }
  }, [user]);

  return (
    <div className="min-h-screen pt-24 px-6 bg-gradient-to-b from-violet-100 to-white dark:from-gray-900 dark:to-gray-800 text-gray-900 dark:text-white">
      <Navbar/>
      <div className="max-w-3xl mx-auto text-center">
        <h1 className="text-4xl font-extrabold text-purple-700 dark:text-fuchsia-300 mb-10">
          Welcome, {user?.name?.split(' ')[0] || 'Guest'}!
        </h1>

        <div className="grid gap-6">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-xl border border-purple-300 dark:border-purple-700">
            <h2 className="text-2xl font-semibold text-purple-700 dark:text-purple-200 mb-2">📋 My Appointments</h2>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              View your upcoming and past appointments here.
            </p>
            <Button
              onClick={() => router.push('/dashboard/customer/appointments')}
              className="w-full bg-purple-600 text-white hover:bg-purple-700"
            >
              View Appointments
            </Button>
          </div>

          {/* future profile editing */}
          {/* <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-xl border border-purple-300 dark:border-purple-700">
            <h2 className="text-2xl font-semibold text-purple-700 dark:text-purple-200 mb-2">👤 Edit My Profile</h2>
            <p className="text-gray-600 dark:text-gray-400 mb-4">Update your profile and contact info.</p>
            <Button className="w-full bg-fuchsia-600 text-white hover:bg-fuchsia-700">Edit Profile</Button>
          </div> */}
        </div>
      </div>
    </div>
  );
}
