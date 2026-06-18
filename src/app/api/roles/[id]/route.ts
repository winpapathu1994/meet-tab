import { connectDB } from "@/lib/db";
import { Role } from "@/lib/models/Role";
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
    const { label, hourlyRate } = await request.json();

    await connectDB();

    const update: Record<string, unknown> = {};
    if (label !== undefined) update.label = label.trim();
    if (hourlyRate !== undefined) {
      if (typeof hourlyRate !== "number" || hourlyRate < 0) {
        return jsonResponse(
          { error: "hourlyRate must be a number >= 0" },
          400,
        );
      }
      update.hourlyRate = hourlyRate;
    }

    const role = await Role.findByIdAndUpdate(id, update, { new: true });

    if (!role) {
      return jsonResponse({ error: "Role not found" }, 404);
    }

    return jsonResponse({ role });
  } catch (error) {
    console.error("Update role error:", error);
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

    const role = await Role.findByIdAndDelete(id);

    if (!role) {
      return jsonResponse({ error: "Role not found" }, 404);
    }

    return jsonResponse({ ok: true });
  } catch (error) {
    console.error("Delete role error:", error);
    return jsonResponse({ error: "Internal server error" }, 500);
  }
}
