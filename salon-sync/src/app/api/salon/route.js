import { connectToDatabase } from '@/app/utils/mongoConnection';

export async function GET(req) {
  try {
    const { db } = await connectToDatabase();
    const salons = await db.collection('Business').find({}, { projection: { businessName: 1, logo: 1, _id: 0 } }).toArray();

    // Return the list of salons
    const salonData = salons.map((salon) => ({
      name: salon.businessName,
      logo: salon.logo,
    }));

    return new Response(JSON.stringify(salonData), { status: 200 });
  } catch (error) {
    console.error('Error fetching salons:', error);
    return new Response(JSON.stringify({ error: 'Internal Server Error' }), { status: 500 });
  }
}
