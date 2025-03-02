'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Image from 'next/image';
import { Card } from '@/components/ui/card';
import Navbar from '@/components/Navbar.jsx'; // Updated to .jsx

export default function SalonPage() {
  const { salonname } = useParams();
  const [salon, setSalon] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function getSalon() {
      try {
        const res = await fetch(`/api/salon/${salonname}`);
        const data = await res.json();


        if (!res.ok) {
          setError(data.error || 'Failed to load salon data');
          setSalon({
            name: salonname,
            banner: null,
            logo: null,
            theme: 'grey',
          });
        } else {
          setSalon(data);
        }
      } catch (err) {
        console.error('Fetch error:', err);
        setError('An unexpected error occurred');
        setSalon({
          name: salonname,
          banner: null,
          logo: null,
          theme: 'grey',
        });
      } finally {
        setLoading(false);
      }
    }
    getSalon();
  }, [salonname]);

  if (loading) {
    return (
      <div>
        <Navbar />
        <div className="flex justify-center items-center h-screen text-lg">Loading...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div>
        <Navbar />
        <div className="flex justify-center items-center h-screen text-lg text-red-500">
          Error: {error}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen" style={{ backgroundColor: salon.theme || 'grey' }}>
      <Navbar />
      {/* Banner */}
      <div className="w-full h-48 bg-gray-300 flex justify-center items-center">
        {salon.banner ? (
          <Image src={salon.banner} alt="Salon Banner" layout="fill" objectFit="cover" />
        ) : (
          <p className="text-white text-2xl">Default Banner</p>
        )}
      </div>

      {/* Salon Info */}
      <div className="max-w-4xl mx-auto mt-6 p-6 text-center">
        <Card className="p-6">
          <div className="flex flex-col items-center">
            {salon.logo ? (
              <Image src={salon.logo} alt="Salon Logo" width={100} height={100} className="rounded-full" />
            ) : (
              <div className="w-24 h-24 bg-gray-400 rounded-full flex justify-center items-center text-white">
                Logo
              </div>
            )}
            <h2 className="text-3xl font-semibold mt-4">{salon.name}</h2>
          </div>
        </Card>
      </div>
    </div>
  );
}