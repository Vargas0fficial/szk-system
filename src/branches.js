// Central list of supported branches.
//
// key    = the URL slug used for the public TV display (/pang, /launion, /tarlac)
//          and passed around internally as ?branch=slug — never expose raw
//          database names in URLs or client-facing query params.
// db     = the actual MongoDB database name that stores this branch's appointments.
// label  = display name shown on the TV screen header and admin navbar.
// active = whether this branch's TV display is live. Set to false for
//          branches that haven't been set up / paid for yet — visitors will
//          see a "not yet accessible" page instead of the live table.
//
// To add a new branch: create its appointments database in Atlas, create an
// admin account for it (node scripts/create-admin.js user pass branchSlug),
// then add one line here.

export const BRANCHES = {
  pang: { db: "szk_pang1", label: "Suzuki Auto Pangasinan", active: true },
  launion: { db: "szk_launion", label: "Suzuki Auto La Union", active: false },
  tarlac: { db: "szk_tarlac", label: "Suzuki Auto Tarlac", active: false },
};

export function isValidBranchSlug(slug) {
  return Object.prototype.hasOwnProperty.call(BRANCHES, slug);
}