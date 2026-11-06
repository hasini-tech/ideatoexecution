import mongoose from 'mongoose';

const cached = global._mongoose || (global._mongoose = { conn: null, promise: null });

export async function connectDB() {
  const uri = process.env.MONGODB_URI;
  if (!uri) throw new Error('MONGODB_URI is not set. Copy .env.example to .env.local and fill it in.');
  if (cached.conn) return cached.conn;
  if (!cached.promise) {
    const hasDatabaseInUri = /^mongodb(?:\+srv)?:\/\/[^/]+\/[^/?]+/i.test(uri);
    const options = { bufferCommands: false };
    if (!hasDatabaseInUri) options.dbName = 'idea-to-execution';
    cached.promise = mongoose.connect(uri, options).catch((e) => {
      cached.promise = null;
      throw e;
    });
  }
  cached.conn = await cached.promise;
  return cached.conn;
}
