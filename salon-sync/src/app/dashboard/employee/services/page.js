'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/app/context/AuthContext';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Loader2, Trash2 } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function ServicesManager() {
  const { user } = useAuth();
  const router = useRouter();
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [newService, setNewService] = useState({ name: '', duration: '', price: '' });

  useEffect(() => {
    if (user?.id) fetchServices();
  }, [user]);

  const fetchServices = async () => {
    setLoading(true);
    const res = await fetch(`/api/employee/services?employeeId=${user.id}`);
    const data = await res.json();
    setServices(data.services || []);
    setLoading(false);
  };

  const handleAdd = async () => {
    const res = await fetch('/api/employee/services', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        employeeId: user.id,
        action: 'add',
        service: {
          name: newService.name,
          duration: Number(newService.duration),
          price: Number(newService.price),
        },
      }),
    });

    const updated = await res.json();
    setServices(updated.services);
    setNewService({ name: '', duration: '', price: '' });
  };

  const handleDelete = async (index) => {
    const res = await fetch('/api/employee/services', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        employeeId: user.id,
        action: 'delete',
        index,
      }),
    });

    const updated = await res.json();
    setServices(updated.services);
  };

  return (
    <div className="min-h-screen pt-24 px-6 bg-gradient-to-b from-violet-100 to-white dark:from-gray-900 dark:to-gray-800 text-gray-900 dark:text-white">
      <div className="max-w-2xl mx-auto bg-white dark:bg-gray-800 p-8 shadow-xl rounded-xl border border-purple-300 dark:border-purple-700">
        <h1 className="text-3xl font-bold text-purple-700 dark:text-purple-300 mb-6 text-center">
          Manage Services
        </h1>

        <div className="space-y-4">
          {services.map((s, idx) => (
            <div key={idx} className="flex justify-between items-center border-b pb-2">
              <div>
                <div className="font-semibold">{s.name}</div>
                <div className="text-sm text-gray-500 dark:text-gray-400">
                  {s.duration} min · ${s.price}
                </div>
              </div>
              <button onClick={() => handleDelete(idx)} className="text-red-500 hover:text-red-600">
                <Trash2 size={18} />
              </button>
            </div>
          ))}

          <div className="pt-4 border-t mt-4">
            <Input
              placeholder="Service Name"
              value={newService.name}
              onChange={(e) => setNewService({ ...newService, name: e.target.value })}
              className="mb-2"
            />
            <Input
              placeholder="Duration (minutes)"
              type="number"
              value={newService.duration}
              onChange={(e) => setNewService({ ...newService, duration: e.target.value })}
              className="mb-2"
            />
            <Input
              placeholder="Price ($)"
              type="number"
              value={newService.price}
              onChange={(e) => setNewService({ ...newService, price: e.target.value })}
              className="mb-4"
            />
            <Button onClick={handleAdd} className="w-full bg-purple-600 text-white hover:bg-purple-700">
              Add Service
            </Button>

            <Button
              className="mt-8 w-full bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-800 dark:text-white"
              onClick={() => router.push('/dashboard/employee')}
            >
              ⬅ Return to Dashboard
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
