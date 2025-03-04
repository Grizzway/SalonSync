// utils/mongoConnection.js

import { MongoClient } from 'mongodb';
const client = new MongoClient(process.env.MONGODB_URI);
const dbName = 'SalonSync';

export async function connectToDatabase() {
  if (typeof window !== 'undefined') {
    // If we're on the client-side, prevent the MongoDB connection from being used
    return null;
  }
  
  // Connect to the database server-side only
  await client.connect();
  const db = client.db(dbName);
  return { db, client };
}
