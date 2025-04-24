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

export async function PUT(req) {
  let client;

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
    const bannerFile = formData.get('banner');
    const rawBusinessHours = formData.get('businessHours');

    const updateFields = {
      Phone: phone,
      Description: description,
      email,
      address,
    };

    if (rawBusinessHours) {
      try {
        updateFields.businessHours = JSON.parse(rawBusinessHours);
      } catch (err) {
      }
    }

    if (logoFile && typeof logoFile === 'object') {
      const logoBuffer = Buffer.from(await logoFile.arrayBuffer());
      const logoUpload = await new Promise((resolve, reject) => {
        cloudinary.uploader.upload_stream({ folder: 'salons/logos' }, (err, result) =>
          err ? reject(err) : resolve(result)
        ).end(logoBuffer);
      });
      updateFields.logo = logoUpload.secure_url;
    }

    if (bannerFile && typeof bannerFile === 'object') {
      const bannerBuffer = Buffer.from(await bannerFile.arrayBuffer());
      const bannerUpload = await new Promise((resolve, reject) => {
        cloudinary.uploader.upload_stream({ folder: 'salons/banners' }, (err, result) =>
          err ? reject(err) : resolve(result)
        ).end(bannerBuffer);
      });
      updateFields.banner = bannerUpload.secure_url;
    }

    const connection = await connectToDatabase();
    client = connection.client;
    const db = connection.db;

    const result = await db.collection('Business').updateOne(
      { salonId: parseInt(salonId) },
      { $set: updateFields }
    );

    if (result.matchedCount === 0) {
      return new Response(JSON.stringify({ error: 'Salon not found' }), { status: 404 });
    }

    return new Response(JSON.stringify({ message: 'Salon updated successfully' }), { status: 200 });
  } catch (err) {
    return new Response(JSON.stringify({ error: 'Internal Server Error' }), { status: 500 });
  } finally {
    if (client && !global._mongoClientPromise) {
      await client.close();
    }
  }
}

export async function GET(req) {
  let client;

  const { searchParams } = new URL(req.url, `http://${req.headers.host}`);
  const salonId = searchParams.get('salonId');

  if (!salonId) {
    return new Response(JSON.stringify({ error: 'Missing salonId' }), { status: 400 });
  }

  try {
    const connection = await connectToDatabase();
    client = connection.client;
    const db = connection.db;

    const salon = await db.collection('Business').findOne({ salonId: parseInt(salonId) });

    if (!salon) {
      return new Response(JSON.stringify({ error: 'Salon not found' }), { status: 404 });
    }

    return new Response(JSON.stringify(salon), { status: 200 });
  } catch (err) {
    return new Response(JSON.stringify({ error: 'Internal Server Error' }), { status: 500 });
  } finally {
    if (client && !global._mongoClientPromise) {
      await client.close();
    }
  }
}
