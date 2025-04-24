import { connectToDatabase } from '@/app/utils/mongoConnection';

export async function GET(req) {
  let client;

  try {
    const connection = await connectToDatabase();
    client = connection.client;
    const db = connection.db;

    const salons = await db.collection('Business').find(
      {},
      {
        projection: {
          businessName: 1,
          logo: 1,
          salonId: 1,
          address: 1,
          _id: 0
        }
      }
    ).toArray();

    const salonData = salons.map((salon) => ({
      id: salon.salonId,
      name: salon.businessName,
      logo: salon.logo,
      address: salon.address
    }));

    return new Response(JSON.stringify(salonData), { status: 200 });
  } catch {
    return new Response(JSON.stringify({ error: 'Internal Server Error' }), { status: 500 });
  } finally {
    if (client && !global._mongoClientPromise) {
      await client.close();
    }
  }
}
