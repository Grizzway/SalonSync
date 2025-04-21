'use client';

import { useAuth } from '@/app/context/AuthContext';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import Navbar from "@/components/Navbar";

import { Calendar, dateFnsLocalizer } from 'react-big-calendar';
import format from 'date-fns/format';
import parse from 'date-fns/parse';
import startOfWeek from 'date-fns/startOfWeek';
import getDay from 'date-fns/getDay';
import { enUS } from 'date-fns/locale';
import 'react-big-calendar/lib/css/react-big-calendar.css';

const locales = { 'en-US': enUS };
const localizer = dateFnsLocalizer({ format, parse, startOfWeek, getDay, locales });

export default function EmployeeDashboard() {
  const { user } = useAuth();
  const router = useRouter();
  const [appointments, setAppointments] = useState([]);
  const [view, setView] = useState('week');
  const [date, setDate] = useState(new Date());
  const [minTime, setMinTime] = useState(new Date(0, 0, 0, 8));
  const [maxTime, setMaxTime] = useState(new Date(0, 0, 0, 20));

  useEffect(() => {
    if (!user || user.type !== 'employee') {
      router.push('/');
    } else {
      fetch(`/api/appointments/employee?employeeId=${user.id}`)
        .then(res => res.json())
        .then(data => {
          const formatted = (data.appointments || []).map((apt) => {
            const start = new Date(`${apt.date}T${apt.time}`);
            const end = new Date(start.getTime() + (apt.duration || 30) * 60000);
            return {
              id: apt._id,
              title: `${apt.service} ($${apt.price})`,
              start,
              end,
              allDay: false
            };
          });
          setAppointments(formatted);
        });

      if (user.salonIds?.[0]) {
        fetch(`/api/modifyPage?salonId=${user.salonIds[0]}`)
          .then(res => res.json())
          .then(data => {
            if (data.businessHours) {
              const hours = Object.values(data.businessHours)
                .filter(h => h.open && h.close)
                .map(h => [parseTime(h.open), parseTime(h.close)]);
              if (hours.length > 0) {
                const opens = hours.map(([open]) => open);
                const closes = hours.map(([_, close]) => close);
                setMinTime(new Date(0, 0, 0, Math.min(...opens)));
                setMaxTime(new Date(0, 0, 0, Math.max(...closes)));
              }
            }
          });
      }
    }
  }, [user]);

  const parseTime = (str) => {
    if (!str || typeof str !== 'string') return 0;
    const [time, modifier] = str.split(' ');
    let [hours] = time.split(':').map(Number);
    if (modifier === 'PM' && hours !== 12) hours += 12;
    if (modifier === 'AM' && hours === 12) hours = 0;
    return hours;
  };

  return (
    <div className="min-h-screen pt-24 px-6 bg-gradient-to-b from-violet-100 to-white dark:from-gray-900 dark:to-gray-800 text-gray-900 dark:text-white">
      <Navbar />

      <div className="max-w-5xl mx-auto">
        <h1 className="text-4xl font-extrabold text-center text-purple-700 dark:text-fuchsia-300 mb-10">
          Welcome, {user?.name?.split(' ')[0] || 'Stylist'}!
        </h1>

        <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-xl border border-purple-300 dark:border-purple-700 mb-10">
          <h2 className="text-2xl font-semibold mb-4 text-purple-700 dark:text-purple-200">
            📅 Weekly Calendar
          </h2>
          <div className="h-[600px] bg-white dark:bg-gray-800 rounded-lg overflow-hidden">
            <Calendar
              localizer={localizer}
              events={appointments}
              startAccessor="start"
              endAccessor="end"
              views={['week', 'day']}
              view={view}
              date={date}
              onView={(newView) => setView(newView)}
              onNavigate={(newDate) => setDate(newDate)}
              style={{ height: '100%', color: '#1e1e1e' }}
              toolbar={true}
              min={minTime}
              max={maxTime}
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-xl border border-purple-200 dark:border-purple-700">
            <h2 className="text-2xl font-semibold text-purple-700 dark:text-purple-200 mb-2">🏠 Your Salon</h2>
            <p className="text-gray-600 dark:text-gray-400 mb-4">See the salon profile you're linked to.</p>
            <Button onClick={() => router.push(`/salons/${user.salonIds[0]}`)} className="w-full bg-purple-600 text-white hover:bg-purple-700">View Salon</Button>
          </div>

          <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-xl border border-purple-200 dark:border-purple-700">
            <h2 className="text-2xl font-semibold text-purple-700 dark:text-purple-200 mb-2">🛠 Edit Profile</h2>
            <p className="text-gray-600 dark:text-gray-400 mb-4">Update your bio, specialties, and profile picture.</p>
            <Button onClick={() => router.push('/dashboard/employee/edit')} className="w-full bg-fuchsia-600 text-white hover:bg-fuchsia-700">Edit Profile</Button>
          </div>

          <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-xl border border-purple-200 dark:border-purple-700">
            <h2 className="text-2xl font-semibold text-purple-700 dark:text-purple-200 mb-2">🧰 Manage Services</h2>
            <p className="text-gray-600 dark:text-gray-400 mb-4">Add or update services you offer for booking.</p>
            <Button onClick={() => router.push('/dashboard/employee/services')} className="w-full bg-purple-600 text-white hover:bg-purple-700">Manage Services</Button>
          </div>
        </div>
      </div>
    </div>
  );
}