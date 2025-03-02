import { connectToDatabase } from '@/app/utils/mongoConnection';
import bcrypt from 'bcryptjs';

// Handle Business Registration and Email Checking
export async function POST(req) {
  try {
    const { businessName, email, password, address } = await req.json();
    const { db } = await connectToDatabase();

    // Check if only email is provided for checking
    if (email && !businessName && !password && !address) {
      // Ensure email is trimmed and lowercase for case insensitivity
      const normalizedEmail = email.trim().toLowerCase();

      // Check if email exists in either the Business or Customer collection
      console.log(`Checking if email ${normalizedEmail} exists in Business and Customer collections...`);
      const existingBusiness = await db.collection('Business').findOne({
        email: normalizedEmail,
      });
      const existingCustomer = await db.collection('Customer').findOne({
        email: normalizedEmail,
      });

      console.log('Business Collection:', existingBusiness);
      console.log('Customer Collection:', existingCustomer);

      if (existingBusiness || existingCustomer) {
        return new Response(JSON.stringify({ success: false }), { status: 200 });
      }
      return new Response(JSON.stringify({ success: true }), { status: 200 });
    }

    // If we have both businessName, email, password, and address, proceed with registration
    if (businessName && email && password && address) {
      // Ensure email is trimmed and lowercase for case insensitivity
      const normalizedEmail = email.trim().toLowerCase();

      // Ensure password exists and is not empty
      if (!password || typeof password !== 'string' || password.trim() === '') {
        return new Response(
          JSON.stringify({
            success: false,
            message: 'Password is required and must be a non-empty string.',
          }),
          { status: 400 }
        );
      }

      // Check if the email already exists in either the Business or Customer collection
      console.log(`Checking if email ${normalizedEmail} exists in Business and Customer collections...`);
      const existingBusiness = await db.collection('Business').findOne({
        email: normalizedEmail,
      });
      const existingCustomer = await db.collection('Customer').findOne({
        email: normalizedEmail,
      });

      console.log('Business Collection:', existingBusiness);
      console.log('Customer Collection:', existingCustomer);

      if (existingBusiness || existingCustomer) {
        return new Response(
          JSON.stringify({ success: false, message: 'Email already exists.' }),
          { status: 400 }
        );
      }

      // Hash the password
      const hashedPassword = await bcrypt.hash(password, 10);

      // Insert data into the 'Business' collection with the hashed password
      const result = await db.collection('Business').insertOne({
        businessName,
        email: normalizedEmail, // Store the email in lowercase
        password: hashedPassword,
        address,
      });

      return new Response(
        JSON.stringify({ success: true, message: 'Business registered successfully!' }),
        { status: 201 }
      );
    }

    return new Response('Invalid data', { status: 400 });
  } catch (error) {
    console.error(error);
    return new Response('Error registering business', { status: 500 });
  }
}
