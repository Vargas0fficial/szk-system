import { connectDB } from "@/db";
import Appointment from "@/models/Appointment";

export async function GET() {
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