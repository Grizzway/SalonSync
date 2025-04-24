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

    const customer = await db.collection('Customer').findOne({ customerId });

    if (!customer) {
      return new Response(JSON.stringify({ error: 'Customer not found' }), { status: 404 });
    }

    return new Response(JSON.stringify({
      name: customer.name,
      email: customer.email
    }), { status: 200 });
  } catch (err) {
    console.error('Error fetching customer profile:', err);
    return new Response(JSON.stringify({ error: 'Internal server error' }), { status: 500 });
  } finally {
    if (client && !global._mongoClientPromise) {
      await client.close();
    }
  }
}
