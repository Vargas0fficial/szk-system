import { jwtVerify } from "jose";
import { cookies } from "next/headers";
import { BRANCHES } from "@/branches";

// Lets the admin UI ask "who am I logged in as, and which branch?" —
// used by admin/page.js to show the correct branch name in the navbar
// without relying on a static env var.
export async function GET() {
    const cookieStore = await cookies();
    const token = cookieStore.get("admin_token")?.value;

    if (!token) {
        return new Response(JSON.stringify({ success: false, error: "Not authenticated" }), {
            status: 401,
            headers: { "Content-Type": "application/json" },
        });
    }

    try {
        const secret = new TextEncoder().encode(process.env.JWT_SECRET);
        const { payload } = await jwtVerify(token, secret);
        const branchInfo = BRANCHES[payload.branch] || null;

        return new Response(JSON.stringify({
            success: true,
            username: payload.username,
            branch: payload.branch,
            branchLabel: branchInfo?.label || payload.branch,
        }), {
            status: 200,
            headers: { "Content-Type": "application/json" },
        });
    } catch {
        return new Response(JSON.stringify({ success: false, error: "Invalid session" }), {
            status: 401,
            headers: { "Content-Type": "application/json" },
        });
    }
}