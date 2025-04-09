import { connectToDatabase } from '@/app/utils/mongoConnection';
import cloudinary from '@/app/utils/cloudinary'; // make sure this file exists
import { Readable } from 'stream';

export async function GET(req, { params }) {
  const { salonId } = await params;

  try {
    const { db } = await connectToDatabase();

    if (!salonId) {
      return new Response(JSON.stringify({ error: 'Invalid salon ID' }), { status: 400 });
    }

    const salon = await db.collection('Business').findOne({ salonId: parseInt(salonId, 10) });

    if (!salon) {
      return new Response(JSON.stringify({ error: 'Salon not found' }), { status: 404 });
    }

    const salonData = {
      id: salon.salonId,
      name: salon.businessName,
      banner: salon.banner || null,
      logo: salon.logo || null,
      address: salon.address,
      theme: salon.theme || 'grey',
      Phone: salon.Phone || null,
      Description: salon.Description || null,
    };

    return new Response(JSON.stringify(salonData), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error fetching salon data:', error);
    return new Response(JSON.stringify({ error: 'Internal Server Error' }), { status: 500 });
  }
}

export async function PATCH(req, { params }) {
  const { salonId } = params;
  const { db } = await connectToDatabase();

  try {
    const formData = await req.formData();
    const file = formData.get('image');

    if (!file) {
      return new Response(JSON.stringify({ error: 'No image file uploaded' }), { status: 400 });
    }

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Upload image to Cloudinary
    const uploadPromise = new Promise((resolve, reject) => {
      const stream = cloudinary.uploader.upload_stream(
        { folder: 'salons' },
        (error, result) => {
          if (error) return reject(error);
          resolve(result);
        }
      );

      Readable.from(buffer).pipe(stream);
    });

    const result = await uploadPromise;

    // Update the salon's banner image in MongoDB
    const updateResult = await db.collection('Business').updateOne(
      { salonId: parseInt(salonId, 10) },
      { $set: { banner: result.secure_url } }
    );

    if (updateResult.matchedCount === 0) {
      return new Response(JSON.stringify({ error: 'Salon not found' }), { status: 404 });
    }

    return new Response(JSON.stringify({ success: true, imageUrl: result.secure_url }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (err) {
    console.error('Upload failed:', err);
    return new Response(JSON.stringify({ error: 'Image upload failed' }), { status: 500 });
  }
}
