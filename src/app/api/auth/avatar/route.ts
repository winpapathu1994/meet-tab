import { connectDB } from "@/lib/db";
import { User } from "@/lib/models/User";
import { getCurrentUserId, jsonResponse } from "@/lib/auth";
import { writeFile, unlink, mkdir } from "fs/promises";
import mongoose from "mongoose";
import path from "path";

const UPLOAD_DIR = path.join(process.cwd(), "public", "uploads");
const MAX_SIZE = 2 * 1024 * 1024; // 2 MB
const ALLOWED_TYPES = ["image/png", "image/jpeg", "image/webp"];

export async function POST(request: Request) {
  try {
    const userId = await getCurrentUserId();
    if (!userId) {
      return jsonResponse({ error: "Unauthorized" }, 401);
    }

    const formData = await request.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return jsonResponse({ error: "No file provided" }, 400);
    }

    if (!ALLOWED_TYPES.includes(file.type)) {
      return jsonResponse({ error: "Only PNG, JPEG, and WebP images are allowed" }, 400);
    }

    if (file.size > MAX_SIZE) {
      return jsonResponse({ error: "Image must be under 2 MB" }, 400);
    }

    await connectDB();

    // Fetch old image path for cleanup — use raw collection to avoid schema cache issues
    const usersCol = mongoose.connection.db!.collection("users");
    const existing = await usersCol.findOne(
      { _id: new mongoose.Types.ObjectId(userId) },
      { projection: { image: 1 } },
    );

    if (!existing) {
      return jsonResponse({ error: "User not found" }, 404);
    }

    // Ensure uploads directory exists
    await mkdir(UPLOAD_DIR, { recursive: true });

    // Delete old avatar if it exists
    if (existing.image) {
      const oldPath = path.join(process.cwd(), "public", String(existing.image).replace(/^\//, ""));
      try {
        await unlink(oldPath);
      } catch {
        // old file may not exist — ignore
      }
    }

    // Save new file to disk
    const ext = file.name.split(".").pop() || "png";
    const filename = `${userId}-${Date.now()}.${ext}`;
    const filePath = path.join(UPLOAD_DIR, filename);
    const buffer = Buffer.from(await file.arrayBuffer());
    await writeFile(filePath, buffer);

    // Persist image path — raw MongoDB driver update bypasses Mongoose schema strict mode,
    // so the write succeeds even if the Mongoose schema cache is stale
    const imagePath = `/uploads/${filename}`;
    await usersCol.updateOne(
      { _id: new mongoose.Types.ObjectId(userId) },
      { $set: { image: imagePath } },
    );

    console.log(`[avatar] Saved image for user ${userId}: ${imagePath}`);

    return jsonResponse({ image: imagePath });
  } catch (error) {
    console.error("Upload avatar error:", error);
    return jsonResponse({ error: "Internal server error" }, 500);
  }
}
