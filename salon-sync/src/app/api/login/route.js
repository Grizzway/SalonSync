import { connectToDatabase } from '@/app/utils/mongoConnection';
import bcrypt from 'bcryptjs';
import { cookies } from 'next/headers';

export async function POST(req) {
  try {
    const { email, password } = await req.json();
    const { db } = await connectToDatabase();

    console.log("🔍 Attempting login for:", email);

    let user = await db.collection('Customer').findOne({ email });
    if (!user) {
      console.log("❌ No customer found, checking Business...");
      user = await db.collection('Business').findOne({ email });
    } else {
      console.log("✅ Found customer account");
    }

    if (!user) {
      console.log("❌ No user found at all");
      return new Response(JSON.stringify({ error: 'User not found' }), { status: 404 });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return new Response(JSON.stringify({ error: 'Invalid password' }), { status: 401 });
    }

    const userData = {
      id: user.customerId || user.salonId,
      name: user.businessName || user.name,
      type: user.businessName ? 'business' : 'customer',
    };

    const cookieStore = await cookies(); // ✅ await added here
    cookieStore.set('user', JSON.stringify(userData), {
      httpOnly: false,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'Lax',
      path: '/',
      maxAge: 60 * 60 * 24 * 7,
    });

    console.log("✅ Login successful:", userData);
    return new Response(JSON.stringify({ success: true, user: userData }), { status: 200 });
  } catch (error) {
    console.error('Login Error:', error);
    return new Response(JSON.stringify({ error: 'Internal Server Error' }), { status: 500 });
  }
}
