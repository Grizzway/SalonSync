import { MongoClient } from 'mongodb';

const uri = process.env.MONGODB_URI;
const dbName = 'SalonSync';

let cachedClient = null;
let cachedDb = null;

export async function connectToDatabase() {
  if (typeof window !== 'undefined') return null;

  if (cachedClient && cachedDb) {
    // ✅ Ensure the client is still connected
    try {
      await cachedClient.db().command({ ping: 1 });
      return { client: cachedClient, db: cachedDb };
    } catch (err) {
      // Client is no longer valid, reset cache
      cachedClient = null;
      cachedDb = null;
    }
  }

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
