'use client';

import { useState, useCallback } from 'react';
import { Dialog } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import Cropper from 'react-easy-crop';
import getCroppedImg from '@/app/utils/getCroppedImg';

export default function SurveyModal({ open, onClose, customerId, onSurveyComplete }) {
  const [form, setForm] = useState({
    hairType: '',
    allergies: '',
    preferences: '',
    experienceRating: '',
    comments: ''
  });
  const [imageSrc, setImageSrc] = useState(null);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState(null);
  const [zoom, setZoom] = useState(1);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  const handleCropComplete = useCallback((_, croppedPixels) => {
    setCroppedAreaPixels(croppedPixels);
  }, []);

  const handleSubmit = async () => {
    let profilePictureUrl = null;

    if (imageSrc && croppedAreaPixels) {
      const cropped = await getCroppedImg(imageSrc, croppedAreaPixels);
      const formData = new FormData();
      formData.append('file', cropped, 'profile-picture.jpg');

      const uploadRes = await fetch('/api/upload/customer-image', {
        method: 'POST',
        body: formData,
      });

      const uploadData = await uploadRes.json();
      profilePictureUrl = uploadData.secure_url;
    }

    const res = await fetch('/api/customer/survey', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        customerId,
        responses: { ...form, profilePicture: profilePictureUrl || null }
      })
    });

    if (res.ok) {
      onSurveyComplete();
      onClose();
    } else {
      alert('Failed to save survey.');
    }
  };

  return (
    open && (
      <div className="fixed inset-0 z-50 bg-black bg-opacity-50 flex items-center justify-center p-4">
        <div className="p-6 space-y-4 bg-white dark:bg-gray-900 rounded-xl shadow-xl w-full max-w-lg relative z-60">
          <h2 className="text-2xl font-bold text-purple-700 dark:text-fuchsia-300 text-center">Customer Survey</h2>
  
          <Input placeholder="Hair Type" name="hairType" value={form.hairType} onChange={handleChange} />
          <Input placeholder="Allergies" name="allergies" value={form.allergies} onChange={handleChange} />
          <Input placeholder="Stylist Preferences" name="preferences" value={form.preferences} onChange={handleChange} />
          <Input placeholder="Rate Your Salon Experiences (1–5)" name="experienceRating" value={form.experienceRating} onChange={handleChange} />
          <Input placeholder="Other Comments" name="comments" value={form.comments} onChange={handleChange} />
  
          <div>
            <label className="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">Upload Profile Picture</label>
            <input
              type="file"
              accept="image/*"
              onChange={(e) => {
                const file = e.target.files[0];
                if (file) setImageSrc(URL.createObjectURL(file));
              }}
              className="w-full p-2 border border-gray-300 rounded"
            />
            {imageSrc && (
              <div className="mt-2 h-64 relative bg-gray-100 rounded overflow-hidden">
                <Cropper
                  image={imageSrc}
                  crop={{ x: 0, y: 0 }}
                  zoom={zoom}
                  aspect={1}
                  onCropChange={() => {}}
                  onZoomChange={setZoom}
                  onCropComplete={handleCropComplete}
                />
              </div>
            )}
          </div>
  
          <div className="flex justify-end gap-4 pt-4">
            <Button variant="secondary" onClick={onClose}>Cancel</Button>
            <Button onClick={handleSubmit} className="bg-purple-600 text-white hover:bg-purple-700">Submit Survey</Button>
          </div>
        </div>
      </div>
    )
  );
  
}
