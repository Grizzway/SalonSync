import { connectToDatabase } from '@/app/utils/mongoConnection';
import bcrypt from 'bcryptjs';

export async function POST(req) {
  try {
    const { name, email, password } = await req.json();
    const { db } = await connectToDatabase();

    // Normalize email for case insensitivity
    const normalizedEmail = email.trim().toLowerCase();

    // Ensure password exists
    if (!password || typeof password !== 'string' || password.trim() === '') {
      return new Response(JSON.stringify({ success: false, message: 'Password is required' }), { status: 400 });
    }

    // Check if email already exists
    const existingUser = await db.collection('Customer').findOne({ email: normalizedEmail });

    if (existingUser) {
      return new Response(JSON.stringify({ success: false, message: 'Email already exists.' }), { status: 400 });
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Insert into database
    const result = await db.collection('Customer').insertOne({
      name,
      email: normalizedEmail,
      password: hashedPassword,
    });

    return new Response(JSON.stringify({ success: true, message: 'Customer registered successfully!' }), { status: 201 });
  } catch (error) {
    console.error("❌ Error registering customer:", error);
    return new Response(JSON.stringify({ success: false, message: 'Error registering customer' }), { status: 500 });
  }
}

