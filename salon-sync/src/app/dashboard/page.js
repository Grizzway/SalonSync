'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/app/context/AuthContext';
import { Card, CardHeader, CardTitle } from '@/components/ui/card';

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
  ];

  const options = user?.type === 'business' ? businessOptions : customerOptions;

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Navbar */}
      <nav className="bg-white shadow-md p-4 flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-800">SalonSync</h1>
        <div className="relative">
          <button onClick={toggleDropdown} className="bg-gray-200 px-4 py-2 rounded-lg">
            {user?.name}
          </button>
          {dropdownOpen && (
            <div className="absolute right-0 mt-2 bg-white shadow-lg rounded-lg w-48">
              <button onClick={() => router.push('/dashboard')} className="w-full px-4 py-2 text-left">Dashboard</button>
              {user?.type === 'business' && (
                <button onClick={() => router.push('/business')} className="w-full px-4 py-2 text-left">My Business</button>
              )}
              <button onClick={handleLogout} className="w-full px-4 py-2 text-left">Logout</button>
            </div>
          )}
        </div>
      </nav>

      {/* Dashboard Grid */}
      <div className="max-w-4xl mx-auto mt-12 p-6">
        <h2 className="text-2xl font-semibold text-gray-800 text-center mb-6">
          Welcome, {user?.name}!
        </h2>
        <div className="grid grid-cols-2 gap-6">
          {options.map((option) => (
            <Card
              key={option.path}
              className="cursor-pointer hover:shadow-lg transition p-6 text-center"
              onClick={() => router.push(option.path)}
            >
              <CardHeader>
                <CardTitle className="text-lg">{option.title}</CardTitle>
              </CardHeader>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
