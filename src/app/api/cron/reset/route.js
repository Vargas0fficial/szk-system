import { connectDB } from "@/db";
import Appointment from "@/models/Appointment";

export async function GET(request) {
    // Vercel cron jobs send this user-agent
    const userAgent = request.headers.get("user-agent") || "";
    const isVercelCron = userAgent.includes("vercel-cron");
    const isLocalhost = request.headers.get("host")?.includes("localhost");

    if (!isVercelCron && !isLocalhost) {
        return new Response(JSON.stringify({ success: false, error: "Unauthorized" }), {
            status: 401,
            headers: { "Content-Type": "application/json" },
        });
    }

    try {
        await connectDB();
        const result = await Appointment.deleteMany({});
        console.log(`End-of-day reset: ${result.deletedCount} appointments deleted.`);

        return new Response(JSON.stringify({ success: true, deleted: result.deletedCount }), {
            status: 200,
            headers: { "Content-Type": "application/json" },
        });
    } catch (error) {
        console.error("Cron reset failed:", error);
        return new Response(JSON.stringify({ success: false, error: error.message }), {
            status: 500,
            headers: { "Content-Type": "application/json" },
        });
    }
}