// /src/app/api/customer/survey/route.js
import { connectToDatabase } from '@/app/utils/mongoConnection';

export async function POST(req) {
  try {
    const body = await req.json();
    const { customerId, responses } = body;

    if (!customerId || !responses) {
      return new Response(JSON.stringify({ error: 'Missing data' }), { status: 400 });
    }

    const { db } = await connectToDatabase();

    const result = await db.collection('Customer').updateOne(
      { customerId: parseInt(customerId) },
      {
        $set: {
          survey: responses,
          hasSurvey: true,
        }
      }
    );

    if (result.matchedCount === 0) {
      return new Response(JSON.stringify({ error: 'Customer not found' }), { status: 404 });
    }

    return new Response(JSON.stringify({ success: true }), { status: 200 });
  } catch (err) {
    console.error('Survey save error:', err);
    return new Response(JSON.stringify({ error: 'Internal server error' }), { status: 500 });
  }
}
