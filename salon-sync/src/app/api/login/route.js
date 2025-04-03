import { connectToDatabase } from '@/app/utils/mongoConnection';
import bcrypt from 'bcryptjs';
import { cookies } from 'next/headers';

export async function POST(req) {
  try {
    const { email, password } = await req.json();
    const { db } = await connectToDatabase();

    let user = await db.collection('Customer').findOne({ email });
    if (!user) {
      user = await db.collection('Business').findOne({ email });
    }

    if (!user) {
      return new Response(JSON.stringify({ error: 'User not found' }), { status: 404 });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return new Response(JSON.stringify({ error: 'Invalid password' }), { status: 401 });
    }

    const userData = { 
      id: user.customerId, 
      name: user.businessName || user.name, 
      type: user.businessName ? 'business' : 'customer' 
    };

    const cookieStore = await cookies(); // Await cookies()
    cookieStore.set('user', JSON.stringify(userData), {
      httpOnly: false, // You might consider setting this to true in production for security
      secure: process.env.NODE_ENV === 'production', // Secure cookies in production
      sameSite: 'Lax',
      path: '/',
      maxAge: 60 * 60 * 24 * 7, // Optional: Set maxAge for cookie expiry (7 days)
    });

    return new Response(JSON.stringify({ success: true, user: userData }), { status: 200 });

  } catch (error) {
    console.error('Login Error:', error);
    return new Response(JSON.stringify({ error: 'Internal Server Error' }), { status: 500 });
  }
}
