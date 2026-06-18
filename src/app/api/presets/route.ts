import { connectDB } from "@/lib/db";
import { Preset } from "@/lib/models/Preset";
import { getCurrentUserId, jsonResponse } from "@/lib/auth";

export async function GET() {
  try {
    const userId = await getCurrentUserId();
    if (!userId) {
      return jsonResponse({ error: "Unauthorized" }, 401);
    }

    await connectDB();

    const presets = await Preset.find({ userId })
      .select("name attendees createdAt updatedAt")
      .sort({ updatedAt: -1 })
      .lean();

    return jsonResponse({ presets });
  } catch (error) {
    console.error("List presets error:", error);
    return jsonResponse({ error: "Internal server error" }, 500);
  }
}

export async function POST(request: Request) {
  try {
    const userId = await getCurrentUserId();
    if (!userId) {
      return jsonResponse({ error: "Unauthorized" }, 401);
    }

    const { name, attendees } = await request.json();

    if (!name || !Array.isArray(attendees)) {
      return jsonResponse({ error: "Name and attendees array are required" }, 400);
    }

    await connectDB();

    const preset = await Preset.create({
      userId,
      name: name.trim(),
      attendees,
    });

    return jsonResponse({ preset }, 201);
  } catch (error) {
    console.error("Create preset error:", error);
    return jsonResponse({ error: "Internal server error" }, 500);
  }
}
