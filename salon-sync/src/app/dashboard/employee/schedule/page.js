"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/app/context/AuthContext";
import { useRouter } from "next/navigation";
import Navbar from "@/components/Navbar";
import { Button } from "@/components/ui/button";

export default function EmployeeSchedulePage() {
  const { user } = useAuth();
  const router = useRouter();
  const [schedule, setSchedule] = useState([]);
  const [weekStart, setWeekStart] = useState(getStartOfWeek(new Date()));

  function getStartOfWeek(date) {
    const d = new Date(date);
    const day = d.getDay();
    const diff = d.getDate() - day;
    return new Date(d.setDate(diff));
  }

  function getEndOfWeek(start) {
    const end = new Date(start);
    end.setDate(end.getDate() + 7);
    return end;
  }

  const goToPreviousWeek = () => {
    const prev = new Date(weekStart);
    prev.setDate(prev.getDate() - 7);
    setWeekStart(getStartOfWeek(prev));
  };

  const goToNextWeek = () => {
    const next = new Date(weekStart);
    next.setDate(next.getDate() + 7);
    setWeekStart(getStartOfWeek(next));
  };

  useEffect(() => {
    if (!user || user.type !== "employee") {
      router.push("/");
      return;
    }

    const fetchSchedule = async () => {
      try {
        const res = await fetch(`/api/schedules/employee?employeeId=${user.id}`);
        const data = await res.json();

        const start = new Date(weekStart);
        const end = getEndOfWeek(start);

        const filtered = (data.schedules || []).filter(shift => {
          const shiftDate = new Date(shift.start);
          return shiftDate >= start && shiftDate < end;
        });

        filtered.sort((a, b) => new Date(a.start) - new Date(b.start));
        setSchedule(filtered);
      } catch (err) {
        console.error("Failed to load schedule:", err);
      }
    };

    fetchSchedule();
  }, [user, weekStart]);

  const formattedWeekRange = () => {
    const start = new Date(weekStart);
    const end = getEndOfWeek(start);
    return `${start.toLocaleDateString()} - ${new Date(end - 1).toLocaleDateString()}`;
  };

  return (
    <div className="min-h-screen pt-24 px-6 bg-gradient-to-b from-violet-100 to-white dark:from-gray-900 dark:to-gray-800 text-gray-900 dark:text-white">
      <Navbar />
      <div className="max-w-3xl mx-auto">
        <h1 className="text-4xl font-extrabold text-center text-purple-700 dark:text-fuchsia-300 mb-6">
          Your Scheduled Shifts
        </h1>

        <div className="flex justify-between items-center mb-4">
          <Button variant="outline" onClick={goToPreviousWeek}>← Previous</Button>
          <span className="text-lg font-semibold text-purple-700 dark:text-purple-300">
            Week: {formattedWeekRange()}
          </span>
          <Button variant="outline" onClick={goToNextWeek}>Next →</Button>
        </div>

        <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-xl border border-purple-300 dark:border-purple-700">
          {schedule.length === 0 ? (
            <p className="text-center text-gray-600 dark:text-gray-400">
              You have no shifts scheduled this week.
            </p>
          ) : (
            <ul className="space-y-4">
              {schedule.map((shift, index) => (
                <li key={index} className="border border-purple-200 dark:border-purple-600 rounded-lg p-4">
                  <p className="font-bold text-purple-700 dark:text-purple-300">
                    {new Date(shift.start).toLocaleDateString("en-US", {
                      weekday: "long",
                      month: "short",
                      day: "numeric"
                    })}
                  </p>
                  <p className="text-gray-700 dark:text-gray-200">
                    {new Date(shift.start).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} - {new Date(shift.end).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </p>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}


