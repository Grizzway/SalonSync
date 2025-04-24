import { connectToDatabase } from '@/app/utils/mongoConnection';

export async function POST(req) {
  let client;

  try {
    const { code } = await req.json();

    const connection = await connectToDatabase();
    client = connection.client;
    const db = connection.db;

    const employee = await db.collection('Employee').findOne({ employeeCode: code });

    if (!employee) {
      return new Response(JSON.stringify({ message: 'Invalid or expired code.' }), { status: 404 });
    }

    return new Response(JSON.stringify({ name: employee.name, email: employee.email }), { status: 200 });
  } catch (err) {
    return new Response(JSON.stringify({ error: 'Server error' }), { status: 500 });
  } finally {
    if (client && !global._mongoClientPromise) {
      await client.close();
    }
  }
}
