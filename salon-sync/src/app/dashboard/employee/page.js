'use client';

import { useAuth } from '@/app/context/AuthContext';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';

export default function EmployeeDashboard() {
  const { user } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!user || user.type !== 'employee') {
      router.push('/');
    }
  }, [user]);

  const handleViewSalon = () => {
    if (user?.salonIds?.length > 0) {
      router.push(`/salons/${user.salonIds[0]}`);
    }
  };

  const handleEditProfile = () => {
    router.push('/dashboard/employee/edit');
  };

  return (
    <div className="min-h-screen pt-24 px-6 bg-gradient-to-b from-violet-100 to-white dark:from-gray-900 dark:to-gray-800 text-gray-900 dark:text-white">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-extrabold text-center text-purple-700 dark:text-fuchsia-300 mb-8">
          Welcome, {user?.name?.split(' ')[0] || 'Stylist'}!
        </h1>

        <div className="grid gap-6 grid-cols-1 sm:grid-cols-2">
          {/* View Salon */}
          <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-xl border border-purple-200 dark:border-purple-700 flex flex-col justify-between">
            <h2 className="text-2xl font-semibold text-purple-700 dark:text-purple-200 mb-2">
              🏠 Your Salon
            </h2>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              See the salon profile you're linked to.
            </p>
            <Button onClick={handleViewSalon} className="w-full bg-purple-600 text-white hover:bg-purple-700">
              View Salon
            </Button>
          </div>

          {/* Edit Profile */}
          <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-xl border border-purple-200 dark:border-purple-700 flex flex-col justify-between">
            <h2 className="text-2xl font-semibold text-purple-700 dark:text-purple-200 mb-2">
              🛠 Edit Your Profile
            </h2>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              Update your bio, specialties, and profile picture.
            </p>
            <Button onClick={handleEditProfile} className="w-full bg-fuchsia-600 text-white hover:bg-fuchsia-700">
              Edit Profile
            </Button>
          </div>

          {/* Schedule Placeholder */}
          <div className="col-span-1 sm:col-span-2 bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-xl border border-purple-200 dark:border-purple-700">
            <h2 className="text-2xl font-semibold text-purple-700 dark:text-purple-200 mb-2">📅 Schedule</h2>
            <p className="text-gray-600 dark:text-gray-400 italic">
              Scheduling tools will be available soon. Stay tuned!
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

