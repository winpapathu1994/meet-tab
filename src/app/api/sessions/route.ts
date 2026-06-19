import { connectDB } from "@/lib/db";
import { SessionHistory } from "@/lib/models/SessionHistory";
import { getCurrentUserId, jsonResponse } from "@/lib/auth";

/** Save a completed meeting session */
export async function POST(request: Request) {
  try {
    const userId = await getCurrentUserId();
    if (!userId) {
      return jsonResponse({ error: "Unauthorized" }, 401);
    }

    const { sessionName, attendees, totalCostMMK, elapsedSeconds, currency } =
      await request.json();

    if (!sessionName || !Array.isArray(attendees)) {
      return jsonResponse(
        { error: "sessionName and attendees array are required" },
        400,
      );
    }

    await connectDB();

    const session = await SessionHistory.create({
      userId,
      sessionName,
      attendees,
      totalCostMMK: totalCostMMK ?? 0,
      elapsedSeconds: elapsedSeconds ?? 0,
      currency: currency ?? "MMK",
    });

    return jsonResponse({ session: session.toObject() }, 201);
  } catch (error) {
    console.error("Save session error:", error);
    return jsonResponse({ error: "Internal server error" }, 500);
  }
}

/** List the user's session history */
export async function GET() {
  try {
    const userId = await getCurrentUserId();
    if (!userId) {
      return jsonResponse({ error: "Unauthorized" }, 401);
    }

    await connectDB();

    const sessions = await SessionHistory.find({ userId })
      .sort({ createdAt: -1 })
      .lean();

    return jsonResponse({ sessions });
  } catch (error) {
    console.error("List sessions error:", error);
    return jsonResponse({ error: "Internal server error" }, 500);
  }
}
