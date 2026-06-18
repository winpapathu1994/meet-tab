import { connectDB } from "@/lib/db";
import { AttendeeSession } from "@/lib/models/AttendeeSession";
import { getCurrentUserId, jsonResponse } from "@/lib/auth";

/** Load the user's saved attendee session */
export async function GET() {
  try {
    const userId = await getCurrentUserId();
    if (!userId) {
      return jsonResponse({ error: "Unauthorized" }, 401);
    }

    await connectDB();

    const session = await AttendeeSession.findOne({ userId }).lean();

    return jsonResponse({
      attendees: session?.attendees ?? [],
    });
  } catch (error) {
    console.error("Load attendees error:", error);
    return jsonResponse({ error: "Internal server error" }, 500);
  }
}

/** Save (upsert) the user's attendee list */
export async function PUT(request: Request) {
  try {
    const userId = await getCurrentUserId();
    if (!userId) {
      return jsonResponse({ error: "Unauthorized" }, 401);
    }

    const { attendees } = await request.json();

    if (!Array.isArray(attendees)) {
      return jsonResponse({ error: "attendees array is required" }, 400);
    }

    await connectDB();

    const session = await AttendeeSession.findOneAndUpdate(
      { userId },
      { attendees },
      { upsert: true, new: true, lean: true },
    );

    return jsonResponse({ attendees: session!.attendees });
  } catch (error) {
    console.error("Save attendees error:", error);
    return jsonResponse({ error: "Internal server error" }, 500);
  }
}

/** Clear the user's saved attendee session */
export async function DELETE() {
  try {
    const userId = await getCurrentUserId();
    if (!userId) {
      return jsonResponse({ error: "Unauthorized" }, 401);
    }

    await connectDB();

    await AttendeeSession.findOneAndDelete({ userId });

    return jsonResponse({ ok: true });
  } catch (error) {
    console.error("Delete attendees error:", error);
    return jsonResponse({ error: "Internal server error" }, 500);
  }
}
