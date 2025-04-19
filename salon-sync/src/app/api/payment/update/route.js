import { connectToDatabase } from '@/app/utils/mongoConnection';
import { ObjectId } from 'mongodb';

export async function PATCH(req) {
  try {
    const { appointmentId, paymentOption, amount } = await req.json();

    if (!appointmentId || !paymentOption || !amount) {
      return new Response(
        JSON.stringify({ message: 'Missing required fields' }),
        { status: 400 }
      );
    }

    const { db } = await connectToDatabase();

    // Try to update an existing payment
    const updated = await db.collection('Payment').updateOne(
      { appointmentId: new ObjectId(appointmentId) },
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
        appointmentId: new ObjectId(appointmentId),
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
  }
}
