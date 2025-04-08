import { connectToDatabase } from '@/app/utils/mongoConnection';
import { v2 as cloudinary } from 'cloudinary';
import { IncomingForm } from 'formidable';  // Correct import
import fs from 'fs';

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

export default async function handler(req) {
  const { searchParams } = new URL(req.url, `http://${req.headers.host}`);
  const salonId = searchParams.get('salonId');

  if (!salonId) {
    return new Response(JSON.stringify({ error: 'Missing salonId' }), { status: 400 });
  }

  try {
    const { db } = await connectToDatabase();

    if (req.method === 'GET') {
      const salon = await db.collection('salons').findOne({ salonId: parseInt(salonId) });
      if (!salon) return new Response(JSON.stringify({ error: 'Salon not found' }), { status: 404 });
      return new Response(JSON.stringify(salon), { status: 200 });
    }

    if (req.method === 'PUT') {
      const form = new IncomingForm({ multiples: false });

      const data = await new Promise((resolve, reject) => {
        form.parse(req, (err, fields, files) => {
          if (err) reject(err);
          else resolve({ fields, files });
        });
      });

      const { fields, files } = data;

      const updateFields = {
        Description: fields.description,
        Phone: fields.phone,
        address: fields.address,
        email: fields.email,
      };

      if (files.logo) {
        const logoUpload = await cloudinary.uploader.upload(files.logo[0].filepath, {
          folder: 'salons',
        });
        updateFields.logo = logoUpload.secure_url;
      }

      const result = await db.collection('salons').updateOne(
        { salonId: parseInt(salonId) },
        { $set: updateFields }
      );

      if (result.matchedCount === 0) {
        return new Response(JSON.stringify({ error: 'Salon not found' }), { status: 404 });
      }

      return new Response(JSON.stringify({ message: 'Salon details updated successfully' }), { status: 200 });
    }

    return new Response(JSON.stringify({ error: 'Method Not Allowed' }), { status: 405 });
  } catch (error) {
    console.error('Error in modifyPage API:', error);
    return new Response(JSON.stringify({ error: 'Internal Server Error' }), { status: 500 });
  }
}
