import { connectToDatabase } from '@/app/utils/mongoConnection';
import bcrypt from 'bcryptjs';

export async function POST(req) {
  try {
    const { name, email, password, profilePicture, bio } = await req.json();
    const { db } = await connectToDatabase();

    const normalizedEmail = email.trim().toLowerCase();

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

    // Convert profile picture to byte stream
    const profilePictureBuffer = profilePicture ? Buffer.from(profilePicture, 'base64') : null;

    // Find the latest customer ID and increment
    const latestCustomer = await db.collection('Customer').find().sort({ customerId: -1 }).limit(1).toArray();
    const nextCustomerId = latestCustomer.length > 0 ? latestCustomer[0].customerId + 1 : 1000;

    // Insert into database
    const result = await db.collection('Customer').insertOne({
      customerId: nextCustomerId,  // New unique customer ID
      name,
      email: normalizedEmail,
      password: hashedPassword,
      profilePicture: profilePictureBuffer,
      bio: bio || '',
      createdAt: new Date()  // Track when the account was created
    });

    return new Response(JSON.stringify({ success: true, message: 'Customer registered successfully!', customerId: nextCustomerId }), { status: 201 });
  } catch (error) {
    console.error("❌ Error registering customer:", error);
    return new Response(JSON.stringify({ success: false, message: 'Error registering customer' }), { status: 500 });
  }
}
