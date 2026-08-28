// List all admin accounts (across all branches).
// Usage: node scripts/list-admins.js

require('dotenv').config({ path: '.env.local' });
const mongoose = require('mongoose');

const MONGODB_URI = process.env.MONGODB_URI;
const ADMIN_DB = 'szk_admins';

if (!MONGODB_URI) {
    console.error('Missing MONGODB_URI. Make sure it is set in your .env.local file.');
    process.exit(1);
}

const AdminSchema = new mongoose.Schema({
    username: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    branch: { type: String, required: true },
}, { timestamps: true });

const Admin = mongoose.models.Admin || mongoose.model('Admin', AdminSchema);

async function listAdmins() {
    await mongoose.connect(MONGODB_URI, { dbName: ADMIN_DB });

    const admins = await Admin.find({}).select('username branch createdAt').sort({ branch: 1 });

    if (admins.length === 0) {
        console.log('No admin accounts found.');
        process.exit(0);
    }

    console.log(`Found ${admins.length} admin account(s):\n`);
    console.log('Username'.padEnd(20) + 'Branch'.padEnd(15) + 'Created');
    console.log('-'.repeat(55));

    admins.forEach((a) => {
        console.log(
            a.username.padEnd(20) +
            a.branch.padEnd(15) +
            new Date(a.createdAt).toLocaleDateString()
        );
    });

    process.exit(0);
}

listAdmins().catch((err) => {
    console.error('Error listing admins:', err.message);
    process.exit(1);
});