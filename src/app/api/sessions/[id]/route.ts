import { connectDB } from "@/lib/db";
import { SessionHistory } from "@/lib/models/SessionHistory";
import { getCurrentUserId, jsonResponse } from "@/lib/auth";

/** Delete a session record (owner only) */
export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const userId = await getCurrentUserId();
    if (!userId) {
      return jsonResponse({ error: "Unauthorized" }, 401);
    }

    const { id } = await params;

    await connectDB();

    const session = await SessionHistory.findOneAndDelete({
      _id: id,
      userId,
    });

    if (!session) {
      return jsonResponse({ error: "Session not found" }, 404);
    }

    return jsonResponse({ ok: true });
  } catch (error) {
    console.error("Delete session error:", error);
    return jsonResponse({ error: "Internal server error" }, 500);
  }
}
