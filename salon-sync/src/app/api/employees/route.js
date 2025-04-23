// ✅ FIXED FILE: src/app/api/employees/route.js
import { connectToDatabase } from '@/app/utils/mongoConnection';
import { Resend } from 'resend';
import { ObjectId } from 'mongodb';

const resend = new Resend(process.env.RESEND_API_KEY);

function generateEmployeeCode() {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let code = '';
  for (let i = 0; i < 6; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}

async function generateEmployeeId(db) {
  const lastEmployee = await db.collection('Employee').find().sort({ employeeId: -1 }).limit(1).toArray();
  const nextId = lastEmployee.length > 0 ? lastEmployee[0].employeeId + 1 : 1000;
  return nextId;
}

export async function GET(req) {
  const { searchParams } = new URL(req.url);
  const salonId = searchParams.get('salonId');

  if (!salonId) {
    return new Response(
      JSON.stringify({ error: 'Salon ID is missing' }),
      { status: 400 }
    );
  }

  const salonIdNumber = Number(salonId);

  try {
    const { db } = await connectToDatabase();
    const employees = await db
      .collection('Employee')
      .find({ $or: [
        { salonId: salonIdNumber },
        { salonIds: { $in: [salonIdNumber] } }
      ]})
      .project({
        _id: 0,
        name: 1,
        employeeId: 1,
        email: 1,
        profilePicture: 1,
        bio: 1,
        createdAt: 1
      })
      .toArray();

    return new Response(JSON.stringify({ employees }), { status: 200 });
  } catch (error) {
    console.error('Error fetching employees:', error);
    return new Response(
      JSON.stringify({ error: 'Failed to fetch employees' }),
      { status: 500 }
    );
  }
}

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

export async function PUT(req) {
  try {
    const { salonId, salonName: businessName, name, email } = await req.json();

    if (!salonId) {
      return new Response(
        JSON.stringify({ error: 'Salon ID is missing' }),
        { status: 400 }
      );
    }

    const { db } = await connectToDatabase();

    const employeeId = await generateEmployeeId(db);
    const employeeCode = generateEmployeeCode();

    await db.collection('Employee').insertOne({
      salonId: Number(salonId),
      salonIds: [Number(salonId)],
      name,
      email,
      employeeCode,
      employeeId,
      profilePicture: null,
      bio: null,
      createdAt: new Date(),
    });

    const { error } = await resend.emails.send({
      from: 'SalonSync <onboarding@grizzway.dev>',
      to: [email],
      subject: 'SalonSync Invitation',
      html: `<p>Hello ${name}!<br>You were invited to <strong>${businessName}</strong>.<br><br>Your login code is: <strong>${employeeCode}</strong></p>`
    });

    if (error) {
      console.error('Error sending email:', error);
      return new Response(
        JSON.stringify({ error: 'Failed to send email', details: error }),
        { status: 500 }
      );
    }

    const employees = await db.collection('Employee')
      .find({ $or: [
        { salonId: Number(salonId) },
        { salonIds: { $in: [Number(salonId)] } }
      ] })
      .project({ _id: 0, name: 1, employeeId: 1 })
      .toArray();

    return new Response(JSON.stringify({ employees }), { status: 200 });

  } catch (error) {
    console.error('Error adding employee:', error);
    return new Response(
      JSON.stringify({ error: 'Failed to add employee', details: error.message }),
      { status: 500 }
    );
  }
}
