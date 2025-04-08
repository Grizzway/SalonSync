import dotenv from "dotenv";
dotenv.config();

import { MongoClient } from "mongodb";
import fetch from "node-fetch";

const uri = process.env.MONGODB_URI;
const GEOAPIFY_KEY = process.env.GEOAPIFY_KEY;

async function geocodeAddress(address) {
  const response = await fetch(
    `https://api.geoapify.com/v1/geocode/search?text=${encodeURIComponent(
      address
    )}&apiKey=${GEOAPIFY_KEY}`
  );

  const data = await response.json();
  if (data.features && data.features.length > 0) {
    const { lat, lon } = data.features[0].properties;
    return { latitude: lat, longitude: lon };
  }

  return null;
}

async function updateSalons() {
  const client = new MongoClient(uri);
  try {
    await client.connect();
    const db = client.db(); // Uses database from URI
    const salons = db.collection("Business"); // Change to 'salons' if that's the actual collection name

    const cursor = salons.find({});

    let updatedCount = 0;

    while (await cursor.hasNext()) {
      const salon = await cursor.next();

      if (!salon.latitude || !salon.longitude) {
        console.log(`📍 Geocoding: ${salon.businessName}`);

        const coords = await geocodeAddress(salon.address);
        if (coords) {
          await salons.updateOne(
            { _id: salon._id },
            {
              $set: {
                latitude: coords.latitude,
                longitude: coords.longitude,
              },
            }
          );
          updatedCount++;
          console.log(`✅ Updated ${salon.businessName} with lat/lng`);
        } else {
          console.warn(`⚠️ Could not geocode: ${salon.address}`);
        }
      } else {
        console.log(`✅ Already has coordinates: ${salon.businessName}`);
      }
    }

    console.log(`🎉 Done. Updated ${updatedCount} salons.`);
  } catch (err) {
    console.error("❌ Error updating salons:", err);
  } finally {
    await client.close();
  }
}

updateSalons();
