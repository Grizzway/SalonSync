import { connectToDatabase } from '@/app/utils/mongoConnection';
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(req) {
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

    const { db } = await connectToDatabase();
    const numericEmployeeId = Number(employeeId); // ✅ ensure it's stored as a number

    // Prevent double booking
    const conflict = await db.collection('Appointment').findOne({
      employeeId: numericEmployeeId,
      date,
      time,
    });

    if (conflict) {
      return new Response(JSON.stringify({ message: 'Time slot already booked' }), { status: 409 });
    }

    // Create customer if guest
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
    const customerName = customer?.name || 'A customer';

    // Get service details from employee
    const emp = await db.collection('Employee').findOne({ employeeId: numericEmployeeId });
    const matchedService = emp?.services?.find((s) => s.name === service);
    const duration = matchedService?.duration || 60;
    const price = matchedService?.price || 100;

    // Save appointment
    const lastAppointment = await db.collection('Appointment')
      .find()
      .sort({ appointmentId: -1 })
      .limit(1)
      .toArray();

    const nextAppointmentId = lastAppointment.length > 0
      ? lastAppointment[0].appointmentId + 1
      : 1000;


    const appointment = {
      appointmentId: nextAppointmentId,
      customerId: finalCustomerId,
      salonId,
      employeeId: parseInt(numericEmployeeId),
      service,
      date,
      time,
      duration,
      price,
      status: 'Booked',
      createdAt: new Date(),
    };

    const result = await db.collection('Appointment').insertOne(appointment);

    // Log payment
    await db.collection('Payment').insertOne({
      appointmentId: result.insertedId,
      customerId: finalCustomerId,
      salonId,
      employeeId: numericEmployeeId,
      cost: paymentOption === 'half' ? price / 2 : price,
      paymentMethod: 'Credit (Fake)',
      paid: paymentOption,
      createdAt: new Date(),
    });

    // Send email
    await resend.emails.send({
      from: 'SalonSync <booking@grizzway.dev>',
      to: [email],
      subject: 'Your SalonSync Appointment Confirmation',
      html: `
        <h2>Appointment Confirmed</h2>
        <p><strong>Service:</strong> ${service}</p>
        <p><strong>Date:</strong> ${date}</p>
        <p><strong>Time:</strong> ${time}</p>
        <p><strong>Stylist:</strong> ${emp?.name || 'Unknown'}</p>
        <p><strong>Total:</strong> $${price} (${paymentOption === 'half' ? 'Half Paid' : 'Paid in Full'})</p>
        <br>
        <p>Thank you for booking with SalonSync 💜</p>
      `,
    });
    
    // Notify the employee
    if (emp?.email) {
      await resend.emails.send({
        from: 'SalonSync <booking@grizzway.dev>',
        to: [emp.email],
        subject: `New Appointment Booked: ${service} on ${date}`,
        html: `
          <h2>You've Been Booked 🎉</h2>
          <p><strong>Service:</strong> ${service}</p>
          <p><strong>Date:</strong> ${date}</p>
          <p><strong>Time:</strong> ${time}</p>
          <p><strong>Customer Name:</strong> ${customerName}</p>
          <p><strong>Customer Email:</strong> ${email}</p>
          <br>
          <p>Log in to your dashboard for more details.</p>
        `,
      });
    }

    return new Response(JSON.stringify({ appointmentId: nextAppointmentId }), { status: 201 });

  } catch (err) {
    console.error('Booking error:', err);
    return new Response(JSON.stringify({ message: 'Internal Server Error' }), { status: 500 });
  }
}

