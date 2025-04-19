// src/app/dashboard/employee/edit/page.js
'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/app/context/AuthContext';
import Cropper from 'react-easy-crop';
import getCroppedImg from '@/app/utils/getCroppedImg';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';

export default function EditEmployeeProfilePage() {
  const { user, login } = useAuth();
  const router = useRouter();

  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [bio, setBio] = useState('');
  const [specialties, setSpecialties] = useState('');
  const [profileSrc, setProfileSrc] = useState(null);
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedArea, setCroppedArea] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!user || user.type !== 'employee') return router.push('/');

    fetch(`/api/employee/profile?employeeId=${user.id}`)
      .then(res => res.json())
      .then(data => {
        const [first, ...rest] = data.name?.split(' ') || [''];
        setFirstName(first);
        setLastName(rest.join(' '));
        setBio(data.bio || '');
        setSpecialties((data.specialties || []).join(', '));
      });
  }, [user]);

  const handleCropComplete = useCallback((_, croppedAreaPixels) => {
    setCroppedArea(croppedAreaPixels);
  }, []);

  const getImageBlob = async () => {
    return await getCroppedImg(profileSrc, croppedArea);
  };

  const handleSubmit = async () => {
    setLoading(true);
    const formData = new FormData();
    formData.append('employeeId', user.id);
    formData.append('name', `${firstName} ${lastName}`);
    formData.append('bio', bio);
    formData.append('specialties', specialties);

    if (profileSrc && croppedArea) {
      const cropped = await getImageBlob();
      formData.append('profilePicture', cropped, 'profile.jpg');
    }

    const res = await fetch('/api/employee/profile', {
      method: 'PATCH',
      body: formData,
    });

    const data = await res.json();
    setLoading(false);

    if (res.ok) {
      login(data.user);
      router.push('/dashboard/employee');
    } else {
      alert(data.message || 'Failed to update profile');
    }
  };

  return (
    <div className="min-h-screen pt-24 px-6 bg-gradient-to-b from-violet-100 to-white dark:from-gray-900 dark:to-gray-800 text-gray-900 dark:text-white">
      <div className="max-w-2xl mx-auto bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-purple-200 dark:border-purple-700 p-8">
        <h1 className="text-3xl font-bold text-center text-purple-700 dark:text-purple-300 mb-6">Edit Your Profile</h1>

        <div className="space-y-4">
          <div className="flex gap-4">
            <Input placeholder="First Name" value={firstName} onChange={e => setFirstName(e.target.value)} />
            <Input placeholder="Last Name" value={lastName} onChange={e => setLastName(e.target.value)} />
          </div>

          <Textarea placeholder="Bio" value={bio} onChange={e => setBio(e.target.value)} />
          <Input placeholder="Specialties (comma separated)" value={specialties} onChange={e => setSpecialties(e.target.value)} />

          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Upload Profile Picture</label>
          <input type="file" accept="image/*" onChange={e => {
            const file = e.target.files[0];
            if (file) setProfileSrc(URL.createObjectURL(file));
          }} />

          {profileSrc && (
            <div className="mt-4 h-64 relative bg-gray-100 rounded overflow-hidden">
              <Cropper
                image={profileSrc}
                crop={crop}
                zoom={zoom}
                aspect={1}
                onCropChange={setCrop}
                onZoomChange={setZoom}
                onCropComplete={handleCropComplete}
              />
            </div>
          )}

          <Button onClick={handleSubmit} disabled={loading} className="w-full bg-fuchsia-600 text-white hover:bg-fuchsia-700">
            {loading ? <Loader2 className="animate-spin h-5 w-5" /> : 'Save Changes'}
          </Button>

          <Button
            className="mt-8 w-full bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-800 dark:text-white"
            onClick={() => router.push('/dashboard/employee')}
          >
            ⬅ Return to Dashboard
          </Button>
        </div>
      </div>
    </div>
  );
}