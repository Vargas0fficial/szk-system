// List the current on/off status of every configured branch.
// Usage: node scripts/list-branches.js

require('dotenv').config({ path: '.env.local' });
const mongoose = require('mongoose');

const MONGODB_URI = process.env.MONGODB_URI;
const ADMIN_DB = 'szk_admins';

if (!MONGODB_URI) {
    console.error('Missing MONGODB_URI. Make sure it is set in your .env.local file.');
    process.exit(1);
}

const BranchStatusSchema = new mongoose.Schema({
    slug: { type: String, required: true, unique: true },
    active: { type: Boolean, default: false },
}, { timestamps: true });

const BranchStatus = mongoose.models.BranchStatus || mongoose.model('BranchStatus', BranchStatusSchema);

// Keep this in sync with src/branches.js
const KNOWN_BRANCHES = ['pang', 'launion', 'tarlac'];

async function listBranches() {
    await mongoose.connect(MONGODB_URI, { dbName: ADMIN_DB, serverSelectionTimeoutMS: 10000 });

    const records = await BranchStatus.find({});
    const statusMap = Object.fromEntries(records.map((r) => [r.slug, r.active]));

    console.log('Branch'.padEnd(15) + 'Status');
    console.log('-'.repeat(30));

    KNOWN_BRANCHES.forEach((slug) => {
        const active = statusMap[slug] ?? false;
        console.log(slug.padEnd(15) + (active ? 'ACTIVE ' : 'INACTIVE '));
    });

    process.exit(0);
}

listBranches().catch((err) => {
    console.error('Error listing branches:', err.message);
    process.exit(1);
});