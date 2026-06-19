import { connectDB } from "@/lib/db";
import { getCurrentUserId, jsonResponse } from "@/lib/auth";
import mongoose from "mongoose";

export async function GET() {
  try {
    const userId = await getCurrentUserId();
    if (!userId) {
      return jsonResponse({ user: null });
    }

    await connectDB();

    // Use raw MongoDB driver to read user — avoids Mongoose schema cache
    // stripping the image field if the schema was compiled before image existed
    const usersCol = mongoose.connection.db!.collection("users");
    const doc = await usersCol.findOne(
      { _id: new mongoose.Types.ObjectId(userId) },
      { projection: { name: 1, email: 1, image: 1 } },
    );

    if (!doc) {
      return jsonResponse({ user: null });
    }

    return jsonResponse({
      user: { id: doc._id, name: doc.name, email: doc.email, image: doc.image || "" },
    });
  } catch (error) {
    console.error("Me error:", error);
    return jsonResponse({ error: "Internal server error" }, 500);
  }
}
