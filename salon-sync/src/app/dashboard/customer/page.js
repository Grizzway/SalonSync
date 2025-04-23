'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/app/context/AuthContext';
import Navbar from '@/components/Navbar';
import { Button } from '@/components/ui/button';

export default function CustomerDashboard() {
  const { user } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!user || user.type !== 'customer') {
      router.push('/');
    }
  }, [user]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-violet-100 to-white dark:from-gray-900 dark:to-gray-800 pt-20 text-gray-900 dark:text-white">
      <Navbar />
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <h1 className="text-4xl md:text-5xl font-extrabold text-center text-purple-700 dark:text-fuchsia-300 mb-12">
          Welcome, {user?.name?.split(' ')[0] || 'Guest'}!
        </h1>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Appointments Card */}
          <div className="rounded-2xl bg-white dark:bg-gray-800 shadow-2xl p-8 border border-purple-300 dark:border-purple-700 flex flex-col justify-between">
            <div>
              <h2 className="text-2xl font-semibold text-purple-700 dark:text-purple-200 mb-2">📋 My Appointments</h2>
              <p className="text-gray-600 dark:text-gray-400 mb-6">
                View your upcoming and past appointments here.
              </p>
            </div>
            <Button
              onClick={() => router.push('/dashboard/customer/appointments')}
              className="w-full bg-gradient-to-r from-purple-600 to-purple-700 text-white hover:from-purple-700 hover:to-purple-800 transition-all"
            >
              View Appointments
            </Button>
          </div>

          {/* Profile Edit Card */}
          <div className="rounded-2xl bg-white dark:bg-gray-800 shadow-2xl p-8 border border-fuchsia-300 dark:border-fuchsia-700 flex flex-col justify-between">
            <div>
              <h2 className="text-2xl font-semibold text-fuchsia-700 dark:text-fuchsia-200 mb-2">👤 Edit My Profile</h2>
              <p className="text-gray-600 dark:text-gray-400 mb-6">
                Update your name, email, bio, or password.
              </p>
            </div>
            <Button
              onClick={() => router.push('/dashboard/customer/edit')}
              className="w-full bg-gradient-to-r from-fuchsia-600 to-pink-600 text-white hover:from-fuchsia-700 hover:to-pink-700 transition-all"
            >
              Edit Profile
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
