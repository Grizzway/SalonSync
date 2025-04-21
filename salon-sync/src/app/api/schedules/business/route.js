// ✅ FILE: /src/app/api/schedules/business/route.js
import { connectToDatabase } from '@/app/utils/mongoConnection';

export async function GET(req) {
  try {
    const salonId = req.nextUrl.searchParams.get("salonId");

    if (!salonId) {
      return new Response(JSON.stringify({ error: "Missing salonId" }), { status: 400 });
    }

    const { db } = await connectToDatabase();

    const schedules = await db
      .collection("Schedule")
      .find({ salonId: parseInt(salonId) })
      .toArray();

    return new Response(JSON.stringify({ schedules }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error("Error fetching salon schedule:", err);
    return new Response(JSON.stringify({ error: "Internal Server Error" }), { status: 500 });
  }
}
