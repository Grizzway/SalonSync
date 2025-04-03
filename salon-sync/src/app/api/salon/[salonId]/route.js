import { connectToDatabase } from '@/app/utils/mongoConnection';

export async function GET(req, { params }) {
  // Await the params before accessing its properties
  const { salonId } = await params;

  try {
    const { db } = await connectToDatabase();

    if (!salonId) {
      return new Response(JSON.stringify({ error: 'Invalid salon ID' }), { status: 400 });
    }

    console.log('Querying for salon ID:', salonId);

    // Query the database for the salon using salonId
    const salon = await db.collection('Business').findOne({ salonId: parseInt(salonId, 10) });

    console.log('Salon found:', salon);

    if (!salon) {
      return new Response(JSON.stringify({ error: 'Salon not found' }), { status: 404 });
    }

    // Return the salon data
    const salonData = {
      id: salon.salonId,
      name: salon.businessName,
      banner: salon.banner || null,
      logo: salon.logo || null,
      address: salon.address,
      theme: salon.theme || 'grey',
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
