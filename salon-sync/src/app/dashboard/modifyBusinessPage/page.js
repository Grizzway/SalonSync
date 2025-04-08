'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/app/context/AuthContext';
import Navbar from '@/components/Navbar';

export default function ModifyBusinessPage() {
  const { user, logout } = useAuth();
  const router = useRouter();
  const [loading, setLoading] = useState(true);

  const [Description, setDescription] = useState('');
  const [email, setEmail] = useState('');
  const [Phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [logo, setLogo] = useState(null);

  useEffect(() => {
    if (!user) {
      router.push('/');
    } else {
      fetchBusinessDetails();
      setLoading(false);
    }
  }, [user, router]);

  const fetchBusinessDetails = async () => {
    try {
        console.log("🔍 Fetching salon details for salonId:", user?.salonId);
      const res = await fetch(`/api/modifyPage?salonId=${user.salonId}`);
      if (!res.ok) throw new Error('Failed to fetch');
      const data = await res.json();
      setPhone(data.Phone || '');
      setDescription(data.Description || '');
      setEmail(data.email || '');
      setAddress(data.address || '');
    } catch (err) {
      console.error('Error fetching:', err);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const formData = new FormData();
    formData.append('phone', Phone);
    formData.append('description', Description);
    formData.append('email', email);
    formData.append('address', address);
    if (logo) formData.append('logo', logo);

    try {
      const res = await fetch(`/api/modifyPage?salonId=${user.salonId}`, {
        method: 'PUT',
        body: formData,
      });
      const data = await res.json();
      if (res.ok) alert('Update successful!');
      else throw new Error(data.error);
    } catch (err) {
      console.error('Update error:', err);
      alert('Failed to update business.');
    }
  };

  if (loading) return <div className="text-center mt-10 text-purple-600">Loading...</div>;

  return (
    <div className="min-h-screen bg-gradient-to-b from-violet-100 via-purple-50 to-white dark:from-gray-900 dark:to-gray-800">
      <Navbar />
      <div className="max-w-3xl mx-auto mt-6 p-6 bg-white dark:bg-gray-800 shadow-xl rounded-3xl border border-purple-200 dark:border-purple-700">
        <h2 className="text-3xl font-extrabold text-purple-700 dark:text-purple-300 text-center mb-6">Modify Business Page</h2>
        <form onSubmit={handleSubmit} encType="multipart/form-data" className="space-y-4">
          <input type="text" placeholder="Phone" value={Phone} onChange={(e) => setPhone(e.target.value)} className="w-full p-2 border border-gray-300 rounded" />
          <input type="text" placeholder="Description" value={Description} onChange={(e) => setDescription(e.target.value)} className="w-full p-2 border border-gray-300 rounded" />
          <input type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} className="w-full p-2 border border-gray-300 rounded" />
          <input type="text" placeholder="Address" value={address} onChange={(e) => setAddress(e.target.value)} className="w-full p-2 border border-gray-300 rounded" />
          <input type="file" accept="image/*" onChange={(e) => setLogo(e.target.files[0])} className="w-full p-2 border border-gray-300 rounded" />
          <button type="submit" className="w-full bg-purple-600 text-white p-2 rounded hover:bg-purple-700">Update</button>
        </form>
      </div>
    </div>
  );
}
