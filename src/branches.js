// Central list of supported branches.
//
// key   = the URL slug used for the public TV display (/pang, /launion, /tarlac)
//         and passed around internally as ?branch=slug — never expose raw
//         database names in URLs or client-facing query params.
// db    = the actual MongoDB database name that stores this branch's appointments.
// label = display name shown on the TV screen header and admin navbar.
//
// NOTE: whether a branch is active/live is now stored in the DATABASE
// (BranchStatus collection in szk_admins), not here — this keeps toggling
// a branch on/off instant (via scripts/toggle-branch.js), with no code
// changes or redeploys needed.
//
// To add a brand-new branch: create its appointments database in Atlas,
// create an admin account for it (node scripts/create-admin.js user pass
// branchSlug), add one line here, then turn it on with
// node scripts/toggle-branch.js branchSlug on

export const BRANCHES = {
  pang: { db: "szk_pang1", label: "Suzuki Auto Pangasinan" },
  launion: { db: "szk_launion", label: "Suzuki Auto La Union" },
  tarlac: { db: "szk_tarlac", label: "Suzuki Auto Tarlac" },
};

export function isValidBranchSlug(slug) {
  return Object.prototype.hasOwnProperty.call(BRANCHES, slug);
}