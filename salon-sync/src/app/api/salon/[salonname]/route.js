import { connectToDatabase } from '@/app/utils/mongoConnection';

export async function GET(req, { params }) {
  // Explicitly await params to satisfy Next.js validation
  const resolvedParams = await Promise.resolve(params);
  const { salonname } = resolvedParams;

  try {
    const { db } = await connectToDatabase();

    // Normalize salonname: replace hyphens with spaces to match database
    const normalizedSalonName = salonname.replace(/-/g, ' ');
    console.log('Querying for salonname:', normalizedSalonName);

    // Query the database for the salon
    const salon = await db.collection('Business').findOne({
      businessName: { $regex: new RegExp(`^${normalizedSalonName}$`, 'i') },
    });

    console.log('Salon found:', salon);

    // If no salon is found, return 404
    if (!salon) {
      return new Response(JSON.stringify({ error: 'Salon not found' }), { status: 404 });
    }

    // Return the salon data
    const salonData = {
      name: salon.businessName,
      banner: salon.banner || null,
      logo: salon.logo || null,
      theme: salon.theme || 'grey',
    };

    return new Response(JSON.stringify(salonData), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error fetching salon data:', error);
    return new Response(JSON.stringify({ error: 'Internal Server Error' }), { status: 500 });
  }
}