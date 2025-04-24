import { connectToDatabase } from '@/app/utils/mongoConnection';
import bcrypt from 'bcrypt';

export async function POST(req) {
  let client;

  try {
    const { customerId, name, email, bio, password } = await req.json();

    if (!customerId || !email || !name) {
      return new Response(JSON.stringify({ success: false, message: 'Missing fields.' }), { status: 400 });
    }

    const connection = await connectToDatabase();
    client = connection.client;
    const db = connection.db;

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
  } finally {
    if (client && !global._mongoClientPromise) {
      await client.close();
    }
  }
}
