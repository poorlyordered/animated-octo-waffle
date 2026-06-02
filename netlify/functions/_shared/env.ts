export interface ServerEnv {
  mongodbUri: string;
  mongodbDb: string;
}

export interface ScopeEnv {
  corporationId: string;
}

export interface EsiTokenVaultEnv {
  sealingKey: string;
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

export function readScopeEnv(env: NodeJS.ProcessEnv = process.env): ScopeEnv {
  const corporationId = env.EVEONLINE_CORPORATION_ID;

  if (!corporationId) {
    throw new Error('EVEONLINE_CORPORATION_ID is required');
  }

  return { corporationId };
}

export function readEsiTokenVaultEnv(env: NodeJS.ProcessEnv = process.env): EsiTokenVaultEnv {
  const sealingKey = env.ESI_TOKEN_VAULT_SEALING_KEY;

  if (sealingKey) {
    return { sealingKey };
  }

  if (env.NODE_ENV === 'production') {
    throw new Error('ESI_TOKEN_VAULT_SEALING_KEY is required');
  }

  return { sealingKey: 'local-development-esi-token-vault-key' };
}
