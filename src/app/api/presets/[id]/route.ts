import { connectDB } from "@/lib/db";
import { Preset } from "@/lib/models/Preset";
import { getCurrentUserId, jsonResponse } from "@/lib/auth";

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const userId = await getCurrentUserId();
    if (!userId) {
      return jsonResponse({ error: "Unauthorized" }, 401);
    }

    const { id } = await params;
    const { name, attendees } = await request.json();

    await connectDB();

    const preset = await Preset.findOneAndUpdate(
      { _id: id, userId },
      { name: name?.trim(), attendees },
      { new: true },
    );

    if (!preset) {
      return jsonResponse({ error: "Preset not found" }, 404);
    }

    return jsonResponse({ preset });
  } catch (error) {
    console.error("Update preset error:", error);
    return jsonResponse({ error: "Internal server error" }, 500);
  }
}

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

    const preset = await Preset.findOneAndDelete({ _id: id, userId });

    if (!preset) {
      return jsonResponse({ error: "Preset not found" }, 404);
    }

    return jsonResponse({ ok: true });
  } catch (error) {
    console.error("Delete preset error:", error);
    return jsonResponse({ error: "Internal server error" }, 500);
  }
}
