// src/app/api/modifyPage/route.js
import { connectToDatabase } from '@/app/utils/mongoConnection';
import { v2 as cloudinary } from 'cloudinary';

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Disable body parser
export const config = {
  api: {
    bodyParser: false,
  },
};

// Read the incoming form manually
export async function PUT(req) {
  const { searchParams } = new URL(req.url, `http://${req.headers.host}`);
  const salonId = searchParams.get('salonId');

  if (!salonId) {
    return new Response(JSON.stringify({ error: 'Missing salonId' }), { status: 400 });
  }

  try {
    const formData = await req.formData();

    const phone = formData.get('phone');
    const description = formData.get('description');
    const email = formData.get('email');
    const address = formData.get('address');
    const logoFile = formData.get('logo');

    const updateFields = {
      Phone: phone,
      Description: description,
      email,
      address,
    };

    if (logoFile && typeof logoFile === 'object') {
      const arrayBuffer = await logoFile.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);

      const uploadRes = await new Promise((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream(
          { folder: 'salons' },
          (err, result) => {
            if (err) reject(err);
            else resolve(result);
          }
        );
        stream.end(buffer);
      });

      updateFields.logo = uploadRes.secure_url;
    }

    const { db } = await connectToDatabase();

    const result = await db.collection('Business').updateOne(
      { salonId: parseInt(salonId) },
      { $set: updateFields }
    );

    if (result.matchedCount === 0) {
      return new Response(JSON.stringify({ error: 'Salon not found' }), { status: 404 });
    }

    return new Response(JSON.stringify({ message: 'Salon updated successfully' }), { status: 200 });
  } catch (err) {
    console.error('PUT error in modifyPage:', err);
    return new Response(JSON.stringify({ error: 'Internal Server Error' }), { status: 500 });
  }
}

// GET still works fine
export async function GET(req) {
  const { searchParams } = new URL(req.url, `http://${req.headers.host}`);
  const salonId = searchParams.get('salonId');

  if (!salonId) {
    return new Response(JSON.stringify({ error: 'Missing salonId' }), { status: 400 });
  }

  try {
    const { db } = await connectToDatabase();
    const salon = await db.collection('Business').findOne({ salonId: parseInt(salonId) });

    if (!salon) {
      return new Response(JSON.stringify({ error: 'Salon not found' }), { status: 404 });
    }

    return new Response(JSON.stringify(salon), { status: 200 });
  } catch (err) {
    console.error('GET error in modifyPage:', err);
    return new Response(JSON.stringify({ error: 'Internal Server Error' }), { status: 500 });
  }
}

