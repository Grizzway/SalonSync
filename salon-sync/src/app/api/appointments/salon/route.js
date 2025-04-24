import { connectToDatabase } from '@/app/utils/mongoConnection';

export async function GET(req) {
  let client;

  try {
    const salonId = req.nextUrl.searchParams.get('sId');
    if (!salonId) {
      return new Response(JSON.stringify({ error: 'Missing salonId' }), { status: 400 });
    }

    const connection = await connectToDatabase();
    client = connection.client;
    const db = connection.db;

    const appointments = await db.collection('Appointment')
      .find({ salonId }) 
      .sort({ date: 1 })
      .toArray();

    return new Response(JSON.stringify({ appointments }), { status: 200 });
  } catch (err) {
    console.error('Error fetching appointments for salon:', err);
    return new Response(JSON.stringify({ error: 'Internal Server Error' }), { status: 500 });
  } finally {
    if (client && !global._mongoClientPromise) {
      await client.close();
    }
  }
}