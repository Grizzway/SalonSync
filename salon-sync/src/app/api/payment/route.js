import { connectToDatabase } from '@/app/utils/mongoConnection';

export async function GET(req) {
  let client;

  const { searchParams } = new URL(req.url);
  const salonId = searchParams.get('salonId');

  if (!salonId) {
    return new Response(
      JSON.stringify({ error: 'Salon ID is missing' }),
      { status: 400 }
    );
  }

  try {
    const connection = await connectToDatabase();
    client = connection.client;
    const db = connection.db;

    // Use aggregation to join Payments with Customer and Employee collections
    const payments = await db.collection('Payment').aggregate([
      { $match: { salonId: parseInt(salonId, 10) } },
      {
        $lookup: {
          from: 'Customer',
          localField: 'customerId',
          foreignField: 'customerId',
          as: 'customerDetails',
        },
      },
      {
        $lookup: {
          from: 'Employee',
          localField: 'employeeId',
          foreignField: 'employeeId',
          as: 'employeeDetails',
        },
      },
      {
        $project: {
          _id: 1,
          appointmentId: 1,
          cost: 1,
          paymentMethod: 1,
          paid: 1,
          'customerDetails.name': 1,
          'employeeDetails.name': 1,
        },
      },
    ]).toArray();

    return new Response(JSON.stringify({ payments }), { status: 200 });
  } catch (error) {
    return new Response(
      JSON.stringify({ error: 'Failed to fetch payments' }),
      { status: 500 }
    );
  } finally {
    if (client && !global._mongoClientPromise) {
      await client.close();
    }
  }
}
