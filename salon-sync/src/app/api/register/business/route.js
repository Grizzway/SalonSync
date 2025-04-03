import { connectToDatabase } from "@/app/utils/mongoConnection";
import bcrypt from "bcryptjs";

// Handle Business Registration and Email Checking
export async function POST(req) {
  try {
    const body = await req.json();
    const { businessName, email, password, address } = body;

    if (!email) {
      return new Response(
        JSON.stringify({ success: false, message: "Email is required." }),
        { status: 400 }
      );
    }

    const { db } = await connectToDatabase();
    const normalizedEmail = email.trim().toLowerCase();

    // Check if request is only to verify email existence
    if (!businessName && !password && !address) {
      console.log(`Checking if email ${normalizedEmail} exists...`);

      const emailExists =
        (await db.collection("Business").findOne({ email: normalizedEmail })) ||
        (await db.collection("Customer").findOne({ email: normalizedEmail }));

      return new Response(
        JSON.stringify({ success: !emailExists }),
        { status: 200 }
      );
    }

    // Ensure all required fields exist for registration
    if (!businessName || !password || !address) {
      return new Response(
        JSON.stringify({ success: false, message: "All fields are required." }),
        { status: 400 }
      );
    }

    // Check if email is already registered
    console.log(`Checking if email ${normalizedEmail} exists before registering...`);
    const existingBusiness = await db.collection("Business").findOne({ email: normalizedEmail });
    const existingCustomer = await db.collection("Customer").findOne({ email: normalizedEmail });

    if (existingBusiness || existingCustomer) {
      return new Response(
        JSON.stringify({ success: false, message: "Email is already registered." }),
        { status: 400 }
      );
    }

    // Hash the password securely
    const hashedPassword = await bcrypt.hash(password, 10);

    // Get the last used salonId
    const lastSalon = await db.collection("Business")
      .find({})
      .sort({ createdAt: -1 })
      .limit(1)
      .toArray();

    const lastSalonId = lastSalon.length > 0 ? lastSalon[0].salonId : 999;
    const newSalonId = lastSalonId + 1;

    // Store business in the database with the generated ID
    const result = await db.collection("Business").insertOne({
      businessName,
      email: normalizedEmail,
      password: hashedPassword,
      address,
      createdAt: new Date(),
      rating: 0,
      salonId: newSalonId, // New field for the salon ID
    });

    console.log("Business registered:", result.insertedId);

    return new Response(
      JSON.stringify({ success: true, message: "Business registered successfully!", businessId: result.insertedId, salonId: newSalonId }),
      { status: 201 }
    );
  } catch (error) {
    console.error("Error in Business Registration API:", error);
    return new Response(
      JSON.stringify({ success: false, message: "Internal Server Error" }),
      { status: 500 }
    );
  }
}
