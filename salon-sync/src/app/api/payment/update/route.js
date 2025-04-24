import { connectToDatabase } from '@/app/utils/mongoConnection';

export async function PATCH(req) {
  let client;

  try {
    const { appointmentId, paymentOption, amount } = await req.json();

    if (!appointmentId || !paymentOption || !amount) {
      return new Response(
        JSON.stringify({ message: 'Missing required fields' }),
        { status: 400 }
      );
    }

    const connection = await connectToDatabase();
    client = connection.client;
    const db = connection.db;

    // Try to update existing payment by appointmentId 
    const updated = await db.collection('Payment').updateOne(
      { appointmentId: Number(appointmentId) },
      {
        $set: {
          paid: paymentOption,
          cost: amount,
          paymentMethod: 'Credit (Fake)',
          updatedAt: new Date(),
        },
      }
    );

    // If no existing payment found, insert a new one
    if (updated.matchedCount === 0) {
      await db.collection('Payment').insertOne({
        appointmentId: Number(appointmentId),
        cost: amount,
        paid: paymentOption,
        paymentMethod: 'Credit (Fake)',
        createdAt: new Date(),
      });
    }

    return new Response(
      JSON.stringify({ message: 'Payment updated' }),
      { status: 200 }
    );
  } catch (err) {
    console.error('Payment update error:', err);
    return new Response(
      JSON.stringify({ message: 'Internal Server Error' }),
      { status: 500 }
    );
  } finally {
    if (client && !global._mongoClientPromise) {
      await client.close();
    }
  }
}
