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

    // Optional: check if the customer exists before creating a survey
    const customer = await db.collection('Customer').findOne({ customerId: parseInt(customerId) });
    if (!customer) {
      return new Response(JSON.stringify({ error: 'Customer not found' }), { status: 404 });
    }

    // Insert into CustomerSurvey collection
    const result = await db.collection('CustomerSurvey').insertOne({
      customerId: parseInt(customerId),
      responses,
      createdAt: new Date(),
    });

    return new Response(JSON.stringify({ success: true, surveyId: result.insertedId }), { status: 201 });
  } catch (err) {
    console.error('Survey submission error:', err);
    return new Response(JSON.stringify({ error: 'Internal server error' }), { status: 500 });
  }
}