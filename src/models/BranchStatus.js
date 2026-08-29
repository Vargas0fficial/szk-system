import mongoose from 'mongoose';

const BranchStatusSchema = new mongoose.Schema({
    slug: { type: String, required: true, unique: true }, // e.g. "pang", "launion", "tarlac"
    active: { type: Boolean, default: false },
}, { timestamps: true });

// Bound to the central "szk_admins" database (same as Admin model) —
// this is what lets us toggle branches on/off via a script or API call
// instead of editing code and redeploying.
export default mongoose.models.BranchStatus || mongoose.model('BranchStatus', BranchStatusSchema);