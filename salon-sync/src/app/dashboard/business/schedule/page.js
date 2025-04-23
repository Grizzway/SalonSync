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

const weekdays = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
const timeOptions = Array.from({ length: 24 * 2 }, (_, i) => {
  const hour = Math.floor(i / 2) % 12 || 12;
  const suffix = i < 24 ? "AM" : "PM";
  const minutes = i % 2 === 0 ? "00" : "30";
  return `${hour.toString().padStart(2, '0')}:${minutes} ${suffix}`;
});

export default function BusinessSchedulePage() {
  const { user } = useAuth();
  const router = useRouter();
  const [events, setEvents] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [selectedDay, setSelectedDay] = useState(null);
  const [shifts, setShifts] = useState([]);
  const [view, setView] = useState("week");
  const [date, setDate] = useState(new Date());
  const [minTime, setMinTime] = useState(new Date(0, 0, 0, 6));
  const [maxTime, setMaxTime] = useState(new Date(0, 0, 0, 22));

  useEffect(() => {
    if (!user || user.type !== "business") {
      router.push("/");
      return;
    }

    fetch(`/api/schedules/business?salonId=${user.id}`)
      .then(res => res.json())
      .then(data => {
        const formatted = (data.schedules || []).map(event => {
          return {
            title: `${event.employeeName}'s Shift`,
            start: new Date(event.start),
            end: new Date(event.end),
            allDay: false
          };
        });
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
    const normalized = timeStr.toUpperCase().replace(/(AM|PM)$/, ' $1').trim();
    const [time, modifier] = normalized.split(' ');
    let [hours, minutes] = time.split(":");
    if (hours === "12") hours = "00";
    if (modifier === "PM") hours = parseInt(hours, 10) + 12;
    return `${hours.toString().padStart(2, '0')}:${minutes}`;
  };

  const handleSaveShifts = async () => {
    if (!selectedDay || !user) return alert("Missing selected day or user.");

    const today = new Date();
    const todayIndex = today.getDay();
    const shiftIndex = weekdays.indexOf(selectedDay);
    const offset = (shiftIndex - todayIndex + 7) % 7;
    const targetDate = new Date(today);
    targetDate.setDate(today.getDate() + offset);

    const validShifts = shifts.filter(shift => shift.employeeId && shift.start && shift.end);

    if (validShifts.length === 0) {
      alert("No valid shifts to save.");
      return;
    }

    for (const shift of validShifts) {
      const employee = employees.find(e => e.employeeId?.toString() === shift.employeeId?.toString());
      if (!employee) {
        alert("Employee not found for shift");
        continue;
      }

      const start = new Date(`${targetDate.toISOString().split("T")[0]}T${convertTo24Hour(shift.start)}:00`);
      const end = new Date(`${targetDate.toISOString().split("T")[0]}T${convertTo24Hour(shift.end)}:00`);

      const payload = {
        salonId: parseInt(user.id),
        employeeId: parseInt(employee.employeeId),
        employeeName: employee.name,
        title: `${employee.name}'s Shift`,
        start,
        end,
      };

      try {
        const res = await fetch('/api/schedules/edit', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
        if (!res.ok) throw new Error("Failed to insert shift");
      } catch (err) {
        alert("Failed to send shift: " + err.message);
      }
    }

    const refreshed = await fetch(`/api/schedules/business?salonId=${user.id}`);
    const freshData = await refreshed.json();
    const formatted = (freshData.schedules || []).map(event => ({
      title: `${event.employeeName}'s Shift`,
      start: new Date(event.start),
      end: new Date(event.end),
      allDay: false
    }));
    setEvents(formatted);
    setSelectedDay(null);
    alert("Shifts saved and refreshed successfully.");
  };

  return (
    <div className="min-h-screen pt-24 px-6 bg-gradient-to-b from-violet-100 to-white dark:from-gray-900 dark:to-gray-800">
      <Navbar />
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-extrabold text-purple-700 dark:text-purple-300 text-center mb-6">
          👥 Employee Schedule Overview
        </h1>

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

        {selectedDay && (
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-xl border border-purple-300 dark:border-purple-700 mb-10">
            <h2 className="text-xl font-bold text-purple-700 dark:text-purple-300 mb-4">Shifts for {selectedDay}</h2>
            {shifts.map((shift, idx) => (
              <div key={idx} className="flex flex-wrap gap-4 items-center mb-4">
                <select
                  className="p-2 border border-gray-300 rounded"
                  value={shift.employeeId?.toString()}
                  onChange={(e) => handleShiftChange(idx, 'employeeId', e.target.value)}
                >
                  <option value="">Select Employee</option>
                  {employees.map(emp => (
                    <option key={`emp-${emp.employeeId}`} value={emp.employeeId?.toString()}>{emp.name}</option>
                  ))}
                </select>
                <select className="p-2 border border-gray-300 rounded" value={shift.start} onChange={(e) => handleShiftChange(idx, 'start', e.target.value)}>
                  <option value="">Start Time</option>
                  {timeOptions.map((t, i) => <option key={`start-${i}`} value={t}>{t}</option>)}
                </select>
                <span>to</span>
                <select className="p-2 border border-gray-300 rounded" value={shift.end} onChange={(e) => handleShiftChange(idx, 'end', e.target.value)}>
                  <option value="">End Time</option>
                  {timeOptions.map((t, i) => <option key={`end-${i}`} value={t}>{t}</option>)}
                </select>
              </div>
            ))}
            <Button variant="outline" onClick={handleAddShift} className="mb-4">Add Shift</Button>
            <Button
              className="bg-purple-600 text-white hover:bg-purple-700"
              onClick={handleSaveShifts}
            >
              Save Shifts
            </Button>
          </div>
        )}

        <div className="h-[650px] bg-white dark:bg-gray-800 rounded-xl shadow-xl border border-purple-300 dark:border-purple-700 p-4">
          <Calendar
            localizer={localizer}
            events={events}
            startAccessor="start"
            endAccessor="end"
            views={["week", "day"]}
            view={view}
            date={date}
            onView={setView}
            onNavigate={setDate}
            style={{ height: "100%" }}
            toolbar={true}
            min={minTime}
            max={maxTime}
          />
        </div>
      </div>
    </div>
  );
}