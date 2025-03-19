import { connectToDatabase } from '@/app/utils/mongoConnection';

export async function GET(req, context) {
  const { salonname } = context.params;

  try {
    const { db } = await connectToDatabase();

    // Retrieve all reviews for the specified salon
    const reviews = await db.collection('Reviews').find({ salon: salonname }).toArray();

    return new Response(JSON.stringify({ reviews }), {
      status: 200,
      headers: { "Content-Type": "application/json" }
    });
  } catch (error) {
    console.error("Error fetching reviews:", error);
    return new Response(JSON.stringify({ error: "Failed to fetch reviews" }), { status: 500 });
  }
}

export async function POST(req, context) {
  const { salonname } = context.params;
  const { rating, review } = await req.json();

  if (!rating || !review) {
    return new Response(JSON.stringify({ error: "Rating and review are required." }), { status: 400 });
  }

  try {
    const { db } = await connectToDatabase();

    // Insert the new review
    await db.collection('Reviews').insertOne({
      salon: salonname,
      rating,
      review,
      createdAt: new Date(),
    });

    // Calculate the new average rating
    const reviews = await db.collection('Reviews').find({ salon: salonname }).toArray();
    const totalRating = reviews.reduce((sum, rev) => sum + rev.rating, 0);
    const avgRating = totalRating / reviews.length;

    // Update the salon's rating in the Business collection
    await db.collection('Business').updateOne(
      { businessName: { $regex: new RegExp(`^${salonname}$`, 'i') } },
      { $set: { rating: avgRating } }
    );

    return new Response(JSON.stringify({ success: true, message: "Review submitted successfully!" }), { status: 201 });
  } catch (error) {
    console.error("Error submitting review:", error);
    return new Response(JSON.stringify({ error: "Failed to submit review" }), { status: 500 });
  }
}

