import { connectToDatabase } from '@/app/utils/mongoConnection';
import { v2 as cloudinary } from 'cloudinary';
import { IncomingForm } from 'formidable'; 
import fs from 'fs';
import bcrypt from 'bcryptjs';
import { cookies } from 'next/headers';

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
      const user = await db.collection('Business').findOne({ salonId: parseInt(salonId) });
      if (!user) return new Response(JSON.stringify({ error: 'Salon not found' }), { status: 404 });
      return new Response(JSON.stringify(user), { status: 200 });
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
        salonId: parseInt(salonId),
      };

      if (files.logo) {
        const logoUpload = await cloudinary.uploader.upload(files.logo[0].filepath, {
          folder: 'salons',
        });
        updateFields.logo = logoUpload.secure_url;
      }

      const result = await db.collection('Business').updateOne(
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

export async function POST(req) {
  try {
    const { email, password } = await req.json();
    const { db } = await connectToDatabase();

    // Find the business user by email
    const user = await db.collection('Business').findOne({ email });
    if (!user) {
      return new Response(JSON.stringify({ success: false, message: 'User not found' }), { status: 404 });
    }

    // Validate the password
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return new Response(JSON.stringify({ success: false, message: 'Invalid password' }), { status: 401 });
    }

    // Prepare user data for the response
    const userData = {
      id: user._id.toString(),
      salonId: user.salonId,
      businessName: user.businessName,
      type: 'business',
    };

    // Set the user data in cookies
    const cookieStore = cookies();
    cookieStore.set('user', JSON.stringify(userData), {
      httpOnly: false,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'Lax',
      path: '/',
      maxAge: 60 * 60 * 24 * 7, // 7 days
    });

    // Return the user data
    return new Response(JSON.stringify({ success: true, user: userData }), { status: 200 });
  } catch (error) {
    console.error('Login Error:', error);
    return new Response(JSON.stringify({ success: false, message: 'Internal Server Error' }), { status: 500 });
  }
}
