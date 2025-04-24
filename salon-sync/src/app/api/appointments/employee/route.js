import { connectToDatabase } from '@/app/utils/mongoConnection';

export async function GET(req) {
  let client;

  try {
    const { searchParams } = new URL(req.url);
    const employeeId = searchParams.get('employeeId');

    if (!employeeId) {
      return new Response(
        JSON.stringify({ message: 'Missing employeeId' }),
        { status: 400 }
      );
    }

    const connection = await connectToDatabase();
    client = connection.client;
    const db = connection.db;

    const appointments = await db
      .collection('Appointment')
      .find({ employeeId: parseInt(employeeId, 10) })
      .toArray();

    return new Response(
      JSON.stringify({ appointments }),
      { status: 200 }
    );
  } catch (err) {
    console.error('Error fetching appointments:', err);
    return new Response(
      JSON.stringify({ message: 'Internal server error' }),
      { status: 500 }
    );
  } finally {
    if (client && !global._mongoClientPromise) {
      await client.close();
    }
  }
}
