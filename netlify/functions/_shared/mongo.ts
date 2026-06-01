import { MongoClient } from 'mongodb';
import { readServerEnv } from './env';

let cachedClient: MongoClient | null = null;

export async function getMongoClient(): Promise<MongoClient> {
  if (cachedClient) {
    return cachedClient;
  }

  const { mongodbUri } = readServerEnv();
  cachedClient = new MongoClient(mongodbUri);
  await cachedClient.connect();
  return cachedClient;
}

export async function getMongoDb() {
  const { mongodbDb } = readServerEnv();
  const client = await getMongoClient();
  return client.db(mongodbDb);
}
