import { MongoClient } from 'mongodb';
import { readServerEnv } from './env';

let cachedClient: MongoClient | null = null;

export async function getMongoClient(): Promise<MongoClient> {
  if (cachedClient) {
    return cachedClient;
  }

  const { mongodbUri } = readServerEnv();
  const client = new MongoClient(mongodbUri);
  await client.connect();
  cachedClient = client;
  return client;
}

export async function getMongoDb() {
  const { mongodbDb } = readServerEnv();
  const client = await getMongoClient();
  return client.db(mongodbDb);
}
