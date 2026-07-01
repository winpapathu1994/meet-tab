import { connectDB } from "@/lib/db";
import { User } from "@/lib/models/User";
import { getCurrentUserId, hashPassword, jsonResponse, verifyPassword } from "@/lib/auth";
import mongoose from "mongoose";

export async function PUT(request: Request) {
  try {
    const userId = await getCurrentUserId();
    if (!userId) {
      return jsonResponse({ error: "Unauthorized" }, 401);
    }

    const { name, currentPassword, newPassword, confirmPassword } = await request.json();

    await connectDB();

    const user = await User.findById(userId);
    if (!user) {
      return jsonResponse({ error: "User not found" }, 404);
    }

    // Update name (required, always present from frontend)
    if (typeof name === "string" && name.trim()) {
      user.name = name.trim();
    }

    // Update password if both current and new are provided
    if (currentPassword && newPassword) {
      if (newPassword !== confirmPassword) {
        return jsonResponse({ error: "Passwords do not match" }, 400);
      }
      const valid = await verifyPassword(currentPassword, user.passwordHash);
      if (!valid) {
        return jsonResponse({ error: "Current password is incorrect", code: "invalid_password" }, 400);
      }
      if (newPassword.length < 6) {
        return jsonResponse({ error: "New password must be at least 6 characters" }, 400);
      }
      user.passwordHash = await hashPassword(newPassword);
    }

    await user.save();

    // Read image via raw collection to avoid Mongoose schema cache stripping the field
    const usersCol = mongoose.connection.db!.collection("users");
    const doc = await usersCol.findOne({ _id: user._id }, { projection: { image: 1 } });

    return jsonResponse({
      user: { id: user._id, name: user.name, email: user.email, image: doc?.image || "" },
    });
  } catch (error) {
    console.error("Update profile error:", error);
    return jsonResponse({ error: "Internal server error" }, 500);
  }
}
