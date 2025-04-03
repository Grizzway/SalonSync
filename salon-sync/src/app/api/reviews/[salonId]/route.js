import { connectToDatabase } from '@/app/utils/mongoConnection';

// Handle GET request to fetch reviews
export async function GET(req, context) {
  const { salonId } = await context.params; // Ensure params are awaited

  console.log('GET Request - salonId:', salonId);

  if (!salonId) {
    return new Response(JSON.stringify({ error: 'Salon ID is missing' }), { status: 400 });
  }

  try {
    const { db } = await connectToDatabase();

    // Fetch all reviews for the specified salon
    const reviews = await db.collection('Reviews').find({ salonId }).toArray();

    // For each review, fetch the customer name
    for (let review of reviews) {
      const customer = await db.collection('Customer').findOne({ customerId: review.customerId });
      if (customer) {
        review.customerName = customer.name;  // Add customer name to the review
      } else {
        review.customerName = "Anonymous";  // Default to Anonymous if customer is not found
      }
    }

    console.log("Reviews found:", reviews);

    return new Response(JSON.stringify({ reviews }), { status: 200 });
  } catch (error) {
    console.error("❌ Error fetching reviews:", error);
    return new Response(JSON.stringify({ error: "Failed to fetch reviews" }), { status: 500 });
  }
}

// Handle POST request to submit a review
export async function POST(req, context) {
  const params = await context.params;
  const salonId = params?.salonId;

  console.log('POST Request - salonId:', salonId);

  // Ensure salonId is provided
  if (!salonId) {
    return new Response(JSON.stringify({ error: 'Salon ID is missing' }), { status: 400 });
  }

  try {
    // Parse the request body
    let requestBody;
    try {
      requestBody = await req.json();
    } catch (err) {
      console.error("❌ Error parsing request body:", err);
      return new Response(JSON.stringify({ error: "Invalid JSON format in request body." }), { status: 400 });
    }

    const { rating, review, customerId } = requestBody;

    console.log(`Received Data -> rating: ${rating}, review: ${review}, customerId: ${customerId}`);

    // Validate required fields
    if (!rating || !review || !customerId) {
      console.warn("⚠️ Missing required fields in request.");
      return new Response(JSON.stringify({ error: "Rating, review, and customer ID are required." }), { status: 400 });
    }

    const { db } = await connectToDatabase();

    // Ensure customer exists before inserting review
    let customer;
    try {
      // Query customer by customerId (NOT MongoDB _id)
      customer = await db.collection('Customer').findOne({ customerId });
    } catch (err) {
      console.error(`❌ Error finding customer with customerId: ${customerId}`, err);
      return new Response(JSON.stringify({ error: "Invalid customer ID format." }), { status: 400 });
    }

    if (!customer) {
      console.warn(`⚠️ Customer ID ${customerId} not found in database.`);
      return new Response(JSON.stringify({ error: "Invalid customer ID." }), { status: 400 });
    }

    // Check if the customer has already reviewed this salon
    const existingReview = await db.collection('Reviews').findOne({ salonId, customerId });

    if (existingReview) {
      return new Response(JSON.stringify({ error: "You can only submit one review per salon." }), { status: 400 });
    }

    // Insert the review
    await db.collection('Reviews').insertOne({
      salonId,
      rating,
      review,
      customerId,  // Use customerId directly, not MongoDB _id
      createdAt: new Date(),
    });

    console.log(`✅ Review successfully added for salonId ${salonId}`);

    // Recalculate the average rating for the salon
    const reviews = await db.collection('Reviews').find({ salonId }).toArray();
    const totalRating = reviews.reduce((sum, rev) => sum + rev.rating, 0);
    const avgRating = totalRating / reviews.length;

    // Update the salon's average rating in the Business collection
    await db.collection('Business').updateOne(
      { salonId },
      { $set: { rating: avgRating } }
    );

    return new Response(JSON.stringify({ success: true, message: "Review submitted successfully!" }), { status: 201 });
  } catch (error) {
    console.error("❌ Error submitting review:", error);
    return new Response(JSON.stringify({ error: "Failed to submit review" }), { status: 500 });
  }
}
