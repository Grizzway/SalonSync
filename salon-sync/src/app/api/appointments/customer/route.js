import { connectToDatabase } from '@/app/utils/mongoConnection';

export async function GET(req) {
  const { searchParams } = new URL(req.url);
  const customerId = Number(searchParams.get('customerId'));
  if (!customerId) {
    return new Response(JSON.stringify({ error: 'Missing customerId' }), { status: 400 });
  }

  try {
    const { db } = await connectToDatabase();

    const appointments = await db.collection('Appointment')
  .find({ customerId }) // Now matches the number type
  .sort({ date: 1, time: 1 })
  .toArray();


    return new Response(JSON.stringify({ appointments }), { status: 200 });
  } catch (err) {
    console.error('Error fetching customer appointments:', err);
    return new Response(JSON.stringify({ error: 'Failed to fetch appointments' }), { status: 500 });
  }
}
