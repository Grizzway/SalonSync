import { connectToDatabase } from '@/app/utils/mongoConnection';
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(req) {
  let client;

  try {
    const {
      customerId,
      name,
      email,
      phone,
      salonId,
      employeeId,
      service,
      date,
      time,
      paymentOption,
    } = await req.json();

    if (!salonId || !employeeId || !service || !date || !time || !email) {
      return new Response(JSON.stringify({ message: 'Missing required fields' }), { status: 400 });
    }

    const connection = await connectToDatabase();
    client = connection.client;
    const db = connection.db;

    const numericEmployeeId = Number(employeeId);

    // Shift check bypassed completely for demo
    const emp = await db.collection('Employee').findOne({ employeeId: numericEmployeeId });
    const matchedService = emp?.services?.find((s) => s.name === service);
    const duration = matchedService?.duration || 60;
    const price = matchedService?.price || 100;

    if (!time.endsWith(':00') && !time.endsWith(':30')) {
      return new Response(JSON.stringify({ message: 'Appointments must be in 30-minute intervals' }), { status: 400 });
    }

    const sameDayAppointments = await db.collection('Appointment').find({
      employeeId: numericEmployeeId,
      date,
    }).toArray();

    const appointmentStart = new Date(`${date}T${time}`).getTime();
    const appointmentEnd = appointmentStart + duration * 60000;

    const hasConflict = sameDayAppointments.some(appt => {
      const apptStart = new Date(`${appt.date}T${appt.time}`).getTime();
      const apptEnd = apptStart + (appt.duration || 60) * 60000;
      return appointmentStart < apptEnd && appointmentEnd > apptStart;
    });

    if (hasConflict) {
      return new Response(JSON.stringify({ message: 'Time slot overlaps with existing appointment' }), { status: 409 });
    }

    let finalCustomerId = customerId;
    if (!customerId) {
      const existing = await db.collection('Customer').findOne({ email });
      if (existing) {
        finalCustomerId = existing.customerId;
      } else {
        const last = await db.collection('Customer').find().sort({ customerId: -1 }).limit(1).toArray();
        finalCustomerId = last.length > 0 ? last[0].customerId + 1 : 1000;
        await db.collection('Customer').insertOne({
          customerId: finalCustomerId,
          name,
          email,
          phone,
          profilePicture: null,
          bio: '',
          createdAt: new Date(),
        });
      }
    }

    const customer = await db.collection('Customer').findOne({ customerId: finalCustomerId });
    const customerName = customer?.name || 'Customer';

    const lastAppointment = await db.collection('Appointment').find().sort({ appointmentId: -1 }).limit(1).toArray();
    const nextAppointmentId = lastAppointment.length > 0 ? lastAppointment[0].appointmentId + 1 : 1000;

    const appointment = {
      appointmentId: nextAppointmentId,
      customerId: finalCustomerId,
      salonId: parseInt(salonId),
      employeeId: numericEmployeeId,
      service,
      date,
      time,
      duration,
      price,
      status: 'Booked',
      createdAt: new Date(),
    };

    const result = await db.collection('Appointment').insertOne(appointment);

    await db.collection('Payment').insertOne({
      appointmentId: nextAppointmentId,
      customerId: finalCustomerId,
      salonId: parseInt(salonId),
      employeeId: numericEmployeeId,
      cost: paymentOption === 'half' ? price / 2 : price,
      paymentMethod: 'Debit/Credit',
      paid: paymentOption,
      createdAt: new Date(),
    });

    await resend.emails.send({
      from: 'SalonSync <booking@grizzway.dev>',
      to: [email],
      subject: 'Your SalonSync Appointment Confirmation',
      html: `<h2>Confirmed</h2><p><strong>Service:</strong> ${service}</p><p><strong>Time:</strong> ${date} at ${time}</p><p><strong>Stylist:</strong> ${emp?.name || 'Stylist'}</p>`
    });

    return new Response(JSON.stringify({ appointmentId: nextAppointmentId }), { status: 201 });
  } catch (err) {
    console.error('Booking error:', err);
    return new Response(JSON.stringify({ message: 'Internal Server Error' }), { status: 500 });
  } finally {
    if (client && !global._mongoClientPromise) {
      await client.close();
    }
  }
}
