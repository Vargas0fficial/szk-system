import { connectDB } from "@/db";
import Staff from "@/models/Staff";
import { jwtVerify } from "jose";
import { cookies } from "next/headers";

// Reads the branch straight from the admin's JWT — same pattern as the
// appointments stream route. An admin only ever sees their own branch's
// staff list, never anyone else's.
async function resolveBranchFromCookie() {
    const cookieStore = await cookies();
    const token = cookieStore.get("admin_token")?.value;
    if (!token) return null;

    try {
        const secret = new TextEncoder().encode(process.env.JWT_SECRET);
        const { payload } = await jwtVerify(token, secret);
        return payload.branch || null;
    } catch {
        return null;
    }
}

// Used by AppointmentForm.jsx and AppointmentTable.jsx to populate the
// Service Advisor / Technician dropdowns with THIS branch's own staff,
// instead of one shared hardcoded list for every branch.
export async function GET() {
    const branch = await resolveBranchFromCookie();

    if (!branch) {
        return new Response(JSON.stringify({ success: false, error: "Not authenticated" }), {
            status: 401,
            headers: { "Content-Type": "application/json" },
        });
    }

    try {
        await connectDB();
        const staff = await Staff.find({ branch }).sort({ name: 1 });

        const advisors = staff.filter((s) => s.role === "advisor").map((s) => s.name);
        const technicians = staff.filter((s) => s.role === "technician").map((s) => s.name);

        return new Response(JSON.stringify({ success: true, advisors, technicians }), {
            status: 200,
            headers: { "Content-Type": "application/json" },
        });
    } catch (error) {
        console.error("Failed to fetch staff list:", error);
        return new Response(JSON.stringify({ success: false, error: error.message }), {
            status: 500,
            headers: { "Content-Type": "application/json" },
        });
    }
}