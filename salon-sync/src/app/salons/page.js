'use client';

import { useEffect, useState } from 'react';
import { Card } from '@/components/ui/card';
import Link from 'next/link';
import Navbar from '@/components/Navbar.jsx';

export default function SalonGridPage() {
  const [salons, setSalons] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function getSalons() {
      const res = await fetch('/api/salon');
      const data = await res.json();
      setSalons(data);
      setLoading(false);
    }
    getSalons();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-blue-50 to-blue-200 dark:from-gray-900 dark:to-gray-800 flex flex-col">
        <Navbar />
        <div className="flex justify-center items-center flex-grow text-lg text-gray-800 dark:text-white">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-blue-200 dark:from-gray-900 dark:to-gray-800">
      <Navbar />
      <div className="max-w-5xl mx-auto py-12 px-6">
        <h2 className="text-4xl font-extrabold text-center text-gray-900 dark:text-white mb-10">Browse Salons</h2>
        <div className="flex flex-col space-y-8">
          {salons.map((salon) => {
            // Ensure that salon.id is defined before using it in the URL
            if (!salon.id) return null;

            return (
              <Link href={`/salons/${salon.id}`} key={salon.id}>
                <Card className="cursor-pointer transform transition duration-300 hover:scale-105 shadow-lg hover:shadow-2xl bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg overflow-hidden p-6">
                  <div className="flex flex-col md:flex-row items-center md:items-start md:space-x-6">
                    {salon.logo ? (
                      <img src={salon.logo} alt={salon.name} className="w-36 h-36 rounded-full shadow-md border border-gray-300 dark:border-gray-600" />
                    ) : (
                      <div className="w-36 h-36 bg-gray-400 rounded-full flex justify-center items-center text-white text-lg font-semibold">
                        No Logo
                      </div>
                    )}
                    <div className="mt-4 md:mt-0 text-center md:text-left">
                      <h3 className="text-3xl font-semibold text-gray-800 dark:text-white">{salon.name}</h3>
                      <p className="text-gray-600 dark:text-gray-300 mt-2">{salon.address || 'Location not available'}</p>
                      <p className="text-gray-500 dark:text-gray-400 mt-2">{salon.description || 'No description available'}</p>
                      <p className="text-gray-500 dark:text-gray-400 mt-2">Contact: {salon.contact || 'Not provided'}</p>
                    </div>
                  </div>
                </Card>
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}
