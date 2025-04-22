import { MongoClient } from 'mongodb';

const uri = process.env.MONGODB_URI;
const dbName = 'SalonSync';

let cachedClient = null;
let cachedDb = null;

export async function connectToDatabase() {
  if (typeof window !== 'undefined') return null;

  if (cachedClient && cachedDb) {
    return { client: cachedClient, db: cachedDb };
  }

  // Only create a new client if one doesn't exist
  const client = new MongoClient(uri, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });

  await client.connect();

  const db = client.db(dbName);

  cachedClient = client;
  cachedDb = db;

  return { client, db };
}