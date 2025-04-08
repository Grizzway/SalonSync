// src/app/api/modifyPage/route.js

import { connectToDatabase } from '@/app/utils/mongoConnection';
import { v2 as cloudinary } from 'cloudinary';
import formidable from 'formidable';
import fs from 'fs';

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Required to disable built-in body parsing
export const config = {
  api: {
    bodyParser: false,
  },
};

// GET: Fetch salon info by salonId
export async function GET(req) {
  const { searchParams } = new URL(req.url);
  const salonId = searchParams.get('salonId');

  if (!salonId) {
    return new Response(JSON.stringify({ error: 'Missing salonId' }), { status: 400 });
  }

  try {
    const { db } = await connectToDatabase();
    const salon = await db.collection('salons').findOne({ salonId: parseInt(salonId) });

    if (!salon) {
      return new Response(JSON.stringify({ error: 'Salon not found' }), { status: 404 });
    }

    return new Response(JSON.stringify(salon), { status: 200 });
  } catch (error) {
    console.error('GET error in modifyPage:', error);
    return new Response(JSON.stringify({ error: 'Internal Server Error' }), { status: 500 });
  }
}

// PUT: Update salon info by salonId
export async function PUT(req) {
  const { searchParams } = new URL(req.url);
  const salonId = searchParams.get('salonId');

  if (!salonId) {
    return new Response(JSON.stringify({ error: 'Missing salonId' }), { status: 400 });
  }

  const form = new formidable.IncomingForm({ multiples: false });

  try {
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
      const upload = await cloudinary.uploader.upload(files.logo[0].filepath, {
        folder: 'salons',
      });
      updateFields.logo = upload.secure_url;
    }

    const { db } = await connectToDatabase();

    const result = await db.collection('salons').updateOne(
      { salonId: parseInt(salonId) },
      { $set: updateFields }
    );

    if (result.matchedCount === 0) {
      return new Response(JSON.stringify({ error: 'Salon not found' }), { status: 404 });
    }

    return new Response(JSON.stringify({ message: 'Salon details updated successfully' }), { status: 200 });
  } catch (error) {
    console.error('PUT error in modifyPage:', error);
    return new Response(JSON.stringify({ error: 'Internal Server Error' }), { status: 500 });
  }
}
