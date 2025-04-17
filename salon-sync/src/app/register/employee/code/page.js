'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';

export default function EmployeeCodeEntryPage() {
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async () => {
    if (!code || code.length < 6) {
      alert('Please enter a valid 6-character code.');
      return;
    }

    setLoading(true);

    const res = await fetch('/api/verify-code', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ code }),
    });

    const data = await res.json();
    setLoading(false);

    if (res.ok) {
      router.push(`/register/employee?code=${code}`);
    } else {
      alert(data.message || 'Invalid or expired code.');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-purple-50 dark:bg-gray-900">
      <div className="w-full max-w-md p-6 bg-white dark:bg-gray-800 rounded-2xl shadow-xl">
        <h1 className="text-2xl font-bold mb-6 text-center">Enter Your Invite Code</h1>
        <Input
          placeholder="Enter your 6-digit code"
          value={code}
          onChange={(e) => setCode(e.target.value.toUpperCase())}
          maxLength={6}
        />
        <Button className="w-full mt-4" onClick={handleSubmit} disabled={loading}>
          {loading ? <Loader2 className="animate-spin h-5 w-5" /> : 'Continue'}
        </Button>
      </div>
    </div>
  );
}