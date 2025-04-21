// /src/app/api/appointments/salon/route.js

import { connectToDatabase } from '@/app/utils/mongoConnection';

export async function GET(req) {
  try {
    const salonId = req.nextUrl.searchParams.get('sId');
    if (!salonId) {
      return new Response(JSON.stringify({ error: 'Missing salonId' }), { status: 400 });
    }

    const { db } = await connectToDatabase();

    const appointments = await db.collection('Appointment')
      .find({ salonId }) // string match
      .sort({ date: 1 })
      .toArray();

    return new Response(JSON.stringify({ appointments }), { status: 200 });
  } catch (err) {
    console.error('Error fetching appointments for salon:', err);
    return new Response(JSON.stringify({ error: 'Internal Server Error' }), { status: 500 });
  }
}
