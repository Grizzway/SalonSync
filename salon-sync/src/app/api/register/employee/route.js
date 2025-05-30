import { connectToDatabase } from '@/app/utils/mongoConnection';
import bcrypt from 'bcrypt';

export async function POST(req) {
  let client;

  try {
    const { code, email, name, password, bio, specialties } = await req.json();

    if (!code || !email || !password || !name) {
      return new Response(JSON.stringify({ success: false, message: 'Missing required fields.' }), { status: 400 });
    }

    const connection = await connectToDatabase();
    client = connection.client;
    const db = connection.db;

    // Look up the employee by their code and email
    const employee = await db.collection('Employee').findOne({ employeeCode: code, email });

    if (!employee) {
      return new Response(JSON.stringify({ success: false, message: 'Invalid or expired code.' }), { status: 404 });
    }

    // Prevent re-registration
    if (employee.password) {
      return new Response(JSON.stringify({ success: false, message: 'Account already exists.' }), { status: 409 });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const updatedData = {
      name,
      password: hashedPassword,
      bio: bio || '',
      specialties: specialties || [],
      salonIds: employee.salonId ? [employee.salonId] : [],
      employeeCode: null, 
    };

    await db.collection('Employee').updateOne(
      { _id: employee._id },
      { $set: updatedData }
    );

    const userData = {
      id: employee.employeeId,
      name,
      type: 'employee',
      salonIds: updatedData.salonIds,
    };

    
    const cookieStore = await require('next/headers').cookies();
    cookieStore.set('user', JSON.stringify(userData), {
      httpOnly: false,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'Lax',
      path: '/',
      maxAge: 60 * 60 * 24 * 7, 
    });

    return new Response(JSON.stringify({ success: true, user: userData }), { status: 200 });
  } catch (error) {
    console.error('Employee registration error:', error);
    return new Response(JSON.stringify({ success: false, message: 'Server error.' }), { status: 500 });
  } finally {
    if (client && !global._mongoClientPromise) {
      await client.close();
    }
  }
}
