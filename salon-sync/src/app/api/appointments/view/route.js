import { connectToDatabase } from '@/app/utils/mongoConnection';
import { ObjectId } from 'mongodb';

export async function GET(req) {
  const { searchParams } = new URL(req.url);
  const id = searchParams.get('appointmentId');

  if (!id) {
    return new Response(JSON.stringify({ message: 'Missing ID' }), { status: 400 });
  }

  const { db } = await connectToDatabase();
  const appointment = await db.collection('Appointment').findOne({ _id: new ObjectId(id) });

  if (!appointment) {
    return new Response(JSON.stringify({ message: 'Appointment not found' }), { status: 404 });
  }

  return new Response(JSON.stringify({ appointment }), { status: 200 });
}
