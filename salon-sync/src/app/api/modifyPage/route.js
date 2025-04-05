import { connectToDatabase } from '@/app/utils/mongoConnection';
import { ObjectId } from 'mongodb';

export default async function handler(req, res) {
    const { salonId } = req.query; // Expecting salonId to be passed as a query parameter

    try {
        // Validate salonId
        if (!ObjectId.isValid(salonId)) {
            return res.status(400).json({ error: 'Invalid salonId' });
        }

        const { db } = await connectToDatabase();

        if (req.method === 'GET') {
            // Fetch business details
            const salon = await db.collection('salons').findOne({ _id: new ObjectId(salonId) });
            if (!salon) {
                return res.status(404).json({ error: 'Salon not found' });
            }
            return res.status(200).json(salon);
        } else if (req.method === 'PUT') {
            // Update business details
            const { Description, Phone, address, email } = req.body;

            const result = await db.collection('salons').updateOne(
                { _id: new ObjectId(salonId) },
                { $set: { Description, Phone, address, email } }
            );

            if (result.matchedCount === 0) {
                return res.status(404).json({ error: 'Salon not found' });
            }

            if (result.modifiedCount === 0) {
                return res.status(200).json({ message: 'No changes made to the salon details' });
            }

            return res.status(200).json({ message: 'Salon details updated successfully' });
        } else {
            // Method not allowed
            return res.status(405).json({ error: 'Method Not Allowed' });
        }
    } catch (error) {
        console.error('Error in modifyPage API:', error);
        return res.status(500).json({ error: 'Internal Server Error' });
    }
}