import { connectDB } from "@/lib/db";
import { Role } from "@/lib/models/Role";
import { getCurrentUserId, jsonResponse } from "@/lib/auth";

export async function GET() {
  try {
    await connectDB();

    const roles = await Role.find()
      .select("label hourlyRate createdAt updatedAt")
      .sort({ label: 1 })
      .lean();

    return jsonResponse({ roles });
  } catch (error) {
    console.error("List roles error:", error);
    return jsonResponse({ error: "Internal server error" }, 500);
  }
}

export async function POST(request: Request) {
  try {
    const userId = await getCurrentUserId();
    if (!userId) {
      return jsonResponse({ error: "Unauthorized" }, 401);
    }

    const { label, hourlyRate } = await request.json();

    if (!label || typeof hourlyRate !== "number" || hourlyRate < 0) {
      return jsonResponse(
        { error: "Label (string) and hourlyRate (number >= 0) are required" },
        400,
      );
    }

    await connectDB();

    const role = await Role.create({
      label: label.trim(),
      hourlyRate,
    });

    return jsonResponse({ role }, 201);
  } catch (error) {
    console.error("Create role error:", error);
    return jsonResponse({ error: "Internal server error" }, 500);
  }
}
