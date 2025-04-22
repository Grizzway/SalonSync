import { connectToDatabase } from '@/app/utils/mongoConnection';

export async function GET(req) {
  const { searchParams } = new URL(req.url);
  const customerId = Number(searchParams.get('customerId'));

  if (!customerId) {
    return new Response(JSON.stringify({ error: 'Missing customerId' }), { status: 400 });
  }

  const { db } = await connectToDatabase();

  const customer = await db.collection('Customer').findOne({ customerId });

  if (!customer) {
    return new Response(JSON.stringify({ error: 'Customer not found' }), { status: 404 });
  }

  return new Response(JSON.stringify({
    name: customer.name,
    email: customer.email
  }), { status: 200 });
}
