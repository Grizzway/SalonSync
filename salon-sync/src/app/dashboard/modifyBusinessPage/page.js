"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/app/context/AuthContext';
import Navbar from '@/components/Navbar';

export default function modifyBusinessPage() {
    const { user, logout } = useAuth();
    const router = useRouter();
    const [loading, setLoading] = useState(true);
    const [dropdownOpen, setDropdownOpen] = useState(false);
    
    const [Description, setDescription] = useState('');
    const [email, setEmail] = useState('');
    const [Phone, setPhone] = useState('');
    const [address, setAddress] = useState('');

    useEffect(() => {
        if (!user) {
            router.push('/');
        } else {
            fetchBusinessDetails();
            setLoading(false);
        }
    }, [user, router]);

    // Grabs the business details from the database
    const fetchBusinessDetails = async () => {
        try {
            const res = await fetch(`/api/modifyPage?salonId=${user.salonId}`); // Use modifyPage route
            if (!res.ok) {
                const errorText = await res.text();
                throw new Error(`Failed to fetch business details: ${errorText}`);
            }
            const data = await res.json();
            if (data) {
                setPhone(data.phone || '');
                setDescription(data.description || '');
                setEmail(data.email || '');
                setAddress(data.address || '');
            }
        } catch (error) {
            console.error('Error fetching business details:', error);
        }
    };

    const handleLogout = () => {
        logout();
        router.push('/login');
    };

    const toggleDropdown = () => {
        setDropdownOpen(!dropdownOpen);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const res = await fetch(`/api/modifyPage?salonId=${user.salonId}`, { // Use modifyPage route
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    phone: Phone,
                    description: Description,
                    email,
                    address,
                }),
            });
            if (res.ok) {
                alert('Business details updated successfully!');
            } else {
                throw new Error('Failed to update business details');
            }
        } catch (error) {
            console.error('Error updating business details:', error);
            alert('Failed to update business details. Please try again later.');
        }
    };

    if (loading) return <div className="flex justify-center items-center h-screen text-lg text-purple-600">Loading...</div>;

    const businessOptions = [
        { title: 'Modify Business Page', path: '/dashboard/business' },
        { title: 'Client Schedule', path: '/dashboard/schedule' },
        { title: 'Employees', path: '/dashboard/employees' },
        { title: 'Payment History', path: '/dashboard/payments' },
        { title: 'Reviews', path: '/dashboard/reviews' },
    ];
    const options = user?.type === 'business' ? businessOptions : [];

    return (
        <div className="min-h-screen bg-gradient-to-b from-violet-100 via-purple-50 to-white dark:from-gray-900 dark:to-gray-800">
            <Navbar />
            <div className="max-w-3xl mx-auto mt-6 p-6 bg-white dark:bg-gray-800 shadow-xl rounded-3xl border border-purple-200 dark:border-purple-700">
                <h2 className="text-3xl font-extrabold text-purple-700 dark:text-purple-300 text-center mb-6">
                    Modify Business Page
                </h2>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <input 
                        type="text" 
                        placeholder="Phone" 
                        value={Phone} 
                        onChange={(e) => setPhone(e.target.value)} 
                        className="w-full p-2 border border-gray-300 rounded"
                    />
                    <input 
                        type="text" 
                        placeholder="Description" 
                        value={Description} 
                        onChange={(e) => setDescription(e.target.value)} 
                        className="w-full p-2 border border-gray-300 rounded"
                    />
                    <input 
                        type="email" 
                        placeholder="Email" 
                        value={email} 
                        onChange={(e) => setEmail(e.target.value)} 
                        className="w-full p-2 border border-gray-300 rounded"
                    />
                    <input 
                        type="text" 
                        placeholder="Address" 
                        value={address} 
                        onChange={(e) => setAddress(e.target.value)} 
                        className="w-full p-2 border border-gray-300 rounded"
                    />
                    <button type="submit" className="w-full bg-purple-600 text-white p-2 rounded hover:bg-purple-700">Update Business Details</button>
                </form>
            </div>

            {/*Description handling*/}
            <div>
                <label htmlFor="description" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mt-4">
                    Description
                </label>
                <textarea
                 id= "description"
                 value={Description}
                 onChange={(e) => setDescription(e.target.value)}
                 rows="4"
                 placeholder="Enter a brief description of your business"
                 />
            </div>

            {/*Email handling*/}
            <div>
                
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mt-4">
                    Email
                </label>
                <input
                 type="email"
                 id="email"
                 value={email}
                 onChange={(e) => setEmail(e.target.value)}
                 placeholder="Enter your business email"
                 className="w-full p-2 border border-gray-300 rounded"
                />
            </div>

            {/*Address handling*/}
            <div>
                <label htmlFor="address" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mt-4">
                    Address
                </label>
                <input
                 type="text"
                 id="address"
                 value={address}
                 onChange={(e) => setAddress(e.target.value)}
                 placeholder="Enter your business address"
                 className="w-full p-2 border border-gray-300 rounded"
                />  
            </div>
        </div>

    );
}
