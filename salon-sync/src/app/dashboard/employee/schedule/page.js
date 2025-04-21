// ✅ FILE: src/app/dashboard/employee/schedule/page.js
"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/app/context/AuthContext";
import { useRouter } from "next/navigation";
import Navbar from "@/components/Navbar";

export default function EmployeeSchedulePage() {
  const { user } = useAuth();
  const router = useRouter();
  const [schedule, setSchedule] = useState([]);

  useEffect(() => {
    if (!user || user.type !== "employee") {
      router.push("/");
      return;
    }

    const salonId = user.salonIds?.[0]; // ✅ Pull from array safely
    if (!salonId) return;

    const fetchSchedule = async () => {
      try {
        const res = await fetch(`/api/schedules/business?salonId=${salonId}`);
        const data = await res.json();

        const filtered = (data.schedules || []).filter(
          shift => parseInt(shift.employeeId) === parseInt(user.id)
        );

        setSchedule(filtered);
      } catch (err) {
        console.error("Failed to load schedule:", err);
      }
    };

    fetchSchedule();
  }, [user]);

  return (
    <div className="min-h-screen pt-24 px-6 bg-gradient-to-b from-violet-100 to-white dark:from-gray-900 dark:to-gray-800 text-gray-900 dark:text-white">
      <Navbar />
      <div className="max-w-3xl mx-auto">
        <h1 className="text-4xl font-extrabold text-center text-purple-700 dark:text-fuchsia-300 mb-10">
          Your Scheduled Shifts
        </h1>
        <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-xl border border-purple-300 dark:border-purple-700">
          {schedule.length === 0 ? (
            <p className="text-center text-gray-600 dark:text-gray-400">
              You have no shifts scheduled.
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
                    {new Date(shift.start).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    {" - "}
                    {new Date(shift.end).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
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




