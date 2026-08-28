// Create a new admin account, tied to a specific branch.
// Usage: node scripts/create-admin.js <username> <password> <branch>
// Example: node scripts/create-admin.js admin_pang MySecurePass123 pang
//
// <branch> must match one of the slugs defined in src/branches.js
// (currently: pang, launion, tarlac)

require('dotenv').config({ path: '.env.local' });
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const MONGODB_URI = process.env.MONGODB_URI;

// All admin accounts now live in one central database, regardless of branch.
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

async function createAdmin() {
    const [, , username, password, branch] = process.argv;

    if (!username || !password || !branch) {
        console.error('Missing arguments.');
        console.error('Usage: node scripts/create-admin.js <username> <password> <branch>');
        console.error('Example: node scripts/create-admin.js admin_pang MySecurePass123 pang');
        process.exit(1);
    }

    if (password.length < 6) {
        console.error('Password must be at least 6 characters.');
        process.exit(1);
    }

    await mongoose.connect(MONGODB_URI, { dbName: ADMIN_DB });

    const existing = await Admin.findOne({ username });
    if (existing) {
        console.log(`Admin account "${username}" already exists!`);
        process.exit(0);
    }

    const hashed = await bcrypt.hash(password, 10);
    await Admin.create({ username, password: hashed, branch });

    console.log(`Admin created! Username: ${username} | Branch: ${branch}`);
    process.exit(0);
}

createAdmin().catch((err) => {
    console.error('Error creating admin:', err.message);
    process.exit(1);
});