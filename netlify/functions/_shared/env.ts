export interface ServerEnv {
  mongodbUri: string;
  mongodbDb: string;
}

export function readServerEnv(env: NodeJS.ProcessEnv = process.env): ServerEnv {
  const mongodbUri = env.MONGODB_URI;
  const mongodbDb = env.MONGODB_DB;

  if (!mongodbUri?.startsWith('mongodb://') && !mongodbUri?.startsWith('mongodb+srv://')) {
    throw new Error('MONGODB_URI must start with mongodb:// or mongodb+srv://');
  }

  if (!mongodbDb) {
    throw new Error('MONGODB_DB is required');
  }

  return { mongodbUri, mongodbDb };
}
