import { connectToDatabase } from '@/app/utils/mongoConnection';

export async function GET() {
  try {
    const { db } = await connectToDatabase();
    const schedules = await db.collection("Schedule").find({}).toArray();

    return new Response(JSON.stringify({ schedules }), {
      status: 200,
      headers: { "Content-Type": "application/json" }
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: "Failed to fetch schedules" }), {
      status: 500
    });
  }
}
