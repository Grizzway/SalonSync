'use client';

import { useState, useEffect } from 'react';
import Navbar from "@/components/Navbar";
import { useAuth } from '@/app/context/AuthContext';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Loader2, XCircle } from 'lucide-react';
import Image from 'next/image';

export default function EmployeesPage() {
    const { user } = useAuth(); // Access user data from AuthContext
    const [employees, setEmployees] = useState([]);
    const [loadingEmployees, setLoadingEmployees] = useState(true); // Loading state for employees
    const [openModal, setOpenModal] = useState(false);
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [selectedEmployeeId, setSelectedEmployeeId] = useState(null);
    const [newEmployeeName, setNewEmployeeName] = useState('');
    const [newEmployeeEmail, setNewEmployeeEmail] = useState('');
    const [submitting, setSubmitting] = useState(false);

    const fetchEmployees = async (salonId) => {
        try {
          console.log('Fetching employees for salonId:', salonId); // Debugging log
          setLoadingEmployees(true); // Start loading
          const res = await fetch(`/api/employees?salonId=${salonId}`, {
            method: 'GET',
          });
    
          if (!res.ok) {
            console.error('Failed to fetch employees:', res.statusText);
            return;
          }
    
          const data = await res.json();
          console.log('Employees fetched:', data); // Debugging log
    
          if (!data?.employees || data.employees.length === 0) {
            console.log('No employees found');
            setEmployees([]); // Set empty array if no employees are found
          } else {
            setEmployees(data.employees); // Set the fetched employees
          }
        } catch (error) {
          console.error('Error fetching employees:', error);
        } finally {
          setLoadingEmployees(false); // Stop loading
        }
      };
    
      useEffect(() => {
        // Check if user is available and has a valid ID
        if (user?.id) {
          console.log('User found, fetching employees');
          fetchEmployees(user.id);
        } else {
          console.log('User not loaded yet, retrying every 500ms');
        }
    
        const interval = setInterval(() => {
          if (user?.id) {
            console.log('User ID found, fetching employees...');
            fetchEmployees(user.id);
            clearInterval(interval); // Stop retrying once we have the user.id
          }
        }, 500); // Retry every 500ms
    
        return () => clearInterval(interval); // Cleanup interval on component unmount
      }, [user]);

  const handleSubmit = async () => {
    setSubmitting(true);
    try {
      const res = await fetch('/api/employees', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          salonId: user?.id,
          salonName: user?.businessName,
          name: newEmployeeName,
          email: newEmployeeEmail,
        }),
      });
      if (res.ok) {
        const updated = await res.json();
        setEmployees(updated.employees); // Refresh the employee list after adding a new employee
        setOpenModal(false);
        setNewEmployeeName('');
        setNewEmployeeEmail('');
      }
    } catch (error) {
      console.error('Error adding employee:', error);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!selectedEmployeeId) return;

    try {
      const res = await fetch(`/api/employees`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ employeeId: selectedEmployeeId }),
      });

      if (res.ok) {
        const updated = await res.json();
        setEmployees(updated.employees); // Refresh the employee list after deletion
      }
    } catch (error) {
      console.error('Error deleting employee:', error);
    } finally {
      setDeleteDialogOpen(false);
      setSelectedEmployeeId(null);
    }
  };

  return (
    <div className="">
        <Navbar />
      <div className="flex justify-between items-center mb-6 p-6">
        <h1 className="text-2xl font-bold">Employees</h1>
        <Button onClick={() => setOpenModal(true)}>Add Employee</Button>
      </div>

      {/* Show the employees if they're fetched, otherwise show the loader */}
      <div className="relative">
        {loadingEmployees ? (
          <div className="flex justify-center items-center h-[60vh]">
            <Loader2 className="h-10 w-10 animate-spin" />
          </div>
        ) : employees.length === 0 ? (
          <div className="flex justify-center items-center h-[60vh] text-gray-500">
            No employees yet.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {employees.map((employee) => (
              <Card key={employee._id} className="relative p-6">
                <button
                  className="absolute top-2 right-2 text-red-500 hover:text-red-700"
                  onClick={() => {
                    setSelectedEmployeeId(employee._id);
                    setDeleteDialogOpen(true);
                  }}
                >
                  <XCircle size={20} />
                </button>

                <div className="flex flex-col items-center">
                  {employee.profilePicture ? (
                    <Image
                      src={employee.profilePicture}
                      alt={`${employee.name}'s Profile`}
                      width={80}
                      height={80}
                      className="rounded-full object-cover"
                    />
                  ) : (
                    <div className="w-20 h-20 rounded-full bg-gray-300 flex items-center justify-center text-gray-600">
                      <span className="text-xl">👤</span>
                    </div>
                  )}
                  <h2 className="mt-4 font-semibold text-lg">{employee.name}</h2>
                  <p className="text-gray-500 text-center text-sm mt-2">
                    {employee.bio || 'No bio provided.'}
                  </p>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Add Employee Modal */}
      <Dialog open={openModal} onOpenChange={setOpenModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add New Employee</DialogTitle>
          </DialogHeader>
          <div className="flex flex-col gap-4">
            <Input
              placeholder="Name"
              value={newEmployeeName}
              onChange={(e) => setNewEmployeeName(e.target.value)}
            />
            <Input
              placeholder="Email"
              value={newEmployeeEmail}
              onChange={(e) => setNewEmployeeEmail(e.target.value)}
            />
            <Button onClick={handleSubmit} disabled={submitting}>
              {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Add Employee'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Are you sure you want to remove this employee?</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-gray-500 mb-4">
            This can not be undone and you will have to re-invite them.
          </p>
          <DialogFooter className="flex gap-4">
            <Button variant="destructive" onClick={handleDelete}>
              Remove Employee
            </Button>
            <Button variant="outline" onClick={() => setDeleteDialogOpen(false)}>
              Cancel
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
