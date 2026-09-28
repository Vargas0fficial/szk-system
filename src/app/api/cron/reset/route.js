import { getBranchConnection } from "@/db";
import { getAppointmentModel } from "@/models/Appointment";
import { BRANCHES } from "@/branches";

export const dynamic = "force-dynamic";

// End-of-day reset: deletes ALL appointments in EVERY branch's database.
//
// Scheduled in vercel.json as "0 9 * * *" — Vercel cron runs in UTC, so
// 09:00 UTC = 17:00 (5:00 PM) Philippine time (UTC+8, no daylight saving).
//
// Auth accepts either:
//   - ?secret=... in the URL (what vercel.json currently uses), or
//   - "Authorization: Bearer <CRON_SECRET>" (what Vercel sends automatically
//     when a CRON_SECRET env var is set on the project).
// Either one must match the CRON_SECRET environment variable.
export async function GET(request) {
    const { searchParams } = new URL(request.url);
    const querySecret = searchParams.get("secret");
    const bearer = request.headers.get("authorization")?.replace(/^Bearer\s+/i, "");
    const expected = process.env.CRON_SECRET;

    // Local testing shortcut — only outside production.
    const isLocalDev =
        process.env.NODE_ENV !== "production" &&
        request.headers.get("host")?.includes("localhost");

    const authorized = isLocalDev || (expected && (querySecret === expected || bearer === expected));

    if (!authorized) {
        return new Response(JSON.stringify({ success: false, error: "Unauthorized" }), {
            status: 401,
            headers: { "Content-Type": "application/json" },
        });
    }

    // Go through every branch one by one. A failure in one branch's database
    // is recorded but doesn't stop the others from being cleared.
    const results = {};
    let hadError = false;

    for (const [slug, info] of Object.entries(BRANCHES)) {
        try {
            const conn = await getBranchConnection(info.db);
            const Appointment = getAppointmentModel(conn);
            const result = await Appointment.deleteMany({});
            results[slug] = result.deletedCount;
            console.log(`End-of-day reset [${slug}]: ${result.deletedCount} appointments deleted.`);
        } catch (error) {
            hadError = true;
            results[slug] = `error: ${error.message}`;
            console.error(`Cron reset failed for branch "${slug}":`, error);
        }
    }

    return new Response(JSON.stringify({ success: !hadError, deleted: results }), {
        status: hadError ? 500 : 200,
        headers: { "Content-Type": "application/json" },
    });
}