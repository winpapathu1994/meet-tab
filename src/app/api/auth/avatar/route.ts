import { connectDB } from "@/lib/db";
import { User } from "@/lib/models/User";
import { getCurrentUserId, jsonResponse } from "@/lib/auth";
import { writeFile, unlink, mkdir } from "fs/promises";
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

    const user = await User.findById(userId);
    if (!user) {
      return jsonResponse({ error: "User not found" }, 404);
    }

    // Ensure uploads directory exists
    await mkdir(UPLOAD_DIR, { recursive: true });

    // Delete old avatar if it exists
    if (user.image) {
      const oldPath = path.join(process.cwd(), "public", user.image.replace(/^\//, ""));
      try {
        await unlink(oldPath);
      } catch {
        // old file may not exist — ignore
      }
    }

    // Save new file
    const ext = file.name.split(".").pop() || "png";
    const filename = `${userId}-${Date.now()}.${ext}`;
    const filePath = path.join(UPLOAD_DIR, filename);
    const buffer = Buffer.from(await file.arrayBuffer());
    await writeFile(filePath, buffer);

    // Update user record
    const imagePath = `/uploads/${filename}`;
    user.image = imagePath;
    await user.save();

    return jsonResponse({ image: imagePath });
  } catch (error) {
    console.error("Upload avatar error:", error);
    return jsonResponse({ error: "Internal server error" }, 500);
  }
}
