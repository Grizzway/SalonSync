'use client';

import { useEffect, useState } from 'react';
import Navbar from '@/components/Navbar';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';

export default function Home() {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 text-gray-900 dark:text-white">
      <Navbar />
      <section className="flex flex-col items-center justify-center text-center py-20 px-4">
        <h1 className="text-4xl font-bold leading-tight">
          Find & Book the Best Salons Near You
        </h1>
        <p className="mt-4 text-lg text-gray-600 dark:text-gray-300">
          Book your next appointment with ease and convenience.
        </p>

        {/* Animated Buttons */}
        <div className="mt-8 flex flex-col md:flex-row space-y-4 md:space-y-0 md:space-x-6">
          <motion.div
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: isMounted ? 1 : 0, opacity: isMounted ? 1 : 0 }}
            transition={{ type: 'spring', stiffness: 120, damping: 10 }}
            className="p-6 bg-white dark:bg-gray-800 rounded-lg shadow-md"
          >
            <Link href="/salons">
              <Button className="bg-blue-600 hover:bg-blue-700 transition-all">
                Browse Salons
              </Button>
            </Link>
          </motion.div>

          <motion.div
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: isMounted ? 1 : 0, opacity: isMounted ? 1 : 0 }}
            transition={{ type: 'spring', stiffness: 120, damping: 10, delay: 0.2 }}
            className="p-6 bg-white dark:bg-gray-800 rounded-lg shadow-md"
          >
            <Link href="/register/business">
              <Button className="bg-green-600 hover:bg-green-700 transition-all">
                Register Your Salon
              </Button>
            </Link>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
