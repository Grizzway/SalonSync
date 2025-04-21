"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/app/context/AuthContext";
import { useRouter } from "next/navigation";
import { Calendar, dateFnsLocalizer } from "react-big-calendar";
import format from "date-fns/format";
import parse from "date-fns/parse";
import startOfWeek from "date-fns/startOfWeek";
import getDay from "date-fns/getDay";
import { enUS } from "date-fns/locale";
import Navbar from "@/components/Navbar";
import "react-big-calendar/lib/css/react-big-calendar.css";
import { Button } from "@/components/ui/button";

const locales = { "en-US": enUS };
const localizer = dateFnsLocalizer({ format, parse, startOfWeek, getDay, locales });

const weekdays = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
const timeOptions = Array.from({ length: 24 }, (_, h) => {
  const hour = h % 12 === 0 ? 12 : h % 12;
  const suffix = h < 12 ? "AM" : "PM";
  return `${hour.toString().padStart(2, '0')}:00 ${suffix}`;
});

export default function BusinessSchedulePage() {
  const { user } = useAuth();
  const router = useRouter();
  const [events, setEvents] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [selectedDay, setSelectedDay] = useState(null);
  const [shifts, setShifts] = useState([]);

  useEffect(() => {
    if (!user || user.type !== "business") {
      router.push("/");
      return;
    }

    fetch(`/api/schedules/business?salonId=${user.id}`)
      .then(res => res.json())
      .then(data => {
        const formatted = (data.schedules || []).map(event => ({
          ...event,
          start: new Date(event.start),
          end: new Date(event.end),
        }));
        setEvents(formatted);
      });

    fetch(`/api/employees?salonId=${user.id}`)
      .then(res => res.json())
      .then(data => setEmployees(data.employees || []));
  }, [user]);

  const handleDayClick = (day) => {
    setSelectedDay(day);
    setShifts([{ employeeId: '', start: '', end: '' }]);
  };

  const handleShiftChange = (idx, field, value) => {
    const updated = [...shifts];
    updated[idx][field] = value;
    setShifts(updated);
  };

  const handleAddShift = () => {
    setShifts(prev => [...prev, { employeeId: '', start: '', end: '' }]);
  };

  const convertTo24Hour = (timeStr) => {
    if (!timeStr) return null;
    const [time, modifier] = timeStr.split(' ');
    let [hours, minutes] = time.split(":");
    if (hours === "12") hours = "00";
    if (modifier === "PM") hours = parseInt(hours, 10) + 12;
    return `${hours.toString().padStart(2, '0')}:${minutes}`;
  };

  const handleSaveShifts = async () => {
    const dateStr = new Date().toISOString().split('T')[0]; // fallback if no day is selected

    const validShifts = shifts.filter(shift =>
      shift.employeeId && shift.start && shift.end
    );

    for (const shift of validShifts) {
      const employee = employees.find(e => e.employeeId.toString() === shift.employeeId);
      const start = new Date(`${dateStr}T${convertTo24Hour(shift.start)}`);
      const end = new Date(`${dateStr}T${convertTo24Hour(shift.end)}`);

      if (isNaN(start.getTime()) || isNaN(end.getTime())) continue;

      const payload = {
        employeeId: parseInt(shift.employeeId),
        employeeName: employee?.name,
        title: `${employee?.name}'s Shift`,
        salonId: user.id,
        start,
        end,
      };

      await fetch('/api/schedules/edit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
    }

    const refreshed = await fetch(`/api/schedules/business?salonId=${user.id}`);
    const freshData = await refreshed.json();
    const formatted = (freshData.schedules || []).map(event => ({
      ...event,
      start: new Date(event.start),
      end: new Date(event.end),
    }));
    setEvents(formatted);
    setSelectedDay(null);
  };

  return (
    <div className="min-h-screen pt-24 px-6 bg-gradient-to-b from-violet-100 to-white dark:from-gray-900 dark:to-gray-800">
      <Navbar />
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-extrabold text-purple-700 dark:text-purple-300 text-center mb-6">
          👥 Employee Schedule Overview
        </h1>

        {/* Day Selector */}
        <div className="flex gap-2 mb-6 justify-center flex-wrap">
          {weekdays.map(day => (
            <Button
              key={day}
              variant={selectedDay === day ? 'default' : 'outline'}
              onClick={() => handleDayClick(day)}
            >
              {day}
            </Button>
          ))}
        </div>

        {/* Shift Form */}
        {selectedDay && (
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-xl border border-purple-300 dark:border-purple-700 mb-10">
            <h2 className="text-xl font-bold text-purple-700 dark:text-purple-300 mb-4">Shifts for {selectedDay}</h2>
            {shifts.map((shift, idx) => (
              <div key={idx} className="flex flex-wrap gap-4 items-center mb-4">
                <select
                  className="p-2 border border-gray-300 rounded"
                  value={shift.employeeId}
                  onChange={(e) => handleShiftChange(idx, 'employeeId', e.target.value)}
                >
                  <option value="">Select Employee</option>
                  {employees.map(emp => (
                    <option key={emp.employeeId} value={emp.employeeId}>{emp.name}</option>
                  ))}
                </select>
                <select className="p-2 border border-gray-300 rounded" value={shift.start} onChange={(e) => handleShiftChange(idx, 'start', e.target.value)}>
                  <option value="">Start Time</option>
                  {timeOptions.map(t => <option key={t}>{t}</option>)}
                </select>
                <span>to</span>
                <select className="p-2 border border-gray-300 rounded" value={shift.end} onChange={(e) => handleShiftChange(idx, 'end', e.target.value)}>
                  <option value="">End Time</option>
                  {timeOptions.map(t => <option key={t}>{t}</option>)}
                </select>
              </div>
            ))}
            <Button variant="outline" onClick={handleAddShift} className="mb-4">Add Shift</Button>
            <Button className="bg-purple-600 text-white hover:bg-purple-700" onClick={handleSaveShifts}>Save Shifts</Button>
          </div>
        )}

        {/* Calendar */}
        <div className="h-[650px] bg-white dark:bg-gray-800 rounded-xl shadow-xl border border-purple-300 dark:border-purple-700 p-4">
          <Calendar
            localizer={localizer}
            events={events}
            startAccessor="start"
            endAccessor="end"
            views={["week", "day"]}
            defaultView="week"
            style={{ height: "100%" }}
          />
        </div>
      </div>
    </div>
  );
}
