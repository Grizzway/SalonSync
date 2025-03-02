import { connectToDatabase } from '@/app/utils/mongoConnection';

export async function GET(req, { params }) {
  const { salonname } = params;

  try {
    const { db } = await connectToDatabase();
    const salon = await db.collection('Business').findOne({
      businessName: { $regex: new RegExp(`^${salonname}$`, 'i') },
    });

    if (!salon) {
      return new Response(JSON.stringify({ error: 'Salon not found' }), { status: 404 });
    }

    const salonData = {
      name: salon.businessName,
      banner: salon.banner || null,
      logo: salon.logo || null,
      theme: salon.theme || 'grey',
    };

    return new Response(JSON.stringify(salonData), { status: 200 });
  } catch (error) {
    console.error('Error fetching salon data:', error);
    return new Response(JSON.stringify({ error: 'Internal Server Error' }), { status: 500 });
  }
}
