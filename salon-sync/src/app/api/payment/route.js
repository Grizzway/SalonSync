import { connectToDatabase } from '@/app/utils/mongoConnection';

export async function GET(req) {
  const { searchParams } = new URL(req.url);
  const salonId = searchParams.get('salonId');

  if (!salonId) {
    return new Response(
      JSON.stringify({ error: 'Salon ID is missing' }),
      { status: 400 }
    );
  }

  try {
    const { db } = await connectToDatabase();

    // Use aggregation to join Payments with Customer and Employee collections
    const payments = await db.collection('Payment').aggregate([
      { $match: { salonId: parseInt(salonId, 10) } }, // Match payments for the given salonId
      {
        $lookup: {
          from: 'Customer', // Join with Customer collection
          localField: 'customerId',
          foreignField: 'customerId',
          as: 'customerDetails',
        },
      },
      {
        $lookup: {
          from: 'Employee', // Join with Employee collection
          localField: 'employeeId',
          foreignField: 'employeeId',
          as: 'employeeDetails',
        },
      },
      {
        $project: {
          _id: 1,
          cost: 1,
          paymentMethod: 1,
          'customerDetails.name': 1, // Include only the customer's name
          'employeeDetails.name': 1, // Include only the employee's name
        },
      },
    ]).toArray();

    return new Response(JSON.stringify({ payments }), { status: 200 });
  } catch (error) {
    console.error('Error fetching payments:', error);
    return new Response(
      JSON.stringify({ error: 'Failed to fetch payments' }),
      { status: 500 }
    );
  }
}