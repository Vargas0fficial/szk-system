import { getBranchConnection } from "@/db";
import { getAppointmentModel } from "@/models/Appointment";
import { BRANCHES, isValidBranchSlug } from "@/branches";
import { jwtVerify } from "jose";
import { cookies } from "next/headers";

// Reads the branch slug straight from the admin's JWT cookie (if logged in).
// This is the ONLY source of truth for write operations — a logged-in admin
// can never write to another branch's data by tampering a request, because
// the branch never comes from anything the client sends.
async function resolveBranchFromCookie() {
  const cookieStore = await cookies();
  const token = cookieStore.get("admin_token")?.value;
  if (!token) return null;

  try {
    const secret = new TextEncoder().encode(process.env.JWT_SECRET);
    const { payload } = await jwtVerify(token, secret);
    return isValidBranchSlug(payload.branch) ? payload.branch : null;
  } catch {
    return null;
  }
}

// Reads the branch slug from the public ?branch=slug query param, used by
// the unauthenticated TV display. Validated against the known branch list.
function resolveBranchFromQuery(request) {
  const { searchParams } = new URL(request.url);
  const slug = searchParams.get("branch");
  return isValidBranchSlug(slug) ? slug : null;
}

async function getModelForGET(request) {
  // Prefer the logged-in admin's own branch when a valid session exists —
  // this is what the admin panel's EventSource call uses (no ?branch= needed).
  const cookieBranch = await resolveBranchFromCookie();
  const slug = cookieBranch || resolveBranchFromQuery(request);

  if (!slug) throw new Error("INVALID_BRANCH");

  const conn = await getBranchConnection(BRANCHES[slug].db);
  return getAppointmentModel(conn);
}

async function getModelForMutation() {
  const slug = await resolveBranchFromCookie();
  if (!slug) throw new Error("UNAUTHENTICATED");

  const conn = await getBranchConnection(BRANCHES[slug].db);
  return getAppointmentModel(conn);
}

export async function GET(request) {
  let Appointment;
  try {
    Appointment = await getModelForGET(request);
  } catch {
    return new Response(JSON.stringify({ success: false, error: "Invalid or missing branch." }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }

  const encoder = new TextEncoder();
  let changeStream = null;
  let heartbeat = null;
  let changeTimeout = null;
  let isClosed = false;

  const stream = new ReadableStream({
    async start(controller) {
      const sendData = (type, data) => {
        if (isClosed) return;
        try {
          controller.enqueue(
            encoder.encode(`data: ${JSON.stringify({ type, data })}\n\n`)
          );
        } catch (e) {
          isClosed = true;
          console.error("Stream enqueue error, client connection might be closed:", e);
        }
      };

      try {
        const initial = await Appointment.find({}).sort({ date: 1 });
        sendData("initial", initial);

        changeStream = Appointment.watch();

        changeStream.on("change", () => {
          if (changeTimeout) clearTimeout(changeTimeout);

          changeTimeout = setTimeout(async () => {
            try {
              const appointments = await Appointment.find({}).sort({ date: 1 });
              sendData("update", appointments);
            } catch (err) {
              console.error("Error fetching updated data during stream change broadcast:", err);
            }
          }, 100);
        });

        changeStream.on("error", (err) => {
          console.error("Change stream execution error:", err);
          isClosed = true;
          try { controller.close(); } catch (e) { }
        });

        heartbeat = setInterval(() => {
          if (isClosed) {
            clearInterval(heartbeat);
            return;
          }
          try {
            controller.enqueue(encoder.encode(`: ping\n\n`));
          } catch (e) {
            isClosed = true;
            clearInterval(heartbeat);
          }
        }, 15000);

      } catch (error) {
        console.error("Failed to initialize SSE stream:", error);
        controller.error(error);
      }
    },
    cancel() {
      isClosed = true;
      if (heartbeat) clearInterval(heartbeat);
      if (changeTimeout) clearTimeout(changeTimeout);
      if (changeStream) changeStream.close();
      console.log("Active SSE stream canceled: Client disconnected.");
    }
  });

  request.signal.addEventListener("abort", () => {
    isClosed = true;
    if (heartbeat) clearInterval(heartbeat);
    if (changeTimeout) clearTimeout(changeTimeout);
    if (changeStream) changeStream.close();
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache, no-transform, private",
      "Connection": "keep-alive",
      "X-Accel-Buffering": "no",
    },
  });
}

// ==========================================
// POST HANDLER FOR SAVING APPOINTMENTS
// ==========================================
export async function POST(request) {
  try {
    const Appointment = await getModelForMutation();
    const body = await request.json();

    const newAppointment = new Appointment(body);
    await newAppointment.save();

    return new Response(JSON.stringify({ success: true, data: newAppointment }), {
      status: 201,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    if (error.message === "UNAUTHENTICATED") {
      return new Response(JSON.stringify({ success: false, error: "Not authenticated" }), {
        status: 401,
        headers: { "Content-Type": "application/json" },
      });
    }
    console.error("Failed to save appointment in database:", error);
    return new Response(JSON.stringify({ success: false, error: error.message }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}

// ==========================================
// PUT HANDLER FOR UPDATING APPOINTMENTS (status + full edit)
// ==========================================
export async function PUT(request) {
  try {
    const Appointment = await getModelForMutation();
    const body = await request.json();
    const { id, status, ...rest } = body;

    if (!id) {
      return new Response(JSON.stringify({ success: false, error: "Missing required field: id" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    const updateData = status && Object.keys(rest).length === 0
      ? { status }
      : { ...rest, ...(status && { status }) };

    const updatedAppointment = await Appointment.findByIdAndUpdate(
      id,
      updateData,
      { returnDocument: 'after' }
    );

    if (!updatedAppointment) {
      return new Response(JSON.stringify({ success: false, error: "Appointment record not found" }), {
        status: 404,
        headers: { "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify({ success: true, data: updatedAppointment }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    if (error.message === "UNAUTHENTICATED") {
      return new Response(JSON.stringify({ success: false, error: "Not authenticated" }), {
        status: 401,
        headers: { "Content-Type": "application/json" },
      });
    }
    console.error("Failed to update appointment in database:", error);
    return new Response(JSON.stringify({ success: false, error: error.message }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}

// ==========================================
// DELETE HANDLER FOR REMOVING APPOINTMENTS
// ==========================================
export async function DELETE(request) {
  try {
    const Appointment = await getModelForMutation();

    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return new Response(JSON.stringify({ success: false, error: "Missing required query parameter: id" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    const deletedAppointment = await Appointment.findByIdAndDelete(id);

    if (!deletedAppointment) {
      return new Response(JSON.stringify({ success: false, error: "Appointment record not found" }), {
        status: 404,
        headers: { "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify({ success: true, message: "Appointment deleted successfully" }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    if (error.message === "UNAUTHENTICATED") {
      return new Response(JSON.stringify({ success: false, error: "Not authenticated" }), {
        status: 401,
        headers: { "Content-Type": "application/json" },
      });
    }
    console.error("Failed to delete appointment from database:", error);
    return new Response(JSON.stringify({ success: false, error: error.message }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}