'use client';

import { useState, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { useAuth } from '@/app/context/AuthContext';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';
import Navbar from '@/components/Navbar';
import SurveyModal from '@/components/SurveyModal';

export default function BookingPage() {
  const { user } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();

  const preselectedSalonId = searchParams.get('salonId');
  const preselectedEmployeeId = searchParams.get('employeeId');

  const [salonId, setSalonId] = useState('');
  const [employeeId, setEmployeeId] = useState('');
  const [employees, setEmployees] = useState([]);
  const [services, setServices] = useState([]);
  const [selectedService, setSelectedService] = useState('');
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [paymentOption, setPaymentOption] = useState('half');

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [loading, setLoading] = useState(true);
  const [showSurveyModal, setShowSurveyModal] = useState(false);

  // Autofill from user and query params
  useEffect(() => {
    if (user?.type === 'customer') {
      setName(user.name || '');
      setEmail(user.email || '');

      // Check if survey was completed (assuming context has full user doc)
      if (!user.surveyCompleted) {
        setShowSurveyModal(true);
      }
    }
    if (preselectedSalonId) setSalonId(preselectedSalonId);
    if (preselectedEmployeeId) setEmployeeId(preselectedEmployeeId);
  }, [user, preselectedSalonId, preselectedEmployeeId]);

  // Load employees for salon
  useEffect(() => {
    const fetchEmployees = async () => {
      if (!salonId) return;
      setLoading(true);
      const res = await fetch(`/api/employees?salonId=${salonId}`);
      const data = await res.json();
      setEmployees(data.employees || []);
      setLoading(false);
    };
    fetchEmployees();
  }, [salonId]);

  // Load services for employee
  useEffect(() => {
    const fetchServices = async () => {
      if (!employeeId) return;
      setLoading(true);
      const res = await fetch(`/api/employee/services?employeeId=${employeeId}`);
      const data = await res.json();
      setServices(data.services || []);
      setLoading(false);
    };
    fetchServices();
  }, [employeeId]);

  const handleBooking = async () => {
    if (user?.type === 'customer' && !user.surveyCompleted) {
      alert('Please complete the customer survey before booking.');
      setShowSurveyModal(true);
      return;
    }

    const payload = {
      customerId: user?.id || null,
      salonId,
      employeeId,
      service: selectedService,
      name,
      email,
      phone,
      date,
      time,
      paymentOption,
    };

    const res = await fetch('/api/appointments', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    const data = await res.json();

    if (res.ok) {
      router.push(`/confirm?appointmentId=${data.appointmentId}`);
    } else {
      alert(data.message || 'Failed to book appointment');
    }
  };

  return (
    <div className="min-h-screen pt-24 px-6 bg-gradient-to-b from-violet-100 to-white dark:from-gray-900 dark:to-gray-800 text-gray-900 dark:text-white">
      <Navbar />
      <div className="max-w-2xl mx-auto bg-white dark:bg-gray-800 p-8 rounded-xl shadow-xl border border-purple-300 dark:border-purple-700">
        <h1 className="text-3xl font-bold text-purple-700 dark:text-purple-300 mb-6 text-center">
          Book an Appointment
        </h1>

        {loading ? (
          <div className="flex justify-center py-10">
            <Loader2 className="animate-spin h-8 w-8 text-purple-600" />
          </div>
        ) : (
          <div className="space-y-4">
            <Input placeholder="Name" value={name} onChange={(e) => setName(e.target.value)} />
            <Input placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} />
            <Input placeholder="Phone" value={phone} onChange={(e) => setPhone(e.target.value)} />

            <select
              value={employeeId}
              onChange={(e) => setEmployeeId(e.target.value)}
              className="w-full p-2 border rounded dark:bg-gray-700"
            >
              <option value="">Select a stylist</option>
              {employees.map((e) => (
                <option key={e.employeeId} value={e.employeeId}>
                  {e.name}
                </option>
              ))}
            </select>

            <select
              value={selectedService}
              onChange={(e) => setSelectedService(e.target.value)}
              className="w-full p-2 border rounded dark:bg-gray-700"
            >
              <option value="">Select a service</option>
              {services.map((s, idx) => (
                <option key={idx} value={s.name}>
                  {s.name} — {s.duration} min — ${s.price}
                </option>
              ))}
            </select>

            <Input type="date" value={date} onChange={(e) => setDate(e.target.value)} />
            <Input type="time" value={time} onChange={(e) => setTime(e.target.value)} />

            <select
              value={paymentOption}
              onChange={(e) => setPaymentOption(e.target.value)}
              className="w-full p-2 border rounded dark:bg-gray-700"
            >
              <option value="half">Pay Half Now</option>
              <option value="full">Pay Full Now</option>
            </select>

            <Button onClick={handleBooking} className="w-full bg-purple-600 text-white hover:bg-purple-700">
              Book Appointment
            </Button>
          </div>
        )}
      </div>

      {showSurveyModal && user?.type === 'customer' && (
        <SurveyModal
          open={showSurveyModal}
          onClose={() => setShowSurveyModal(false)}
          customerId={user.id}
          onSurveyComplete={() => setShowSurveyModal(false)}
        />
      )}
    </div>
  );
}


