import { connectToDatabase } from '@/app/utils/mongoConnection';

export async function GET(req) {
  let client;

  try {
    const { searchParams } = new URL(req.url);
    const customerId = Number(searchParams.get('customerId'));

    if (!customerId) {
      return new Response(JSON.stringify({ error: 'Missing customerId' }), { status: 400 });
    }

    const connection = await connectToDatabase();
    client = connection.client;
    const db = connection.db;

    const survey = await db.collection('CustomerSurvey').findOne({ customerId });

    return new Response(JSON.stringify({ completed: !!survey }), { status: 200 });
  } catch (err) {
    console.error('Survey check error:', err);
    return new Response(JSON.stringify({ error: 'Server error' }), { status: 500 });
  } finally {
    if (client && !global._mongoClientPromise) {
      await client.close();
    }
  }
}