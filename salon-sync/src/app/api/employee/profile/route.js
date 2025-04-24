import { connectToDatabase } from '@/app/utils/mongoConnection';
import { v2 as cloudinary } from 'cloudinary';
import { writeFile } from 'fs/promises';
import { nanoid } from 'nanoid';
import path from 'path';

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export async function GET(req) {
  let client;

  try {
    const { searchParams } = new URL(req.url);
    const employeeId = Number(searchParams.get('employeeId'));

    if (!employeeId) return new Response(JSON.stringify({ message: 'Missing ID' }), { status: 400 });

    const connection = await connectToDatabase();
    client = connection.client;
    const db = connection.db;

    const employee = await db.collection('Employee').findOne({ employeeId });

    if (!employee) return new Response(JSON.stringify({ message: 'Not found' }), { status: 404 });

    return new Response(
      JSON.stringify({
        name: employee.name,
        bio: employee.bio,
        specialties: employee.specialties || [],
        profilePicture: employee.profilePicture || '',
      }),
      { status: 200 }
    );
  } catch (err) {
    console.error('GET employee profile error:', err);
    return new Response(JSON.stringify({ error: 'Server error' }), { status: 500 });
  } finally {
    if (client && !global._mongoClientPromise) {
      await client.close();
    }
  }
}

export async function PATCH(req) {
  let client;

  try {
    const formData = await req.formData();
    const employeeId = Number(formData.get('employeeId'));
    const name = formData.get('name');
    const bio = formData.get('bio');
    const specialties = formData.get('specialties')?.split(',').map(s => s.trim());
    const imageFile = formData.get('profilePicture');

    if (!employeeId) return new Response(JSON.stringify({ message: 'Missing employee ID' }), { status: 400 });

    const connection = await connectToDatabase();
    client = connection.client;
    const db = connection.db;

    const updateFields = { name, bio, specialties };

    if (imageFile && typeof imageFile.arrayBuffer === 'function') {
      const buffer = Buffer.from(await imageFile.arrayBuffer());
      const filename = path.join('/tmp', `${nanoid()}.jpg`);
      await writeFile(filename, buffer);

      const cloudRes = await cloudinary.uploader.upload(filename, {
        folder: 'employees/profile',
        public_id: `employee_${employeeId}`,
        overwrite: true,
      });

      updateFields.profilePicture = cloudRes.secure_url;
    }

    await db.collection('Employee').updateOne(
      { employeeId },
      { $set: updateFields }
    );

    const updated = await db.collection('Employee').findOne({ employeeId });

    const userData = {
      id: updated.employeeId,
      name: updated.name,
      type: 'employee',
      salonIds: updated.salonIds || (updated.salonId ? [updated.salonId] : []),
    };

    return new Response(JSON.stringify({ success: true, user: userData }), { status: 200 });
  } catch (err) {
    console.error('PATCH employee profile error:', err);
    return new Response(JSON.stringify({ error: 'Server error' }), { status: 500 });
  } finally {
    if (client && !global._mongoClientPromise) {
      await client.close();
    }
  }
}