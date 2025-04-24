import { connectToDatabase } from '@/app/utils/mongoConnection';

export async function POST(req) {
  let client;

  try {
    const body = await req.json();
    const { customerId, responses } = body;

    if (!customerId || !responses) {
      return new Response(JSON.stringify({ error: 'Missing data' }), { status: 400 });
    }

    const connection = await connectToDatabase();
    client = connection.client;
    const db = connection.db;

    const customer = await db.collection('Customer').findOne({ customerId: parseInt(customerId) });
    if (!customer) {
      return new Response(JSON.stringify({ error: 'Customer not found' }), { status: 404 });
    }

    const result = await db.collection('CustomerSurvey').updateOne(
      { customerId: parseInt(customerId) },
      {
        $set: {
          responses,
          updatedAt: new Date()
        },
        $setOnInsert: {
          createdAt: new Date()
        }
      },
      { upsert: true }
    );

    return new Response(JSON.stringify({ success: true, surveyId: result.insertedId }), { status: 201 });
  } catch (err) {
    console.error('Survey submission error:', err);
    return new Response(JSON.stringify({ error: 'Internal server error' }), { status: 500 });
  } finally {
    if (client && !global._mongoClientPromise) {
      await client.close();
    }
  }
}