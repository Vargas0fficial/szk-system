import mongoose from 'mongoose';

const StaffSchema = new mongoose.Schema({
    branch: { type: String, required: true }, // e.g. "pang", "launion", "tarlac"
    role: { type: String, required: true, enum: ['advisor', 'technician'] },
    name: { type: String, required: true },
}, { timestamps: true });

// Prevents accidentally adding the exact same person twice under the same
// branch + role.
StaffSchema.index({ branch: 1, role: 1, name: 1 }, { unique: true });

// Bound to the central "szk_admins" database (same as Admin/BranchStatus) —
// lets each branch have its own advisor/technician list, manageable via
// scripts/manage-staff.js without touching code or redeploying.
export default mongoose.models.Staff || mongoose.model('Staff', StaffSchema);