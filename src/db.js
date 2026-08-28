import mongoose from 'mongoose';

const MONGODB_URI = process.env.MONGODB_URI;

// Central database that stores ALL admin accounts across every branch.
// Each admin document has a "branch" field pointing to which branch's
// appointments database that admin manages.
const ADMIN_DB = 'szk_admins';

if (!MONGODB_URI) {
  throw new Error('MONGODB_URI is not defined in .env.local');
}

let cached = global.mongoose || { conn: null, promise: null };
global.mongoose = cached;

// Base connection to the cluster, pointed at the central admins database.
// Used for login / admin account lookups.
export async function connectDB() {
  if (cached.conn) return cached.conn;

  if (!cached.promise) {
    cached.promise = mongoose.connect(MONGODB_URI, {
      serverSelectionTimeoutMS: 10000,
      dbName: ADMIN_DB,
    });
  }

  cached.conn = await cached.promise;
  return cached.conn;
}

// Returns a connection scoped to a specific branch's database.
// This reuses the same underlying connection to the cluster (no new TCP
// connection is opened) — it just points queries at a different database,
// which is exactly what mongoose's useDb() is designed for.
export async function getBranchConnection(branchDb) {
  const base = await connectDB();
  return base.connection.useDb(branchDb, { useCache: true });
}