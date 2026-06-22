import mongoose from 'mongoose';

// Tandaan: Palitan mo ang <db_password> ng totoong password mo, gar!
const MONGODB_URI = 'mongodb+srv://mbvargas91_db_user:Markminard1@cluster0.2oeqdzm.mongodb.net/?appName=szk-appointment';

if (!MONGODB_URI) {
  throw new Error('Pakilagay ang MONGODB_URI sa src/db.js, gar!');
}

export async function connectDB() {

  if (mongoose.connection.readyState >= 1) return;

  try {
    await mongoose.connect(MONGODB_URI);
    console.log("Connected to MongoDB!");
  } catch (error) {
    console.error("MongoDB connection error:", error);
  }
}
