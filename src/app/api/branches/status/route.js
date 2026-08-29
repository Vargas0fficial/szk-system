import { connectDB } from "@/db";
import BranchStatus from "@/models/BranchStatus";
import { BRANCHES, isValidBranchSlug } from "@/branches";

// Public endpoint used by the TV display ([branch]/page.js) to check
// whether a branch is currently active — reads from the database so
// toggling a branch on/off (via scripts/toggle-branch.js) takes effect
// immediately, without any redeploy.
export async function GET(request) {
    const { searchParams } = new URL(request.url);
    const slug = searchParams.get("slug");

    if (!isValidBranchSlug(slug)) {
        return new Response(JSON.stringify({ success: false, error: "Unknown branch" }), {
            status: 404,
            headers: { "Content-Type": "application/json" },
        });
    }

    try {
        await connectDB();
        const record = await BranchStatus.findOne({ slug });

        return new Response(JSON.stringify({
            success: true,
            active: record?.active ?? false,
            label: BRANCHES[slug].label,
        }), {
            status: 200,
            headers: { "Content-Type": "application/json" },
        });
    } catch (error) {
        console.error("Failed to check branch status:", error);
        return new Response(JSON.stringify({ success: false, error: error.message }), {
            status: 500,
            headers: { "Content-Type": "application/json" },
        });
    }
}