import { connectToDatabase } from '@/app/utils/mongoConnection';
import { ObjectId } from 'mongodb';

export async function POST(req) {
  let client;
  try {
    const data = await req.json();
    const connection = await connectToDatabase();
    client = connection.client;
    const db = connection.db;

    const employeeId = parseInt(data.employeeId);
    if (isNaN(employeeId)) {
      return new Response(JSON.stringify({ error: "Invalid employeeId" }), { status: 400 });
    }

    const result = await db.collection("Schedule").insertOne({
      salonId: parseInt(data.salonId),
      employeeName: data.employeeName,
      employeeId,
      title: data.title,
      start: new Date(data.start),
      end: new Date(data.end),
    });

    return new Response(JSON.stringify({ insertedId: result.insertedId }), { status: 201 });
  } catch {
    return new Response(JSON.stringify({ error: "Failed to create schedule" }), { status: 500 });
  } finally {
    if (client && !global._mongoClientPromise) await client.close();
  }
}

export async function PUT(req) {
  let client;
  try {
    const data = await req.json();
    const connection = await connectToDatabase();
    client = connection.client;
    const db = connection.db;

    if (!data._id) {
      return new Response(JSON.stringify({ error: "Missing schedule ID" }), { status: 400 });
    }

    await db.collection("Schedule").updateOne(
      { _id: new ObjectId(data._id) },
      {
        $set: {
          employeeName: data.employeeName,
          title: data.title,
          start: new Date(data.start),
          end: new Date(data.end),
        }
      }
    );

    return new Response(JSON.stringify({ success: true }), { status: 200 });
  } catch {
    return new Response(JSON.stringify({ error: "Failed to update schedule" }), { status: 500 });
  } finally {
    if (client && !global._mongoClientPromise) await client.close();
  }
}

export async function DELETE(req) {
  let client;
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("_id");

    if (!id) return new Response(JSON.stringify({ error: "Missing ID" }), { status: 400 });

    const connection = await connectToDatabase();
    client = connection.client;
    const db = connection.db;

    await db.collection("Schedule").deleteOne({ _id: new ObjectId(id) });

    return new Response(JSON.stringify({ success: true }), { status: 200 });
  } catch {
    return new Response(JSON.stringify({ error: "Failed to delete schedule" }), { status: 500 });
  } finally {
    if (client && !global._mongoClientPromise) await client.close();
  }
}
