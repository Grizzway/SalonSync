'use client';

import { useEffect, useState } from 'react';
import { Card } from '@/components/ui/card';
import Link from 'next/link';
import Navbar from '@/components/Navbar.jsx'; // Updated to .jsx

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
      <div>
        <Navbar />
        <div className="flex justify-center items-center h-screen text-lg">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <Navbar />
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 p-6">
        {salons.map((salon) => (
          <Link href={`/salons/${salon.name.toLowerCase().replace(/\s+/g, '-')}`} key={salon.name}>
            <Card className="cursor-pointer">
              <div className="flex flex-col items-center p-4">
                {salon.logo ? (
                  <img src={salon.logo} alt={salon.name} className="w-24 h-24 rounded-full mb-4" />
                ) : (
                  <div className="w-24 h-24 bg-gray-400 rounded-full mb-4 flex justify-center items-center text-white">
                    Logo
                  </div>
                )}
                <h3 className="text-xl font-semibold">{salon.name}</h3>
              </div>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}