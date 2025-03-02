import { connectToDatabase } from '@/app/utils/mongoConnection';
import bcrypt from 'bcryptjs';

// Handle Business Registration
export async function POST(req) {
  try {
    const { businessName, email, password, address } = await req.json();
    const { db } = await connectToDatabase();

    // Ensure email is trimmed and lowercase for case insensitivity
    const normalizedEmail = email.trim().toLowerCase();

    // Ensure password exists and is not empty
    if (!password || typeof password !== 'string' || password.trim() === '') {
      return new Response(JSON.stringify({ success: false, message: 'Password is required and must be a non-empty string.' }), { status: 400 });
    }

    // Log the normalized email for debugging
    console.log('Normalized Email:', normalizedEmail);

    // Check if the email already exists in either the Business or Customer collection
    const existingBusiness = await db.collection('Business').findOne({ email: normalizedEmail });
    const existingCustomer = await db.collection('Customer').findOne({ email: normalizedEmail });

    console.log('Existing Business:', existingBusiness);
    console.log('Existing Customer:', existingCustomer);

    if (existingBusiness || existingCustomer) {
      return new Response(JSON.stringify({ success: false, message: 'Email already exists.' }), { status: 400 });
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Insert data into the 'Business' collection with the hashed password
    const result = await db.collection('Business').insertOne({
      businessName,
      email: normalizedEmail,  // Store the email in lowercase
      password: hashedPassword,
      address,
    });

    return new Response(JSON.stringify({ success: true, message: 'Business registered successfully!' }), { status: 201 });
  } catch (error) {
    console.error(error);
    return new Response('Error registering business', { status: 500 });
  }
}

// Handle Email Checking
export async function POST_check_email(req) {
  try {
    const { email } = await req.json();
    const { db } = await connectToDatabase();

    // Ensure email is trimmed and lowercase for case insensitivity
    const normalizedEmail = email.trim().toLowerCase();

    // Log the normalized email for debugging
    console.log('Checking Email:', normalizedEmail);

    // Check if email exists in either the Business or Customer collection
    const existingBusiness = await db.collection('Business').findOne({ email: normalizedEmail });
    const existingCustomer = await db.collection('Customer').findOne({ email: normalizedEmail });

    console.log('Existing Business:', existingBusiness);
    console.log('Existing Customer:', existingCustomer);

    if (existingBusiness || existingCustomer) {
      return new Response(JSON.stringify({ success: false }), { status: 200 });
    }
    return new Response(JSON.stringify({ success: true }), { status: 200 });
  } catch (error) {
    console.error(error);
    return new Response('Error checking email', { status: 500 });
  }
}
