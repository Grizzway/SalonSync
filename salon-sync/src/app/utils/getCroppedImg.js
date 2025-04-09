// src/utils/getCroppedImg.js

export default function getCroppedImg(imageSrc, crop, fileName = 'cropped.jpeg') {
    return new Promise((resolve, reject) => {
      const image = new Image();
      image.src = imageSrc;
      image.crossOrigin = 'anonymous';
  
      image.onload = () => {
        const canvas = document.createElement('canvas');
        const scaleX = image.naturalWidth / image.width;
        const scaleY = image.naturalHeight / image.height;
        canvas.width = crop.width;
        canvas.height = crop.height;
        const ctx = canvas.getContext('2d');
  
        ctx.drawImage(
          image,
          crop.x * scaleX,
          crop.y * scaleY,
          crop.width * scaleX,
          crop.height * scaleY,
          0,
          0,
          crop.width,
          crop.height
        );
  
        canvas.toBlob((blob) => {
          if (!blob) {
            return reject(new Error('Canvas is empty'));
          }
          const file = new File([blob], fileName, { type: 'image/jpeg' });
          resolve(file);
        }, 'image/jpeg');
      };
  
      image.onerror = () => {
        reject(new Error('Failed to load image'));
      };
    });
  }
  