'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';
import { useAuth } from '@/app/context/AuthContext';

export default function EmployeeLoginPage() {
  const [loginInfo, setLoginInfo] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const router = useRouter();

  const handleChange = (e) => {
    setLoginInfo((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleLogin = async () => {
    setLoading(true);
    const res = await fetch('/api/login/employee', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(loginInfo),
    });

    const data = await res.json();
    setLoading(false);

    if (res.ok) {
      login(data.user);
      router.push('/dashboard/employee');
    } else {
      alert(data.message || 'Login failed');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-purple-50 dark:bg-gray-900">
      <div className="bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-md max-w-md w-full">
        <h1 className="text-2xl font-bold mb-6 text-center">Employee Login</h1>

        <Input
          name="email"
          placeholder="Email or Username"
          value={loginInfo.email}
          onChange={handleChange}
          className="mb-4"
        />
        <Input
          name="password"
          type="password"
          placeholder="Password"
          value={loginInfo.password}
          onChange={handleChange}
          className="mb-4"
        />

        <Button className="w-full" onClick={handleLogin} disabled={loading}>
          {loading ? <Loader2 className="animate-spin h-5 w-5" /> : 'Login'}
        </Button>

        <p className="mt-4 text-sm text-center text-gray-500 dark:text-gray-400">
          Forgot your password?{' '}
          <a href="/reset-password/employee" className="underline text-fuchsia-500">
            Reset here
          </a>
        </p>

        <p className="mt-2 text-sm text-center text-gray-500 dark:text-gray-400">
          New employee with a code?{' '}
          <a href="/register/employee/code" className="underline text-fuchsia-500">
            Start here
          </a>
        </p>
      </div>
    </div>
  );
}
