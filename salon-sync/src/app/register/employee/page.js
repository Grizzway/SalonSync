'use client';

import { Suspense, useState, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Loader2 } from 'lucide-react';
import { useAuth } from '@/app/context/AuthContext';

// Suspense wrapper
export default function RegisterEmployeePageWrapper() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-purple-50 dark:bg-gray-900">
        <div className="text-center text-gray-600 dark:text-white">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-2" />
          Validating code...
        </div>
      </div>
    }>
      <RegisterEmployeePage />
    </Suspense>
  );
}

// Wrapped page logic
export function RegisterEmployeePage() {
  const [loading, setLoading] = useState(false);
  const [codeValid, setCodeValid] = useState(false);
  const [employeeInfo, setEmployeeInfo] = useState({});
  const [form, setForm] = useState({
    firstName: '',
    lastName: '',
    password: '',
    confirmPassword: '',
    bio: '',
    specialties: '',
  });

  const searchParams = useSearchParams();
  const code = searchParams.get('code');
  const router = useRouter();
  const { login } = useAuth();

  useEffect(() => {
    async function verifyCode() {
      const res = await fetch('/api/verify-code', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code }),
      });

      if (res.ok) {
        const data = await res.json();
        setEmployeeInfo(data);
        setCodeValid(true);
      } else {
        alert('Invalid or expired employee code.');
        router.push('/');
      }
    }

    if (code) verifyCode();
  }, [code]);

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async () => {
    if (form.password !== form.confirmPassword) {
      alert('Passwords do not match.');
      return;
    }

    setLoading(true);

    const res = await fetch('/api/register/employee', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        code,
        email: employeeInfo.email,
        name: `${form.firstName} ${form.lastName}`,
        password: form.password,
        bio: form.bio,
        specialties: form.specialties.split(',').map(s => s.trim()),
      }),
    });

    const data = await res.json();
    setLoading(false);

    if (res.ok) {
      login(data.user);
      router.push('/dashboard/employee');
    } else {
      alert(data.message || 'Something went wrong');
    }
  };

  if (!codeValid) return null;

  return (
    <div className="min-h-screen flex items-center justify-center bg-purple-50 dark:bg-gray-900">
      <div className="bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-md max-w-xl w-full">
        <h1 className="text-3xl font-bold mb-6 text-center">Create Your Employee Account</h1>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <Input name="firstName" placeholder="First Name" onChange={handleChange} />
          <Input name="lastName" placeholder="Last Name" onChange={handleChange} />
        </div>

        <Input
          name="password"
          placeholder="Password"
          type="password"
          className="mb-4"
          onChange={handleChange}
        />
        <Input
          name="confirmPassword"
          placeholder="Confirm Password"
          type="password"
          className="mb-4"
          onChange={handleChange}
        />

        <Textarea
          name="bio"
          placeholder="Tell us about yourself"
          className="mb-4"
          onChange={handleChange}
        />

        <Input
          name="specialties"
          placeholder="Specialties (e.g., Color, Cuts)"
          onChange={handleChange}
        />

        <Button className="w-full mt-6" onClick={handleSubmit} disabled={loading}>
          {loading ? <Loader2 className="animate-spin h-5 w-5" /> : 'Create Account'}
        </Button>
      </div>
    </div>
  );
}
