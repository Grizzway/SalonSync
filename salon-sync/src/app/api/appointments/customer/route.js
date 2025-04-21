import { connectToDatabase } from '@/app/utils/mongoConnection';
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function GET(req) {
  const { searchParams } = new URL(req.url);
  const customerId = Number(searchParams.get('customerId'));

  if (!customerId) {
    return new Response(JSON.stringify({ error: 'Missing customerId' }), { status: 400 });
  }

  try {
    const { db } = await connectToDatabase();

    // Fetch customer appointments
    const appointments = await db.collection('Appointment')
      .find({ customerId }) // Now matches the number type
      .sort({ date: 1, time: 1 })
      .toArray();

    // Fetch customer details
    const customer = await db.collection('Customer').findOne({ customerId });
    if (!customer) {
      return new Response(JSON.stringify({ error: 'Customer not found' }), { status: 404 });
    }

    // Send confirmation email for the latest appointment
    if (appointments.length > 0) {
      const latestAppointment = appointments[0]; // Assuming the first one is the latest
      const emailPayload = {
        to: customer.email,
        subject: 'Your Upcoming Appointment - SalonSync',
        html: `
          <p>Dear ${customer.name},</p>
          <p>Here are the details of your upcoming appointment:</p>
          <ul>
            <li><strong>Service:</strong> ${latestAppointment.service}</li>
            <li><strong>Date:</strong> ${latestAppointment.date}</li>
            <li><strong>Time:</strong> ${latestAppointment.time}</li>
          </ul>
          <p>We look forward to seeing you!</p>
          <p>Best regards,<br>The SalonSync Team</p>
        `,
      };

      const emailRes = await resend.emails.send(emailPayload);

      if (!emailRes.ok) {
        console.error('Failed to send confirmation email.');
      }
    }

    return new Response(JSON.stringify({ appointments }), { status: 200 });
  } catch (err) {
    console.error('Error fetching customer appointments:', err);
    return new Response(JSON.stringify({ error: 'Failed to fetch appointments' }), { status: 500 });
  }
}
