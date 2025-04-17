import { connectToDatabase } from '@/app/utils/mongoConnection';

export async function POST(req) {
  const { code } = await req.json();

  const { db } = await connectToDatabase();
  const employee = await db.collection('Employee').findOne({ employeeCode: code });

  if (!employee) {
    return new Response(JSON.stringify({ message: 'Invalid or expired code.' }), { status: 404 });
  }

  return new Response(JSON.stringify({ name: employee.name, email: employee.email }), { status: 200 });
}
