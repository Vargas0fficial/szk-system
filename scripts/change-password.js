// Change an existing admin account's password.
// Usage: node scripts/change-password.js <username> <newPassword>
// Example: node scripts/change-password.js john_admin MyNewSecurePass123

require('dotenv').config({ path: '.env.local' });
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
    console.error('Missing MONGODB_URI. Make sure it is set in your .env.local file.');
    process.exit(1);
}

const AdminSchema = new mongoose.Schema({
    username: { type: String, required: true, unique: true },
    password: { type: String, required: true },
}, { timestamps: true });

const Admin = mongoose.models.Admin || mongoose.model('Admin', AdminSchema);

async function changePassword() {
    const [, , username, newPassword] = process.argv;

    if (!username || !newPassword) {
        console.error('Missing arguments.');
        console.error('Usage: node scripts/change-password.js <username> <newPassword>');
        process.exit(1);
    }

    if (newPassword.length < 6) {
        console.error('Password must be at least 6 characters.');
        process.exit(1);
    }

    await mongoose.connect(MONGODB_URI);

    const existing = await Admin.findOne({ username });
    if (!existing) {
        console.log(`Admin account "${username}" does not exist.`);
        process.exit(0);
    }

    const hashed = await bcrypt.hash(newPassword, 10);
    existing.password = hashed;
    await existing.save();

    console.log(`Password updated! Username: ${username}`);
    process.exit(0);
}

changePassword().catch((err) => {
    console.error('Error changing password:', err.message);
    process.exit(1);
});