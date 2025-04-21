// /src/app/api/upload/customer-image/route.js

import { connectToDatabase } from '@/app/utils/mongoConnection';
import { v2 as cloudinary } from 'cloudinary';

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export const config = {
  api: {
    bodyParser: false,
  },
};

export async function POST(req) {
  try {
    const formData = await req.formData();
    const file = formData.get('file');

    if (!file || typeof file !== 'object') {
      return new Response(JSON.stringify({ error: 'No file uploaded' }), { status: 400 });
    }

    const buffer = Buffer.from(await file.arrayBuffer());

    const uploadResult = await new Promise((resolve, reject) => {
      cloudinary.uploader.upload_stream(
        {
          folder: 'customers/profilePics',
          resource_type: 'image',
        },
        (err, result) => {
          if (err) reject(err);
          else resolve(result);
        }
      ).end(buffer);
    });

    return new Response(JSON.stringify(uploadResult), { status: 200 });
  } catch (err) {
    console.error('Cloudinary upload failed:', err);
    return new Response(JSON.stringify({ error: 'Image upload failed' }), { status: 500 });
  }
}
