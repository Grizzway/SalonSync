import { connectToDatabase } from '@/app/utils/mongoConnection';
import bcrypt from 'bcrypt';
import { cookies } from 'next/headers';

export async function POST(req) {
  try {
    const { email, password } = await req.json();

    if (!email || !password) {
      return new Response(JSON.stringify({ success: false, message: 'Email and password required' }), { status: 400 });
    }

    const { db } = await connectToDatabase();
    const user = await db.collection('Business').findOne({ email });

    if (!user) {
      return new Response(JSON.stringify({ success: false, message: 'User not found' }), { status: 404 });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return new Response(JSON.stringify({ success: false, message: 'Incorrect password' }), { status: 401 });
    }

    // ✅ Match cookie structure used in /login route
    const userData = {
      salonId: user.salonId,
      name: user.businessName,
      type: 'business',
    };

    const cookieStore = cookies(); // No need to `await` this – it's a sync getter
    cookieStore.set('user', JSON.stringify(userData), {
      httpOnly: false,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'Lax',
      path: '/',
      maxAge: 60 * 60 * 24 * 7,
    });

    return new Response(JSON.stringify({ success: true, user: userData }), { status: 200 });
  } catch (err) {
    console.error('Login error:', err);
    return new Response(JSON.stringify({ success: false, message: 'Internal server error' }), { status: 500 });
  }
}
