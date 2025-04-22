'use client';

import { useState, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { useAuth } from '@/app/context/AuthContext';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';
import Navbar from '@/components/Navbar';
import SurveyModal from '@/components/SurveyModal';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogClose } from '@/components/ui/dialog';

export default function BookingPage() {
  const { user } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();

  const preselectedSalonId = searchParams.get('salonId');
  const preselectedEmployeeId = searchParams.get('employeeId');

  const [salonId, setSalonId] = useState('');
  const [employeeId, setEmployeeId] = useState('');
  const [employeeName, setEmployeeName] = useState('');
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
  const [surveyChecked, setSurveyChecked] = useState(false);
  const [showSurveyNotice, setShowSurveyNotice] = useState(false);
  const [surveyIntroComplete, setSurveyIntroComplete] = useState(false);
  
  useEffect(() => {
    const checkSurveyStatus = async () => {
      if (!user?.id || user.type !== 'customer') return;
  
      try {
        const res = await fetch(`/api/customer/survey/check?customerId=${user.id}`);
        const data = await res.json();
        if (!data.completed) {
          setShowSurveyNotice(true);
  
          // Fade out notice, then show modal
          setTimeout(() => {
            setShowSurveyNotice(false);
            setSurveyIntroComplete(true);
          }, 4000);
        }
      } catch (error) {
        console.error('Error checking survey status:', error);
      } finally {
        setSurveyChecked(true);
      }
    };
  
    checkSurveyStatus();
  }, [user]);
  
  // Show SurveyModal after delay
  useEffect(() => {
    if (surveyIntroComplete) {
      const timer = setTimeout(() => {
        setShowSurveyModal(true);
      }, 500); // small fade-out buffer
      return () => clearTimeout(timer);
    }
  }, [surveyIntroComplete]);

  useEffect(() => {
    const fetchCustomerProfile = async () => {
      if (!user?.id || user.type !== 'customer') return;
  
      try {
        const res = await fetch(`/api/customer/profile?customerId=${user.id}`);
        const data = await res.json();
        if (res.ok) {
          setName(data.name || '');
          setEmail(data.email || '');
        }
      } catch (err) {
        console.error('Failed to fetch customer profile:', err);
      }
    };
  
    fetchCustomerProfile();
  }, [user]);


  useEffect(() => {
    const salon = searchParams.get('salonId');
    const employee = searchParams.get('employeeId');
  
    if (salon) setSalonId(salon);
    if (employee) setEmployeeId(employee);
  
    if (salon && employee) {
      const fetchServices = async () => {
        setLoading(true);
        try {
          // Fetch services for employee directly
          const res = await fetch(`/api/employee/services?employeeId=${employee}`);
          const data = await res.json();
          setServices(data.services || []);
  
            // Fetch employee profile to get name
          const empRes = await fetch(`/api/employee/profile?employeeId=${employee}`);
          const empData = await empRes.json();
          setEmployeeName(empData.name || '');
        } catch (err) {
          console.error('Error loading services or employee name:', err);
        } finally {
          setLoading(false);
        }
      };
  
      fetchServices();
    }
  }, [searchParams]);

  const handleBooking = async () => {
    if (user?.type === 'customer' && showSurveyModal) {
      alert('Please complete the customer survey before booking.');
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
          Book an Appointment {employeeName ? `with ${employeeName}` : ''}
        </h1>

        {loading || !surveyChecked ? (
          <div className="flex justify-center py-10">
            <Loader2 className="animate-spin h-8 w-8 text-purple-600" />
          </div>
        ) : (
          <div className="space-y-4">
            <Input placeholder="Name" value={name} onChange={(e) => setName(e.target.value)} />
            <Input placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} />
            <Input placeholder="Phone" value={phone} onChange={(e) => setPhone(e.target.value)} />

            <select
              value={selectedService}
              onChange={(e) => setSelectedService(e.target.value)}
              className="w-full p-2 border rounded dark:bg-gray-700"
            >
              <option value="">Select a service</option>
              {services
                .filter((s) => s.name && s.duration && s.price)
                .map((s, idx) => (
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

{/* ShadCN Dialog Notice (fades in and disappears) */}
<Dialog open={showSurveyNotice}>
  <DialogContent className="animate-fade-in text-center">
    <DialogHeader>
      <DialogTitle className="text-lg font-semibold text-red-600">
        We noticed you haven't done your customer information survey.
      </DialogTitle>
      <p className="text-sm text-gray-700 dark:text-gray-300 mt-2">
        This must be done before booking.
      </p>
    </DialogHeader>
  </DialogContent>
</Dialog>

{/* Show SurveyModal only AFTER intro is fully complete */}
{surveyIntroComplete && showSurveyModal && user?.type === 'customer' && (
  <div className="animate-fade-in">
    <SurveyModal
      open={true}
      onClose={() => setShowSurveyModal(false)}
      customerId={user.id}
      onSurveyComplete={() => setShowSurveyModal(false)}
    />
  </div>
)}
    </div>
  );
}
