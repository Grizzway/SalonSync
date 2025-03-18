'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/app/context/AuthContext';
import Navbar from '@/components/Navbar';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';

export default function Home() {
  const { user } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (user?.type === 'employee') {
      router.push('/dashboard');
    }
  }, [user, router]);

  return (
    <div className="relative min-h-screen bg-gradient-to-b from-blue-50 to-blue-200 dark:from-gray-900 dark:to-gray-800 text-gray-900 dark:text-white">
      <Navbar />

      <div className="absolute bottom-0 left-0 w-full overflow-hidden leading-none z-0">
        <svg
          className="animate-wave"
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 1440 320"
          fill="currentColor"
        >
          <path
            fillOpacity="1"
            d="M0,192L60,197.3C120,203,240,213,360,213.3C480,213,600,203,720,197.3C840,192,960,192,1080,181.3C1200,171,1320,149,1380,138.7L1440,128L1440,320L1380,320C1320,320,1200,320,1080,320C960,320,840,320,720,320C600,320,480,320,360,320C240,320,120,320,60,320L0,320Z"
          ></path>
        </svg>
      </div>

      <section className="flex flex-col items-center justify-center text-center py-20 px-4 relative z-10">
        <h1 className="text-4xl md:text-6xl lg:text-7xl font-extrabold leading-tight text-gray-800 dark:text-gray-200 drop-shadow-lg">
          Find & Book the Best Salons Near You
        </h1>
        <p className="mt-4 text-lg text-gray-600 dark:text-gray-400">
          Book your next appointment with ease and convenience.
        </p>

        <div className="mt-8 flex flex-col md:flex-row space-y-4 md:space-y-0 md:space-x-6">
          <motion.div
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: 'spring', stiffness: 120, damping: 10 }}
            className="p-6 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-md hover:shadow-lg transition-all"
          >
            <Link href="/salons">
              <Button className="bg-blue-600 hover:bg-blue-700 transition-all transform hover:scale-105 shadow-lg dark:shadow-blue-900">
                Browse Salons
              </Button>
            </Link>
          </motion.div>
          <motion.div
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: 'spring', stiffness: 120, damping: 10, delay: 0.2 }}
            className="p-6 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-md hover:shadow-lg transition-all"
          >
            <Link href="/register/business">
              <Button className="bg-green-600 hover:bg-green-700 transition-all transform hover:scale-105 shadow-lg dark:shadow-green-900">
                Register Your Salon
              </Button>
            </Link>
          </motion.div>
        </div>
      </section>
    </div>
  );
}