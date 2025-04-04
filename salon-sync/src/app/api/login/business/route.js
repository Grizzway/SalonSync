import { connectToDatabase } from '@/app/utils/mongoConnection';
import bcrypt from 'bcryptjs';
import { cookies } from 'next/headers';

export async function POST(req) {
  try {
    const { email, password } = await req.json();
    const { db } = await connectToDatabase();

    const user = await db.collection('Business').findOne({ email });

    if (!user) {
      return new Response(JSON.stringify({ success: false, message: 'Business not found' }), { status: 404 });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return new Response(JSON.stringify({ success: false, message: 'Invalid password' }), { status: 401 });
    }

    const userData = {
      id: user.salonId,
      name: user.businessName,
      type: 'business'
    };

    const cookieStore = cookies();
    cookieStore.set('user', JSON.stringify(userData), {
      httpOnly: false,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'Lax',
      path: '/',
      maxAge: 60 * 60 * 24 * 7,
    });

    return new Response(JSON.stringify({ success: true, user: userData }), { status: 200 });

  } catch (error) {
    console.error('Business Login Error:', error);
    return new Response(JSON.stringify({ success: false, message: 'Internal Server Error' }), { status: 500 });
  }
}
