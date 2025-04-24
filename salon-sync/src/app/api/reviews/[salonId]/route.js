import { connectToDatabase } from '@/app/utils/mongoConnection';

export async function GET(req, context) {
  let client;
  const { salonId } = await context.params;

  if (!salonId) {
    return new Response(JSON.stringify({ error: 'Salon ID is missing' }), { status: 400 });
  }

  try {
    const connection = await connectToDatabase();
    client = connection.client;
    const db = connection.db;

    const reviews = await db.collection('Reviews').aggregate([
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
        $project: {
          _id: 1,
          rating: 1,
          review: 1,
          createdAt: 1,
          'customerDetails.name': 1,
        },
      },
    ]).toArray();

    return new Response(JSON.stringify({ reviews }), { status: 200 });
  } catch (error) {
    console.error('Error fetching reviews:', error);
    return new Response(JSON.stringify({ error: 'Failed to fetch reviews' }), { status: 500 });
  } finally {
    if (client && !global._mongoClientPromise) {
      await client.close();
    }
  }
}

export async function POST(req, context) {
  let client;
  const { salonId } = await context.params;

  if (!salonId) {
    return new Response(JSON.stringify({ error: 'Salon ID is missing' }), { status: 400 });
  }

  try {
    const { rating, review, customerId } = await req.json();

    if (!rating || !review || !customerId) {
      return new Response(JSON.stringify({ error: 'Rating, review, and customer ID are required.' }), { status: 400 });
    }

    const connection = await connectToDatabase();
    client = connection.client;
    const db = connection.db;

    const customer = await db.collection('Customer').findOne({ customerId });
    if (!customer) {
      return new Response(JSON.stringify({ error: 'Invalid customer ID.' }), { status: 400 });
    }

    const existingReview = await db.collection('Reviews').findOne({ salonId: parseInt(salonId, 10), customerId });
    if (existingReview) {
      return new Response(JSON.stringify({ error: 'You can only submit one review per salon.' }), { status: 400 });
    }

    await db.collection('Reviews').insertOne({
      salonId: parseInt(salonId, 10),
      rating,
      review,
      customerId,
      createdAt: new Date(),
    });

    const reviews = await db.collection('Reviews').find({ salonId: parseInt(salonId, 10) }).toArray();
    const totalRating = reviews.reduce((sum, rev) => sum + rev.rating, 0);
    const avgRating = totalRating / reviews.length;

    await db.collection('Business').updateOne(
      { salonId: parseInt(salonId, 10) },
      { $set: { rating: avgRating } }
    );

    return new Response(JSON.stringify({ success: true, message: 'Review submitted successfully!' }), { status: 201 });
  } catch (error) {
    console.error('Error submitting review:', error);
    return new Response(JSON.stringify({ error: 'Failed to submit review' }), { status: 500 });
  } finally {
    if (client && !global._mongoClientPromise) {
      await client.close();
    }
  }
}
