import { connectToDatabase } from '@/app/utils/mongoConnection';
import cloudinary from '@/app/utils/cloudinary';
import { Readable } from 'stream';
export const dynamic = 'force-dynamic';

export async function GET(req, context) {
  let client;
  const { salonId } = await context.params;

  try {
    const connection = await connectToDatabase();
    client = connection.client;
    const db = connection.db;

    if (!salonId) {
      return new Response(JSON.stringify({ error: 'Invalid salon ID' }), { status: 400 });
    }

    const salon = await db.collection('Business').findOne({ salonId: parseInt(salonId, 10) });

    if (!salon) {
      return new Response(JSON.stringify({ error: 'Salon not found' }), { status: 404 });
    }

    const employees = await db.collection('Employee')
      .find({ salonId: parseInt(salonId, 10) })
      .project({ employeeId: 1, name: 1, profilePicture: 1, bio: 1, email: 1 })
      .toArray();

    const salonData = {
      id: salon.salonId,
      name: salon.businessName,
      banner: salon.banner || null,
      logo: salon.logo || null,
      address: salon.address,
      theme: salon.theme || 'grey',
      Phone: salon.Phone || null,
      Description: salon.Description || null,
      employees: employees || [],
    };

    return new Response(JSON.stringify(salonData), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: 'Internal Server Error' }), { status: 500 });
  } finally {
    if (client && !global._mongoClientPromise) {
      await client.close();
    }
  }
}

export async function PATCH(req, context) {
  let client;
  const { salonId } = context.params;

  try {
    const connection = await connectToDatabase();
    client = connection.client;
    const db = connection.db;

    const formData = await req.formData();
    const file = formData.get('image');

    if (!file) {
      return new Response(JSON.stringify({ error: 'No image file uploaded' }), { status: 400 });
    }

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    const uploadResult = await new Promise((resolve, reject) => {
      const stream = cloudinary.uploader.upload_stream(
        { folder: 'salons' },
        (error, result) => {
          if (error) return reject(error);
          resolve(result);
        }
      );
      Readable.from(buffer).pipe(stream);
    });

    const updateResult = await db.collection('Business').updateOne(
      { salonId: parseInt(salonId, 10) },
      { $set: { banner: uploadResult.secure_url } }
    );

    if (updateResult.matchedCount === 0) {
      return new Response(JSON.stringify({ error: 'Salon not found' }), { status: 404 });
    }

    return new Response(JSON.stringify({ success: true, imageUrl: uploadResult.secure_url }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: 'Image upload failed' }), { status: 500 });
  } finally {
    if (client && !global._mongoClientPromise) {
      await client.close();
    }
  }
}
