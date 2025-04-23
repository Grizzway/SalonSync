import { connectToDatabase } from '@/app/utils/mongoConnection';
import bcrypt from 'bcrypt';

export async function POST(req) {
  try {
    const { customerId, name, email, bio, password } = await req.json();
    const { db } = await connectToDatabase();

    if (!customerId || !email || !name) {
      return new Response(JSON.stringify({ success: false, message: 'Missing fields.' }), { status: 400 });
    }

    const update = { name, email, bio };
    if (password && password.length > 0) {
      const hashed = await bcrypt.hash(password, 10);
      update.password = hashed;
    }

    await db.collection('Customer').updateOne({ customerId: parseInt(customerId) }, { $set: update });

    return new Response(JSON.stringify({ success: true }), { status: 200 });
  } catch (err) {
    console.error('Profile update failed:', err);
    return new Response(JSON.stringify({ success: false, message: 'Server error' }), { status: 500 });
  }
}
