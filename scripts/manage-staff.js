// Manage per-branch service advisors and technicians — no code changes,
// no redeploy needed.
//
// Usage:
//   node scripts/manage-staff.js add <branch> <advisor|technician> <full name>
//   node scripts/manage-staff.js remove <branch> <advisor|technician> <full name>
//   node scripts/manage-staff.js list <branch>
//
// Examples:
//   node scripts/manage-staff.js add pang advisor "KENNETH FERNANDEZ"
//   node scripts/manage-staff.js add pang technician "MARK CERALDE"
//   node scripts/manage-staff.js remove pang technician "MARK CERALDE"
//   node scripts/manage-staff.js list pang

require('dotenv').config({ path: '.env.local' });
const mongoose = require('mongoose');

const MONGODB_URI = process.env.MONGODB_URI;
const ADMIN_DB = 'szk_admins';

if (!MONGODB_URI) {
    console.error('Missing MONGODB_URI. Make sure it is set in your .env.local file.');
    process.exit(1);
}

const StaffSchema = new mongoose.Schema({
    branch: { type: String, required: true },
    role: { type: String, required: true, enum: ['advisor', 'technician'] },
    name: { type: String, required: true },
}, { timestamps: true });

StaffSchema.index({ branch: 1, role: 1, name: 1 }, { unique: true });

const Staff = mongoose.models.Staff || mongoose.model('Staff', StaffSchema);

function printUsage() {
    console.error('Usage:');
    console.error('  node scripts/manage-staff.js add <branch> <advisor|technician> <full name>');
    console.error('  node scripts/manage-staff.js remove <branch> <advisor|technician> <full name>');
    console.error('  node scripts/manage-staff.js list <branch>');
}

async function run() {
    const [, , command, branch, role, ...nameParts] = process.argv;
    const name = nameParts.join(' ').trim();

    if (!command || !branch) {
        printUsage();
        process.exit(1);
    }

    await mongoose.connect(MONGODB_URI, { dbName: ADMIN_DB, serverSelectionTimeoutMS: 10000 });

    if (command === 'list') {
        const staff = await Staff.find({ branch }).sort({ role: 1, name: 1 });
        if (staff.length === 0) {
            console.log(`No staff found for branch "${branch}".`);
        } else {
            console.log(`Staff for branch "${branch}":\n`);
            ['advisor', 'technician'].forEach((r) => {
                const filtered = staff.filter((s) => s.role === r);
                console.log(r.toUpperCase() + 'S:');
                if (filtered.length === 0) console.log('  (none)');
                filtered.forEach((s) => console.log('  - ' + s.name));
            });
        }
        process.exit(0);
    }

    if (command === 'add') {
        if (!role || !['advisor', 'technician'].includes(role) || !name) {
            printUsage();
            process.exit(1);
        }
        try {
            await Staff.create({ branch, role, name });
            console.log(`Added ${role}: "${name}" to branch "${branch}"`);
        } catch (err) {
            if (err.code === 11000) {
                console.log(`"${name}" is already listed as a ${role} for branch "${branch}".`);
            } else {
                throw err;
            }
        }
        process.exit(0);
    }

    if (command === 'remove') {
        if (!role || !['advisor', 'technician'].includes(role) || !name) {
            printUsage();
            process.exit(1);
        }
        const result = await Staff.deleteOne({ branch, role, name });
        if (result.deletedCount === 0) {
            console.log(`No matching ${role} named "${name}" found for branch "${branch}".`);
        } else {
            console.log(`Removed ${role}: "${name}" from branch "${branch}"`);
        }
        process.exit(0);
    }

    printUsage();
    process.exit(1);
}

run().catch((err) => {
    console.error('Error:', err.message);
    process.exit(1);
});