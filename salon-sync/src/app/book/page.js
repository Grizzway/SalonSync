'use client';

import { useState, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { useAuth } from '@/app/context/AuthContext';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import Navbar from '@/components/Navbar';
import SurveyModal from '@/components/SurveyModal';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';

export default function BookingPage() {
  const { user } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();

  const [salonId, setSalonId] = useState('');
  const [employeeId, setEmployeeId] = useState('');
  const [employeeName, setEmployeeName] = useState('');
  const [services, setServices] = useState([]);
  const [selectedService, setSelectedService] = useState('');
  const [date, setDate] = useState('');
  const [selectedTime, setSelectedTime] = useState('');
  const [bookedTimes, setBookedTimes] = useState([]);
  const [paymentOption, setPaymentOption] = useState('half');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [surveyChecked, setSurveyChecked] = useState(false);
  const [showSurveyModal, setShowSurveyModal] = useState(false);
  const [surveyIntroComplete, setSurveyIntroComplete] = useState(false);
  const [showSurveyNotice, setShowSurveyNotice] = useState(false);

  useEffect(() => {
    const salon = searchParams.get('salonId');
    const employee = searchParams.get('employeeId');
    if (salon) setSalonId(salon);
    if (employee) setEmployeeId(employee);
  }, [searchParams]);

  useEffect(() => {
    if (user?.id && user.type === 'customer') {
      fetch(`/api/customer/profile?customerId=${user.id}`)
        .then(res => res.json())
        .then(data => {
          setName(data.name || '');
          setEmail(data.email || '');
        })
        .catch(() => {});
    }
  }, [user]);

  useEffect(() => {
    if (user?.id && user.type === 'customer') {
      fetch(`/api/customer/survey/check?customerId=${user.id}`)
        .then(res => res.json())
        .then(data => {
          if (!data.completed) {
            setShowSurveyNotice(true);
            setTimeout(() => {
              setShowSurveyNotice(false);
              setSurveyIntroComplete(true);
            }, 2000);
          }
        })
        .catch(() => {
          setSurveyIntroComplete(true);
        })
        .finally(() => setSurveyChecked(true));
    } else {
      setSurveyChecked(true);
    }
  }, [user]);

  useEffect(() => {
    if (surveyIntroComplete) {
      const timer = setTimeout(() => setShowSurveyModal(true), 500);
      return () => clearTimeout(timer);
    }
  }, [surveyIntroComplete]);

  useEffect(() => {
    if (!employeeId) return;
    Promise.all([
      fetch(`/api/employee/services?employeeId=${employeeId}`),
      fetch(`/api/employee/profile?employeeId=${employeeId}`)
    ]).then(async ([res1, res2]) => {
      const servicesData = await res1.json().catch(() => ({}));
      const profileData = await res2.json().catch(() => ({}));
      setServices(servicesData.services || []);
      setEmployeeName(profileData.name || '');
    }).catch(() => {});
  }, [employeeId]);

  useEffect(() => {
    if (!employeeId || !date) return;
    fetch(`/api/appointments/employee?employeeId=${employeeId}`)
      .then(res => res.json())
      .then(data => {
        const booked = (data.appointments || [])
          .filter(a => a.date === date)
          .map(a => a.time);
        setBookedTimes(booked);
      })
      .catch(() => {
        setBookedTimes([]);
      });
  }, [employeeId, date]);

  const generateTimeSlots = () => {
    const slots = [];
    for (let h = 9; h < 17; h++) {
      slots.push(`${h.toString().padStart(2, '0')}:00`);
      slots.push(`${h.toString().padStart(2, '0')}:30`);
    }
    return slots.filter(t => !bookedTimes.includes(t));
  };

  const handleBooking = async () => {
    if (showSurveyModal) return alert('Please complete the customer survey first.');
    const payload = {
      customerId: user?.id || null,
      salonId,
      employeeId,
      service: selectedService,
      name,
      email,
      phone,
      date,
      time: selectedTime,
      paymentOption,
    };
    const res = await fetch('/api/appointments', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    const data = await res.json();
    if (res.ok) router.push(`/confirm?appointmentId=${data.appointmentId}`);
    else alert(data.message || 'Booking failed');
  };

  return (
    <div className="min-h-screen pt-24 px-6 bg-gradient-to-b from-violet-100 to-white dark:from-gray-900 dark:to-gray-800 text-gray-900 dark:text-white">
      <Navbar />
      <div className="max-w-2xl mx-auto bg-white dark:bg-gray-800 p-8 rounded-xl shadow-xl border border-purple-300 dark:border-purple-700">
        <h1 className="text-3xl font-bold text-purple-700 dark:text-purple-300 mb-6 text-center">
          Book an Appointment {employeeName ? `with ${employeeName}` : ''}
        </h1>

        {!surveyChecked ? (
          <p className="text-center">Loading...</p>
        ) : (
          <div className="space-y-4">
            <Input placeholder="Name" value={name} onChange={(e) => setName(e.target.value)} />
            <Input placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} />
            <Input placeholder="Phone" value={phone} onChange={(e) => setPhone(e.target.value)} />

            <select value={selectedService} onChange={(e) => setSelectedService(e.target.value)} className="w-full p-2 border rounded dark:bg-gray-700">
              <option value="">Select a service</option>
              {services.map((s, idx) => (
                <option key={idx} value={s.name}>{s.name} — {s.duration} min — ${s.price}</option>
              ))}
            </select>

            <Input type="date" value={date} onChange={(e) => setDate(e.target.value)} />

            <div className="grid grid-cols-4 gap-2">
              {generateTimeSlots().map((slot, i) => (
                <Button key={i} variant={selectedTime === slot ? 'default' : 'outline'} onClick={() => setSelectedTime(slot)}>{slot}</Button>
              ))}
            </div>

            <select value={paymentOption} onChange={(e) => setPaymentOption(e.target.value)} className="w-full p-2 border rounded dark:bg-gray-700">
              <option value="half">Pay Half Now</option>
              <option value="full">Pay Full Now</option>
            </select>

            <Button onClick={handleBooking} className="w-full bg-purple-600 text-white hover:bg-purple-700">
              Book Appointment
            </Button>
          </div>
        )}
      </div>

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




