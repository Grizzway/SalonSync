// ✅ FIXED FILE: src/app/api/schedules/employee/route.js
import { connectToDatabase } from '@/app/utils/mongoConnection';

export async function GET(req) {
  try {
    const employeeId = req.nextUrl.searchParams.get('employeeId');
    if (!employeeId) {
      return new Response(JSON.stringify({ error: 'Missing employeeId' }), { status: 400 });
    }

    const { db } = await connectToDatabase();

    const schedules = await db.collection('Schedule') // ✅ FIXED COLLECTION NAME
      .find({ employeeId: parseInt(employeeId, 10) })
      .sort({ start: 1 })
      .toArray();

    return new Response(JSON.stringify({ schedules }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (err) {
    console.error('Error fetching employee schedule:', err);
    return new Response(JSON.stringify({ error: 'Internal Server Error' }), { status: 500 });
  }
}

