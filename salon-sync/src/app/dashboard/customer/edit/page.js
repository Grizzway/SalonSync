'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/app/context/AuthContext';
import Navbar from '@/components/Navbar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';

export default function EditCustomerProfile() {
  const { user } = useAuth();
  const router = useRouter();
  const [form, setForm] = useState({ name: '', email: '', bio: '', password: '' });

  useEffect(() => {
    if (!user || user.type !== 'customer') {
      router.push('/');
    } else {
      setForm({
        name: user.name || '',
        email: user.email || '',
        bio: user.bio || '',
        password: '',
      });
    }
  }, [user]);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const res = await fetch('/api/customer/update', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...form, customerId: user.id }),
    });

    const data = await res.json();
    if (data.success) {
      router.push('/dashboard/customer');
    } else {
      alert(data.message || 'Update failed');
    }
  };

  return (
    <div className="min-h-screen pt-24 px-6 bg-gradient-to-b from-violet-100 to-white dark:from-gray-900 dark:to-gray-800 text-gray-900 dark:text-white">
      <Navbar />
      <div className="max-w-xl mx-auto">
        <h1 className="text-4xl font-extrabold text-purple-700 dark:text-fuchsia-300 mb-8 text-center">Edit My Profile</h1>
        <form onSubmit={handleSubmit} className="space-y-6 bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-xl border border-purple-300 dark:border-purple-700">
          <Input name="name" value={form.name} onChange={handleChange} placeholder="Full Name" required />
          <Input name="email" value={form.email} onChange={handleChange} placeholder="Email" required />
          <Textarea name="bio" value={form.bio} onChange={handleChange} placeholder="Tell us about yourself..." />
          <Input name="password" value={form.password} onChange={handleChange} placeholder="New Password (optional)" type="password" />
          <Button className="w-full bg-fuchsia-600 text-white hover:bg-fuchsia-700" type="submit">Save Changes</Button>
        </form>
      </div>
    </div>
  );
}
