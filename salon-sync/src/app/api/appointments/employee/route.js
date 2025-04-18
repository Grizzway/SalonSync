import { connectToDatabase } from '@/app/utils/mongoConnection';

export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const employeeId = searchParams.get('employeeId');

    if (!employeeId) {
      return new Response(JSON.stringify({ message: 'Missing employeeId' }), { status: 400 });
    }

    const { db } = await connectToDatabase();
    const appointments = await db
      .collection('Appointments')
      .find({ employeeId: Number(employeeId) })
      .toArray();

    return new Response(JSON.stringify({ appointments }), { status: 200 });
  } catch (err) {
    console.error('Error fetching appointments:', err);
    return new Response(JSON.stringify({ message: 'Internal server error' }), { status: 500 });
  }
}
