import { connectToDatabase } from '@/app/utils/mongoConnection';

export async function GET(req) {
  let client;

  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('appointmentId');

    if (!id) {
      return new Response(JSON.stringify({ message: 'Missing ID' }), { status: 400 });
    }

    const connection = await connectToDatabase();
    client = connection.client;
    const db = connection.db;

    const appointment = await db.collection('Appointment').findOne({ appointmentId: Number(id) });

    if (!appointment) {
      return new Response(JSON.stringify({ message: 'Appointment not found' }), { status: 404 });
    }

    return new Response(JSON.stringify({ appointment }), { status: 200 });
  } catch (err) {
    console.error('Error fetching appointment by ID:', err);
    return new Response(JSON.stringify({ error: 'Internal server error' }), { status: 500 });
  } finally {
    if (client && !global._mongoClientPromise) {
      await client.close();
    }
  }
}
