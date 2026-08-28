import mongoose from 'mongoose';

const AdminSchema = new mongoose.Schema({
    username: { type: String, required: true, unique: true },
    password: { type: String, required: true }, // bcrypt hashed
    branch: { type: String, required: true }, // e.g. "pang" — which branch this admin manages
}, { timestamps: true });

// Always bound to the central "szk_admins" database (the default connection).
export default mongoose.models.Admin || mongoose.model('Admin', AdminSchema);