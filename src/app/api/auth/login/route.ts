import { connectDB } from "@/lib/db";
import { User } from "@/lib/models/User";
import { jsonResponse, setTokenCookie, signToken, verifyPassword } from "@/lib/auth";
import mongoose from "mongoose";

export async function POST(request: Request) {
  try {
    const { email, password } = await request.json();

    if (!email || !password) {
      return jsonResponse({ error: "Email and password are required" }, 400);
    }

    await connectDB();

    const user = await User.findOne({ email: email.toLowerCase().trim() });
    if (!user) {
      return jsonResponse({ error: "No account found with this email", code: "email_not_found" }, 401);
    }

    const valid = await verifyPassword(password, user.passwordHash);
    if (!valid) {
      return jsonResponse({ error: "Invalid password", code: "invalid_password" }, 401);
    }

    const token = signToken({ userId: user._id.toString() });
    await setTokenCookie(token);

    // Read image via raw collection to avoid Mongoose schema cache issues
    const usersCol = mongoose.connection.db!.collection("users");
    const doc = await usersCol.findOne({ _id: user._id }, { projection: { image: 1 } });

    return jsonResponse({
      user: { id: user._id, name: user.name, email: user.email, image: doc?.image || "" },
    });
  } catch (error) {
    console.error("Login error:", error);
    return jsonResponse({ error: "Internal server error" }, 500);
  }
}
