'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/app/context/AuthContext';
import Navbar from '@/components/Navbar';
import Cropper from 'react-easy-crop';
import getCroppedImg from '@/app/utils/getCroppedImg';

export default function ModifyBusinessPage() {
  const { user, logout } = useAuth();
  const router = useRouter();
  const [loading, setLoading] = useState(true);

  const [Description, setDescription] = useState('');
  const [email, setEmail] = useState('');
  const [Phone, setPhone] = useState('');
  const [address, setAddress] = useState('');

  const [logoSrc, setLogoSrc] = useState(null);
  const [bannerSrc, setBannerSrc] = useState(null);

  const [cropLogo, setCropLogo] = useState({ x: 0, y: 0 });
  const [zoomLogo, setZoomLogo] = useState(1);
  const [croppedLogoArea, setCroppedLogoArea] = useState(null);

  const [cropBanner, setCropBanner] = useState({ x: 0, y: 0 });
  const [zoomBanner, setZoomBanner] = useState(1);
  const [croppedBannerArea, setCroppedBannerArea] = useState(null);

  useEffect(() => {
    if (!user || !user.id) {
      router.push('/');
      return;
    }
    fetchBusinessDetails(user.id);
  }, [user, router]);

  const fetchBusinessDetails = async (salonId) => {
    try {
      const res = await fetch(`/api/modifyPage?salonId=${salonId}`);
      if (!res.ok) throw new Error('Failed to fetch');
      const data = await res.json();
      setPhone(data.Phone || '');
      setDescription(data.Description || '');
      setEmail(data.email || '');
      setAddress(data.address || '');
    } catch (err) {
      console.error('Error fetching:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCropComplete = useCallback((_, croppedAreaPixels, setter) => {
    setter(croppedAreaPixels);
  }, []);

  const getImageBlob = async (src, croppedAreaPixels) => {
    return await getCroppedImg(src, croppedAreaPixels);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const formData = new FormData();
    formData.append('phone', Phone);
    formData.append('description', Description);
    formData.append('email', email);
    formData.append('address', address);

    if (logoSrc && croppedLogoArea) {
      const cropped = await getImageBlob(logoSrc, croppedLogoArea);
      formData.append('logo', cropped, 'cropped-logo.jpg');
    }

    if (bannerSrc && croppedBannerArea) {
      const cropped = await getImageBlob(bannerSrc, croppedBannerArea);
      formData.append('banner', cropped, 'cropped-banner.jpg');
    }

    try {
      const res = await fetch(`/api/modifyPage?salonId=${user.id}`, {
        method: 'PUT',
        body: formData,
      });
      const data = await res.json();
      if (res.ok) alert('Update successful!');
      else throw new Error(data.error);
    } catch (err) {
      console.error('Update error:', err);
      alert('Failed to update business.');
    }
  };

  if (loading) {
    return (
      <div className="text-center mt-10 text-purple-600">
        Loading...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-violet-100 via-purple-50 to-white dark:from-gray-900 dark:to-gray-800">
      <Navbar />
      <div className="max-w-3xl mx-auto mt-6 p-6 bg-white dark:bg-gray-800 shadow-xl rounded-3xl border border-purple-200 dark:border-purple-700">
        <h2 className="text-3xl font-extrabold text-purple-700 dark:text-purple-300 text-center mb-6">Modify Business Page</h2>
        <form onSubmit={handleSubmit} encType="multipart/form-data" className="space-y-6">
          <input type="text" placeholder="Phone" value={Phone} onChange={(e) => setPhone(e.target.value)} className="w-full p-2 border border-gray-300 rounded" />
          <input type="text" placeholder="Description" value={Description} onChange={(e) => setDescription(e.target.value)} className="w-full p-2 border border-gray-300 rounded" />
          <input type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} className="w-full p-2 border border-gray-300 rounded" />
          <input type="text" placeholder="Address" value={address} onChange={(e) => setAddress(e.target.value)} className="w-full p-2 border border-gray-300 rounded" />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block mb-1 text-sm font-medium text-gray-700 dark:text-gray-300">Upload Salon Logo</label>
              <input
                type="file"
                accept="image/*"
                onChange={(e) => {
                  const file = e.target.files[0];
                  if (file) setLogoSrc(URL.createObjectURL(file));
                }}
                className="w-full p-2 border border-gray-300 rounded"
              />
              {logoSrc && (
                <div className="mt-2 h-64 relative bg-gray-100 rounded overflow-hidden">
                  <Cropper
                    image={logoSrc}
                    crop={cropLogo}
                    zoom={zoomLogo}
                    aspect={1}
                    onCropChange={setCropLogo}
                    onZoomChange={setZoomLogo}
                    onCropComplete={(c, p) => handleCropComplete(c, p, setCroppedLogoArea)}
                  />
                </div>
              )}
            </div>

            <div>
              <label className="block mb-1 text-sm font-medium text-gray-700 dark:text-gray-300">Upload Banner Image</label>
              <input
                type="file"
                accept="image/*"
                onChange={(e) => {
                  const file = e.target.files[0];
                  if (file) setBannerSrc(URL.createObjectURL(file));
                }}
                className="w-full p-2 border border-gray-300 rounded"
              />
              {bannerSrc && (
                <div className="mt-2 h-64 relative bg-gray-100 rounded overflow-hidden">
                  <Cropper
                    image={bannerSrc}
                    crop={cropBanner}
                    zoom={zoomBanner}
                    aspect={3.5 / 1}
                    onCropChange={setCropBanner}
                    onZoomChange={setZoomBanner}
                    onCropComplete={(c, p) => handleCropComplete(c, p, setCroppedBannerArea)}
                  />
                </div>
              )}
            </div>
          </div>

          <button type="submit" className="w-full bg-purple-600 text-white p-2 rounded hover:bg-purple-700">
            Update
          </button>
        </form>
      </div>
    </div>
  );
}

