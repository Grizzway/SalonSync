import { connectToDatabase } from '@/app/utils/mongoConnection';

export async function GET(req) {
  let client;

  try {
    const { searchParams } = new URL(req.url);
    const employeeId = Number(searchParams.get('employeeId'));

    if (!employeeId) {
      return new Response(JSON.stringify({ message: 'Missing employee ID' }), { status: 400 });
    }

    const connection = await connectToDatabase();
    client = connection.client;
    const db = connection.db;

    const employee = await db.collection('Employee').findOne({ employeeId });

    if (!employee) {
      return new Response(JSON.stringify({ message: 'Employee not found' }), { status: 404 });
    }

    return new Response(JSON.stringify({ services: employee.specialties || [] }), { status: 200 });
  } catch (err) {
    console.error('Service fetch error:', err);
    return new Response(JSON.stringify({ message: 'Server error' }), { status: 500 });
  } finally {
    if (client && !global._mongoClientPromise) {
      await client.close();
    }
  }
}

export async function PATCH(req) {
  let client;

  try {
    const { employeeId, action, service, index } = await req.json();

    if (!employeeId || !action) {
      return new Response(JSON.stringify({ message: 'Invalid request' }), { status: 400 });
    }

    const connection = await connectToDatabase();
    client = connection.client;
    const db = connection.db;

    const employee = await db.collection('Employee').findOne({ employeeId });
    if (!employee) {
      return new Response(JSON.stringify({ message: 'Employee not found' }), { status: 404 });
    }

    let updatedServices = employee.specialties || [];

    if (action === 'add' && service) {
      updatedServices.push(service);
    } else if (action === 'delete' && typeof index === 'number') {
      updatedServices.splice(index, 1);
    } else {
      return new Response(JSON.stringify({ message: 'Invalid action or missing data' }), { status: 400 });
    }

    await db.collection('Employee').updateOne(
      { employeeId },
      { $set: { specialties: updatedServices } }
    );

    return new Response(JSON.stringify({ success: true, services: updatedServices }), { status: 200 });
  } catch (err) {
    console.error('Service update error:', err);
    return new Response(JSON.stringify({ message: 'Server error' }), { status: 500 });
  } finally {
    if (client && !global._mongoClientPromise) {
      await client.close();
    }
  }
}
