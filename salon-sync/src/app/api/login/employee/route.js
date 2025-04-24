import { connectToDatabase } from '@/app/utils/mongoConnection';
import { cookies } from 'next/headers';
import bcrypt from 'bcrypt';

export async function POST(req) {
  let client;

  try {
    const { email, password } = await req.json();

    if (!email || !password) {
      return new Response(JSON.stringify({ success: false, message: 'Email and password required.' }), { status: 400 });
    }

    const connection = await connectToDatabase();
    client = connection.client;
    const db = connection.db;

    const employee = await db.collection('Employee').findOne({ email });

    if (!employee) {
      return new Response(JSON.stringify({ success: false, message: 'Employee not found.' }), { status: 404 });
    }

    if (!employee.password) {
      return new Response(JSON.stringify({ success: false, message: 'Employee has not finished registration.' }), { status: 403 });
    }

    const passwordMatches = await bcrypt.compare(password, employee.password);

    if (!passwordMatches) {
      return new Response(JSON.stringify({ success: false, message: 'Incorrect password.' }), { status: 401 });
    }

    const userData = {
      id: employee.employeeId,
      name: employee.name,
      type: 'employee',
      salonIds: employee.salonIds || (employee.salonId ? [employee.salonId] : []),
    };

    const cookieStore = cookies();
    cookieStore.set('user', JSON.stringify(userData), {
      httpOnly: false,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'Lax',
      path: '/',
      maxAge: 60 * 60 * 24 * 7, // 7 days
    });

    return new Response(JSON.stringify({ success: true, user: userData }), { status: 200 });
  } catch (err) {
    console.error('Employee login error:', err);
    return new Response(JSON.stringify({ success: false, message: 'Internal server error.' }), { status: 500 });
  } finally {
    if (client && !global._mongoClientPromise) {
      await client.close();
    }
  }
}
