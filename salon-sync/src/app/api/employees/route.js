import { connectToDatabase } from '@/app/utils/mongoConnection';
import { Resend } from 'resend';
import { ObjectId } from 'mongodb'; // Import ObjectId from MongoDB

const resend = new Resend(process.env.RESEND_API_KEY);

function generateEmployeeCode() {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let code = '';
  for (let i = 0; i < 6; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}

// Function to generate a custom employee ID starting at 1000
async function generateEmployeeId(db) {
  const lastEmployee = await db.collection('Employee').find().sort({ employeeId: -1 }).limit(1).toArray();
  const nextId = lastEmployee.length > 0 ? lastEmployee[0].employeeId + 1 : 1000;
  return nextId;
}

// GET endpoint to fetch employees
export async function GET(req) {
    const { searchParams } = new URL(req.url);
    const salonId = searchParams.get('salonId');
  
    if (!salonId) {
      return new Response(
        JSON.stringify({ error: 'Salon ID is missing' }),
        { status: 400 }
      );
    }
  
    // Ensure salonId is treated as a number for comparison in MongoDB
    const salonIdNumber = Number(salonId); // Convert salonId to number
  
    try {
      const { db } = await connectToDatabase();
      const employees = await db
        .collection('Employee')
        .find({ salonId: salonIdNumber }) // Use the numeric salonId here
        .toArray();
      
      if (employees.length === 0) {
        console.log('No employees found for salonId:', salonIdNumber);
      }
  
      return new Response(JSON.stringify({ employees }), { status: 200 });
    } catch (error) {
      console.error('Error fetching employees:', error);
      return new Response(
        JSON.stringify({ error: 'Failed to fetch employees' }),
        { status: 500 }
      );
    }
  }

// DELETE endpoint to delete an employee
export async function DELETE(req) {
  try {
    const { employeeId } = await req.json();
  
    if (!employeeId) {
      return new Response(JSON.stringify({ message: 'Employee ID is required.' }), { status: 400 });
    }

    const { db } = await connectToDatabase();
    const result = await db.collection('Employee').deleteOne({ _id: new ObjectId(employeeId) });

    if (!result.deletedCount) {
      return new Response(JSON.stringify({ message: 'Employee not found.' }), { status: 404 });
    }

    const employees = await db.collection('Employee').find().toArray();
    return new Response(JSON.stringify({ employees }), { status: 200 });

  } catch (error) {
    console.error('Error deleting employee:', error);
    return new Response(JSON.stringify({ message: 'Internal server error.' }), { status: 500 });
  }
}

// PUT endpoint to add an employee
export async function PUT(req) {
  try {
    const { salonId, salonName, name, email } = await req.json();

    if (!salonId) {
      return new Response(
        JSON.stringify({ error: 'Salon ID is missing' }),
        { status: 400 }
      );
    }

    const { db } = await connectToDatabase();

    // Generate the custom employee ID starting at 1000
    const employeeId = await generateEmployeeId(db);

    const employeeCode = generateEmployeeCode();

    // Insert new employee with custom employeeId and other details
    await db.collection('Employee').insertOne({
      salonId,
      name,
      email,
      employeeCode,
      employeeId, // Add custom employee ID
      profilePicture: null,
      bio: null,
      createdAt: new Date(), // Add creation date
    });

    // Send the invitation email
    const { data, error } = await resend.emails.send({
      from: 'SalonSync <onboarding@grizzway.dev>',
      to: [email],
      subject: 'SalonSync Invitation',
      html: `<p>Hello ${name}!<br>You were invited to <strong>${salonName}</strong>.<br><br>Your login code is: <strong>${employeeCode}</strong></p>`,
    });

    if (error) {
      console.error('Error sending email:', error);
      return new Response(
        JSON.stringify({ error: 'Failed to send email', details: error }),
        { status: 500 }
      );
    }

    const employees = await db.collection('Employee').find({ salonId }).toArray();
    return new Response(JSON.stringify({ employees }), { status: 200 });

  } catch (error) {
    console.error('Error adding employee:', error);
    return new Response(
      JSON.stringify({ error: 'Failed to add employee', details: error.message }),
      { status: 500 }
    );
  }
}
