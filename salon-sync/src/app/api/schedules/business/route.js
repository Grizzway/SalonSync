import { connectToDatabase } from '@/app/utils/mongoConnection';

export async function GET(req) {
  let client;

  try {
    const salonId = req.nextUrl.searchParams.get("salonId");

    if (!salonId) {
      return new Response(JSON.stringify({ error: "Missing salonId" }), { status: 400 });
    }

    const connection = await connectToDatabase();
    client = connection.client;
    const db = connection.db;

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
  } finally {
    if (client && !global._mongoClientPromise) {
      await client.close();
    }
  }
}
