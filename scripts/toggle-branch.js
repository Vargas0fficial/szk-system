// Turn a branch on or off — no code changes, no redeploy needed.
// Usage: node scripts/toggle-branch.js <branch> <on|off>
// Example: node scripts/toggle-branch.js launion on
//          node scripts/toggle-branch.js tarlac off

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

async function toggleBranch() {
    const [, , slug, state] = process.argv;

    if (!slug || !state || !['on', 'off'].includes(state.toLowerCase())) {
        console.error('Missing or invalid arguments.');
        console.error('Usage: node scripts/toggle-branch.js <branch> <on|off>');
        console.error('Example: node scripts/toggle-branch.js launion on');
        process.exit(1);
    }

    const active = state.toLowerCase() === 'on';

    await mongoose.connect(MONGODB_URI, { dbName: ADMIN_DB, serverSelectionTimeoutMS: 10000 });

    await BranchStatus.findOneAndUpdate(
        { slug },
        { slug, active },
        { upsert: true, new: true }
    );

    console.log(`Branch "${slug}" is now ${active ? 'ACTIVE ' : 'INACTIVE '}`);
    console.log('This takes effect immediately — no redeploy needed.');
    process.exit(0);
}

toggleBranch().catch((err) => {
    console.error('Error toggling branch:', err.message);
    process.exit(1);
});