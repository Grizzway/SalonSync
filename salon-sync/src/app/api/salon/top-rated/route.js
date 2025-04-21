import { connectToDatabase } from "@/app/utils/mongoConnection";

export async function GET() {
  try {
    const { db } = await connectToDatabase();

    // Aggregate average ratings per salon using salonId
    const ratingAggregation = await db.collection("Reviews").aggregate([
      { 
        $group: { 
          _id: { $toString: "$salonId" },  // Convert to string to ensure matching
          avgRating: { $avg: "$rating" }, 
          reviewCount: { $sum: 1 } 
        } 
      },
      { $sort: { avgRating: -1 } }
    ]).toArray();

    // Extract salon IDs as numbers
    const salonIds = ratingAggregation.map(salon => parseInt(salon._id));

    // Fetch business details using salonId with projection and limit
    const businesses = await db.collection("Business")
      .find({ salonId: { $in: salonIds } })
      .project({ salonId: 1, businessName: 1, address: 1, logo: 1 })
      .limit(10)
      .toArray();

    // Merge ratings with business details
    const allSalons = businesses.map(business => {
      const ratingData = ratingAggregation.find(r => parseInt(r._id) === business.salonId);
      return {
        salonId: business.salonId,
        businessName: business.businessName,
        address: business.address,
        rating: ratingData?.avgRating || 0,
        reviewCount: ratingData?.reviewCount || 0,
        imageUrl: business.logo || "https://res.cloudinary.com/dxftncwhj/image/upload/v1744217062/placeholder_skpuau.png"
      };
    });

    return new Response(JSON.stringify({ salons: allSalons }), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        "Cache-Control": "s-maxage=60, stale-while-revalidate"
      }
    });
  } catch (error) {
    console.error("Error fetching salons:", error);
    return new Response(JSON.stringify({ error: "Failed to fetch salons" }), { status: 500 });
  }
}