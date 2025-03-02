import { connectToDatabase } from '@/app/utils/mongoConnection';
import bcrypt from 'bcryptjs';

export async function POST(req) {
  try {
    const { name, email, password } = await req.json();
    const { db } = await connectToDatabase();

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Insert data into the 'Customer' collection with the hashed password
    const result = await db.collection('Customer').insertOne({
      name,
      email,
      password: hashedPassword, // Store the hashed password
    });

    return new Response(JSON.stringify({ success: true, message: 'Customer registered successfully!' }), {
      status: 201,
    });
  } catch (error) {
    console.error(error);
    return new Response('Error registering customer', { status: 500 });
  }
}
