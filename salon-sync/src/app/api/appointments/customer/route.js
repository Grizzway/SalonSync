import { connectToDatabase } from '@/app/utils/mongoConnection';
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function GET(req) {
  let client;

  const { searchParams } = new URL(req.url);
  const customerId = Number(searchParams.get('customerId'));

  if (!customerId) {
    return new Response(JSON.stringify({ error: 'Missing customerId' }), { status: 400 });
  }

  try {
    const connection = await connectToDatabase();
    client = connection.client;
    const db = connection.db;

    const appointments = await db.collection('Appointment')
      .find({ customerId })
      .sort({ date: 1, time: 1 })
      .toArray();

    const enrichedAppointments = await Promise.all(
      appointments.map(async (apt) => {
        const employee = await db.collection('Employee').findOne({ employeeId: apt.employeeId });
        return {
          ...apt,
          employeeName: employee?.name || 'Unknown',
        };
      })
    );

    return new Response(JSON.stringify({ appointments: enrichedAppointments }), { status: 200 });
  } catch (err) {
    console.error('Error fetching customer appointments:', err);
    return new Response(JSON.stringify({ error: 'Failed to fetch appointments' }), { status: 500 });
  } finally {
    if (client && !global._mongoClientPromise) {
      await client.close();
    }
  }
}

export async function DELETE(req) {
  let client;

  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('appointmentId');

    if (!id) {
      return new Response(JSON.stringify({ error: 'Missing appointmentId' }), { status: 400 });
    }

    const connection = await connectToDatabase();
    client = connection.client;
    const db = connection.db;

    const appointment = await db.collection('Appointment').findOne({ appointmentId: Number(id) });

    if (!appointment) {
      return new Response(JSON.stringify({ error: 'Appointment not found' }), { status: 404 });
    }

    const customer = await db.collection('Customer').findOne({ customerId: appointment.customerId });
    const employee = await db.collection('Employee').findOne({ employeeId: appointment.employeeId });

    const customerName = customer?.name || 'A customer';
    const customerEmail = customer?.email;
    const employeeEmail = employee?.email;
    const employeeName = employee?.name || 'Your client';

    const service = appointment.service;
    const date = appointment.date;
    const time = appointment.time;

    const result = await db.collection('Appointment').deleteOne({ appointmentId: Number(id) });

    if (result.deletedCount === 0) {
      return new Response(JSON.stringify({ error: 'Failed to delete appointment' }), { status: 500 });
    }

    if (customerEmail) {
      await resend.emails.send({
        from: 'SalonSync <booking@grizzway.dev>',
        to: [customerEmail],
        subject: 'Your Appointment Has Been Canceled',
        html: `
          <h2>Appointment Canceled</h2>
          <p>Hi ${customerName},</p>
          <p>Your appointment for <strong>${service}</strong> with <strong>${employeeName}</strong> on <strong>${date}</strong> at <strong>${time}</strong> has been canceled.</p>
          <p>If you paid in full, you’ll receive a 50% refund.</p>
          <p>Thanks for using SalonSync 💜</p>
        `,
      });
    }

    if (employeeEmail) {
      await resend.emails.send({
        from: 'SalonSync <booking@grizzway.dev>',
        to: [employeeEmail],
        subject: 'An Appointment Has Been Canceled',
        html: `
          <h2>Appointment Canceled</h2>
          <p><strong>${customerName}</strong> has canceled their <strong>${service}</strong> appointment scheduled on <strong>${date}</strong> at <strong>${time}</strong>.</p>
          <p>Please check your dashboard for schedule updates.</p>
        `,
      });
    }

    return new Response(JSON.stringify({ success: true }), { status: 200 });
  } catch (err) {
    console.error('Error cancelling appointment:', err);
    return new Response(JSON.stringify({ error: 'Failed to cancel appointment' }), { status: 500 });
  } finally {
    if (client && !global._mongoClientPromise) {
      await client.close();
    }
  }
}