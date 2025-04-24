import { connectToDatabase } from '@/app/utils/mongoConnection';

export async function GET() {
  let client;

  try {
    const connection = await connectToDatabase();
    client = connection.client;
    const db = connection.db;

    const result = await db.collection('Schedule').insertOne({
      test: true,
      createdAt: new Date(),
      source: 'test-route'
    });

    return new Response(JSON.stringify({ insertedId: result.insertedId }), {
      status: 201,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), { status: 500 });
  } finally {
    if (client && !global._mongoClientPromise) {
      await client.close();
    }
  }
}
