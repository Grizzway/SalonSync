'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';

export default function SurveyModal({ open, onClose, onSurveyComplete, customerId, prefill }) {
  const [form, setForm] = useState({
    hairType: '',
    hairTexture: '',
    curlType: '',
    hairLength: '',
    colorHistory: '',
    hairDamageInfo: '',
    shampooConditioner: '',
    skincareRoutine: '',
    sensitiveSkin: '',
    skinType: '',
    allergies: ''
  });

  const [errors, setErrors] = useState({});
  const [formErrorMessage, setFormErrorMessage] = useState('');

  useEffect(() => {
    if (open && prefill) {
      setForm(prefill);
    } else if (open) {
      setForm({
        hairType: '',
        hairTexture: '',
        curlType: '',
        hairLength: '',
        colorHistory: '',
        hairDamageInfo: '',
        shampooConditioner: '',
        skincareRoutine: '',
        sensitiveSkin: '',
        skinType: '',
        allergies: ''
      });
    }
  }, [open, prefill]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
    setErrors(prev => ({ ...prev, [name]: '' }));
    setFormErrorMessage('');
  };

  const validateForm = () => {
    const newErrors = {};
    for (const key in form) {
      if (key === 'curlType' && form.hairTexture !== 'Curly') continue;
      if (!form[key]) newErrors[key] = 'This field is required.';
    }
    setErrors(newErrors);
    if (Object.keys(newErrors).length > 0) {
      setFormErrorMessage('Please fill out all the required fields.');
    }
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    const res = await fetch('/api/customer/survey', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        customerId,
        responses: form,
      }),
    });

    if (res.ok) {
      onSurveyComplete();
      onClose();
    } else {
      alert('Failed to save survey.');
    }
  };

  const inputClass = (field) => `w-full p-2 border rounded ${errors[field] ? 'border-red-500' : ''}`;
  const textAreaClass = (field) => `w-full p-3 border rounded h-28 ${errors[field] ? 'border-red-500' : ''}`;

  return (
    open && (
      <div className="fixed inset-0 z-50 bg-black bg-opacity-50 flex items-center justify-center p-4">
        <div className="p-6 space-y-6 bg-white dark:bg-gray-900 rounded-xl shadow-xl w-full max-w-2xl relative z-60 overflow-y-auto max-h-screen">
          <h2 className="text-2xl font-bold text-purple-700 dark:text-fuchsia-300 text-center">Customer Survey</h2>

          {formErrorMessage && (
            <div className="text-red-600 font-medium text-center">{formErrorMessage}</div>
          )}

          {/* Hair Section */}
          <div>
            <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-200">Hair</h3>
            <div className="space-y-2">
              <select name="hairType" value={form.hairType} onChange={handleChange} className={inputClass('hairType')}>
                <option value="">Hair Type</option>
                <option value="Thin">Thin</option>
                <option value="Medium">Medium</option>
                <option value="Thick">Thick</option>
              </select>

              <select name="hairTexture" value={form.hairTexture} onChange={handleChange} className={inputClass('hairTexture')}>
                <option value="">Hair Texture</option>
                <option value="Fine">Fine</option>
                <option value="Straight">Straight</option>
                <option value="Coarse">Coarse</option>
                <option value="Curly">Curly</option>
              </select>

              {form.hairTexture === 'Curly' && (
                <select name="curlType" value={form.curlType} onChange={handleChange} className={inputClass('curlType')}>
                  <option value="">Curl Type</option>
                  <option value="Wavy">Wavy</option>
                  <option value="Medium Curls">Medium Curls</option>
                  <option value="Tight Curls">Tight Curls</option>
                </select>
              )}

              <select name="hairLength" value={form.hairLength} onChange={handleChange} className={inputClass('hairLength')}>
                <option value="">Hair Length</option>
                <option value="None">None</option>
                <option value="Very Short">Very Short</option>
                <option value="Chin Length">Chin Length</option>
                <option value="Shoulder Length">Shoulder Length</option>
                <option value="Longer">Longer</option>
              </select>

              <textarea name="colorHistory" value={form.colorHistory} onChange={handleChange} placeholder="Color History" className={textAreaClass('colorHistory')} />
              <textarea name="hairDamageInfo" value={form.hairDamageInfo} onChange={handleChange} placeholder="Is your hair damaged? If so give information." className={textAreaClass('hairDamageInfo')} />
              <textarea name="shampooConditioner" value={form.shampooConditioner} onChange={handleChange} placeholder="What Shampoo and Conditioner do you use?" className={textAreaClass('shampooConditioner')} />
            </div>
          </div>

          <hr className="my-4" />

          {/* Skin Section */}
          <div>
            <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-200">Skin</h3>
            <textarea name="skincareRoutine" value={form.skincareRoutine} onChange={handleChange} placeholder="What is your skin care routine? Products?" className={textAreaClass('skincareRoutine')} />
            <div className={`flex items-center gap-4 mt-2 ${errors.sensitiveSkin ? 'border border-red-500 p-2 rounded' : ''}`}>
              <label className="text-sm font-medium">Would you define your skin as sensitive?</label>
              <label><input type="radio" name="sensitiveSkin" value="Yes" checked={form.sensitiveSkin === 'Yes'} onChange={handleChange} /> Yes</label>
              <label><input type="radio" name="sensitiveSkin" value="No" checked={form.sensitiveSkin === 'No'} onChange={handleChange} /> No</label>
            </div>
            <select name="skinType" value={form.skinType} onChange={handleChange} className={inputClass('skinType')}>
              <option value="">Skin Type</option>
              <option value="Oily">Oily</option>
              <option value="Normal">Normal</option>
              <option value="Dry">Dry</option>
              <option value="Aged">Aged</option>
              <option value="Sun Damaged">Sun Damaged</option>
            </select>
          </div>

          <hr className="my-4" />

          {/* Final Section */}
          <div>
            <textarea name="allergies" value={form.allergies} onChange={handleChange} placeholder="Do you have any allergies? If so list them." className={textAreaClass('allergies')} />
          </div>

          {/* Submit */}
          <div className="flex justify-end gap-4 pt-4">
            <Button variant="secondary" onClick={onClose}>Cancel</Button>
            <Button onClick={handleSubmit} className="bg-purple-600 text-white hover:bg-purple-700">Submit Survey</Button>
          </div>
        </div>
      </div>
    )
  );
}