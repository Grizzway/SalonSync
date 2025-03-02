'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function BusinessRegisterPage() {
  const [businessName, setBusinessName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [address, setAddress] = useState('');
  const [message, setMessage] = useState('');
  const router = useRouter();

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Check if email already exists (client-side) - using the same endpoint
    console.log(`Checking if email ${email} exists...`);
    const res = await fetch('/api/register/business', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email }), // This sends the email to the backend to check
    });

    const emailData = await res.json();
    console.log('Email Check Response:', emailData);

    if (emailData.success === false) {
      setMessage('Email is already in use.');
      return;
    }

    // Proceed with registration if email is not used
    console.log('Email not used, proceeding with registration...');
    const response = await fetch('/api/register/business', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ businessName, email, password, address }),
    });

    const data = await response.json();
    console.log('Registration Response:', data);

    if (data.success) {
      setMessage('Registration successful!');
      setTimeout(() => {
        router.push('/login');  // Redirect after 3 seconds
      }, 3000);
    } else {
      setMessage(data.message || 'Error during registration.');
    }
  };

  return (
    <div className="flex flex-col items-center space-y-4">
      <h1 className="text-2xl">Business Registration</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="businessName">Business Name</label>
          <input
            type="text"
            id="businessName"
            value={businessName}
            onChange={(e) => setBusinessName(e.target.value)}
            className="border p-2 rounded text-black"
            required
          />
        </div>
        <div>
          <label htmlFor="email">Email</label>
          <input
            type="email"
            id="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="border p-2 rounded text-black"
            required
          />
        </div>
        <div>
          <label htmlFor="password">Password</label>
          <input
            type="password"
            id="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="border p-2 rounded text-black"
            required
          />
        </div>
        <div>
          <label htmlFor="address">Business Address</label>
          <input
            type="text"
            id="address"
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            className="border p-2 rounded text-black"
            required
          />
        </div>
        <button type="submit" className="bg-green-500 text-white px-4 py-2 rounded">
          Register
        </button>
      </form>
      {message && <p>{message}</p>}
    </div>
  );
}
