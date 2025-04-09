// src/components/CropModal.jsx

"use client";

import React, { useState, useCallback } from "react";
import Cropper from "react-easy-crop";
import getCroppedImg from "@/app/utils/getCroppedImg";
import { Dialog } from "@headlessui/react";

export default function CropModal({ image, aspect, onClose, onCropComplete }) {
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState(null);

  const handleCropComplete = useCallback((_, croppedPixels) => {
    setCroppedAreaPixels(croppedPixels);
  }, []);

  const handleDone = async () => {
    try {
      const croppedBlob = await getCroppedImg(image, croppedAreaPixels);
      onCropComplete(croppedBlob);
      onClose();
    } catch (e) {
      console.error("Cropping failed", e);
    }
  };

  return (
    <Dialog open={!!image} onClose={onClose} className="fixed z-50 inset-0 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white rounded-xl shadow-lg w-[90vw] max-w-2xl h-[75vh] p-4 relative">
        <Cropper
          image={image}
          crop={crop}
          zoom={zoom}
          aspect={aspect}
          onCropChange={setCrop}
          onZoomChange={setZoom}
          onCropComplete={handleCropComplete}
        />

        <div className="absolute bottom-4 right-4 space-x-3">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-300 text-black rounded-lg hover:bg-gray-400"
          >
            Cancel
          </button>
          <button
            onClick={handleDone}
            className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
          >
            Done
          </button>
        </div>
      </div>
    </Dialog>
  );
}