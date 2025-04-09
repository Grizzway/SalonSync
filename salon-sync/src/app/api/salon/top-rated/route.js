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

    // Extract salon IDs as strings
    const salonIds = ratingAggregation.map(salon => parseInt(salon._id));  // Convert back to number

    // Fetch business details using salonId
    const businesses = await db.collection("Business").find({ 
      salonId: { $in: salonIds } 
    }).toArray();

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
      headers: { "Content-Type": "application/json" }
    });
  } catch (error) {
    console.error("Error fetching salons:", error);
    return new Response(JSON.stringify({ error: "Failed to fetch salons" }), { status: 500 });
  }
}
