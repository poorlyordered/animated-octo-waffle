import { jest } from '@jest/globals';

const connect = jest.fn<() => Promise<void>>();
const db = jest.fn();

const MongoClient = jest.fn().mockImplementation(() => ({
  connect,
  db
}));

jest.unstable_mockModule('mongodb', () => ({
  MongoClient
}));

const { getMongoClient } = await import('../../../../netlify/functions/_shared/mongo');

const originalEnv = process.env;

describe('Mongo client cache', () => {
  afterEach(() => {
    process.env = originalEnv;
    connect.mockReset();
    db.mockReset();
    MongoClient.mockClear();
  });

  it('does not cache a client until connect succeeds', async () => {
    process.env = {
      ...originalEnv,
      MONGODB_URI: 'mongodb://localhost:27017',
      MONGODB_DB: 'gryyk47_test'
    };
    connect
      .mockRejectedValueOnce(new Error('temporary connection failure'))
      .mockResolvedValueOnce(undefined);

    await expect(getMongoClient()).rejects.toThrow('temporary connection failure');
    await expect(getMongoClient()).resolves.toBeDefined();

    expect(MongoClient).toHaveBeenCalledTimes(2);
    expect(connect).toHaveBeenCalledTimes(2);
  });
});
