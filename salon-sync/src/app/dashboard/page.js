"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/app/context/AuthContext';
import { Card, CardHeader, CardTitle } from '@/components/ui/card';
import Navbar from '@/components/Navbar';

export default function Dashboard() {
  const { user, logout } = useAuth();
  const router = useRouter();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      router.push('/');
    } else {
      setLoading(false);
    }
  }, [user, router]);

  const handleLogout = () => {
    logout();
    router.push('/login');
  };

  const toggleDropdown = () => {
    setDropdownOpen(!dropdownOpen);
  };

  if (loading) return <div className="flex justify-center items-center h-screen text-lg">Loading...</div>;

  const customerOptions = [
    { title: 'Modify Profile', path: '/dashboard/profile' },
    { title: 'View Appointments', path: '/dashboard/appointments' },
    { title: 'Check Inbox', path: '/dashboard/inbox' },
    { title: 'See Past Reviews', path: '/dashboard/reviews' },
  ];

  const businessOptions = [
    { title: 'Modify Business Page', path: '/dashboard/business' },
    { title: 'Client Schedule', path: '/dashboard/schedule' },
    { title: 'Employees', path: '/dashboard/employees' },
    { title: 'Payment History', path: '/dashboard/payments' },
    { title: 'Reviews', path: '/dashboard/reviews' },
  ];

  const options = user?.type === 'business' ? businessOptions : customerOptions;

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-blue-200 dark:from-gray-900 dark:to-gray-800">
      <Navbar />
      {/* Dashboard Grid */}
      <div className="max-w-3xl mx-auto mt-6 p-6 bg-white dark:bg-gray-800 shadow-xl rounded-2xl border border-gray-200 dark:border-gray-700">
        <h2 className="text-3xl font-semibold text-gray-800 dark:text-gray-200 text-center mb-6">
          Welcome, {user?.name}!
        </h2>
        <div className="flex flex-col space-y-4">
          {options.map((option) => (
            <Card
              key={option.path}
              className="cursor-pointer hover:shadow-lg transition transform hover:scale-[1.02] p-6 text-center bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg"
              onClick={() => router.push(option.path)}
            >
              <CardHeader>
                <CardTitle className="text-lg font-medium text-gray-800 dark:text-gray-200">{option.title}</CardTitle>
              </CardHeader>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}

