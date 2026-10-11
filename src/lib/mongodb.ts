import mongoose, { type Mongoose } from 'mongoose';

const MONGODB_URI = process.env.MONGODB_URI;

interface MongooseCache {
  conn: Mongoose | null;
  promise: Promise<Mongoose> | null;
}

/**
 * Global is used here to maintain a cached connection across hot reloads
 * in development and across invocations on serverless platforms. This prevents
 * connections from growing exponentially and exhausting the Atlas connection limit.
 */
const cached: MongooseCache = (global as unknown as { mongoose?: MongooseCache }).mongoose ?? {
  conn: null,
  promise: null,
};

if (!(global as unknown as { mongoose?: MongooseCache }).mongoose) {
  (global as unknown as { mongoose?: MongooseCache }).mongoose = cached;
}

const MONGOOSE_OPTIONS = {
  bufferCommands: false,
  dbName: 'nhontam_db',
  // Serverless / Atlas M0 friendly pool sizing to avoid connection exhaustion.
  maxPoolSize: 5,
  minPoolSize: 0,
  // Fail fast instead of hanging ~30s when Atlas is unreachable or cold.
  serverSelectionTimeoutMS: 5000,
  connectTimeoutMS: 10000,
  socketTimeoutMS: 30000,
  maxIdleTimeMS: 10000,
};

export async function connectToDatabase(): Promise<Mongoose> {
  if (cached.conn) {
    return cached.conn;
  }

  if (!MONGODB_URI) {
    throw new Error('Please define the MONGODB_URI environment variable inside .env.local');
  }

  if (!cached.promise) {
    cached.promise = mongoose.connect(MONGODB_URI, MONGOOSE_OPTIONS);
  }

  try {
    cached.conn = await cached.promise;
  } catch (e) {
    cached.promise = null;
    throw e;
  }

  return cached.conn;
}
